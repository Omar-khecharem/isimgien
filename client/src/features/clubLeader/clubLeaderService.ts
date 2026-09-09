import { apiClient } from "../../services/apiClient";
import type { ApiResponse } from "../../types";

export interface DashboardKpis {
  totalFormations: number;
  formationsTerminees: number;
  formationsEnCours: number;
  inscriptionsEnAttente: number;
}

export interface AnalyticsDay {
  day: string;
  checkIns: number;
  checkOuts: number;
  incomplete: number;
}

export interface NextTraining {
  _id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: string;
  registrationCount: number;
}

export interface UpcomingTraining {
  _id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: string;
}

export interface MemberRecord {
  _id: string;
  user: { _id: string; firstName: string; lastName: string; email: string };
  academicYear?: string;
  status?: string;
  amountPaid?: number;
  createdAt: string;
}

export interface RegistrationRecord {
  _id: string;
  user: { _id: string; firstName: string; lastName: string; email: string };
  status: string;
  targetType: string;
  createdAt: string;
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  recentTransactions: Array<{
    _id: string;
    type: string;
    category: string;
    amount: number;
    description: string;
    date: string;
    recordedBy: { firstName: string; lastName: string };
  }>;
}

export interface ActiveSession {
  _id: string;
  total: number;
  checkedIn: number;
  checkedOut: number;
  incomplete: number;
  notAttended: number;
  training: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
  };
}

export interface ClubDashboardData {
  kpis: DashboardKpis;
  analytics: AnalyticsDay[];
  nextTraining: NextTraining | null;
  upcoming: UpcomingTraining[];
  members: {
    recentMemberships: MemberRecord[];
    pendingRequests: number;
    recentRegistrations: RegistrationRecord[];
  };
  finance: FinanceSummary;
  activeSession: ActiveSession | null;
  recentRegistrations: RegistrationRecord[];
}

export const clubLeaderService = {
  async getDashboard(clubId: string) {
    return apiClient.get<ApiResponse<ClubDashboardData>>(
      `/clubs/${clubId}/dashboard`
    );
  },
};
