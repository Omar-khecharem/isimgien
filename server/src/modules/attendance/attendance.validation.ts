import { z } from "zod";
import { AttendanceStatus } from "../../shared/enums";

const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  sort: z
    .enum(["createdAt", "-createdAt", "status", "-status"])
    .optional(),
});

// ─── Start Session ───────────────────────────────────────────────────────────

export const startSessionSchema = {
  params: z.object({ clubId: mongoId, trainingId: mongoId }),
};

// ─── Close Session ───────────────────────────────────────────────────────────

export const closeSessionSchema = {
  params: z.object({ clubId: mongoId, trainingId: mongoId }),
};

// ─── Check-in Student ────────────────────────────────────────────────────────

export const checkInStudentSchema = {
  params: z.object({ clubId: mongoId, trainingId: mongoId }),
  body: z.object({
    userId: mongoId,
    method: z.enum(["manual", "qr_code"]).optional().default("manual"),
  }),
};

// ─── Check-in via QR ────────────────────────────────────────────────────────

export const checkInViaQrSchema = {
  params: z.object({ trainingId: mongoId }),
  body: z.object({
    qrToken: z.string().min(1),
  }),
};

// ─── Check-out Student ───────────────────────────────────────────────────────

export const checkOutStudentSchema = {
  params: z.object({ clubId: mongoId, trainingId: mongoId }),
  body: z.object({
    userId: mongoId,
  }),
};

// ─── Mark Absent ─────────────────────────────────────────────────────────────

export const markAbsentSchema = {
  params: z.object({ clubId: mongoId, trainingId: mongoId }),
  body: z.object({
    userIds: z.array(mongoId).min(1).max(100),
  }),
};

// ─── Bulk Check-in ───────────────────────────────────────────────────────────

export const bulkCheckInSchema = {
  params: z.object({ clubId: mongoId, trainingId: mongoId }),
  body: z.object({
    userIds: z.array(mongoId).min(1).max(100),
  }),
};

// ─── Get Session Status ─────────────────────────────────────────────────────

export const getSessionSchema = {
  params: z.object({ clubId: mongoId, trainingId: mongoId }),
};

// ─── Get Training Attendance ─────────────────────────────────────────────────

export const getTrainingAttendanceSchema = {
  params: z.object({ clubId: mongoId, trainingId: mongoId }),
  query: paginationQuery.extend({
    status: z.nativeEnum(AttendanceStatus).optional(),
  }),
};

// ─── Get Single Attendance Record ────────────────────────────────────────────

export const getAttendanceRecordSchema = {
  params: z.object({ clubId: mongoId, trainingId: mongoId, attendanceId: mongoId }),
};

// ─── Get My Attendance (Student) ────────────────────────────────────────────

export const getMyAttendanceSchema = {
  query: paginationQuery.extend({
    trainingId: mongoId.optional(),
  }),
};

// ─── Global Attendance (Super Admin) ────────────────────────────────────────

export const getGlobalAttendanceSchema = {
  query: paginationQuery.extend({
    clubId: mongoId.optional(),
    trainingId: mongoId.optional(),
    status: z.nativeEnum(AttendanceStatus).optional(),
  }),
};

// ─── Types ───────────────────────────────────────────────────────────────────

export type CheckInInput = z.infer<typeof checkInStudentSchema.body>;
export type CheckOutInput = z.infer<typeof checkOutStudentSchema.body>;
export type MarkAbsentInput = z.infer<typeof markAbsentSchema.body>;
export type BulkCheckInInput = z.infer<typeof bulkCheckInSchema.body>;
export type GetTrainingAttendanceQuery = z.infer<
  typeof getTrainingAttendanceSchema.query
>;
export type GetMyAttendanceQuery = z.infer<typeof getMyAttendanceSchema.query>;
export type GetGlobalAttendanceQuery = z.infer<
  typeof getGlobalAttendanceSchema.query
>;
