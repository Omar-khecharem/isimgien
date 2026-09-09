import { useQuery } from "@tanstack/react-query";
import { membershipsService, type Membership } from "../memberships/membershipsService";

export function useMyMemberships() {
  return useQuery({
    queryKey: ["student", "memberships"],
    queryFn: async () => {
      const response = await membershipsService.getMyMemberships({
        limit: 50,
      });
      return response;
    },
  });
}
