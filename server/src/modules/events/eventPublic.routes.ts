import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import * as eventController from "./event.controller";
import { listPublicEventsSchema } from "./event.validation";

const router = Router();

// ─── Public: Browse public events ────────────────────────────────────────────

router.get(
  "/",
  validate(listPublicEventsSchema),
  eventController.listPublicEvents
);

// ─── Public: Get event by ID ─────────────────────────────────────────────────

router.get(
  "/:id",
  eventController.getPublicEvent
);

export default router;
