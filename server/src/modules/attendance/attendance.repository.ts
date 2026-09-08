import mongoose from "mongoose";
import { Attendance, IAttendance } from "../../models/attendance.model";
import { Registration } from "../../models/registration.model";
import { Training } from "../../models/training.model";
import { RegistrationStatus, RegistrationTargetType } from "../../shared/enums";

// ─── Attendance CRUD ─────────────────────────────────────────────────────────

export async function findAttendanceById(id: string): Promise<IAttendance | null> {
  return Attendance.findById(id);
}

export async function findAttendanceByIdLean(id: string) {
  return Attendance.findById(id)
    .populate("user", "firstName lastName email studentId avatar")
    .populate("training", "title date startTime endTime location club")
    .lean();
}

export async function createAttendance(
  data: Partial<IAttendance>
): Promise<IAttendance> {
  return Attendance.create(data);
}

export async function updateAttendance(
  id: string,
  data: Partial<IAttendance>
): Promise<IAttendance | null> {
  return Attendance.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
}

export async function findAttendanceByTrainingAndUser(
  trainingId: string,
  userId: string
): Promise<IAttendance | null> {
  return Attendance.findOne({ training: trainingId, user: userId });
}

export async function findAttendanceByTraining(
  trainingId: string
) {
  return Attendance.find({ training: trainingId })
    .populate("user", "firstName lastName email studentId avatar")
    .sort({ "user.firstName": 1 })
    .lean();
}

export async function findAttendanceByTrainingPaginated(
  trainingId: string,
  filter: Record<string, unknown>,
  skip: number,
  limit: number
) {
  const combinedFilter = { training: trainingId, ...filter };
  const [records, total] = await Promise.all([
    Attendance.find(combinedFilter)
      .populate("user", "firstName lastName email studentId avatar")
      .sort({ status: 1, "user.firstName": 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Attendance.countDocuments(combinedFilter),
  ]);
  return { records, total };
}

export async function findUserAttendance(
  userId: string,
  filter: Record<string, unknown>,
  skip: number,
  limit: number
) {
  const combinedFilter = { user: userId, ...filter };
  const [records, total] = await Promise.all([
    Attendance.find(combinedFilter)
      .populate({
        path: "training",
        select: "title date startTime endTime location club",
        populate: { path: "club", select: "name slug logo" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Attendance.countDocuments(combinedFilter),
  ]);
  return { records, total };
}

export async function findGlobalAttendance(
  filter: Record<string, unknown>,
  skip: number,
  limit: number
) {
  const [records, total] = await Promise.all([
    Attendance.find(filter)
      .populate("user", "firstName lastName email studentId avatar")
      .populate({
        path: "training",
        select: "title date startTime endTime club",
        populate: { path: "club", select: "name slug" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Attendance.countDocuments(filter),
  ]);
  return { records, total };
}

// ─── Bulk Operations ─────────────────────────────────────────────────────────

export async function createBulkAttendance(
  records: Partial<IAttendance>[]
) {
  return Attendance.insertMany(records as any[]);
}

// ─── Registration Queries ────────────────────────────────────────────────────

export async function findApprovedRegistrations(
  trainingId: string
) {
  return Registration.find({
    targetType: RegistrationTargetType.TRAINING,
    target: trainingId,
    status: RegistrationStatus.APPROVED,
  }).lean();
}

// ─── Training Queries ────────────────────────────────────────────────────────

export async function findTrainingById(
  id: string
) {
  return Training.findById(id);
}

// ─── QR Token ────────────────────────────────────────────────────────────────

export async function findAttendanceByQrToken(
  qrToken: string
): Promise<IAttendance | null> {
  return Attendance.findOne({ qrToken });
}
