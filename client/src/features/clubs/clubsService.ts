import { apiClient } from "../../services/apiClient";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "../../types";
import type { Membership } from "../memberships/membershipsService";

export interface ClubSocialLinks {
  website?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
}

export interface Club {
  _id: string;
  name: string;
  slug: string;
  description: string;
  logo?: string | null;
  coverImage?: string | null;
  leader?: { _id: string; firstName: string; lastName: string; email: string; avatar?: string | null } | null;
  establishedDate?: string | null;
  isActive: boolean;
  contactEmail?: string | null;
  contactPhone?: string | null;
  socialLinks?: ClubSocialLinks;
  settings: {
    requireRegistrationValidation: boolean;
    defaultTrainingCapacity: number | null;
    membershipFee: number;
    membershipPeriodMonths: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateClubByLeaderInput {
  name?: string;
  description?: string;
  logo?: string | null;
  coverImage?: string | null;
  establishedDate?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  socialLinks?: ClubSocialLinks;
  settings?: {
    requireRegistrationValidation?: boolean;
    defaultTrainingCapacity?: number | null;
    membershipFee?: number;
    membershipPeriodMonths?: number;
  };
}

export const clubsService = {
  async list(params?: PaginationParams & { isActive?: boolean }) {
    return apiClient.get<PaginatedResponse<Club>>("/clubs", params as any);
  },

  async listActive(params?: PaginationParams) {
    return apiClient.get<PaginatedResponse<Club>>("/clubs", params as any);
  },

  async getMyClub() {
    return apiClient.get<ApiResponse<Club>>("/clubs/my-club");
  },

  async getById(id: string) {
    return apiClient.get<ApiResponse<Club>>(`/clubs/${id}`);
  },

  async create(data: Partial<Club>) {
    return apiClient.post<ApiResponse<Club>>("/clubs", data);
  },

  async update(id: string, data: Partial<Club>) {
    return apiClient.put<ApiResponse<Club>>(`/clubs/${id}`, data);
  },

  async updateByLeader(id: string, data: UpdateClubByLeaderInput) {
    return apiClient.put<ApiResponse<Club>>(`/clubs/${id}/manage`, data);
  },

  async deactivate(id: string) {
    return apiClient.patch<ApiResponse<Club>>(`/clubs/${id}/deactivate`);
  },

  async join(id: string, academicYear: string) {
    return apiClient.post<ApiResponse<Membership>>(`/clubs/${id}/join`, { academicYear });
  },

  async assignLeader(clubId: string, userId: string) {
    return apiClient.patch<ApiResponse<Club>>(`/clubs/${clubId}/leader`, { userId });
  },
};
