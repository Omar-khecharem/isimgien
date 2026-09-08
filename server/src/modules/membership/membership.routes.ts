import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import * as membershipController from "./membership.controller";
import * as membershipPolicies from "./membership.policies";
import {
  createMembershipSchema,
  getMembershipSchema,
  listMembershipsSchema,
  updateMembershipStatusSchema,
  recordPaymentSchema,
  getMyMembershipSchema,
} from "./membership.validation";

const router = Router({ mergeParams: true });

// ─── Club Leader: Get membership stats ───────────────────────────────────────

router.get(
  "/stats",
  authenticate,
  membershipPolicies.requireClubLeaderOrSuperAdmin,
  validate({ params: getMyMembershipSchema.params }),
  membershipController.getMembershipStats
);

// ─── Student: Get my membership ──────────────────────────────────────────────

router.get(
  "/my-membership",
  authenticate,
  membershipPolicies.requireStudentSelf,
  validate(getMyMembershipSchema),
  membershipController.getMyMembership
);

// ─── Club Leader: List memberships ───────────────────────────────────────────

router.get(
  "/",
  authenticate,
  membershipPolicies.requireClubLeaderOrSuperAdmin,
  validate(listMembershipsSchema),
  membershipController.listMemberships
);

// ─── Club Leader: Create membership ──────────────────────────────────────────

router.post(
  "/",
  authenticate,
  membershipPolicies.requireClubLeaderOrSuperAdmin,
  validate(createMembershipSchema),
  membershipController.createMembership
);

// ─── Club Leader: Get membership details ─────────────────────────────────────

router.get(
  "/:membershipId",
  authenticate,
  membershipPolicies.requireClubLeaderOrSuperAdmin,
  validate(getMembershipSchema),
  membershipController.getMembership
);

// ─── Club Leader: Update membership status ───────────────────────────────────

router.patch(
  "/:membershipId/status",
  authenticate,
  membershipPolicies.requireClubLeaderOrSuperAdmin,
  validate(updateMembershipStatusSchema),
  membershipController.updateMembershipStatus
);

// ─── Club Leader: Record payment ─────────────────────────────────────────────

router.post(
  "/:membershipId/payment",
  authenticate,
  membershipPolicies.requireClubLeaderOrSuperAdmin,
  validate(recordPaymentSchema),
  membershipController.recordPayment
);

export default router;
