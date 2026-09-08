import crypto from "crypto";
import mongoose from "mongoose";
import * as attendanceRepo from "./attendance.repository";
import { ApiError } from "../../shared/utils/ApiError";
import { AttendanceStatus, TrainingStatus } from "../../shared/enums";
import type {
  CheckInInput,
  CheckOutInput,
  MarkAbsentInput,
  BulkCheckInInput,
  GetTrainingAttendanceQuery,
  GetMyAttendanceQuery,
  GetGlobalAttendanceQuery,
} from "./attendance.validation";

// ─── State Machine ───────────────────────────────────────────────────────────

const VALID_TRANSITIONS: Record<AttendanceStatus, AttendanceStatus[]> = {
  [AttendanceStatus.NOT_ATTENDED]: [
    AttendanceStatus.CHECKED_IN,
    AttendanceStatus.ABSENT,
  ],
  [AttendanceStatus.CHECKED_IN]: [
    AttendanceStatus.CHECKED_OUT,
    AttendanceStatus.INCOMPLETE,
  ],
  [AttendanceStatus.CHECKED_OUT]: [],
  [AttendanceStatus.ABSENT]: [],
  [AttendanceStatus.INCOMPLETE]: [],
};

export function isValidTransition(
  current: AttendanceStatus,
  target: AttendanceStatus
): boolean {
  return VALID_TRANSITIONS[current].includes(target);
}

export function validateAttendanceTransition(
  current: AttendanceStatus,
  target: AttendanceStatus
): void {
  if (!isValidTransition(current, target)) {
    throw ApiError.badRequest(
      `Cannot transition attendance from "${current}" to "${target}"`
    );
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildSort(sort?: string): Record<string, 1 | -1> {
  if (!sort) return { createdAt: -1 };
  if (sort.startsWith("-")) {
    return { [sort.slice(1)]: -1 };
  }
  return { [sort]: 1 };
}

function generateQrToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ─── Session Management ──────────────────────────────────────────────────────

/**
 * Start an attendance session for a training.
 * Creates NOT_ATTENDED records for all approved registrations.
 * This is the "Start Check-in" action for the frontend.
 */
export async function startSession(clubId: string, trainingId: string) {
  const training = await attendanceRepo.findTrainingById(trainingId);
  if (!training) {
    throw ApiError.notFound("Training not found");
  }
  if (training.club.toString() !== clubId) {
    throw ApiError.forbidden("Training does not belong to this club");
  }

  // Check if attendance records already exist
  const existingRecords = await attendanceRepo.findAttendanceByTraining(
    trainingId
  );
  if (existingRecords.length > 0) {
    throw ApiError.badRequest(
      "Attendance session already started for this training"
    );
  }

  // Get all approved registrations
  const registrations = await attendanceRepo.findApprovedRegistrations(
    trainingId
  );

  if (registrations.length === 0) {
    throw ApiError.badRequest(
      "No approved registrations found for this training"
    );
  }

  // Create NOT_ATTENDED records for all registered students
  const attendanceRecords = registrations.map((reg) => ({
    training: new mongoose.Types.ObjectId(trainingId),
    user: reg.user,
    checkIn: { time: null, recordedBy: null, method: "manual" as const },
    checkOut: { time: null, recordedBy: null, method: "manual" as const },
    status: AttendanceStatus.NOT_ATTENDED,
    qrToken: generateQrToken(),
  }));

  await attendanceRepo.createBulkAttendance(attendanceRecords);

  return {
    trainingId,
    totalRegistered: registrations.length,
    message: "Attendance session started",
  };
}

/**
 * Close an attendance session.
 * Marks all remaining NOT_ATTENDED students as ABSENT.
 */
export async function closeSession(clubId: string, trainingId: string) {
  const training = await attendanceRepo.findTrainingById(trainingId);
  if (!training) {
    throw ApiError.notFound("Training not found");
  }
  if (training.club.toString() !== clubId) {
    throw ApiError.forbidden("Training does not belong to this club");
  }

  const records = await attendanceRepo.findAttendanceByTraining(trainingId);
  if (records.length === 0) {
    throw ApiError.badRequest("No attendance session found for this training");
  }

  // Mark all NOT_ATTENDED as ABSENT
  let absentCount = 0;
  for (const record of records) {
    if (record.status === AttendanceStatus.NOT_ATTENDED) {
      await attendanceRepo.updateAttendance(record._id.toString(), {
        status: AttendanceStatus.ABSENT,
      } as any);
      absentCount++;
    }

    // Mark CHECKED_IN but not CHECKED_OUT as INCOMPLETE
    if (record.status === AttendanceStatus.CHECKED_IN) {
      await attendanceRepo.updateAttendance(record._id.toString(), {
        status: AttendanceStatus.INCOMPLETE,
      } as any);
    }
  }

  return {
    trainingId,
    totalProcessed: records.length,
    absentMarked: absentCount,
    message: "Attendance session closed",
  };
}

/**
 * Get the current session status for a training.
 * Returns aggregated data for the frontend's live view.
 */
export async function getSessionStatus(
  clubId: string,
  trainingId: string
) {
  const training = await attendanceRepo.findTrainingById(trainingId);
  if (!training) {
    throw ApiError.notFound("Training not found");
  }
  if (training.club.toString() !== clubId) {
    throw ApiError.forbidden("Training does not belong to this club");
  }

  const records = await attendanceRepo.findAttendanceByTraining(trainingId);

  const stats = {
    total: records.length,
    checkedIn: records.filter(
      (r) =>
        r.status === AttendanceStatus.CHECKED_IN ||
        r.status === AttendanceStatus.CHECKED_OUT
    ).length,
    checkedOut: records.filter(
      (r) => r.status === AttendanceStatus.CHECKED_OUT
    ).length,
    absent: records.filter((r) => r.status === AttendanceStatus.ABSENT).length,
    incomplete: records.filter(
      (r) => r.status === AttendanceStatus.INCOMPLETE
    ).length,
    notAttended: records.filter(
      (r) => r.status === AttendanceStatus.NOT_ATTENDED
    ).length,
  };

  const isActive =
    records.length > 0 &&
    records.some(
      (r) =>
        r.status === AttendanceStatus.NOT_ATTENDED ||
        r.status === AttendanceStatus.CHECKED_IN
    );

  const participants = records.map((r) => ({
    userId: (r.user as any)._id?.toString() || r.user.toString(),
    name: `${(r.user as any).firstName || ""} ${(r.user as any).lastName || ""}`.trim(),
    email: (r.user as any).email || "",
    status: r.status,
    checkInTime: r.checkIn.time,
    checkOutTime: r.checkOut.time,
    method: r.checkIn.method,
  }));

  return {
    trainingId,
    training: {
      title: training.title,
      date: training.date,
      startTime: training.startTime,
      endTime: training.endTime,
      location: training.location,
    },
    isActive,
    stats,
    participants,
  };
}

// ─── Check-in Operations ─────────────────────────────────────────────────────

/**
 * Check in a student manually.
 * Club Leader records the check-in with server timestamp.
 */
export async function checkInStudent(
  clubId: string,
  trainingId: string,
  input: CheckInInput,
  recordedBy: string
) {
  const training = await attendanceRepo.findTrainingById(trainingId);
  if (!training) {
    throw ApiError.notFound("Training not found");
  }
  if (training.club.toString() !== clubId) {
    throw ApiError.forbidden("Training does not belong to this club");
  }

  const record = await attendanceRepo.findAttendanceByTrainingAndUser(
    trainingId,
    input.userId
  );
  if (!record) {
    throw ApiError.notFound(
      "No attendance record found. Start the session first."
    );
  }

  validateAttendanceTransition(record.status, AttendanceStatus.CHECKED_IN);

  const updated = await attendanceRepo.updateAttendance(record._id.toString(), {
    status: AttendanceStatus.CHECKED_IN,
    checkIn: {
      time: new Date(),
      recordedBy: new mongoose.Types.ObjectId(recordedBy),
      method: input.method || "manual",
    },
  } as any);

  return updated!.toJSON();
}

/**
 * Check in a student via QR code.
 * Uses server timestamp as source of truth.
 */
export async function checkInViaQr(trainingId: string, qrToken: string) {
  const record = await attendanceRepo.findAttendanceByQrToken(qrToken);
  if (!record) {
    throw ApiError.notFound("Invalid QR token");
  }
  if (record.training.toString() !== trainingId) {
    throw ApiError.badRequest("QR token does not match this training");
  }

  validateAttendanceTransition(record.status, AttendanceStatus.CHECKED_IN);

  const updated = await attendanceRepo.updateAttendance(record._id.toString(), {
    status: AttendanceStatus.CHECKED_IN,
    checkIn: {
      time: new Date(),
      recordedBy: null,
      method: "qr_code",
    },
  } as any);

  return updated!.toJSON();
}

/**
 * Bulk check-in multiple students.
 */
export async function bulkCheckIn(
  clubId: string,
  trainingId: string,
  input: BulkCheckInInput,
  recordedBy: string
) {
  const training = await attendanceRepo.findTrainingById(trainingId);
  if (!training) {
    throw ApiError.notFound("Training not found");
  }
  if (training.club.toString() !== clubId) {
    throw ApiError.forbidden("Training does not belong to this club");
  }

  const results = { checkedIn: 0, skipped: 0, errors: [] as string[] };
  const now = new Date();

  for (const userId of input.userIds) {
    const record = await attendanceRepo.findAttendanceByTrainingAndUser(
      trainingId,
      userId
    );
    if (!record) {
      results.errors.push(`No attendance record for user ${userId}`);
      continue;
    }

    if (!isValidTransition(record.status, AttendanceStatus.CHECKED_IN)) {
      results.skipped++;
      continue;
    }

    await attendanceRepo.updateAttendance(record._id.toString(), {
      status: AttendanceStatus.CHECKED_IN,
      checkIn: {
        time: now,
        recordedBy: new mongoose.Types.ObjectId(recordedBy),
        method: "manual",
      },
    } as any);
    results.checkedIn++;
  }

  return results;
}

// ─── Check-out Operations ────────────────────────────────────────────────────

/**
 * Check out a student.
 * Only allowed after check-in. Server records the timestamp.
 */
export async function checkOutStudent(
  clubId: string,
  trainingId: string,
  input: CheckOutInput
) {
  const training = await attendanceRepo.findTrainingById(trainingId);
  if (!training) {
    throw ApiError.notFound("Training not found");
  }
  if (training.club.toString() !== clubId) {
    throw ApiError.forbidden("Training does not belong to this club");
  }

  const record = await attendanceRepo.findAttendanceByTrainingAndUser(
    trainingId,
    input.userId
  );
  if (!record) {
    throw ApiError.notFound("No attendance record found for this student");
  }

  validateAttendanceTransition(record.status, AttendanceStatus.CHECKED_OUT);

  const updated = await attendanceRepo.updateAttendance(record._id.toString(), {
    status: AttendanceStatus.CHECKED_OUT,
    checkOut: {
      time: new Date(),
      recordedBy: null,
      method: record.checkIn.method,
    },
  } as any);

  return updated!.toJSON();
}

// ─── Mark Absent ─────────────────────────────────────────────────────────────

/**
 * Manually mark students as absent.
 */
export async function markAbsent(
  clubId: string,
  trainingId: string,
  input: MarkAbsentInput
) {
  const training = await attendanceRepo.findTrainingById(trainingId);
  if (!training) {
    throw ApiError.notFound("Training not found");
  }
  if (training.club.toString() !== clubId) {
    throw ApiError.forbidden("Training does not belong to this club");
  }

  const results = { marked: 0, skipped: 0, errors: [] as string[] };

  for (const userId of input.userIds) {
    const record = await attendanceRepo.findAttendanceByTrainingAndUser(
      trainingId,
      userId
    );
    if (!record) {
      results.errors.push(`No attendance record for user ${userId}`);
      continue;
    }

    if (!isValidTransition(record.status, AttendanceStatus.ABSENT)) {
      results.skipped++;
      continue;
    }

    await attendanceRepo.updateAttendance(record._id.toString(), {
      status: AttendanceStatus.ABSENT,
    } as any);
    results.marked++;
  }

  return results;
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Get attendance records for a training (Club Leader).
 */
export async function getTrainingAttendance(
  clubId: string,
  trainingId: string,
  query: GetTrainingAttendanceQuery
) {
  const training = await attendanceRepo.findTrainingById(trainingId);
  if (!training) {
    throw ApiError.notFound("Training not found");
  }
  if (training.club.toString() !== clubId) {
    throw ApiError.forbidden("Training does not belong to this club");
  }

  const { page, limit, status } = query;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (status) {
    filter.status = status;
  }

  const { records, total } = await attendanceRepo.findAttendanceByTrainingPaginated(
    trainingId,
    filter,
    skip,
    limit
  );

  return {
    records,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/**
 * Get a single attendance record (Club Leader).
 */
export async function getAttendanceRecord(
  clubId: string,
  trainingId: string,
  attendanceId: string
) {
  const training = await attendanceRepo.findTrainingById(trainingId);
  if (!training) {
    throw ApiError.notFound("Training not found");
  }
  if (training.club.toString() !== clubId) {
    throw ApiError.forbidden("Training does not belong to this club");
  }

  const record = await attendanceRepo.findAttendanceByIdLean(attendanceId);
  if (!record) {
    throw ApiError.notFound("Attendance record not found");
  }
  if ((record.training as any)._id?.toString() !== trainingId) {
    throw ApiError.forbidden("Attendance record does not belong to this training");
  }

  return record;
}

/**
 * Get student's own attendance history.
 */
export async function getMyAttendance(
  userId: string,
  query: GetMyAttendanceQuery
) {
  const { page, limit, trainingId } = query;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (trainingId) {
    filter.training = trainingId;
  }

  const { records, total } = await attendanceRepo.findUserAttendance(
    userId,
    filter,
    skip,
    limit
  );

  return {
    records,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/**
 * Get global attendance (Super Admin).
 */
export async function getGlobalAttendance(
  query: GetGlobalAttendanceQuery
) {
  const { page, limit, sort, clubId, trainingId, status } = query;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (clubId) {
    filter["training.club"] = new mongoose.Types.ObjectId(clubId);
  }
  if (trainingId) {
    filter.training = new mongoose.Types.ObjectId(trainingId);
  }
  if (status) {
    filter.status = status;
  }

  const sortObj = buildSort(sort);
  const { records, total } = await attendanceRepo.findGlobalAttendance(
    filter,
    skip,
    limit
  );

  return {
    records,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
