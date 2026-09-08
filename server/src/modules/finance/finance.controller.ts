import { Request, Response } from "express";
import * as financeService from "./finance.service";
import { ApiResponse } from "../../shared/utils/apiResponse";
import { asyncHandler } from "../../shared/utils/asyncHandler";

// ─── Club Leader: Transaction CRUD ──────────────────────────────────────────

export const createTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const transaction = await financeService.createTransaction(
      req.params.clubId,
      req.body,
      req.user!.id
    );
    ApiResponse.created(res, transaction, "Transaction recorded successfully");
  }
);

export const getTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const transaction = await financeService.getTransaction(
      req.params.clubId,
      req.params.transactionId
    );
    ApiResponse.success(res, transaction);
  }
);

export const listTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await financeService.listTransactions(
      req.params.clubId,
      req.query as any
    );
    ApiResponse.paginated(res, result.transactions, result.meta);
  }
);

// ─── Club Leader: Balance & Summary ──────────────────────────────────────────

export const getBalance = asyncHandler(async (req: Request, res: Response) => {
  const balance = await financeService.getBalance(req.params.clubId);
  ApiResponse.success(res, balance);
});

export const getFinanceSummary = asyncHandler(
  async (req: Request, res: Response) => {
    const summary = await financeService.getFinanceSummary(
      req.params.clubId,
      req.query as any
    );
    ApiResponse.success(res, summary);
  }
);

// ─── Super Admin: Global Finance ─────────────────────────────────────────────

export const getGlobalFinance = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await financeService.getGlobalFinance(req.query as any);
    ApiResponse.paginated(res, result.transactions, result.meta);
  }
);

export const getGlobalSummary = asyncHandler(
  async (req: Request, res: Response) => {
    const summary = await financeService.getGlobalSummary(req.query as any);
    ApiResponse.success(res, summary);
  }
);
