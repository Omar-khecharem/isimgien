import { Request, Response, NextFunction } from "express";
import { ApiError } from "../../shared/utils/ApiError";
import { Role } from "../../shared/enums/roles";
import { Club } from "../../models/club.model";
import { Form } from "../../models/form.model";

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

export async function requireFormOwnershipOrSuperAdmin(
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
    const formId = req.params.id;

    if (!clubId || !formId) {
      return next(ApiError.badRequest("Club and form identifiers are required"));
    }

    const form = await Form.findById(formId).select("club").lean();
    if (!form) {
      return next(ApiError.notFound("Form not found"));
    }
    if (form.club.toString() !== clubId) {
      return next(ApiError.forbidden("Form does not belong to this club"));
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
