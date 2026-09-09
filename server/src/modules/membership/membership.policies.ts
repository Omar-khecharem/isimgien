import { Request, Response, NextFunction } from "express";
import { ApiError } from "../../shared/utils/ApiError";
import { Role } from "../../shared/enums/roles";
import {
  requireSuperAdmin as _requireSuperAdmin,
  requireClubLeaderOrSuperAdmin as _requireClubLeaderOrSuperAdmin,
  requireAuthenticated,
} from "../../middleware/policies.middleware";

// Re-export shared policies
export const requireSuperAdmin = _requireSuperAdmin;
export const requireClubLeaderOrSuperAdmin = _requireClubLeaderOrSuperAdmin;
export { requireAuthenticated as requireStudentOrAbove };

/**
 * Student can only access their own membership.
 * Attaches `req.targetUserId` for downstream use.
 */
export function requireStudentSelf(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return next(ApiError.unauthorized());
  }

  if (req.user.role === Role.SUPER_ADMIN || req.user.role === Role.CLUB_LEADER) {
    return next();
  }

  if (req.user.role !== Role.STUDENT) {
    return next(ApiError.forbidden("Student access required"));
  }

  (req as any).targetUserId = req.user.id;
  next();
}
