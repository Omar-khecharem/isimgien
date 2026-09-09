import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import * as eventController from "./event.controller";
import { requireSuperAdmin } from "./event.policies";
import { listGlobalEventsSchema } from "./event.validation";

const router = Router();

// ─── Super Admin: List ALL events across all clubs ─────────────────────────

router.get(
  "/",
  authenticate,
  requireSuperAdmin,
  validate(listGlobalEventsSchema),
  eventController.listGlobalEvents
);

export default router;
