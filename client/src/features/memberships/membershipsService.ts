import { apiClient } from "../../services/apiClient";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "../../types";

export enum MembershipStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  PENDING_PAYMENT = "pending_payment",
}

export interface Membership {
  _id: string;
  club: { _id: string; name: string; slug: string };
  user: { _id: string; firstName: string; lastName: string; email: string };
  academicYear: string;
  status: MembershipStatus;
  amountPaid: number;
  paymentDate?: string | null;
  receiptNumber?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const membershipsService = {
  async listByClub(clubId: string, params?: PaginationParams & { status?: MembershipStatus }) {
    return apiClient.get<PaginatedResponse<Membership>>(
      `/clubs/${clubId}/memberships`,
      params as any
    );
  },

  async getMyMembership(clubId: string) {
    return apiClient.get<ApiResponse<Membership>>(
      `/clubs/${clubId}/memberships/my-membership`
    );
  },

  async getMyMemberships(params?: PaginationParams) {
    return apiClient.get<PaginatedResponse<Membership>>("/clubs/my-memberships", params as any);
  },

  async recordPayment(clubId: string, membershipId: string, data: { amount: number; paymentDate: string }) {
    return apiClient.post<ApiResponse<Membership>>(
      `/clubs/${clubId}/memberships/${membershipId}/payment`,
      data
    );
  },
};
