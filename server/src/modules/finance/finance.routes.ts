import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import * as financeController from "./finance.controller";
import * as financePolicies from "./finance.policies";
import {
  createTransactionSchema,
  getTransactionSchema,
  listTransactionsSchema,
  getBalanceSchema,
  getFinanceSummarySchema,
} from "./finance.validation";

const router = Router({ mergeParams: true });

// ─── Club Leader: Get balance ────────────────────────────────────────────────

router.get(
  "/balance",
  authenticate,
  financePolicies.requireClubLeaderOrSuperAdmin,
  validate(getBalanceSchema),
  financeController.getBalance
);

// ─── Club Leader: Financial summary ──────────────────────────────────────────

router.get(
  "/summary",
  authenticate,
  financePolicies.requireClubLeaderOrSuperAdmin,
  validate(getFinanceSummarySchema),
  financeController.getFinanceSummary
);

// ─── Club Leader: List transactions ──────────────────────────────────────────

router.get(
  "/transactions",
  authenticate,
  financePolicies.requireClubLeaderOrSuperAdmin,
  validate(listTransactionsSchema),
  financeController.listTransactions
);

// ─── Club Leader: Create transaction ─────────────────────────────────────────

router.post(
  "/transactions",
  authenticate,
  financePolicies.requireClubLeaderOrSuperAdmin,
  validate(createTransactionSchema),
  financeController.createTransaction
);

// ─── Club Leader: Get transaction details ────────────────────────────────────

router.get(
  "/transactions/:transactionId",
  authenticate,
  financePolicies.requireClubLeaderOrSuperAdmin,
  validate(getTransactionSchema),
  financeController.getTransaction
);

export default router;
