import { Request, Response } from "express";
import * as userService from "./user.service";
import { ApiResponse } from "../../shared/utils/apiResponse";
import { asyncHandler } from "../../shared/utils/asyncHandler";

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.listUsers(req.query as any);
  ApiResponse.paginated(res, result.users, result.meta);
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id);
  ApiResponse.success(res, user);
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateUserRole(req.params.id, req.body.role);
  ApiResponse.success(res, user, 200, "Role updated successfully");
});

export const toggleActive = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.toggleUserActive(req.params.id);
  ApiResponse.success(res, user, 200, "User status updated");
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteUser(req.params.id);
  ApiResponse.noContent(res);
});
