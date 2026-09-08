import { Request, Response, NextFunction } from "express";
import { ApiError } from "../../shared/utils/ApiError";
import { Role } from "../../shared/enums/roles";
import { Club } from "../../models/club.model";
import { Training } from "../../models/training.model";

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

export async function requireTrainingOwnershipOrSuperAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
) {
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

    const clubId = getClubIdFromRequest(req);
    const trainingId = req.params.trainingId;

    if (!clubId || !trainingId) {
      return next(
        ApiError.badRequest("Club and training identifiers are required")
      );
    }

    const training = await Training.findById(trainingId).select("club").lean();
    if (!training) {
      return next(ApiError.notFound("Training not found"));
    }
    if (training.club.toString() !== clubId) {
      return next(
        ApiError.forbidden("Training does not belong to this club")
      );
    }

    const club = await Club.findById(clubId).select("leader").lean();
    if (!club || !club.leader) {
      return next(ApiError.forbidden("Club leader verification failed"));
    }
    if (club.leader.toString() !== req.user!.id) {
      return next(ApiError.forbidden("You are not the leader of this club"));
    }
    next();
  } catch (error) {
    next(error);
  }
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
