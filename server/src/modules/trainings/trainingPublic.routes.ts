import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import * as trainingController from "./training.controller";
import { listPublicTrainingsSchema, getPublicTrainingSchema } from "./training.validation";

const router = Router();

// ─── Public: Browse upcoming trainings ───────────────────────────────────────

router.get(
  "/",
  validate(listPublicTrainingsSchema),
  trainingController.listPublicTrainings
);

// ─── Public: Get training by ID ──────────────────────────────────────────────

router.get(
  "/:id",
  validate(getPublicTrainingSchema),
  trainingController.getPublicTraining
);

export default router;
