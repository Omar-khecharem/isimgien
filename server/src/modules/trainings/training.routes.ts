import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import * as trainingController from "./training.controller";
import * as trainingPolicies from "./training.policies";
import {
  createTrainingSchema,
  updateTrainingSchema,
  transitionTrainingStatusSchema,
  getTrainingSchema,
  listClubTrainingsSchema,
  deleteTrainingSchema,
  getTrainingRegistrationsSchema,
} from "./training.validation";

const router = Router({ mergeParams: true });

// ─── Student: My registrations ───────────────────────────────────────────────

router.get(
  "/my-registrations",
  authenticate,
  trainingPolicies.requireStudentOrAbove,
  trainingController.getMyRegistrations
);

// ─── Student: Register for training ──────────────────────────────────────────

router.post(
  "/:id/register",
  authenticate,
  trainingPolicies.requireStudentOrAbove,
  validate(getTrainingSchema),
  trainingController.registerForTraining
);

// ─── Student: Cancel registration ────────────────────────────────────────────

router.delete(
  "/:id/register",
  authenticate,
  trainingPolicies.requireStudentOrAbove,
  validate(getTrainingSchema),
  trainingController.cancelRegistration
);

// ─── Club Leader: List trainings for a club ──────────────────────────────────

router.get(
  "/",
  authenticate,
  trainingPolicies.requireClubLeaderOrSuperAdmin,
  validate(listClubTrainingsSchema),
  trainingController.listClubTrainings
);

// ─── Club Leader: Create training ────────────────────────────────────────────

router.post(
  "/",
  authenticate,
  trainingPolicies.requireClubLeaderOrSuperAdmin,
  validate(createTrainingSchema),
  trainingController.createTraining
);

// ─── Club Leader: Get training by ID ─────────────────────────────────────────

router.get(
  "/:id",
  authenticate,
  trainingPolicies.requireClubLeaderOrSuperAdmin,
  validate(getTrainingSchema),
  trainingController.getTraining
);

// ─── Club Leader: Update training ────────────────────────────────────────────

router.put(
  "/:id",
  authenticate,
  trainingPolicies.requireTrainingOwnershipOrSuperAdmin,
  validate(updateTrainingSchema),
  trainingController.updateTraining
);

// ─── Club Leader: Transition training status ─────────────────────────────────

router.patch(
  "/:id/status",
  authenticate,
  trainingPolicies.requireTrainingOwnershipOrSuperAdmin,
  validate(transitionTrainingStatusSchema),
  trainingController.transitionStatus
);

// ─── Club Leader: Delete training ────────────────────────────────────────────

router.delete(
  "/:id",
  authenticate,
  trainingPolicies.requireTrainingOwnershipOrSuperAdmin,
  validate(deleteTrainingSchema),
  trainingController.deleteTraining
);

// ─── Club Leader: View registrations ─────────────────────────────────────────

router.get(
  "/:id/registrations",
  authenticate,
  trainingPolicies.requireTrainingOwnershipOrSuperAdmin,
  validate(getTrainingRegistrationsSchema),
  trainingController.getTrainingRegistrations
);

export default router;
