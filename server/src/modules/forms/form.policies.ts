import {
  requireSuperAdmin as _requireSuperAdmin,
  requireClubLeaderOrSuperAdmin as _requireClubLeaderOrSuperAdmin,
  requireAuthenticated,
  requireResourceOwnershipOrSuperAdmin,
} from "../../middleware/policies.middleware";
import { Form } from "../../models/form.model";

// Re-export shared policies
export const requireSuperAdmin = _requireSuperAdmin;
export const requireClubLeaderOrSuperAdmin = _requireClubLeaderOrSuperAdmin;
export { requireAuthenticated as requireStudentOrAbove };

/**
 * Verifies the form belongs to the club AND the user is the leader.
 * Uses :clubId and :id params (form routes).
 */
export const requireFormOwnershipOrSuperAdmin =
  requireResourceOwnershipOrSuperAdmin(Form, "id", "Form");
