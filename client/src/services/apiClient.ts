import type { ApiError, ApiResponse } from "../types";

const BASE_URL = "/api/v1";

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | undefined | null>;
}

class ApiClient {
  private getAccessToken(): string | null {
    return localStorage.getItem("accessToken");
  }

  private setAccessToken(token: string): void {
    localStorage.setItem("accessToken", token);
  }

  private clearAccessToken(): void {
    localStorage.removeItem("accessToken");
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { params, ...fetchConfig } = config;

    let url = `${BASE_URL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value != null && value !== "") {
          searchParams.set(key, String(value));
        }
      }
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    const token = this.getAccessToken();
    const headers: Record<string, string> = {
      ...(fetchConfig.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (
      fetchConfig.body &&
      typeof fetchConfig.body === "string"
    ) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      ...fetchConfig,
      headers,
      credentials: "include",
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json();

    if (!response.ok) {
      const apiError = data as ApiError;
      throw apiError;
    }

    return data as T;
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | undefined | null>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", params });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  async refreshAccessToken(): Promise<string | null> {
    try {
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) return null;

      const data = await response.json();
      if (data.success && data.data?.accessToken) {
        this.setAccessToken(data.data.accessToken);
        return data.data.accessToken;
      }
      return null;
    } catch {
      return null;
    }
  }

  setToken(token: string): void {
    this.setAccessToken(token);
  }

  clearToken(): void {
    this.clearAccessToken();
  }
}

export const apiClient = new ApiClient();
