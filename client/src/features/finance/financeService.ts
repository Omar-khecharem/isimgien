import { apiClient } from "../../services/apiClient";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "../../types";

export interface Transaction {
  _id: string;
  club: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
  date: string;
  recordedBy: { _id: string; firstName: string; lastName: string };
  receipt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceSummary {
  clubId: string;
  clubName: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categoryBreakdown: Record<string, { income: number; expense: number }>;
}

export const financeService = {
  async listTransactions(clubId: string, params?: PaginationParams & { type?: string; category?: string }) {
    return apiClient.get<PaginatedResponse<Transaction>>(
      `/clubs/${clubId}/finance/transactions`,
      params as any
    );
  },

  async getBalance(clubId: string) {
    return apiClient.get<ApiResponse<{ balance: number; totalIncome: number; totalExpenses: number }>>(
      `/clubs/${clubId}/finance/balance`
    );
  },

  async getSummary(clubId: string) {
    return apiClient.get<ApiResponse<FinanceSummary>>(
      `/clubs/${clubId}/finance/summary`
    );
  },

  async createTransaction(clubId: string, data: Partial<Transaction>) {
    return apiClient.post<ApiResponse<Transaction>>(
      `/clubs/${clubId}/finance/transactions`,
      data
    );
  },
};
