import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsService, type Event } from "../events/eventsService";
import { trainingsService, type Training } from "../trainings/trainingsService";

export interface UnifiedItem {
  kind: "event" | "training";
  _id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  poster?: string | null;
  capacity: number | null;
  registeredCount: number;
  status: string;
  clubId: string;
  clubName: string;
  clubLogo?: string | null;
}

function toUnified(
  items: (Event | Training)[],
  kind: "event" | "training"
): UnifiedItem[] {
  return items.map((item) => {
    const clubObj =
      kind === "event"
        ? (item as Event).club
        : (item as Training).club;

    let clubId = "";
    let clubName = "";
    let clubLogo: string | undefined;

    if (typeof clubObj === "string") {
      clubId = clubObj;
      clubName = "";
    } else if (clubObj && typeof clubObj === "object") {
      clubId = clubObj._id;
      clubName = clubObj.name;
      clubLogo = "logo" in clubObj ? clubObj.logo : undefined;
    }

    return {
      kind,
      _id: item._id,
      title: item.title,
      description: item.description,
      date: item.date,
      startTime: item.startTime,
      endTime: item.endTime,
      location: item.location,
      poster: item.poster,
      capacity: item.capacity,
      registeredCount: item.registeredCount,
      status: item.status,
      clubId,
      clubName,
      clubLogo,
    };
  });
}

export function useAllEvents() {
  return useQuery({
    queryKey: ["student", "all-events"],
    queryFn: async () => {
      const [evRes, trRes] = await Promise.all([
        eventsService.listPublic({ limit: 50, sort: "date" }),
        trainingsService.listPublic({ limit: 50, sort: "date" }),
      ]);
      const events = toUnified(evRes.data, "event");
      const trainings = toUnified(trRes.data, "training");
      return [...events, ...trainings].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    },
  });
}

export function useRegisterEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: UnifiedItem) => {
      if (item.kind === "event") {
        return eventsService.register(item.clubId, item._id);
      }
      return trainingsService.register(item.clubId, item._id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student", "all-events"] });
      qc.invalidateQueries({ queryKey: ["student", "upcoming-trainings"] });
      qc.invalidateQueries({ queryKey: ["student", "upcoming-events"] });
    },
  });
}

export function useCancelRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: UnifiedItem) => {
      if (item.kind === "event") {
        return eventsService.cancelRegistration(item.clubId, item._id);
      }
      return trainingsService.cancelRegistration(item.clubId, item._id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student", "all-events"] });
      qc.invalidateQueries({ queryKey: ["student", "upcoming-trainings"] });
      qc.invalidateQueries({ queryKey: ["student", "upcoming-events"] });
    },
  });
}
