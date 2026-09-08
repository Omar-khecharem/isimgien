import { Request, Response, NextFunction } from "express";
import { ApiError } from "../shared/utils/ApiError";
import { Role } from "../shared/enums/roles";
import { Club } from "../models/club.model";

/**
 * authorize(...roles)
 *
 * Role-based access control using hierarchy.
 * - SUPER_ADMIN (3) can access anything.
 * - CLUB_LEADER (2) can access STUDENT (1) resources.
 * - STUDENT (1) can only access STUDENT resources.
 *
 * Usage: authorize(Role.SUPER_ADMIN) or authorize(Role.CLUB_LEADER, Role.STUDENT)
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    const userRole = req.user.role as Role;

    const isAllowed = allowedRoles.some((role) => {
      if (userRole === Role.SUPER_ADMIN) return true;
      return userRole === role;
    });

    if (!isAllowed) {
      return next(
        ApiError.forbidden(
          `Requires one of: ${allowedRoles.join(", ")}`
        )
      );
    }

    next();
  };
}

/**
 * requireSuperAdmin
 *
 * Shortcut: only SUPER_ADMIN allowed.
 * CLUB_LEADER cannot escalate to this via hierarchy.
 */
export function requireSuperAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(ApiError.unauthorized());
  }

  if (req.user.role !== Role.SUPER_ADMIN) {
    return next(ApiError.forbidden("Super Admin access required"));
  }

  next();
}

/**
 * requireClubOwnership
 *
 * Ensures the authenticated CLUB_LEADER actually leads the club
 * referenced in the request. SUPER_ADMIN bypasses this check.
 *
 * Looks for club ID in req.params.clubId or req.params.id (whichever exists).
 * If neither exists, it falls back to req.body.club.
 */
export function requireClubOwnership(
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

  if (req.user.role === Role.STUDENT) {
    return next(ApiError.forbidden("Students cannot manage club resources"));
  }

  const clubId =
    (req.params.clubId as string) ||
    (req.params.id as string) ||
    (req.body.club as string);

  if (!clubId) {
    return next(ApiError.badRequest("Club identifier is required"));
  }

  Club.findById(clubId)
    .select("leader")
    .then((club) => {
      if (!club) {
        return next(ApiError.notFound("Club not found"));
      }

      if (!club.leader) {
        return next(ApiError.forbidden("This club has no assigned leader"));
      }

      if (club.leader.toString() !== req.user!.id) {
        return next(
          ApiError.forbidden("You are not the leader of this club")
        );
      }

      next();
    })
    .catch((err) => {
      next(err);
    });
}

/**
 * requireSuperAdminOrOwnership
 *
 * Hybrid: SUPER_ADMIN gets global access, CLUB_LEADER must own the club.
 * Useful for routes that serve both roles.
 */
export function requireSuperAdminOrOwnership(
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

  return requireClubOwnership(req, _res, next);
}
