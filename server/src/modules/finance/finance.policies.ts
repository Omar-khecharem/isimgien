import {
  requireSuperAdmin as _requireSuperAdmin,
  requireClubLeaderOrSuperAdmin as _requireClubLeaderOrSuperAdmin,
  requireAuthenticated,
} from "../../middleware/policies.middleware";

// Re-export shared policies
export const requireSuperAdmin = _requireSuperAdmin;
export const requireClubLeaderOrSuperAdmin = _requireClubLeaderOrSuperAdmin;
export { requireAuthenticated as requireStudentOrAbove };
