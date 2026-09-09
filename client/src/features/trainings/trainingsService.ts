import { apiClient } from "../../services/apiClient";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "../../types";

export enum TrainingStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  REGISTRATION_OPEN = "registration_open",
  REGISTRATION_CLOSED = "registration_closed",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface Training {
  _id: string;
  club: string;
  title: string;
  slug: string;
  description: string;
  poster?: string | null;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number | null;
  status: TrainingStatus;
  requiresValidation: boolean;
  linkedForm?: string | null;
  createdBy: string;
  registeredCount: number;
  createdAt: string;
  updatedAt: string;
}

export const trainingsService = {
  async listByClub(clubId: string, params?: PaginationParams & { status?: TrainingStatus }) {
    return apiClient.get<PaginatedResponse<Training>>(
      `/clubs/${clubId}/trainings`,
      params as any
    );
  },

  async getById(clubId: string, id: string) {
    return apiClient.get<ApiResponse<Training>>(`/clubs/${clubId}/trainings/${id}`);
  },

  async create(clubId: string, data: Partial<Training>) {
    return apiClient.post<ApiResponse<Training>>(`/clubs/${clubId}/trainings`, data);
  },

  async update(clubId: string, id: string, data: Partial<Training>) {
    return apiClient.put<ApiResponse<Training>>(`/clubs/${clubId}/trainings/${id}`, data);
  },

  async transitionStatus(clubId: string, id: string, status: TrainingStatus) {
    return apiClient.patch<ApiResponse<Training>>(
      `/clubs/${clubId}/trainings/${id}/status`,
      { status }
    );
  },

  async delete(clubId: string, id: string) {
    return apiClient.delete(`/clubs/${clubId}/trainings/${id}`);
  },

  // Public
  async listPublic(params?: PaginationParams) {
    return apiClient.get<PaginatedResponse<Training>>("/trainings", params as any);
  },
};
