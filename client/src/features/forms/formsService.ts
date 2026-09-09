import { apiClient } from "../../services/apiClient";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "../../types";

export interface Form {
  _id: string;
  club: string;
  title: string;
  description: string;
  createdBy: string;
  isActive: boolean;
  isPublished: boolean;
  version: number;
  questions: FormQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface FormQuestion {
  _id: string;
  type: string;
  label: string;
  description?: string | null;
  required: boolean;
  options?: { label: string; value: string }[] | null;
  validation?: { min?: number; max?: number; pattern?: string };
  order: number;
}

export const formsService = {
  async listByClub(clubId: string, params?: PaginationParams) {
    return apiClient.get<PaginatedResponse<Form>>(
      `/clubs/${clubId}/forms`,
      params as any
    );
  },

  async getById(clubId: string, id: string) {
    return apiClient.get<ApiResponse<Form>>(`/clubs/${clubId}/forms/${id}`);
  },

  async create(clubId: string, data: Partial<Form>) {
    return apiClient.post<ApiResponse<Form>>(`/clubs/${clubId}/forms`, data);
  },

  async publish(clubId: string, id: string) {
    return apiClient.patch<ApiResponse<Form>>(`/clubs/${clubId}/forms/${id}/publish`);
  },

  async unpublish(clubId: string, id: string) {
    return apiClient.patch<ApiResponse<Form>>(`/clubs/${clubId}/forms/${id}/unpublish`);
  },
};
