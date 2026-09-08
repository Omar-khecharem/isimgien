import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import * as formController from "./form.controller";
import * as formPolicies from "./form.policies";
import {
  createFormSchema,
  updateFormSchema,
  getFormSchema,
  listClubFormsSchema,
  deleteFormSchema,
  addQuestionSchema,
  updateQuestionSchema,
  deleteQuestionSchema,
  reorderQuestionsSchema,
  publishFormSchema,
  unpublishFormSchema,
  listFormResponsesSchema,
} from "./form.validation";

const router = Router({ mergeParams: true });

// ─── Club Leader: List forms ─────────────────────────────────────────────────

router.get(
  "/",
  authenticate,
  formPolicies.requireClubLeaderOrSuperAdmin,
  validate(listClubFormsSchema),
  formController.listClubForms
);

// ─── Club Leader: Create form ────────────────────────────────────────────────

router.post(
  "/",
  authenticate,
  formPolicies.requireClubLeaderOrSuperAdmin,
  validate(createFormSchema),
  formController.createForm
);

// ─── Club Leader: Get form by ID ─────────────────────────────────────────────

router.get(
  "/:id",
  authenticate,
  formPolicies.requireClubLeaderOrSuperAdmin,
  validate(getFormSchema),
  formController.getForm
);

// ─── Club Leader: Update form ────────────────────────────────────────────────

router.put(
  "/:id",
  authenticate,
  formPolicies.requireFormOwnershipOrSuperAdmin,
  validate(updateFormSchema),
  formController.updateForm
);

// ─── Club Leader: Delete form ────────────────────────────────────────────────

router.delete(
  "/:id",
  authenticate,
  formPolicies.requireFormOwnershipOrSuperAdmin,
  validate(deleteFormSchema),
  formController.deleteForm
);

// ─── Club Leader: Publish form ───────────────────────────────────────────────

router.patch(
  "/:id/publish",
  authenticate,
  formPolicies.requireFormOwnershipOrSuperAdmin,
  validate(publishFormSchema),
  formController.publishForm
);

// ─── Club Leader: Unpublish form ─────────────────────────────────────────────

router.patch(
  "/:id/unpublish",
  authenticate,
  formPolicies.requireFormOwnershipOrSuperAdmin,
  validate(unpublishFormSchema),
  formController.unpublishForm
);

// ─── Club Leader: Add question ───────────────────────────────────────────────

router.post(
  "/:id/questions",
  authenticate,
  formPolicies.requireFormOwnershipOrSuperAdmin,
  validate(addQuestionSchema),
  formController.addQuestion
);

// ─── Club Leader: Update question ────────────────────────────────────────────

router.put(
  "/:id/questions/:questionId",
  authenticate,
  formPolicies.requireFormOwnershipOrSuperAdmin,
  validate(updateQuestionSchema),
  formController.updateQuestion
);

// ─── Club Leader: Delete question ────────────────────────────────────────────

router.delete(
  "/:id/questions/:questionId",
  authenticate,
  formPolicies.requireFormOwnershipOrSuperAdmin,
  validate(deleteQuestionSchema),
  formController.deleteQuestion
);

// ─── Club Leader: Reorder questions ──────────────────────────────────────────

router.put(
  "/:id/questions/reorder",
  authenticate,
  formPolicies.requireFormOwnershipOrSuperAdmin,
  validate(reorderQuestionsSchema),
  formController.reorderQuestions
);

// ─── Club Leader: View responses ─────────────────────────────────────────────

router.get(
  "/:id/responses",
  authenticate,
  formPolicies.requireFormOwnershipOrSuperAdmin,
  validate(listFormResponsesSchema),
  formController.listFormResponses
);

// ─── Club Leader: Response statistics ────────────────────────────────────────

router.get(
  "/:id/responses/stats",
  authenticate,
  formPolicies.requireFormOwnershipOrSuperAdmin,
  validate(listFormResponsesSchema),
  formController.getResponseStats
);

export default router;
