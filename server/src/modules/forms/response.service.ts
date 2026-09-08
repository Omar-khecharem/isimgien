import mongoose from "mongoose";
import * as formRepo from "./form.repository";
import * as responseRepo from "./response.repository";
import { ApiError } from "../../shared/utils/ApiError";
import { FormQuestionType } from "../../shared/enums";
import type { SubmitResponseInput, ListFormResponsesQuery } from "./form.validation";

// ─── Answer Validation ───────────────────────────────────────────────────────

interface QuestionDef {
  _id: mongoose.Types.ObjectId;
  type: FormQuestionType;
  label: string;
  required: boolean;
  options: { label: string; value: string }[] | null;
  validation: { min?: number; max?: number; pattern?: string };
}

function validateAnswer(
  question: QuestionDef,
  value: string | string[] | number | null
): string | null {
  // Required check
  if (question.required) {
    if (value === null || value === undefined) {
      return `Question "${question.label}" is required`;
    }
    if (typeof value === "string" && value.trim() === "") {
      return `Question "${question.label}" is required`;
    }
    if (Array.isArray(value) && value.length === 0) {
      return `Question "${question.label}" is required`;
    }
  }

  // If not required and empty, skip further validation
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "string" && value.trim() === "") {
    return null;
  }
  if (Array.isArray(value) && value.length === 0) {
    return null;
  }

  switch (question.type) {
    case FormQuestionType.SHORT_TEXT:
    case FormQuestionType.LONG_TEXT: {
      if (typeof value !== "string") {
        return `Question "${question.label}" expects a text value`;
      }
      const strVal = value as string;
      if (question.validation?.min != null && strVal.length < question.validation.min) {
        return `Question "${question.label}" must be at least ${question.validation.min} characters`;
      }
      if (question.validation?.max != null && strVal.length > question.validation.max) {
        return `Question "${question.label}" must be at most ${question.validation.max} characters`;
      }
      if (question.validation?.pattern) {
        const regex = new RegExp(question.validation.pattern);
        if (!regex.test(strVal)) {
          return `Question "${question.label}" does not match the required pattern`;
        }
      }
      break;
    }

    case FormQuestionType.EMAIL: {
      if (typeof value !== "string") {
        return `Question "${question.label}" expects an email value`;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value as string)) {
        return `Question "${question.label}" must be a valid email address`;
      }
      break;
    }

    case FormQuestionType.NUMBER: {
      if (typeof value !== "number" || isNaN(value)) {
        return `Question "${question.label}" expects a numeric value`;
      }
      if (question.validation?.min != null && value < question.validation.min) {
        return `Question "${question.label}" must be at least ${question.validation.min}`;
      }
      if (question.validation?.max != null && value > question.validation.max) {
        return `Question "${question.label}" must be at most ${question.validation.max}`;
      }
      break;
    }

    case FormQuestionType.SINGLE_CHOICE: {
      if (typeof value !== "string") {
        return `Question "${question.label}" expects a single choice value`;
      }
      if (!question.options) {
        return `Question "${question.label}" has no options configured`;
      }
      const validValues = question.options.map((o) => o.value);
      if (!validValues.includes(value as string)) {
        return `Question "${question.label}" has an invalid option`;
      }
      break;
    }

    case FormQuestionType.MULTIPLE_CHOICE: {
      if (!Array.isArray(value)) {
        return `Question "${question.label}" expects an array of choices`;
      }
      if (!question.options) {
        return `Question "${question.label}" has no options configured`;
      }
      const validMultiValues = question.options.map((o) => o.value);
      const allValid = (value as string[]).every((v) =>
        validMultiValues.includes(v)
      );
      if (!allValid) {
        return `Question "${question.label}" contains invalid options`;
      }
      break;
    }

    case FormQuestionType.DROPDOWN: {
      if (typeof value !== "string") {
        return `Question "${question.label}" expects a dropdown value`;
      }
      if (!question.options) {
        return `Question "${question.label}" has no options configured`;
      }
      const validDropdownValues = question.options.map((o) => o.value);
      if (!validDropdownValues.includes(value as string)) {
        return `Question "${question.label}" has an invalid option`;
      }
      break;
    }

    case FormQuestionType.DATE: {
      if (typeof value !== "string") {
        return `Question "${question.label}" expects a date value`;
      }
      const dateVal = new Date(value as string);
      if (isNaN(dateVal.getTime())) {
        return `Question "${question.label}" must be a valid date`;
      }
      break;
    }

    default:
      return `Question "${question.label}" has an unknown type`;
  }

  return null;
}

// ─── Submit Response ─────────────────────────────────────────────────────────

export async function submitResponse(
  userId: string,
  formId: string,
  input: SubmitResponseInput
) {
  const form = await formRepo.findFormById(formId);
  if (!form) {
    throw ApiError.notFound("Form not found");
  }

  if (!form.isPublished) {
    throw ApiError.badRequest("This form is not accepting responses");
  }

  if (!form.isActive) {
    throw ApiError.badRequest("This form is no longer active");
  }

  if (!form.publishedQuestions || form.publishedQuestions.length === 0) {
    throw ApiError.internal("Form has no published questions");
  }

  // Check for duplicate submission
  const existing = await responseRepo.findResponseByFormAndUser(formId, userId);
  if (existing) {
    throw ApiError.conflict("You have already submitted a response to this form");
  }

  // Build question lookup from published questions (the authoritative snapshot)
  const questionMap = new Map<string, QuestionDef>();
  for (const q of form.publishedQuestions) {
    questionMap.set(q._id.toString(), q as QuestionDef);
  }

  // Validate all answers against the published question definitions
  const errors: Record<string, string> = {};
  for (const answer of input.answers) {
    const question = questionMap.get(answer.questionId);
    if (!question) {
      errors[answer.questionId] = `Question not found in published form`;
      continue;
    }

    const error = validateAnswer(question, answer.value);
    if (error) {
      errors[answer.questionId] = error;
    }
  }

  // Check for missing required questions
  for (const question of form.publishedQuestions) {
    const qId = question._id.toString();
    const answered = input.answers.some((a) => a.questionId === qId);
    if (!answered && question.required) {
      if (!errors[qId]) {
        errors[qId] = `Question "${question.label}" is required`;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    throw ApiError.validation(errors);
  }

  // Create the response with snapshot of question definitions
  const questionSnapshot = JSON.parse(
    JSON.stringify(form.publishedQuestions)
  );

  const response = await responseRepo.createResponse({
    form: new mongoose.Types.ObjectId(formId),
    user: new mongoose.Types.ObjectId(userId),
    formVersion: form.version,
    questionDefinitions: questionSnapshot as any,
    answers: input.answers.map((a) => ({
      questionId: new mongoose.Types.ObjectId(a.questionId),
      value: a.value,
    })) as any,
    submittedAt: new Date(),
  });

  return response.toJSON();
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getResponseById(responseId: string) {
  const response = await responseRepo.findResponseByIdLean(responseId);
  if (!response) {
    throw ApiError.notFound("Response not found");
  }
  return response;
}

export async function listFormResponses(
  clubId: string,
  formId: string,
  query: ListFormResponsesQuery
) {
  const form = await formRepo.findFormById(formId);
  if (!form) {
    throw ApiError.notFound("Form not found");
  }
  if (form.club.toString() !== clubId) {
    throw ApiError.forbidden("Form does not belong to this club");
  }

  const { page, limit } = query;
  const skip = (page - 1) * limit;

  const { responses, total } = await responseRepo.findResponsesByForm(
    formId,
    skip,
    limit
  );

  return {
    responses,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getUserResponses(userId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;
  const { responses, total } = await responseRepo.findUserResponses(
    userId,
    skip,
    limit
  );
  return {
    responses,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getResponseStats(clubId: string, formId: string) {
  const form = await formRepo.findFormById(formId);
  if (!form) {
    throw ApiError.notFound("Form not found");
  }
  if (form.club.toString() !== clubId) {
    throw ApiError.forbidden("Form does not belong to this club");
  }

  const totalResponses = await responseRepo.countResponsesByForm(formId);
  const currentVersionResponses = await responseRepo.countResponsesByFormAndVersion(
    formId,
    form.version
  );

  return {
    formId,
    formVersion: form.version,
    totalResponses,
    currentVersionResponses,
    previousVersionResponses: totalResponses - currentVersionResponses,
  };
}
