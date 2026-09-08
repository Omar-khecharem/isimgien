import { Request, Response } from "express";
import * as clubService from "./club.service";
import { ApiResponse } from "../../shared/utils/apiResponse";
import { asyncHandler } from "../../shared/utils/asyncHandler";

// ─── Super Admin: Club CRUD ──────────────────────────────────────────────────

export const createClub = asyncHandler(async (req: Request, res: Response) => {
  const club = await clubService.createClub(req.body);
  ApiResponse.created(res, club, "Club created successfully");
});

export const updateClub = asyncHandler(async (req: Request, res: Response) => {
  const club = await clubService.updateClub(req.params.id, req.body);
  ApiResponse.success(res, club, 200, "Club updated successfully");
});

export const deactivateClub = asyncHandler(
  async (req: Request, res: Response) => {
    const club = await clubService.deactivateClub(req.params.id);
    ApiResponse.success(res, club, 200, "Club deactivated successfully");
  }
);

export const getClub = asyncHandler(async (req: Request, res: Response) => {
  const club = await clubService.getClubById(req.params.id);
  ApiResponse.success(res, club);
});

export const listClubs = asyncHandler(async (req: Request, res: Response) => {
  const result = await clubService.listClubs(req.query as any);
  ApiResponse.paginated(res, result.clubs, result.meta);
});

// ─── Super Admin: Leader management ──────────────────────────────────────────

export const assignLeader = asyncHandler(
  async (req: Request, res: Response) => {
    const club = await clubService.assignLeader(req.params.id, req.body);
    ApiResponse.success(res, club, 200, "Leader assigned successfully");
  }
);

export const removeLeader = asyncHandler(
  async (req: Request, res: Response) => {
    const club = await clubService.removeLeader(req.params.id);
    ApiResponse.success(res, club, 200, "Leader removed successfully");
  }
);

// ─── Super Admin / Club Leader: Membership ───────────────────────────────────

export const getClubMembers = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await clubService.getClubMembers(
      req.params.id,
      req.query as any
    );
    ApiResponse.paginated(res, result.members, result.meta);
  }
);

export const inviteMember = asyncHandler(
  async (req: Request, res: Response) => {
    const membership = await clubService.inviteMember(req.params.id, req.body);
    ApiResponse.created(res, membership, "Member invited successfully");
  }
);

// ─── Club Leader: Update own club ────────────────────────────────────────────

export const updateClubByLeader = asyncHandler(
  async (req: Request, res: Response) => {
    const club = await clubService.updateClubByLeader(
      req.params.id,
      req.user!.id,
      req.body
    );
    ApiResponse.success(res, club, 200, "Club updated successfully");
  }
);

export const getClubByLeader = asyncHandler(
  async (req: Request, res: Response) => {
    const club = await clubService.getClubByLeader(
      req.params.id,
      req.user!.id
    );
    ApiResponse.success(res, club);
  }
);

// ─── Student: Browse & Join ──────────────────────────────────────────────────

export const listActiveClubs = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await clubService.listActiveClubs(req.query as any);
    ApiResponse.paginated(res, result.clubs, result.meta);
  }
);

export const getPublicClub = asyncHandler(
  async (req: Request, res: Response) => {
    const club = await clubService.getClubById(req.params.id);
    ApiResponse.success(res, club);
  }
);

export const joinClub = asyncHandler(async (req: Request, res: Response) => {
  const membership = await clubService.joinClub(
    req.params.id,
    req.user!.id,
    req.body
  );
  ApiResponse.created(res, membership, "Membership request submitted");
});

export const getMyMemberships = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await clubService.getMyMemberships(
      req.user!.id,
      req.query as any
    );
    ApiResponse.paginated(res, result.memberships, result.meta);
  }
);
