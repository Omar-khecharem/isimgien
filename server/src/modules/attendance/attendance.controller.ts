import { Request, Response } from "express";
import * as attendanceService from "./attendance.service";
import { ApiResponse } from "../../shared/utils/apiResponse";
import { asyncHandler } from "../../shared/utils/asyncHandler";

// ─── Session Management (Club Leader) ────────────────────────────────────────

export const startSession = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await attendanceService.startSession(
      req.params.clubId,
      req.params.trainingId
    );
    ApiResponse.created(res, result, "Attendance session started");
  }
);

export const closeSession = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await attendanceService.closeSession(
      req.params.clubId,
      req.params.trainingId
    );
    ApiResponse.success(res, result, 200, "Attendance session closed");
  }
);

export const getSession = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await attendanceService.getSessionStatus(
      req.params.clubId,
      req.params.trainingId
    );
    ApiResponse.success(res, result);
  }
);

// ─── Check-in Operations (Club Leader) ──────────────────────────────────────

export const checkInStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await attendanceService.checkInStudent(
      req.params.clubId,
      req.params.trainingId,
      req.body,
      req.user!.id
    );
    ApiResponse.success(res, result, 200, "Student checked in");
  }
);

export const bulkCheckIn = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await attendanceService.bulkCheckIn(
      req.params.clubId,
      req.params.trainingId,
      req.body,
      req.user!.id
    );
    ApiResponse.success(res, result, 200, "Bulk check-in completed");
  }
);

// ─── QR Check-in (Student) ──────────────────────────────────────────────────

export const checkInViaQr = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await attendanceService.checkInViaQr(
      req.params.trainingId,
      req.body.qrToken
    );
    ApiResponse.success(res, result, 200, "Checked in via QR code");
  }
);

// ─── Check-out Operations (Club Leader) ─────────────────────────────────────

export const checkOutStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await attendanceService.checkOutStudent(
      req.params.clubId,
      req.params.trainingId,
      req.body
    );
    ApiResponse.success(res, result, 200, "Student checked out");
  }
);

// ─── Mark Absent (Club Leader) ──────────────────────────────────────────────

export const markAbsent = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await attendanceService.markAbsent(
      req.params.clubId,
      req.params.trainingId,
      req.body
    );
    ApiResponse.success(res, result, 200, "Absent marks applied");
  }
);

// ─── Queries (Club Leader) ──────────────────────────────────────────────────

export const getTrainingAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await attendanceService.getTrainingAttendance(
      req.params.clubId,
      req.params.trainingId,
      req.query as any
    );
    ApiResponse.paginated(res, result.records, result.meta);
  }
);

export const getAttendanceRecord = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await attendanceService.getAttendanceRecord(
      req.params.clubId,
      req.params.trainingId,
      req.params.attendanceId
    );
    ApiResponse.success(res, result);
  }
);

// ─── Student: My Attendance ─────────────────────────────────────────────────

export const getMyAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await attendanceService.getMyAttendance(
      req.user!.id,
      req.query as any
    );
    ApiResponse.paginated(res, result.records, result.meta);
  }
);

// ─── Super Admin: Global Attendance ─────────────────────────────────────────

export const getGlobalAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await attendanceService.getGlobalAttendance(
      req.query as any
    );
    ApiResponse.paginated(res, result.records, result.meta);
  }
);
