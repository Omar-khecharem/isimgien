import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { requireClubLeaderOrSuperAdmin } from "../../middleware/policies.middleware";
import * as dashboardController from "./dashboard.controller";

const router = Router({ mergeParams: true });

router.get(
  "/",
  authenticate,
  requireClubLeaderOrSuperAdmin,
  dashboardController.getClubDashboard
);

export default router;
