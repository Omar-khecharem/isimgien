import { z } from "zod";
import { TrainingStatus } from "../../shared/enums";

// ─── Reusable fragments ──────────────────────────────────────────────────────

const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  sort: z
    .enum(["date", "-date", "createdAt", "-createdAt", "title", "-title"])
    .optional(),
});

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

// ─── Create training ─────────────────────────────────────────────────────────

export const createTrainingSchema = {
  params: z.object({ clubId: mongoId }),
  body: z
    .object({
      title: z.string().trim().min(1).max(300),
      description: z.string().trim().min(1).max(10000),
      date: z.coerce.date(),
      startTime: z.string().regex(timeRegex, "Time format: HH:mm"),
      endTime: z.string().regex(timeRegex, "Time format: HH:mm"),
      location: z.string().trim().min(1).max(300),
      capacity: z.number().int().min(1).nullable().optional(),
      requiresValidation: z.boolean().optional(),
      linkedFormId: mongoId.nullable().optional(),
      slug: z
        .string()
        .trim()
        .toLowerCase()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
        .optional(),
    })
    .refine(
      (data) => {
        const [startH, startM] = data.startTime.split(":").map(Number);
        const [endH, endM] = data.endTime.split(":").map(Number);
        return startH * 60 + startM < endH * 60 + endM;
      },
      { message: "End time must be after start time", path: ["endTime"] }
    ),
};

// ─── Update training ─────────────────────────────────────────────────────────

export const updateTrainingSchema = {
  params: z.object({ clubId: mongoId, id: mongoId }),
  body: z
    .object({
      title: z.string().trim().min(1).max(300).optional(),
      description: z.string().trim().min(1).max(10000).optional(),
      date: z.coerce.date().optional(),
      startTime: z.string().regex(timeRegex, "Time format: HH:mm").optional(),
      endTime: z.string().regex(timeRegex, "Time format: HH:mm").optional(),
      location: z.string().trim().min(1).max(300).optional(),
      capacity: z.number().int().min(1).nullable().optional(),
      requiresValidation: z.boolean().optional(),
      linkedFormId: mongoId.nullable().optional(),
      slug: z
        .string()
        .trim()
        .toLowerCase()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    }),
};

// ─── Transition status ───────────────────────────────────────────────────────

export const transitionTrainingStatusSchema = {
  params: z.object({ clubId: mongoId, id: mongoId }),
  body: z.object({
    status: z.nativeEnum(TrainingStatus),
  }),
};

// ─── Get training ────────────────────────────────────────────────────────────

export const getTrainingSchema = {
  params: z.object({ clubId: mongoId, id: mongoId }),
};

// ─── List trainings ──────────────────────────────────────────────────────────

export const listClubTrainingsSchema = {
  params: z.object({ clubId: mongoId }),
  query: paginationQuery.extend({
    status: z.nativeEnum(TrainingStatus).optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
  }),
};

export const listPublicTrainingsSchema = {
  query: paginationQuery.extend({
    clubId: mongoId.optional(),
    status: z.nativeEnum(TrainingStatus).optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
  }),
};

// ─── Delete training ─────────────────────────────────────────────────────────

export const deleteTrainingSchema = {
  params: z.object({ clubId: mongoId, id: mongoId }),
};

// ─── Get registrations for a training ────────────────────────────────────────

export const getTrainingRegistrationsSchema = {
  params: z.object({ clubId: mongoId, id: mongoId }),
  query: paginationQuery.extend({
    status: z.enum(["pending", "approved", "rejected", "cancelled"]).optional(),
  }),
};

// ─── Public: Get training by ID ─────────────────────────────────────────────

export const getPublicTrainingSchema = {
  params: z.object({ id: mongoId }),
};

// ─── Types ───────────────────────────────────────────────────────────────────

export type CreateTrainingInput = z.infer<typeof createTrainingSchema.body>;
export type UpdateTrainingInput = z.infer<typeof updateTrainingSchema.body>;
export type TransitionTrainingStatusInput = z.infer<
  typeof transitionTrainingStatusSchema.body
>;
export type ListClubTrainingsQuery = z.infer<
  typeof listClubTrainingsSchema.query
>;
export type ListPublicTrainingsQuery = z.infer<
  typeof listPublicTrainingsSchema.query
>;
