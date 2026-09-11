import { Request, Response } from "express";
import * as dashboardService from "./dashboard.service";
import { ApiResponse } from "../../shared/utils/apiResponse";
import { asyncHandler } from "../../shared/utils/asyncHandler";

export const getClubDashboard = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await dashboardService.getClubDashboard(
      req.params.clubId,
      req.user!.id,
      req.user!.role
    );
    ApiResponse.success(res, data);
  }
);
