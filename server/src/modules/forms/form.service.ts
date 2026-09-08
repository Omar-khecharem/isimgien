import mongoose from "mongoose";
import * as formRepo from "./form.repository";
import * as responseRepo from "./response.repository";
import { ApiError } from "../../shared/utils/ApiError";
import type {
  CreateFormInput,
  UpdateFormInput,
  AddQuestionInput,
  UpdateQuestionInput,
  ReorderQuestionsInput,
  ListClubFormsQuery,
} from "./form.validation";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildSort(sort?: string): Record<string, 1 | -1> {
  if (!sort) return { createdAt: -1 };
  if (sort.startsWith("-")) {
    return { [sort.slice(1)]: -1 };
  }
  return { [sort]: 1 };
}

// ─── CRUD Operations ─────────────────────────────────────────────────────────

export async function createForm(
  clubId: string,
  input: CreateFormInput,
  creatorId: string
) {
  const titleExists = await formRepo.formExistsByTitle(clubId, input.title);
  if (titleExists) {
    throw ApiError.conflict("A form with this title already exists in this club");
  }

  const questions = (input.questions || []).map((q, idx) => ({
    ...q,
    description: q.description ?? null,
    required: q.required ?? false,
    options: q.options ?? null,
    validation: q.validation ?? {},
    order: q.order ?? idx,
  }));

  const form = await formRepo.createForm({
    club: new mongoose.Types.ObjectId(clubId),
    createdBy: new mongoose.Types.ObjectId(creatorId),
    title: input.title,
    description: input.description ?? "",
    questions: questions as any,
    isActive: true,
    isPublished: false,
    version: 0,
    publishedQuestions: null,
  });

  return form.toJSON();
}

export async function updateForm(
  clubId: string,
  formId: string,
  input: UpdateFormInput
) {
  const form = await formRepo.findFormById(formId);
  if (!form) {
    throw ApiError.notFound("Form not found");
  }
  if (form.club.toString() !== clubId) {
    throw ApiError.forbidden("Form does not belong to this club");
  }

  if (input.title && input.title !== form.title) {
    const titleExists = await formRepo.formExistsByTitle(
      clubId,
      input.title,
      formId
    );
    if (titleExists) {
      throw ApiError.conflict("A form with this title already exists in this club");
    }
  }

  const updated = await formRepo.updateForm(formId, input as any);
  return updated!.toJSON();
}

export async function deleteForm(clubId: string, formId: string) {
  const form = await formRepo.findFormById(formId);
  if (!form) {
    throw ApiError.notFound("Form not found");
  }
  if (form.club.toString() !== clubId) {
    throw ApiError.forbidden("Form does not belong to this club");
  }

  // Check if there are any responses
  const responseCount = await responseRepo.countResponsesByForm(formId);
  if (responseCount > 0) {
    throw ApiError.badRequest(
      "Cannot delete a form that has received responses. Deactivate it instead."
    );
  }

  await formRepo.deleteForm(formId);
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getFormById(clubId: string, formId: string) {
  const form = await formRepo.findFormByIdLean(formId);
  if (!form) {
    throw ApiError.notFound("Form not found");
  }
  if ((form.club as any)._id?.toString() !== clubId) {
    throw ApiError.forbidden("Form does not belong to this club");
  }
  return form;
}

export async function listClubForms(
  clubId: string,
  query: ListClubFormsQuery
) {
  const { page, limit, search, sort, isPublished } = query;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { club: clubId };
  if (isPublished !== undefined) {
    filter.isPublished = isPublished;
  }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const sortObj = buildSort(sort);
  const { forms, total } = await formRepo.findFormsByClub(
    clubId,
    filter,
    sortObj,
    skip,
    limit
  );

  return {
    forms,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getPublicFormById(formId: string) {
  const form = await formRepo.findPublishedFormByIdLean(formId);
  if (!form) {
    throw ApiError.notFound("Form not found");
  }
  if (!form.isPublished) {
    throw ApiError.notFound("Form is not published");
  }
  // Only return publishedQuestions to the public
  return {
    _id: form._id,
    title: form.title,
    description: form.description,
    club: form.club,
    questions: form.publishedQuestions,
    version: form.version,
  };
}

// ─── Question Management ─────────────────────────────────────────────────────

export async function addQuestion(
  clubId: string,
  formId: string,
  input: AddQuestionInput
) {
  const form = await formRepo.findFormById(formId);
  if (!form) {
    throw ApiError.notFound("Form not found");
  }
  if (form.club.toString() !== clubId) {
    throw ApiError.forbidden("Form does not belong to this club");
  }
  if (form.isPublished) {
    throw ApiError.badRequest(
      "Cannot modify questions on a published form. Unpublish it first."
    );
  }
  if (form.questions.length >= 50) {
    throw ApiError.badRequest("A form cannot have more than 50 questions");
  }

  const maxOrder =
    form.questions.length > 0
      ? Math.max(...form.questions.map((q) => q.order))
      : -1;

  const questionData = {
    type: input.type,
    label: input.label,
    description: input.description ?? null,
    required: input.required ?? false,
    options: input.options ?? null,
    validation: input.validation ?? {},
    order: input.order ?? maxOrder + 1,
  };

  const updated = await formRepo.addQuestion(formId, questionData as any);
  if (!updated) {
    throw ApiError.internal("Failed to add question");
  }
  return updated.toJSON();
}

export async function updateQuestion(
  clubId: string,
  formId: string,
  questionId: string,
  input: UpdateQuestionInput
) {
  const form = await formRepo.findFormById(formId);
  if (!form) {
    throw ApiError.notFound("Form not found");
  }
  if (form.club.toString() !== clubId) {
    throw ApiError.forbidden("Form does not belong to this club");
  }
  if (form.isPublished) {
    throw ApiError.badRequest(
      "Cannot modify questions on a published form. Unpublish it first."
    );
  }

  const questionExists = form.questions.some(
    (q) => q._id.toString() === questionId
  );
  if (!questionExists) {
    throw ApiError.notFound("Question not found in this form");
  }

  const updated = await formRepo.updateQuestion(formId, questionId, input as any);
  if (!updated) {
    throw ApiError.internal("Failed to update question");
  }
  return updated.toJSON();
}

export async function deleteQuestion(
  clubId: string,
  formId: string,
  questionId: string
) {
  const form = await formRepo.findFormById(formId);
  if (!form) {
    throw ApiError.notFound("Form not found");
  }
  if (form.club.toString() !== clubId) {
    throw ApiError.forbidden("Form does not belong to this club");
  }
  if (form.isPublished) {
    throw ApiError.badRequest(
      "Cannot modify questions on a published form. Unpublish it first."
    );
  }

  const questionExists = form.questions.some(
    (q) => q._id.toString() === questionId
  );
  if (!questionExists) {
    throw ApiError.notFound("Question not found in this form");
  }

  const updated = await formRepo.removeQuestion(formId, questionId);
  if (!updated) {
    throw ApiError.internal("Failed to delete question");
  }
  return updated.toJSON();
}

export async function reorderQuestions(
  clubId: string,
  formId: string,
  input: ReorderQuestionsInput
) {
  const form = await formRepo.findFormById(formId);
  if (!form) {
    throw ApiError.notFound("Form not found");
  }
  if (form.club.toString() !== clubId) {
    throw ApiError.forbidden("Form does not belong to this club");
  }
  if (form.isPublished) {
    throw ApiError.badRequest(
      "Cannot reorder questions on a published form. Unpublish it first."
    );
  }

  // Validate all provided IDs exist in the form
  const formQuestionIds = form.questions.map((q) => q._id.toString());
  const allExist = input.questionIds.every((id) =>
    formQuestionIds.includes(id)
  );
  if (!allExist) {
    throw ApiError.badRequest("One or more question IDs are invalid");
  }

  const updated = await formRepo.reorderQuestions(formId, input.questionIds);
  if (!updated) {
    throw ApiError.internal("Failed to reorder questions");
  }
  return updated.toJSON();
}

// ─── Publish/Unpublish ───────────────────────────────────────────────────────

export async function publishForm(clubId: string, formId: string) {
  const form = await formRepo.findFormById(formId);
  if (!form) {
    throw ApiError.notFound("Form not found");
  }
  if (form.club.toString() !== clubId) {
    throw ApiError.forbidden("Form does not belong to this club");
  }
  if (form.isPublished) {
    throw ApiError.badRequest("Form is already published");
  }
  if (form.questions.length === 0) {
    throw ApiError.badRequest(
      "Cannot publish a form with no questions. Add at least one question first."
    );
  }

  const updated = await formRepo.publishForm(formId);
  if (!updated) {
    throw ApiError.internal("Failed to publish form");
  }
  return updated.toJSON();
}

export async function unpublishForm(clubId: string, formId: string) {
  const form = await formRepo.findFormById(formId);
  if (!form) {
    throw ApiError.notFound("Form not found");
  }
  if (form.club.toString() !== clubId) {
    throw ApiError.forbidden("Form does not belong to this club");
  }
  if (!form.isPublished) {
    throw ApiError.badRequest("Form is not published");
  }

  const updated = await formRepo.unpublishForm(formId);
  if (!updated) {
    throw ApiError.internal("Failed to unpublish form");
  }
  return updated.toJSON();
}
