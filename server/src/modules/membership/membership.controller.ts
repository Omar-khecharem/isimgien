import { Request, Response } from "express";
import * as membershipService from "./membership.service";
import { ApiResponse } from "../../shared/utils/apiResponse";
import { asyncHandler } from "../../shared/utils/asyncHandler";

// ─── Club Leader: Create membership ──────────────────────────────────────────

export const createMembership = asyncHandler(
  async (req: Request, res: Response) => {
    const membership = await membershipService.createMembership(
      req.params.clubId,
      req.body,
      req.user!.id
    );
    ApiResponse.created(res, membership, "Membership created successfully");
  }
);

// ─── Club Leader: Get membership details ─────────────────────────────────────

export const getMembership = asyncHandler(
  async (req: Request, res: Response) => {
    const membership = await membershipService.getMembership(
      req.params.clubId,
      req.params.membershipId
    );
    ApiResponse.success(res, membership);
  }
);

// ─── Club Leader: List memberships ───────────────────────────────────────────

export const listMemberships = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await membershipService.listMemberships(
      req.params.clubId,
      req.query as any
    );
    ApiResponse.paginated(res, result.memberships, result.meta);
  }
);

// ─── Club Leader: Update membership status ───────────────────────────────────

export const updateMembershipStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const membership = await membershipService.updateMembershipStatus(
      req.params.clubId,
      req.params.membershipId,
      req.body.status
    );
    ApiResponse.success(res, membership, 200, "Membership status updated");
  }
);

// ─── Club Leader: Record payment ─────────────────────────────────────────────

export const recordPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const membership = await membershipService.recordPayment(
      req.params.clubId,
      req.params.membershipId,
      req.body
    );
    ApiResponse.success(res, membership, 200, "Payment recorded successfully");
  }
);

// ─── Club Leader: Membership stats ───────────────────────────────────────────

export const getMembershipStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await membershipService.getMembershipStats(
      req.params.clubId
    );
    ApiResponse.success(res, stats);
  }
);

// ─── Student: Get my membership ──────────────────────────────────────────────

export const getMyMembership = asyncHandler(
  async (req: Request, res: Response) => {
    const userId =
      (req as any).targetUserId ?? req.user!.id;
    const membership = await membershipService.getMyMembership(
      req.params.clubId,
      userId
    );
    ApiResponse.success(res, membership);
  }
);

// ─── Super Admin: Global memberships ─────────────────────────────────────────

export const getGlobalMemberships = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await membershipService.getGlobalMemberships(
      req.query as any
    );
    ApiResponse.paginated(res, result.memberships, result.meta);
  }
);
