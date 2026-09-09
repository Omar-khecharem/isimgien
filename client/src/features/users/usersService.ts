import { apiClient } from "../../services/apiClient";
import type { ApiResponse, PaginatedResponse, PaginationParams, Role } from "../../types";

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  avatar?: string | null;
  phone?: string | null;
  studentId?: string | null;
  isActive: boolean;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateRolePayload {
  role: Role;
}

export const usersService = {
  async list(params?: PaginationParams & { role?: Role; isActive?: boolean }) {
    return apiClient.get<PaginatedResponse<User>>("/users", params as any);
  },

  async getById(id: string) {
    return apiClient.get<ApiResponse<User>>(`/users/${id}`);
  },

  async updateRole(id: string, role: Role) {
    return apiClient.patch<ApiResponse<User>>(`/users/${id}/role`, { role });
  },

  async toggleActive(id: string) {
    return apiClient.patch<ApiResponse<User>>(`/users/${id}/toggle-active`);
  },

  async delete(id: string) {
    return apiClient.delete(`/users/${id}`);
  },
};
