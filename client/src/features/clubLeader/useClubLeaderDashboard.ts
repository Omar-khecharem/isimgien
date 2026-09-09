import { useQuery } from "@tanstack/react-query";
import { clubLeaderService } from "./clubLeaderService";

export function useClubLeaderDashboard(clubId: string | undefined) {
  return useQuery({
    queryKey: ["clubLeader", "dashboard", clubId],
    queryFn: async () => {
      if (!clubId) throw new Error("Club ID is required");
      const response = await clubLeaderService.getDashboard(clubId);
      return response.data;
    },
    enabled: !!clubId,
    refetchInterval: 30000,
  });
}
