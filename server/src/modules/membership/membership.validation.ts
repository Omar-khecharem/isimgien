import { z } from "zod";
import { MembershipStatus } from "../../shared/enums";

const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  sort: z
    .enum([
      "createdAt",
      "-createdAt",
      "academicYear",
      "-academicYear",
      "status",
      "-status",
    ])
    .optional(),
});

// ─── Create Membership ───────────────────────────────────────────────────────

export const createMembershipSchema = {
  params: z.object({ clubId: mongoId }),
  body: z.object({
    userId: mongoId,
    academicYear: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{4}$/, "Academic year format: YYYY-YYYY"),
    amountPaid: z.number().min(0, "Amount paid cannot be negative").default(0),
    paymentDate: z.coerce.date().nullable().optional(),
    receiptNumber: z.string().trim().max(100).nullable().optional(),
    notes: z.string().trim().max(500).nullable().optional(),
  }),
};

// ─── Get Membership ──────────────────────────────────────────────────────────

export const getMembershipSchema = {
  params: z.object({ clubId: mongoId, membershipId: mongoId }),
};

// ─── List Memberships ────────────────────────────────────────────────────────

export const listMembershipsSchema = {
  params: z.object({ clubId: mongoId }),
  query: paginationQuery.extend({
    status: z.nativeEnum(MembershipStatus).optional(),
    academicYear: z.string().trim().optional(),
  }),
};

// ─── Update Membership Status ────────────────────────────────────────────────

export const updateMembershipStatusSchema = {
  params: z.object({ clubId: mongoId, membershipId: mongoId }),
  body: z.object({
    status: z.nativeEnum(MembershipStatus),
  }),
};

// ─── Record Payment ──────────────────────────────────────────────────────────

export const recordPaymentSchema = {
  params: z.object({ clubId: mongoId, membershipId: mongoId }),
  body: z.object({
    amount: z.number().positive("Amount must be positive"),
    paymentDate: z.coerce.date(),
    receiptNumber: z.string().trim().max(100).nullable().optional(),
  }),
};

// ─── Get My Membership (Student) ─────────────────────────────────────────────

export const getMyMembershipSchema = {
  params: z.object({ clubId: mongoId }),
};

// ─── Types ───────────────────────────────────────────────────────────────────

export type CreateMembershipInput = z.infer<typeof createMembershipSchema.body>;
export type ListMembershipsQuery = z.infer<typeof listMembershipsSchema.query>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema.body>;
