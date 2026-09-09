import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import * as responseController from "./response.controller";
import * as formPolicies from "./form.policies";
import {
  submitResponseSchema,
  getResponseSchema,
  getMyResponsesSchema,
} from "./form.validation";

const router = Router();

// ─── Student: Submit response to a form ──────────────────────────────────────

router.post(
  "/:id/responses",
  authenticate,
  formPolicies.requireStudentOrAbove,
  validate(submitResponseSchema),
  responseController.submitResponse
);

// ─── Student: Get own responses ──────────────────────────────────────────────

router.get(
  "/my-responses",
  authenticate,
  formPolicies.requireStudentOrAbove,
  validate(getMyResponsesSchema),
  responseController.getMyResponses
);

// ─── Club Leader: View single response ───────────────────────────────────────

router.get(
  "/responses/:id",
  authenticate,
  formPolicies.requireStudentOrAbove,
  validate(getResponseSchema),
  responseController.getResponse
);

export default router;
