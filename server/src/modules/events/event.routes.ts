import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import * as eventController from "./event.controller";
import * as eventPolicies from "./event.policies";
import {
  createEventSchema,
  updateEventSchema,
  transitionEventStatusSchema,
  getEventSchema,
  listClubEventsSchema,
  deleteEventSchema,
  getEventRegistrationsSchema,
} from "./event.validation";

const router = Router({ mergeParams: true });

// ─── Student: My registrations ───────────────────────────────────────────────

router.get(
  "/my-registrations",
  authenticate,
  eventPolicies.requireStudentOrAbove,
  eventController.getMyRegistrations
);

// ─── Student: Register for event ─────────────────────────────────────────────

router.post(
  "/:id/register",
  authenticate,
  eventPolicies.requireStudentOrAbove,
  validate(getEventSchema),
  eventController.registerForEvent
);

// ─── Student: Cancel registration ────────────────────────────────────────────

router.delete(
  "/:id/register",
  authenticate,
  eventPolicies.requireStudentOrAbove,
  validate(getEventSchema),
  eventController.cancelRegistration
);

// ─── Club Leader: List events for a club ─────────────────────────────────────

router.get(
  "/",
  authenticate,
  eventPolicies.requireClubLeaderOrSuperAdmin,
  validate(listClubEventsSchema),
  eventController.listClubEvents
);

// ─── Club Leader: Create event ───────────────────────────────────────────────

router.post(
  "/",
  authenticate,
  eventPolicies.requireClubLeaderOrSuperAdmin,
  validate(createEventSchema),
  eventController.createEvent
);

// ─── Club Leader: Get event by ID ────────────────────────────────────────────

router.get(
  "/:id",
  authenticate,
  eventPolicies.requireClubLeaderOrSuperAdmin,
  validate(getEventSchema),
  eventController.getEvent
);

// ─── Club Leader: Update event ───────────────────────────────────────────────

router.put(
  "/:id",
  authenticate,
  eventPolicies.requireEventOwnershipOrSuperAdmin,
  validate(updateEventSchema),
  eventController.updateEvent
);

// ─── Club Leader: Transition event status ────────────────────────────────────

router.patch(
  "/:id/status",
  authenticate,
  eventPolicies.requireEventOwnershipOrSuperAdmin,
  validate(transitionEventStatusSchema),
  eventController.transitionStatus
);

// ─── Club Leader: Delete event ───────────────────────────────────────────────

router.delete(
  "/:id",
  authenticate,
  eventPolicies.requireEventOwnershipOrSuperAdmin,
  validate(deleteEventSchema),
  eventController.deleteEvent
);

// ─── Club Leader: View registrations ─────────────────────────────────────────

router.get(
  "/:id/registrations",
  authenticate,
  eventPolicies.requireEventOwnershipOrSuperAdmin,
  validate(getEventRegistrationsSchema),
  eventController.getEventRegistrations
);

export default router;
