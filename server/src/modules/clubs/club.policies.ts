import {
  requireSuperAdmin as _requireSuperAdmin,
  requireClubLeaderOrSuperAdmin as _requireClubLeaderOrSuperAdmin,
  requireAuthenticated,
  getClubIdFromParams,
} from "../../middleware/policies.middleware";
import { Club } from "../../models/club.model";

// Re-export shared policies
export const requireSuperAdmin = _requireSuperAdmin;
export const requireClubLeaderOrSuperAdmin = _requireClubLeaderOrSuperAdmin;
export { requireAuthenticated as requireStudentOrAbove };

// ─── Club-specific: requires access to club via :id param ───────────────────

/**
 * For club routes using :id param (not :clubId).
 * Delegates to requireClubLeaderOrSuperAdmin which reads from params.
 */
