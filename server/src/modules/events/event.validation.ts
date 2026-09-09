import { z } from "zod";
import { EventStatus } from "../../shared/enums";

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

// ─── Create event ────────────────────────────────────────────────────────────

export const createEventSchema = {
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
      isPublic: z.boolean().optional(),
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

// ─── Update event ────────────────────────────────────────────────────────────

export const updateEventSchema = {
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
      isPublic: z.boolean().optional(),
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

export const transitionEventStatusSchema = {
  params: z.object({ clubId: mongoId, id: mongoId }),
  body: z.object({
    status: z.nativeEnum(EventStatus),
  }),
};

// ─── Get event ───────────────────────────────────────────────────────────────

export const getEventSchema = {
  params: z.object({ clubId: mongoId, id: mongoId }),
};

// ─── List events ─────────────────────────────────────────────────────────────

export const listClubEventsSchema = {
  params: z.object({ clubId: mongoId }),
  query: paginationQuery.extend({
    status: z.nativeEnum(EventStatus).optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
  }),
};

export const listPublicEventsSchema = {
  query: paginationQuery.extend({
    clubId: mongoId.optional(),
    status: z.nativeEnum(EventStatus).optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
  }),
};

// ─── Delete event ────────────────────────────────────────────────────────────

export const deleteEventSchema = {
  params: z.object({ clubId: mongoId, id: mongoId }),
};

// ─── Get registrations for an event ──────────────────────────────────────────

export const getEventRegistrationsSchema = {
  params: z.object({ clubId: mongoId, id: mongoId }),
  query: paginationQuery.extend({
    status: z.enum(["pending", "approved", "rejected", "cancelled"]).optional(),
  }),
};

// ─── Public: Get event by ID ────────────────────────────────────────────────

export const getPublicEventSchema = {
  params: z.object({ id: mongoId }),
};

// ─── Types ───────────────────────────────────────────────────────────────────

export type CreateEventInput = z.infer<typeof createEventSchema.body>;
export type UpdateEventInput = z.infer<typeof updateEventSchema.body>;
export type TransitionEventStatusInput = z.infer<
  typeof transitionEventStatusSchema.body
>;
export type ListClubEventsQuery = z.infer<typeof listClubEventsSchema.query>;
export type ListPublicEventsQuery = z.infer<typeof listPublicEventsSchema.query>;
