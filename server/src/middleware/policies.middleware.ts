import { Request, Response, NextFunction } from "express";
import { ApiError } from "../shared/utils/ApiError";
import { Role } from "../shared/enums/roles";
import { Club } from "../models/club.model";
import mongoose from "mongoose";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extract clubId strictly from URL params (never from body).
 * This prevents IDOR via request body injection.
 */
export function getClubIdFromParams(req: Request): string | undefined {
  return (req.params.clubId as string) || (req.params.id as string);
}

// ─── Shared Policies ────────────────────────────────────────────────────────

/**
 * requireAuthenticated
 * Any authenticated user may proceed. (Previously: requireStudentOrAbove)
 */
export function requireAuthenticated(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return next(ApiError.unauthorized());
  }
  next();
}

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

  const clubId = getClubIdFromParams(req);
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

// ─── Resource Ownership Policies ────────────────────────────────────────────

/**
 * Creates middleware that verifies:
 * 1. The resource belongs to the club in the URL
 * 2. The user is the leader of that club
 * SUPER_ADMIN bypasses all checks.
 *
 * @param Model - Mongoose model to query
 * @param paramName - URL param containing the resource ID
 * @param resourceName - Human-readable name for error messages
 */
export function requireResourceOwnershipOrSuperAdmin(
  Model: mongoose.Model<any>,
  paramName: string,
  resourceName: string
) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(ApiError.unauthorized());
      }

      if (req.user.role === Role.SUPER_ADMIN) {
        return next();
      }

      if (req.user.role !== Role.CLUB_LEADER) {
        return next(ApiError.forbidden("Club Leader access required"));
      }

      const clubId = getClubIdFromParams(req);
      const resourceId = req.params[paramName];

      if (!clubId || !resourceId) {
        return next(
          ApiError.badRequest("Club and resource identifiers are required")
        );
      }

      const resource = await Model.findById(resourceId).select("club").lean() as any;
      if (!resource) {
        return next(ApiError.notFound(`${resourceName} not found`));
      }
      if (resource.club.toString() !== clubId) {
        return next(
          ApiError.forbidden(
            `${resourceName} does not belong to this club`
          )
        );
      }

      const club = await Club.findById(clubId).select("leader").lean() as any;
      if (!club || !club.leader) {
        return next(
          ApiError.forbidden("Club leader verification failed")
        );
      }
      if (club.leader.toString() !== req.user!.id) {
        return next(
          ApiError.forbidden("You are not the leader of this club")
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
