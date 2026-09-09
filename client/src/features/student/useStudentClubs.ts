import { useQuery } from "@tanstack/react-query";
import { clubsService, type Club } from "../clubs/clubsService";
import { membershipsService, type Membership } from "../memberships/membershipsService";

export function useStudentClubs() {
  return useQuery({
    queryKey: ["student", "clubs"],
    queryFn: async () => {
      const memberships = await membershipsService.getMyMemberships({
        limit: 50,
      });

      const clubs = await Promise.all(
        memberships.data.map(async (m) => {
          try {
            const clubResponse = await clubsService.getById(
              typeof m.club === "string" ? m.club : m.club._id
            );
            return {
              club: clubResponse.data,
              membership: m,
            };
          } catch {
            return null;
          }
        })
      );

      return clubs.filter(Boolean) as {
        club: Club;
        membership: Membership;
      }[];
    },
  });
}
