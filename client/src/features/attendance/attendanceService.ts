import { apiClient } from "../../services/apiClient";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "../../types";

export enum AttendanceStatus {
  NOT_ATTENDED = "not_attended",
  CHECKED_IN = "checked_in",
  CHECKED_OUT = "checked_out",
  ABSENT = "absent",
  INCOMPLETE = "incomplete",
}

export interface AttendanceRecord {
  _id: string;
  training: { _id: string; title: string; date: string };
  user: { _id: string; firstName: string; lastName: string; email: string };
  checkIn: { time: string | null; recordedBy: string | null; method: string };
  checkOut: { time: string | null; recordedBy: string | null; method: string };
  status: AttendanceStatus;
  qrToken?: string | null;
}

export const attendanceService = {
  async getTrainingAttendance(
    clubId: string,
    trainingId: string,
    params?: PaginationParams & { status?: AttendanceStatus }
  ) {
    return apiClient.get<PaginatedResponse<AttendanceRecord>>(
      `/clubs/${clubId}/trainings/${trainingId}/attendance`,
      params as any
    );
  },

  async startSession(clubId: string, trainingId: string) {
    return apiClient.post(`/clubs/${clubId}/trainings/${trainingId}/attendance`);
  },

  async closeSession(clubId: string, trainingId: string) {
    return apiClient.patch(`/clubs/${clubId}/trainings/${trainingId}/attendance/close`);
  },

  async checkIn(clubId: string, trainingId: string, userId: string) {
    return apiClient.post(
      `/clubs/${clubId}/trainings/${trainingId}/attendance/check-in`,
      { userId, method: "manual" }
    );
  },

  async checkOut(clubId: string, trainingId: string, userId: string) {
    return apiClient.post(
      `/clubs/${clubId}/trainings/${trainingId}/attendance/check-out`,
      { userId }
    );
  },

  async getMyAttendance(params?: PaginationParams) {
    return apiClient.get<PaginatedResponse<AttendanceRecord>>(
      "/attendance/my-attendance",
      params as any
    );
  },
};
