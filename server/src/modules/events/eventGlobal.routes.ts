import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import * as eventController from "./event.controller";
import { requireSuperAdmin } from "./event.policies";
import { listGlobalEventsSchema, createFacultyEventSchema } from "./event.validation";

const router = Router();

// ─── Super Admin: List ALL events across all clubs ─────────────────────────

router.get(
  "/",
  authenticate,
  requireSuperAdmin,
  validate(listGlobalEventsSchema),
  eventController.listGlobalEvents
);

// ─── Super Admin: Create faculty event ─────────────────────────────────────

router.post(
  "/",
  authenticate,
  requireSuperAdmin,
  validate(createFacultyEventSchema),
  eventController.createFacultyEvent
);

export default router;
