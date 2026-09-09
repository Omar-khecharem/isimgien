import { apiClient } from "../../services/apiClient";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "../../types";

export enum EventStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  REGISTRATION_OPEN = "registration_open",
  REGISTRATION_CLOSED = "registration_closed",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface Event {
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
  status: EventStatus;
  isPublic: boolean;
  createdBy: string;
  registeredCount: number;
  createdAt: string;
  updatedAt: string;
}

export const eventsService = {
  async listByClub(clubId: string, params?: PaginationParams & { status?: EventStatus }) {
    return apiClient.get<PaginatedResponse<Event>>(
      `/clubs/${clubId}/events`,
      params as any
    );
  },

  async getById(clubId: string, id: string) {
    return apiClient.get<ApiResponse<Event>>(`/clubs/${clubId}/events/${id}`);
  },

  async create(clubId: string, data: Partial<Event>) {
    return apiClient.post<ApiResponse<Event>>(`/clubs/${clubId}/events`, data);
  },

  async update(clubId: string, id: string, data: Partial<Event>) {
    return apiClient.put<ApiResponse<Event>>(`/clubs/${clubId}/events/${id}`, data);
  },

  async transitionStatus(clubId: string, id: string, status: EventStatus) {
    return apiClient.patch<ApiResponse<Event>>(
      `/clubs/${clubId}/events/${id}/status`,
      { status }
    );
  },

  async delete(clubId: string, id: string) {
    return apiClient.delete(`/clubs/${clubId}/events/${id}`);
  },

  // Public
  async listPublic(params?: PaginationParams) {
    return apiClient.get<PaginatedResponse<Event>>("/events", params as any);
  },
};
