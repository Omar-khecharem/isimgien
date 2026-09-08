import { z } from "zod";
import { TransactionType, TransactionCategory } from "../../shared/enums";

const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  sort: z
    .enum(["date", "-date", "createdAt", "-createdAt", "amount", "-amount"])
    .optional(),
});

// ─── Create Transaction ──────────────────────────────────────────────────────

const INCOME_CATEGORIES = [
  TransactionCategory.MEMBERSHIP_FEE,
  TransactionCategory.EVENT_REVENUE,
  TransactionCategory.TRAINING_FEE,
  TransactionCategory.OTHER_INCOME,
];

const EXPENSE_CATEGORIES = [
  TransactionCategory.EQUIPMENT,
  TransactionCategory.SUPPLIES,
  TransactionCategory.TRANSPORT,
  TransactionCategory.OTHER_EXPENSE,
];

export const createTransactionSchema = {
  params: z.object({ clubId: mongoId }),
  body: z
    .object({
      type: z.nativeEnum(TransactionType),
      category: z.nativeEnum(TransactionCategory),
      amount: z.number().positive("Amount must be positive").max(10000000),
      description: z.string().trim().min(1).max(500),
      date: z.coerce.date(),
      relatedMembershipId: mongoId.nullable().optional(),
      notes: z.string().trim().max(500).nullable().optional(),
    })
    .refine(
      (data) => {
        if (data.type === TransactionType.INCOME) {
          return INCOME_CATEGORIES.includes(data.category);
        }
        return EXPENSE_CATEGORIES.includes(data.category);
      },
      {
        message: "Category does not match transaction type",
        path: ["category"],
      }
    ),
};

// ─── Get Transaction ─────────────────────────────────────────────────────────

export const getTransactionSchema = {
  params: z.object({ clubId: mongoId, transactionId: mongoId }),
};

// ─── List Transactions ───────────────────────────────────────────────────────

export const listTransactionsSchema = {
  params: z.object({ clubId: mongoId }),
  query: paginationQuery.extend({
    type: z.nativeEnum(TransactionType).optional(),
    category: z.nativeEnum(TransactionCategory).optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    minAmount: z.coerce.number().min(0).optional(),
    maxAmount: z.coerce.number().min(0).optional(),
  }),
};

// ─── Get Balance ─────────────────────────────────────────────────────────────

export const getBalanceSchema = {
  params: z.object({ clubId: mongoId }),
};

// ─── Financial Summary ───────────────────────────────────────────────────────

export const getFinanceSummarySchema = {
  params: z.object({ clubId: mongoId }),
  query: z.object({
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
  }),
};

// ─── Global Finance (Super Admin) ────────────────────────────────────────────

export const getGlobalFinanceSchema = {
  query: paginationQuery.extend({
    clubId: mongoId.optional(),
    type: z.nativeEnum(TransactionType).optional(),
    category: z.nativeEnum(TransactionCategory).optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
  }),
};

export const getGlobalSummarySchema = {
  query: z.object({
    clubId: mongoId.optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
  }),
};

// ─── Types ───────────────────────────────────────────────────────────────────

export type CreateTransactionInput = z.infer<typeof createTransactionSchema.body>;
export type ListTransactionsQuery = z.infer<typeof listTransactionsSchema.query>;
export type GetGlobalFinanceQuery = z.infer<typeof getGlobalFinanceSchema.query>;
export type GetFinanceSummaryQuery = z.infer<typeof getFinanceSummarySchema.query>;
export type GetGlobalSummaryQuery = z.infer<typeof getGlobalSummarySchema.query>;
