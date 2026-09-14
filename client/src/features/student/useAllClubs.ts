import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clubsService } from "../clubs/clubsService";

export function useAllClubs() {
  return useQuery({
    queryKey: ["clubs", "all-active"],
    queryFn: async () => {
      const res = await clubsService.list({ limit: 50, isActive: true });
      return res.data;
    },
  });
}

export function useJoinClub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clubId, academicYear }: { clubId: string; academicYear: string }) =>
      clubsService.join(clubId, academicYear),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student", "clubs"] });
      qc.invalidateQueries({ queryKey: ["clubs", "all-active"] });
      qc.invalidateQueries({ queryKey: ["my-memberships"] });
    },
  });
}
