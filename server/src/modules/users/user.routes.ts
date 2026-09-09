import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import * as userController from "./user.controller";
import * as userPolicies from "./user.policies";
import {
  listUsersSchema,
  getUserSchema,
  updateRoleSchema,
  toggleActiveSchema,
  deleteUserSchema,
} from "./user.validation";

const router = Router();

// ─── Super Admin: List all users ──────────────────────────────────────────

router.get(
  "/",
  authenticate,
  userPolicies.requireSuperAdmin,
  validate(listUsersSchema),
  userController.listUsers
);

// ─── Super Admin: Get user by ID ──────────────────────────────────────────

router.get(
  "/:id",
  authenticate,
  userPolicies.requireSuperAdmin,
  validate(getUserSchema),
  userController.getUser
);

// ─── Super Admin: Update user role ────────────────────────────────────────

router.patch(
  "/:id/role",
  authenticate,
  userPolicies.requireSuperAdmin,
  validate(updateRoleSchema),
  userController.updateRole
);

// ─── Super Admin: Toggle user active status ───────────────────────────────

router.patch(
  "/:id/toggle-active",
  authenticate,
  userPolicies.requireSuperAdmin,
  validate(toggleActiveSchema),
  userController.toggleActive
);

// ─── Super Admin: Delete user ─────────────────────────────────────────────

router.delete(
  "/:id",
  authenticate,
  userPolicies.requireSuperAdmin,
  validate(deleteUserSchema),
  userController.deleteUser
);

export default router;
