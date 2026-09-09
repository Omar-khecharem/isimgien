import { useQuery } from "@tanstack/react-query";
import { attendanceService, type AttendanceRecord } from "../attendance/attendanceService";

export function useMyAttendance(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["student", "attendance", page, limit],
    queryFn: async () => {
      const response = await attendanceService.getMyAttendance({ page, limit });
      return response;
    },
  });
}
