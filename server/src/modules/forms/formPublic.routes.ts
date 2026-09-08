import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import * as formController from "./form.controller";
import { getPublicFormSchema } from "./form.validation";

const router = Router();

// ─── Public: Get published form (for students to fill) ───────────────────────

router.get(
  "/:id",
  validate(getPublicFormSchema),
  formController.getPublicForm
);

export default router;
