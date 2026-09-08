import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import * as membershipController from "./membership.controller";
import * as membershipPolicies from "./membership.policies";
import { listMembershipsSchema } from "./membership.validation";

const router = Router();

// ─── Super Admin: Global memberships ─────────────────────────────────────────

router.get(
  "/",
  authenticate,
  membershipPolicies.requireSuperAdmin,
  validate(listMembershipsSchema),
  membershipController.getGlobalMemberships
);

export default router;
