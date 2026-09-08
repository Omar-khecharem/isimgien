import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import * as attendanceController from "./attendance.controller";
import * as attendancePolicies from "./attendance.policies";
import {
  startSessionSchema,
  closeSessionSchema,
  checkInStudentSchema,
  checkOutStudentSchema,
  markAbsentSchema,
  bulkCheckInSchema,
  getSessionSchema,
  getTrainingAttendanceSchema,
  getAttendanceRecordSchema,
} from "./attendance.validation";

const router = Router({ mergeParams: true });

// ─── Club Leader: Start attendance session ───────────────────────────────────

router.post(
  "/",
  authenticate,
  attendancePolicies.requireTrainingOwnershipOrSuperAdmin,
  validate(startSessionSchema),
  attendanceController.startSession
);

// ─── Club Leader: Close attendance session ───────────────────────────────────

router.delete(
  "/",
  authenticate,
  attendancePolicies.requireTrainingOwnershipOrSuperAdmin,
  validate(closeSessionSchema),
  attendanceController.closeSession
);

// ─── Club Leader: Get session status (live view) ─────────────────────────────

router.get(
  "/session",
  authenticate,
  attendancePolicies.requireTrainingOwnershipOrSuperAdmin,
  validate(getSessionSchema),
  attendanceController.getSession
);

// ─── Club Leader: List attendance for a training ─────────────────────────────

router.get(
  "/",
  authenticate,
  attendancePolicies.requireTrainingOwnershipOrSuperAdmin,
  validate(getTrainingAttendanceSchema),
  attendanceController.getTrainingAttendance
);

// ─── Club Leader: Get single attendance record ───────────────────────────────

router.get(
  "/:attendanceId",
  authenticate,
  attendancePolicies.requireTrainingOwnershipOrSuperAdmin,
  validate(getAttendanceRecordSchema),
  attendanceController.getAttendanceRecord
);

// ─── Club Leader: Check-in student ───────────────────────────────────────────

router.post(
  "/check-in",
  authenticate,
  attendancePolicies.requireTrainingOwnershipOrSuperAdmin,
  validate(checkInStudentSchema),
  attendanceController.checkInStudent
);

// ─── Club Leader: Bulk check-in ──────────────────────────────────────────────

router.post(
  "/check-in/bulk",
  authenticate,
  attendancePolicies.requireTrainingOwnershipOrSuperAdmin,
  validate(bulkCheckInSchema),
  attendanceController.bulkCheckIn
);

// ─── Club Leader: Check-out student ──────────────────────────────────────────

router.post(
  "/check-out",
  authenticate,
  attendancePolicies.requireTrainingOwnershipOrSuperAdmin,
  validate(checkOutStudentSchema),
  attendanceController.checkOutStudent
);

// ─── Club Leader: Mark absent ────────────────────────────────────────────────

router.post(
  "/absent",
  authenticate,
  attendancePolicies.requireTrainingOwnershipOrSuperAdmin,
  validate(markAbsentSchema),
  attendanceController.markAbsent
);

// ─── Student: QR check-in (no clubId needed) ────────────────────────────────
// Note: This is mounted separately in routes/index.ts

export default router;
