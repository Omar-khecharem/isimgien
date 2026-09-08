import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import * as attendanceController from "./attendance.controller";
import * as attendancePolicies from "./attendance.policies";
import {
  checkInViaQrSchema,
  getMyAttendanceSchema,
  getGlobalAttendanceSchema,
} from "./attendance.validation";

const router = Router();

// ─── Student: QR check-in ───────────────────────────────────────────────────

router.post(
  "/check-in/qr/:trainingId",
  authenticate,
  attendancePolicies.requireStudentOrAbove,
  validate(checkInViaQrSchema),
  attendanceController.checkInViaQr
);

// ─── Student: My attendance history ──────────────────────────────────────────

router.get(
  "/my-attendance",
  authenticate,
  attendancePolicies.requireStudentOrAbove,
  validate(getMyAttendanceSchema),
  attendanceController.getMyAttendance
);

// ─── Super Admin: Global attendance ──────────────────────────────────────────

router.get(
  "/global",
  authenticate,
  attendancePolicies.requireSuperAdmin,
  validate(getGlobalAttendanceSchema),
  attendanceController.getGlobalAttendance
);

export default router;
