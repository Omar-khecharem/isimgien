import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import * as financeController from "./finance.controller";
import * as financePolicies from "./finance.policies";
import {
  getGlobalFinanceSchema,
  getGlobalSummarySchema,
} from "./finance.validation";

const router = Router();

// ─── Super Admin: Global transactions ────────────────────────────────────────

router.get(
  "/transactions",
  authenticate,
  financePolicies.requireSuperAdmin,
  validate(getGlobalFinanceSchema),
  financeController.getGlobalFinance
);

// ─── Super Admin: Global summary ─────────────────────────────────────────────

router.get(
  "/summary",
  authenticate,
  financePolicies.requireSuperAdmin,
  validate(getGlobalSummarySchema),
  financeController.getGlobalSummary
);

export default router;
