import { apiClient } from "../../services/apiClient";
import type { ApiResponse } from "../../types";

export interface NotificationSummary {
  total: number;
  unread: number;
  recent: Array<{
    _id: string;
    title: string;
    message: string;
    type: string;
    createdAt: string;
  }>;
}

export const notificationsService = {
  async getGlobalSummary() {
    return apiClient.get<ApiResponse<NotificationSummary>>("/notifications/summary");
  },
};
