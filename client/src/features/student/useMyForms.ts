import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../services/apiClient";
import type { PaginatedResponse } from "../../types";

export interface FormResponse {
  _id: string;
  form: {
    _id: string;
    title: string;
    club: { _id: string; name: string; slug: string };
  };
  submittedBy: string;
  submittedAt: string;
  answers: Record<string, unknown>;
}

export function useMyFormResponses() {
  return useQuery({
    queryKey: ["student", "form-responses"],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<FormResponse>>(
        "/forms/my-responses",
        { limit: 50 }
      );
      return response;
    },
  });
}
