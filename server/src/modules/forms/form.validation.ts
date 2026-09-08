import { z } from "zod";
import { FormQuestionType } from "../../shared/enums";

const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  sort: z
    .enum(["createdAt", "-createdAt", "title", "-title", "version", "-version"])
    .optional(),
});

// ─── Question Schemas ─────────────────────────────────────────────────────────

const formQuestionOptionSchema = z.object({
  label: z.string().trim().min(1).max(200),
  value: z.string().trim().min(1).max(200),
});

const formQuestionValidationSchema = z.object({
  min: z.number().int().min(0).optional(),
  max: z.number().int().min(0).optional(),
  pattern: z.string().max(200).optional(),
});

const formQuestionSchema = z
  .object({
    type: z.nativeEnum(FormQuestionType),
    label: z.string().trim().min(1).max(500),
    description: z.string().trim().max(1000).nullable().optional(),
    required: z.boolean().optional().default(false),
    options: z.array(formQuestionOptionSchema).min(2).max(50).nullable().optional(),
    validation: formQuestionValidationSchema.optional().default({}),
    order: z.number().int().min(0).optional(),
  })
  .refine(
    (data) => {
      const needsOptions = [
        FormQuestionType.SINGLE_CHOICE,
        FormQuestionType.MULTIPLE_CHOICE,
        FormQuestionType.DROPDOWN,
      ];
      if (needsOptions.includes(data.type)) {
        return Array.isArray(data.options) && data.options.length >= 2;
      }
      return true;
    },
    {
      message: "Choice-type questions must have at least 2 options",
      path: ["options"],
    }
  );

// ─── Form CRUD Schemas ───────────────────────────────────────────────────────

export const createFormSchema = {
  params: z.object({ clubId: mongoId }),
  body: z.object({
    title: z.string().trim().min(1).max(300),
    description: z.string().trim().max(2000).optional().default(""),
    questions: z.array(formQuestionSchema).max(50).optional().default([]),
  }),
};

export const updateFormSchema = {
  params: z.object({ clubId: mongoId, id: mongoId }),
  body: z
    .object({
      title: z.string().trim().min(1).max(300).optional(),
      description: z.string().trim().max(2000).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    }),
};

export const getFormSchema = {
  params: z.object({ clubId: mongoId, id: mongoId }),
};

export const listClubFormsSchema = {
  params: z.object({ clubId: mongoId }),
  query: paginationQuery.extend({
    isPublished: z.coerce.boolean().optional(),
  }),
};

export const deleteFormSchema = {
  params: z.object({ clubId: mongoId, id: mongoId }),
};

// ─── Question Management Schemas ─────────────────────────────────────────────

export const addQuestionSchema = {
  params: z.object({ clubId: mongoId, id: mongoId }),
  body: formQuestionSchema,
};

export const updateQuestionSchema = {
  params: z.object({ clubId: mongoId, id: mongoId, questionId: mongoId }),
  body: z
    .object({
      type: z.nativeEnum(FormQuestionType).optional(),
      label: z.string().trim().min(1).max(500).optional(),
      description: z.string().trim().max(1000).nullable().optional(),
      required: z.boolean().optional(),
      options: z.array(formQuestionOptionSchema).min(2).max(50).nullable().optional(),
      validation: formQuestionValidationSchema.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    }),
};

export const deleteQuestionSchema = {
  params: z.object({ clubId: mongoId, id: mongoId, questionId: mongoId }),
};

export const reorderQuestionsSchema = {
  params: z.object({ clubId: mongoId, id: mongoId }),
  body: z.object({
    questionIds: z.array(mongoId).min(1).max(50),
  }),
};

// ─── Publish/Unpublish Schemas ───────────────────────────────────────────────

export const publishFormSchema = {
  params: z.object({ clubId: mongoId, id: mongoId }),
};

export const unpublishFormSchema = {
  params: z.object({ clubId: mongoId, id: mongoId }),
};

// ─── Response Schemas ────────────────────────────────────────────────────────

const formAnswerSchema = z.object({
  questionId: mongoId,
  value: z.union([z.string(), z.array(z.string()), z.number()]).nullable(),
});

export const submitResponseSchema = {
  params: z.object({ id: mongoId }),
  body: z.object({
    answers: z.array(formAnswerSchema).min(1),
  }),
};

export const getResponseSchema = {
  params: z.object({ id: mongoId }),
};

export const listFormResponsesSchema = {
  params: z.object({ clubId: mongoId, id: mongoId }),
  query: paginationQuery,
};

export const getPublicFormSchema = {
  params: z.object({ id: mongoId }),
};

// ─── Types ───────────────────────────────────────────────────────────────────

export type CreateFormInput = z.infer<typeof createFormSchema.body>;
export type UpdateFormInput = z.infer<typeof updateFormSchema.body>;
export type AddQuestionInput = z.infer<typeof addQuestionSchema.body>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema.body>;
export type ReorderQuestionsInput = z.infer<typeof reorderQuestionsSchema.body>;
export type SubmitResponseInput = z.infer<typeof submitResponseSchema.body>;
export type ListClubFormsQuery = z.infer<typeof listClubFormsSchema.query>;
export type ListFormResponsesQuery = z.infer<typeof listFormResponsesSchema.query>;
