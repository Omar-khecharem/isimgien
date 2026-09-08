import { Request, Response } from "express";
import * as authService from "./auth.service";
import { ApiResponse } from "../../shared/utils/apiResponse";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { config } from "../../config";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/api/v1/auth",
};

const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: "strict" as const,
  path: "/api/v1/auth",
};

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password);

  res.cookie("refreshToken", result.tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

  ApiResponse.success(
    res,
    {
      user: result.user,
      accessToken: result.tokens.accessToken,
    },
    200,
    "Login successful"
  );
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.user!.id);
  ApiResponse.success(res, user);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshTokenValue = req.cookies?.refreshToken;

  if (!refreshTokenValue) {
    ApiResponse.success(res, null, 200, "No refresh token");
    return;
  }

  const tokens = await authService.refreshToken(refreshTokenValue);

  res.cookie("refreshToken", tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

  ApiResponse.success(
    res,
    { accessToken: tokens.accessToken },
    200,
    "Token refreshed"
  );
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("refreshToken", CLEAR_COOKIE_OPTIONS);
  ApiResponse.success(res, null, 200, "Logged out successfully");
});
