import { apiClient } from "../../services/apiClient";
import type {
  AuthenticatedUser,
  ApiResponse,
  LoginCredentials,
} from "../../types";

export const authService = {
  async login(
    credentials: LoginCredentials
  ): Promise<{ user: AuthenticatedUser; accessToken: string }> {
    const res = await apiClient.post<
      ApiResponse<{ user: AuthenticatedUser; accessToken: string }>
    >("/auth/login", credentials);
    apiClient.setToken(res.data.accessToken);
    return res.data;
  },

  async getMe(): Promise<AuthenticatedUser> {
    const res = await apiClient.get<ApiResponse<AuthenticatedUser>>("/auth/me");
    return res.data;
  },

  async refresh(): Promise<string | null> {
    return apiClient.refreshAccessToken();
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
    apiClient.clearToken();
  },
};
