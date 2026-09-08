import { z } from "zod";

// ─── Reusable fragments ──────────────────────────────────────────────────────

const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  isActive: z.coerce.boolean().optional(),
  sort: z.enum(["name", "-name", "createdAt", "-createdAt"]).optional(),
});

const socialLinksSchema = z
  .object({
    website: z.string().url().optional(),
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
    linkedin: z.string().url().optional(),
  })
  .partial()
  .optional();

const clubSettingsSchema = z
  .object({
    requireRegistrationValidation: z.boolean().optional(),
    defaultTrainingCapacity: z.number().int().min(0).nullable().optional(),
    membershipFee: z.number().min(0).optional(),
    membershipPeriodMonths: z.number().int().min(1).max(60).optional(),
  })
  .partial()
  .optional();

// ─── Create club (Super Admin) ───────────────────────────────────────────────

export const createClubSchema = {
  body: z.object({
    name: z.string().trim().min(1).max(200),
    description: z.string().trim().min(1).max(5000),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
      .optional(),
    establishedDate: z.coerce.date().optional(),
    contactEmail: z.string().email().optional(),
    contactPhone: z.string().trim().max(20).optional(),
    socialLinks: socialLinksSchema,
    settings: clubSettingsSchema,
  }),
};

// ─── Update club ─────────────────────────────────────────────────────────────

export const updateClubSchema = {
  params: z.object({ id: mongoId }),
  body: z.object({
    name: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().min(1).max(5000).optional(),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
      .optional(),
    establishedDate: z.coerce.date().nullable().optional(),
    contactEmail: z.string().email().nullable().optional(),
    contactPhone: z.string().trim().max(20).nullable().optional(),
    socialLinks: socialLinksSchema,
    settings: clubSettingsSchema,
  }),
};

// ─── Deactivate club (Super Admin) ───────────────────────────────────────────

export const deactivateClubSchema = {
  params: z.object({ id: mongoId }),
};

// ─── Get club by ID ──────────────────────────────────────────────────────────

export const getClubSchema = {
  params: z.object({ id: mongoId }),
};

// ─── List clubs ──────────────────────────────────────────────────────────────

export const listClubsSchema = {
  query: paginationQuery,
};

// ─── Assign / remove leader ──────────────────────────────────────────────────

export const assignLeaderSchema = {
  params: z.object({ id: mongoId }),
  body: z.object({
    userId: mongoId,
  }),
};

export const removeLeaderSchema = {
  params: z.object({ id: mongoId }),
};

// ─── Club membership ─────────────────────────────────────────────────────────

export const getClubMembersSchema = {
  params: z.object({ id: mongoId }),
  query: paginationQuery.extend({
    status: z.enum(["active", "expired", "pending_payment"]).optional(),
  }),
};

export const inviteMemberSchema = {
  params: z.object({ id: mongoId }),
  body: z.object({
    userId: mongoId,
    academicYear: z
      .string()
      .regex(/^\d{4}-\d{4}$/, "Academic year format: YYYY-YYYY"),
  }),
};

// ─── Student membership actions ──────────────────────────────────────────────

export const joinClubSchema = {
  params: z.object({ id: mongoId }),
  body: z.object({
    academicYear: z
      .string()
      .regex(/^\d{4}-\d{4}$/, "Academic year format: YYYY-YYYY"),
  }),
};

export const getMyMembershipsSchema = {
  query: paginationQuery.extend({
    status: z.enum(["active", "expired", "pending_payment"]).optional(),
  }),
};

// ─── Types ───────────────────────────────────────────────────────────────────

export type CreateClubInput = z.infer<typeof createClubSchema.body>;
export type UpdateClubInput = z.infer<typeof updateClubSchema.body>;
export type ListClubsQuery = z.infer<typeof listClubsSchema.query>;
export type GetClubParams = z.infer<typeof getClubSchema.params>;
export type AssignLeaderInput = z.infer<typeof assignLeaderSchema.body>;
export type GetClubMembersQuery = z.infer<typeof getClubMembersSchema.query>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema.body>;
export type JoinClubInput = z.infer<typeof joinClubSchema.body>;
export type GetMyMembershipsQuery = z.infer<typeof getMyMembershipsSchema.query>;
