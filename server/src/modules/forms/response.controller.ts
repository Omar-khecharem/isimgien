import { Request, Response } from "express";
import * as responseService from "./response.service";
import { ApiResponse } from "../../shared/utils/apiResponse";
import { asyncHandler } from "../../shared/utils/asyncHandler";

// ─── Student: Submit Response ────────────────────────────────────────────────

export const submitResponse = asyncHandler(
  async (req: Request, res: Response) => {
    const response = await responseService.submitResponse(
      req.user!.id,
      req.params.id,
      req.body
    );
    ApiResponse.created(res, response, "Response submitted successfully");
  }
);

// ─── Student: Get Own Responses ──────────────────────────────────────────────

export const getMyResponses = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 20 } = req.query;
    const result = await responseService.getUserResponses(
      req.user!.id,
      Number(page),
      Number(limit)
    );
    ApiResponse.paginated(res, result.responses, result.meta);
  }
);

// ─── Club Leader: View Single Response ───────────────────────────────────────

export const getResponse = asyncHandler(
  async (req: Request, res: Response) => {
    const response = await responseService.getResponseById(req.params.id);
    ApiResponse.success(res, response);
  }
);
