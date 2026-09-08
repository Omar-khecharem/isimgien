export enum Role {
  SUPER_ADMIN = "super_admin",
  CLUB_LEADER = "club_leader",
  STUDENT = "student",
}

export const RoleHierarchy: Record<Role, number> = {
  [Role.SUPER_ADMIN]: 3,
  [Role.CLUB_LEADER]: 2,
  [Role.STUDENT]: 1,
};

export function hasRequiredRole(userRole: Role, requiredRole: Role): boolean {
  return RoleHierarchy[userRole] >= RoleHierarchy[requiredRole];
}
