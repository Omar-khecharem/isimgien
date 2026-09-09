import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceService, type AttendanceRecord } from "./attendanceService";
import { trainingsService, type Training } from "../trainings/trainingsService";

export interface SessionData {
  trainingId: string;
  training: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
  };
  isActive: boolean;
  stats: {
    total: number;
    checkedIn: number;
    checkedOut: number;
    absent: number;
    incomplete: number;
    notAttended: number;
  };
  participants: Array<{
    userId: string;
    name: string;
    email: string;
    status: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    method: string;
  }>;
}

export interface SessionResponse {
  success: true;
  data: SessionData;
}

export function useAttendanceSession(clubId: string, trainingId: string) {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: ["attendance", "session", clubId, trainingId],
    queryFn: async () => {
      const response = await attendanceService.getTrainingAttendance(
        clubId,
        trainingId,
        { limit: 200 }
      );
      return response;
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 5000;
      const hasActive = data.data.some(
        (r) =>
          r.status === "not_attended" ||
          r.status === "checked_in"
      );
      return hasActive ? 5000 : 30000;
    },
  });

  const trainingQuery = useQuery({
    queryKey: ["training", clubId, trainingId],
    queryFn: async () => {
      const response = await trainingsService.getById(clubId, trainingId);
      return response.data;
    },
  });

  const startSession = useMutation({
    mutationFn: () => attendanceService.startSession(clubId, trainingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attendance", "session", clubId, trainingId],
      });
    },
  });

  const closeSession = useMutation({
    mutationFn: () => attendanceService.closeSession(clubId, trainingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attendance", "session", clubId, trainingId],
      });
    },
  });

  const checkIn = useMutation({
    mutationFn: (userId: string) =>
      attendanceService.checkIn(clubId, trainingId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attendance", "session", clubId, trainingId],
      });
    },
  });

  const checkOut = useMutation({
    mutationFn: (userId: string) =>
      attendanceService.checkOut(clubId, trainingId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attendance", "session", clubId, trainingId],
      });
    },
  });

  const records = sessionQuery.data?.data ?? [];
  const training = trainingQuery.data;

  const stats = computeStats(records);
  const isActive = records.some(
    (r) => r.status === "not_attended" || r.status === "checked_in"
  );
  const hasSession = records.length > 0;

  const session: SessionData | null = hasSession
    ? {
        trainingId,
        training: training
          ? {
              title: training.title,
              date: training.date,
              startTime: training.startTime,
              endTime: training.endTime,
              location: training.location,
            }
          : { title: "", date: "", startTime: "", endTime: "", location: "" },
        isActive,
        stats,
        participants: records.map((r) => ({
          userId: r.user._id,
          name: `${r.user.firstName} ${r.user.lastName}`,
          email: r.user.email,
          status: r.status,
          checkInTime: r.checkIn.time,
          checkOutTime: r.checkOut.time,
          method: r.checkIn.method,
        })),
      }
    : null;

  return {
    session,
    training,
    records,
    stats,
    isActive,
    hasSession,
    isLoading: sessionQuery.isLoading || trainingQuery.isLoading,
    error: sessionQuery.error || trainingQuery.error,
    refetch: sessionQuery.refetch,
    startSession,
    closeSession,
    checkIn,
    checkOut,
  };
}

function computeStats(records: AttendanceRecord[]) {
  const total = records.length;
  const checkedIn = records.filter(
    (r) => r.status === "checked_in" || r.status === "checked_out"
  ).length;
  const checkedOut = records.filter((r) => r.status === "checked_out").length;
  const incomplete = records.filter((r) => r.status === "incomplete").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const notAttended = records.filter((r) => r.status === "not_attended").length;
  const registered = total;

  return { total, registered, checkedIn, checkedOut, incomplete, absent, notAttended };
}
