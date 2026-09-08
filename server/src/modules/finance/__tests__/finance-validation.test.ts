import {
  createTransactionSchema,
  getTransactionSchema,
  listTransactionsSchema,
  getBalanceSchema,
  getFinanceSummarySchema,
  getGlobalFinanceSchema,
  getGlobalSummarySchema,
} from "../finance.validation";
import { TransactionType, TransactionCategory } from "../../../shared/enums";

describe("Finance Validation", () => {
  // ─── Create Transaction ──────────────────────────────────────────────────

  describe("createTransactionSchema", () => {
    const validClubId = "507f1f77bcf86cd799439011";

    it("should accept a valid income transaction", () => {
      const result = createTransactionSchema.body.safeParse({
        type: TransactionType.INCOME,
        category: TransactionCategory.MEMBERSHIP_FEE,
        amount: 50,
        description: "Annual membership fee",
        date: "2026-09-01T00:00:00.000Z",
      });
      expect(result.success).toBe(true);
    });

    it("should accept a valid expense transaction", () => {
      const result = createTransactionSchema.body.safeParse({
        type: TransactionType.EXPENSE,
        category: TransactionCategory.EQUIPMENT,
        amount: 200,
        description: "New projector",
        date: "2026-09-01T00:00:00.000Z",
      });
      expect(result.success).toBe(true);
    });

    it("should reject negative amounts", () => {
      const result = createTransactionSchema.body.safeParse({
        type: TransactionType.INCOME,
        category: TransactionCategory.MEMBERSHIP_FEE,
        amount: -50,
        description: "Invalid amount",
        date: "2026-09-01T00:00:00.000Z",
      });
      expect(result.success).toBe(false);
    });

    it("should reject zero amount", () => {
      const result = createTransactionSchema.body.safeParse({
        type: TransactionType.INCOME,
        category: TransactionCategory.MEMBERSHIP_FEE,
        amount: 0,
        description: "Zero amount",
        date: "2026-09-01T00:00:00.000Z",
      });
      expect(result.success).toBe(false);
    });

    it("should reject expense category for income type", () => {
      const result = createTransactionSchema.body.safeParse({
        type: TransactionType.INCOME,
        category: TransactionCategory.EQUIPMENT,
        amount: 100,
        description: "Wrong category",
        date: "2026-09-01T00:00:00.000Z",
      });
      expect(result.success).toBe(false);
    });

    it("should reject income category for expense type", () => {
      const result = createTransactionSchema.body.safeParse({
        type: TransactionType.EXPENSE,
        category: TransactionCategory.MEMBERSHIP_FEE,
        amount: 100,
        description: "Wrong category",
        date: "2026-09-01T00:00:00.000Z",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty description", () => {
      const result = createTransactionSchema.body.safeParse({
        type: TransactionType.INCOME,
        category: TransactionCategory.MEMBERSHIP_FEE,
        amount: 50,
        description: "",
        date: "2026-09-01T00:00:00.000Z",
      });
      expect(result.success).toBe(false);
    });

    it("should reject description over 500 characters", () => {
      const result = createTransactionSchema.body.safeParse({
        type: TransactionType.INCOME,
        category: TransactionCategory.MEMBERSHIP_FEE,
        amount: 50,
        description: "x".repeat(501),
        date: "2026-09-01T00:00:00.000Z",
      });
      expect(result.success).toBe(false);
    });

    it("should accept valid params", () => {
      const result = createTransactionSchema.params.safeParse({
        clubId: validClubId,
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid clubId", () => {
      const result = createTransactionSchema.params.safeParse({
        clubId: "invalid",
      });
      expect(result.success).toBe(false);
    });
  });

  // ─── Get Transaction ─────────────────────────────────────────────────────

  describe("getTransactionSchema", () => {
    it("should accept valid params", () => {
      const result = getTransactionSchema.params.safeParse({
        clubId: "507f1f77bcf86cd799439011",
        transactionId: "507f1f77bcf86cd799439012",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid transactionId", () => {
      const result = getTransactionSchema.params.safeParse({
        clubId: "507f1f77bcf86cd799439011",
        transactionId: "invalid",
      });
      expect(result.success).toBe(false);
    });
  });

  // ─── List Transactions ───────────────────────────────────────────────────

  describe("listTransactionsSchema", () => {
    it("should apply default pagination", () => {
      const result = listTransactionsSchema.query.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("should accept valid filters", () => {
      const result = listTransactionsSchema.query.safeParse({
        page: 1,
        limit: 10,
        type: TransactionType.INCOME,
        category: TransactionCategory.MEMBERSHIP_FEE,
        dateFrom: "2026-01-01",
        dateTo: "2026-12-31",
        minAmount: 10,
        maxAmount: 100,
      });
      expect(result.success).toBe(true);
    });

    it("should reject limit > 100", () => {
      const result = listTransactionsSchema.query.safeParse({
        limit: 101,
      });
      expect(result.success).toBe(false);
    });

    it("should reject negative minAmount", () => {
      const result = listTransactionsSchema.query.safeParse({
        minAmount: -1,
      });
      expect(result.success).toBe(false);
    });
  });

  // ─── Get Balance ─────────────────────────────────────────────────────────

  describe("getBalanceSchema", () => {
    it("should accept valid params", () => {
      const result = getBalanceSchema.params.safeParse({
        clubId: "507f1f77bcf86cd799439011",
      });
      expect(result.success).toBe(true);
    });
  });

  // ─── Financial Summary ───────────────────────────────────────────────────

  describe("getFinanceSummarySchema", () => {
    it("should accept valid params", () => {
      const result = getFinanceSummarySchema.params.safeParse({
        clubId: "507f1f77bcf86cd799439011",
      });
      expect(result.success).toBe(true);
    });

    it("should accept valid query with dates", () => {
      const result = getFinanceSummarySchema.query.safeParse({
        dateFrom: "2026-01-01",
        dateTo: "2026-12-31",
      });
      expect(result.success).toBe(true);
    });

    it("should accept empty query", () => {
      const result = getFinanceSummarySchema.query.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  // ─── Global Finance ──────────────────────────────────────────────────────

  describe("getGlobalFinanceSchema", () => {
    it("should accept valid query with all filters", () => {
      const result = getGlobalFinanceSchema.query.safeParse({
        page: 1,
        limit: 20,
        clubId: "507f1f77bcf86cd799439011",
        type: TransactionType.EXPENSE,
        category: TransactionCategory.EQUIPMENT,
        dateFrom: "2026-01-01",
        dateTo: "2026-12-31",
      });
      expect(result.success).toBe(true);
    });
  });

  // ─── Global Summary ──────────────────────────────────────────────────────

  describe("getGlobalSummarySchema", () => {
    it("should accept empty query", () => {
      const result = getGlobalSummarySchema.query.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should accept clubId filter", () => {
      const result = getGlobalSummarySchema.query.safeParse({
        clubId: "507f1f77bcf86cd799439011",
      });
      expect(result.success).toBe(true);
    });
  });
});

describe("Finance Category Validation", () => {
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

  it("should only allow income categories for INCOME type", () => {
    for (const cat of INCOME_CATEGORIES) {
      const result = createTransactionSchema.body.safeParse({
        type: TransactionType.INCOME,
        category: cat,
        amount: 50,
        description: `Test ${cat}`,
        date: "2026-09-01T00:00:00.000Z",
      });
      expect(result.success).toBe(true);
    }
  });

  it("should only allow expense categories for EXPENSE type", () => {
    for (const cat of EXPENSE_CATEGORIES) {
      const result = createTransactionSchema.body.safeParse({
        type: TransactionType.EXPENSE,
        category: cat,
        amount: 50,
        description: `Test ${cat}`,
        date: "2026-09-01T00:00:00.000Z",
      });
      expect(result.success).toBe(true);
    }
  });
});
