import { useQuery } from "@tanstack/react-query";
import { trainingsService, type Training } from "../trainings/trainingsService";
import { eventsService, type Event } from "../events/eventsService";

export interface UpcomingItem {
  type: "training" | "event";
  data: Training | Event;
  clubName?: string;
}

export function useUpcomingTrainings() {
  return useQuery({
    queryKey: ["student", "upcoming-trainings"],
    queryFn: async () => {
      const response = await trainingsService.listPublic({
        limit: 10,
        sort: "date",
      });
      return response.data;
    },
  });
}

export function useUpcomingEvents() {
  return useQuery({
    queryKey: ["student", "upcoming-events"],
    queryFn: async () => {
      const response = await eventsService.listPublic({
        limit: 10,
        sort: "date",
      });
      return response.data;
    },
  });
}
