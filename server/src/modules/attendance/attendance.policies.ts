import {
  requireSuperAdmin as _requireSuperAdmin,
  requireClubLeaderOrSuperAdmin as _requireClubLeaderOrSuperAdmin,
  requireAuthenticated,
  requireResourceOwnershipOrSuperAdmin,
} from "../../middleware/policies.middleware";
import { Training } from "../../models/training.model";

// Re-export shared policies
export const requireSuperAdmin = _requireSuperAdmin;
export const requireClubLeaderOrSuperAdmin = _requireClubLeaderOrSuperAdmin;
export { requireAuthenticated as requireStudentOrAbove };

/**
 * Verifies the training belongs to the club AND the user is the leader.
 * Uses :clubId and :trainingId params (attendance routes).
 */
export const requireTrainingOwnershipOrSuperAdmin =
  requireResourceOwnershipOrSuperAdmin(Training, "trainingId", "Training");
