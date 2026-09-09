import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../services/apiClient";
import type { PaginatedResponse } from "../../types";

export interface TrainingRegistration {
  _id: string;
  training: {
    _id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    status: string;
    club: { _id: string; name: string; slug: string };
  };
  user: string;
  registeredAt: string;
  status: "registered" | "cancelled" | "waitlisted";
}

export function useMyTrainingRegistrations(clubId: string) {
  return useQuery({
    queryKey: ["student", "training-registrations", clubId],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<TrainingRegistration>>(
        `/clubs/${clubId}/trainings/my-registrations`,
        { limit: 50 }
      );
      return response;
    },
    enabled: !!clubId,
  });
}

export interface EventRegistration {
  _id: string;
  event: {
    _id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    status: string;
    club: { _id: string; name: string; slug: string };
  };
  user: string;
  registeredAt: string;
  status: "registered" | "cancelled" | "waitlisted";
}

export function useMyEventRegistrations(clubId: string) {
  return useQuery({
    queryKey: ["student", "event-registrations", clubId],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<EventRegistration>>(
        `/clubs/${clubId}/events/my-registrations`,
        { limit: 50 }
      );
      return response;
    },
    enabled: !!clubId,
  });
}
