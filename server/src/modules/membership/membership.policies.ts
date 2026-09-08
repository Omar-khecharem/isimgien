import { Request, Response, NextFunction } from "express";
import { ApiError } from "../../shared/utils/ApiError";
import { Role } from "../../shared/enums/roles";
import { Club } from "../../models/club.model";

function getClubIdFromRequest(req: Request): string | undefined {
  return (req.params.clubId as string) || (req.body.club as string);
}

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

  // Attach userId for downstream filtering
  (req as any).targetUserId = req.user.id;
  next();
}
