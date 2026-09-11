import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import { uploadClubImage } from "../../middleware/upload.middleware";
import * as clubController from "./club.controller";
import * as clubPolicies from "./club.policies";
import {
  createClubSchema,
  updateClubSchema,
  deactivateClubSchema,
  getClubSchema,
  listClubsSchema,
  assignLeaderSchema,
  removeLeaderSchema,
  getClubMembersSchema,
  inviteMemberSchema,
  joinClubSchema,
  getMyMembershipsSchema,
} from "./club.validation";

const router = Router();

// ─── Public / Authenticated: Browse active clubs ─────────────────────────────

router.get(
  "/",
  authenticate,
  clubPolicies.requireStudentOrAbove,
  validate(listClubsSchema),
  clubController.listActiveClubs
);

// ─── Authenticated: Get my memberships ───────────────────────────────────────

router.get(
  "/my-memberships",
  authenticate,
  clubPolicies.requireStudentOrAbove,
  validate(getMyMembershipsSchema),
  clubController.getMyMemberships
);

// ─── Super Admin: List all clubs (including inactive) ────────────────────────

router.get(
  "/all",
  authenticate,
  clubPolicies.requireSuperAdmin,
  validate(listClubsSchema),
  clubController.listClubs
);

// ─── Super Admin: Create club ────────────────────────────────────────────────

router.post(
  "/",
  authenticate,
  clubPolicies.requireSuperAdmin,
  validate(createClubSchema),
  clubController.createClub
);

// ─── Club Leader: Get own club ───────────────────────────────────────────────

router.get(
  "/my-club",
  authenticate,
  clubPolicies.requireStudentOrAbove,
  clubController.getClubByLeader
);

// ─── Get club by ID (role-dependent) ─────────────────────────────────────────

router.get(
  "/:id",
  authenticate,
  clubPolicies.requireStudentOrAbove,
  validate(getClubSchema),
  clubController.getClub
);

// ─── Super Admin: Update club ────────────────────────────────────────────────

router.put(
  "/:id",
  authenticate,
  clubPolicies.requireSuperAdmin,
  validate(updateClubSchema),
  clubController.updateClub
);

// ─── Club Leader: Update own club ────────────────────────────────────────────

router.put(
  "/:id/manage",
  authenticate,
  clubPolicies.requireClubLeaderOrSuperAdmin,
  validate(updateClubSchema),
  clubController.updateClubByLeader
);

// ─── Super Admin: Deactivate club ────────────────────────────────────────────

router.patch(
  "/:id/deactivate",
  authenticate,
  clubPolicies.requireSuperAdmin,
  validate(deactivateClubSchema),
  clubController.deactivateClub
);

// ─── Super Admin: Assign leader ──────────────────────────────────────────────

router.patch(
  "/:id/leader",
  authenticate,
  clubPolicies.requireSuperAdmin,
  validate(assignLeaderSchema),
  clubController.assignLeader
);

// ─── Super Admin: Remove leader ──────────────────────────────────────────────

router.delete(
  "/:id/leader",
  authenticate,
  clubPolicies.requireSuperAdmin,
  validate(removeLeaderSchema),
  clubController.removeLeader
);

// ─── Super Admin / Club Leader: View members ─────────────────────────────────

router.get(
  "/:id/members",
  authenticate,
  clubPolicies.requireClubLeaderOrSuperAdmin,
  validate(getClubMembersSchema),
  clubController.getClubMembers
);

// ─── Club Leader: Invite member ──────────────────────────────────────────────

router.post(
  "/:id/members/invite",
  authenticate,
  clubPolicies.requireClubLeaderOrSuperAdmin,
  validate(inviteMemberSchema),
  clubController.inviteMember
);

// ─── Student: Join club ──────────────────────────────────────────────────────

router.post(
  "/:id/join",
  authenticate,
  clubPolicies.requireStudentOrAbove,
  validate(joinClubSchema),
  clubController.joinClub
);

// ─── Club image upload ──────────────────────────────────────────────────────

router.post(
  "/upload",
  authenticate,
  clubPolicies.requireStudentOrAbove,
  uploadClubImage.single("file"),
  clubController.uploadClubImage
);

export default router;
