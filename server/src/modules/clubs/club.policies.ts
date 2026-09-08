import { Request, Response, NextFunction } from "express";
import { ApiError } from "../../shared/utils/ApiError";
import { Role } from "../../shared/enums/roles";
import { Club } from "../../models/club.model";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getClubIdFromRequest(req: Request): string | undefined {
  return (req.params.id as string) || (req.body.club as string);
}

// ─── Policies ────────────────────────────────────────────────────────────────

/**
 * requireSuperAdmin
 * Only Super Admin may proceed.
 */
export function requireSuperAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return next(ApiError.unauthorized());
  }
  if (req.user.role !== Role.SUPER_ADMIN) {
    return next(ApiError.forbidden("Super Admin access required"));
  }
  next();
}

/**
 * requireClubLeaderOrSuperAdmin
 * Super Admin bypasses ownership. Club Leader must own the club.
 * Students are denied.
 */
export function requireClubLeaderOrSuperAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return next(ApiError.unauthorized());
  }

  if (req.user.role === Role.SUPER_ADMIN) {
    return next();
  }

  if (req.user.role !== Role.CLUB_LEADER) {
    return next(ApiError.forbidden("Club Leader access required"));
  }

  const clubId = getClubIdFromRequest(req);
  if (!clubId) {
    return next(ApiError.badRequest("Club identifier is required"));
  }

  Club.findById(clubId)
    .select("leader")
    .lean()
    .then((club) => {
      if (!club) {
        return next(ApiError.notFound("Club not found"));
      }
      if (!club.leader) {
        return next(ApiError.forbidden("This club has no assigned leader"));
      }
      if (club.leader.toString() !== req.user!.id) {
        return next(ApiError.forbidden("You are not the leader of this club"));
      }
      next();
    })
    .catch(next);
}

/**
 * requireStudentOrAbove
 * Any authenticated user may proceed.
 */
export function requireStudentOrAbove(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return next(ApiError.unauthorized());
  }
  next();
}
