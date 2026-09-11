import { apiClient } from "../../services/apiClient";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "../../types";

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

export interface MembershipStats {
  clubId: string;
  clubName: string;
  membershipFee: number;
  active: { count: number; totalPaid: number };
  expired: { count: number; totalPaid: number };
  pendingPayment: { count: number; totalPaid: number };
  totalMembers: number;
  totalRevenue: number;
}

export interface MemberRecord {
  _id: string;
  user: { _id: string; firstName: string; lastName: string; email: string; avatar?: string };
  academicYear?: string;
  status?: string;
  amountPaid?: number;
  paymentDate?: string | null;
  receiptNumber?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface InviteMemberInput {
  userId: string;
  academicYear: string;
}

export interface UpdateMemberStatusInput {
  status: "active" | "expired" | "pending_payment";
}

export interface RecordPaymentInput {
  amountPaid: number;
  paymentDate?: string;
  receiptNumber?: string;
}

// ─── Form Types ──────────────────────────────────────────────────────────

export type FormQuestionType =
  | "short_text"
  | "long_text"
  | "email"
  | "number"
  | "single_choice"
  | "multiple_choice"
  | "dropdown"
  | "date";

export interface FormQuestionOption {
  label: string;
  value: string;
}

export interface FormQuestion {
  _id: string;
  type: FormQuestionType;
  label: string;
  description?: string | null;
  required: boolean;
  options?: FormQuestionOption[] | null;
  validation?: { min?: number; max?: number; pattern?: string };
  order: number;
}

export interface FormRecord {
  _id: string;
  title: string;
  description: string;
  club: { _id: string; name: string; slug: string; logo?: string | null };
  createdBy: { _id: string; firstName: string; lastName: string; email: string };
  questions: FormQuestion[];
  isActive: boolean;
  isPublished: boolean;
  version: number;
  publishedQuestions?: FormQuestion[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface FormStats {
  formId: string;
  formVersion: number;
  totalResponses: number;
  currentVersionResponses: number;
  previousVersionResponses: number;
}

export interface FormResponseRecord {
  _id: string;
  form: string;
  user: { _id: string; firstName: string; lastName: string; email: string };
  formVersion: number;
  questionDefinitions: FormQuestion[];
  answers: Array<{ questionId: string; value: string | string[] | number | null }>;
  submittedAt: string;
  createdAt: string;
}

export interface CreateFormInput {
  title: string;
  description?: string;
}

export interface AddQuestionInput {
  type: FormQuestionType;
  label: string;
  description?: string | null;
  required?: boolean;
  options?: FormQuestionOption[] | null;
}

export const clubLeaderService = {
  async getDashboard(clubId: string) {
    return apiClient.get<ApiResponse<ClubDashboardData>>(
      `/clubs/${clubId}/dashboard`
    );
  },

  async getMembers(clubId: string, params?: PaginationParams & { status?: string }) {
    return apiClient.get<PaginatedResponse<MemberRecord>>(
      `/clubs/${clubId}/members`,
      params as any
    );
  },

  async getMembershipStats(clubId: string) {
    return apiClient.get<ApiResponse<MembershipStats>>(
      `/clubs/${clubId}/memberships/stats`
    );
  },

  async inviteMember(clubId: string, data: InviteMemberInput) {
    return apiClient.post<ApiResponse<MemberRecord>>(
      `/clubs/${clubId}/members/invite`,
      data
    );
  },

  async updateMemberStatus(clubId: string, membershipId: string, data: UpdateMemberStatusInput) {
    return apiClient.patch<ApiResponse<MemberRecord>>(
      `/clubs/${clubId}/memberships/${membershipId}/status`,
      data
    );
  },

  async recordPayment(clubId: string, membershipId: string, data: RecordPaymentInput) {
    return apiClient.post<ApiResponse<MemberRecord>>(
      `/clubs/${clubId}/memberships/${membershipId}/payment`,
      data
    );
  },

  // ─── Forms ─────────────────────────────────────────────────────────────

  async listForms(clubId: string, params?: PaginationParams & { isPublished?: boolean }) {
    return apiClient.get<PaginatedResponse<FormRecord>>(
      `/clubs/${clubId}/forms`,
      params as any
    );
  },

  async getForm(clubId: string, formId: string) {
    return apiClient.get<ApiResponse<FormRecord>>(
      `/clubs/${clubId}/forms/${formId}`
    );
  },

  async createForm(clubId: string, data: CreateFormInput) {
    return apiClient.post<ApiResponse<FormRecord>>(
      `/clubs/${clubId}/forms`,
      data
    );
  },

  async updateForm(clubId: string, formId: string, data: { title?: string; description?: string }) {
    return apiClient.put<ApiResponse<FormRecord>>(
      `/clubs/${clubId}/forms/${formId}`,
      data
    );
  },

  async deleteForm(clubId: string, formId: string) {
    return apiClient.delete<ApiResponse<null>>(
      `/clubs/${clubId}/forms/${formId}`
    );
  },

  async publishForm(clubId: string, formId: string) {
    return apiClient.patch<ApiResponse<FormRecord>>(
      `/clubs/${clubId}/forms/${formId}/publish`
    );
  },

  async unpublishForm(clubId: string, formId: string) {
    return apiClient.patch<ApiResponse<FormRecord>>(
      `/clubs/${clubId}/forms/${formId}/unpublish`
    );
  },

  async addQuestion(clubId: string, formId: string, data: AddQuestionInput) {
    return apiClient.post<ApiResponse<FormRecord>>(
      `/clubs/${clubId}/forms/${formId}/questions`,
      data
    );
  },

  async updateQuestion(clubId: string, formId: string, questionId: string, data: Partial<AddQuestionInput>) {
    return apiClient.put<ApiResponse<FormRecord>>(
      `/clubs/${clubId}/forms/${formId}/questions/${questionId}`,
      data
    );
  },

  async deleteQuestion(clubId: string, formId: string, questionId: string) {
    return apiClient.delete<ApiResponse<FormRecord>>(
      `/clubs/${clubId}/forms/${formId}/questions/${questionId}`
    );
  },

  async reorderQuestions(clubId: string, formId: string, questionIds: string[]) {
    return apiClient.put<ApiResponse<FormRecord>>(
      `/clubs/${clubId}/forms/${formId}/questions/reorder`,
      { questionIds }
    );
  },

  async getFormResponses(clubId: string, formId: string, params?: PaginationParams) {
    return apiClient.get<PaginatedResponse<FormResponseRecord>>(
      `/clubs/${clubId}/forms/${formId}/responses`,
      params as any
    );
  },

  async getFormStats(clubId: string, formId: string) {
    return apiClient.get<ApiResponse<FormStats>>(
      `/clubs/${clubId}/forms/${formId}/responses/stats`
    );
  },
};
