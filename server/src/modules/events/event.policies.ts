import {
  requireSuperAdmin as _requireSuperAdmin,
  requireClubLeaderOrSuperAdmin as _requireClubLeaderOrSuperAdmin,
  requireAuthenticated,
  requireResourceOwnershipOrSuperAdmin,
} from "../../middleware/policies.middleware";
import { Event } from "../../models/event.model";

// Re-export shared policies
export const requireSuperAdmin = _requireSuperAdmin;
export const requireClubLeaderOrSuperAdmin = _requireClubLeaderOrSuperAdmin;
export { requireAuthenticated as requireStudentOrAbove };

/**
 * Verifies the event belongs to the club AND the user is the leader.
 * Uses :clubId and :id params (event routes).
 */
export const requireEventOwnershipOrSuperAdmin =
  requireResourceOwnershipOrSuperAdmin(Event, "id", "Event");
