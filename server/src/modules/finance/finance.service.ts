import mongoose from "mongoose";
import * as financeRepo from "./finance.repository";
import { ApiError } from "../../shared/utils/ApiError";
import { TransactionType } from "../../shared/enums";
import { Transaction } from "../../models/transaction.model";
import type {
  CreateTransactionInput,
  ListTransactionsQuery,
  GetGlobalFinanceQuery,
  GetFinanceSummaryQuery,
  GetGlobalSummaryQuery,
} from "./finance.validation";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildSort(sort?: string): Record<string, 1 | -1> {
  if (!sort) return { date: -1 };
  if (sort.startsWith("-")) {
    return { [sort.slice(1)]: -1 };
  }
  return { [sort]: 1 };
}

// ─── Transaction CRUD ────────────────────────────────────────────────────────

export async function createTransaction(
  clubId: string,
  input: CreateTransactionInput,
  actorId: string
) {
  const club = await financeRepo.findClubById(clubId);
  if (!club) {
    throw ApiError.notFound("Club not found");
  }

  const transaction = await financeRepo.createTransaction({
    club: new mongoose.Types.ObjectId(clubId),
    type: input.type,
    category: input.category,
    amount: input.amount,
    description: input.description,
    date: input.date,
    recordedBy: new mongoose.Types.ObjectId(actorId),
    relatedMembership: input.relatedMembershipId
      ? new mongoose.Types.ObjectId(input.relatedMembershipId)
      : null,
    notes: input.notes ?? null,
  });

  return transaction.toJSON();
}

export async function getTransaction(clubId: string, transactionId: string) {
  const transaction = await financeRepo.findTransactionById(transactionId);
  if (!transaction) {
    throw ApiError.notFound("Transaction not found");
  }
  if ((transaction.club as any)._id?.toString() !== clubId) {
    if ((transaction.club as any).toString() !== clubId) {
      throw ApiError.forbidden("Transaction does not belong to this club");
    }
  }
  return transaction;
}

export async function listTransactions(
  clubId: string,
  query: ListTransactionsQuery
) {
  const { page, limit, sort, type, category, dateFrom, dateTo, minAmount, maxAmount, search } =
    query;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) (filter.date as Record<string, Date>).$gte = dateFrom;
    if (dateTo) (filter.date as Record<string, Date>).$lte = dateTo;
  }
  if (minAmount != null || maxAmount != null) {
    filter.amount = {};
    if (minAmount != null) (filter.amount as Record<string, number>).$gte = minAmount;
    if (maxAmount != null) (filter.amount as Record<string, number>).$lte = maxAmount;
  }
  if (search) {
    filter.description = { $regex: search, $options: "i" };
  }

  const sortObj = buildSort(sort);
  const { transactions, total } = await financeRepo.findTransactionsByClub(
    clubId,
    filter,
    sortObj,
    skip,
    limit
  );

  return {
    transactions,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// ─── Balance ─────────────────────────────────────────────────────────────────

export async function getBalance(clubId: string) {
  const club = await financeRepo.findClubById(clubId);
  if (!club) {
    throw ApiError.notFound("Club not found");
  }

  const balance = await financeRepo.calculateBalance(clubId);
  return {
    clubId,
    clubName: club.name,
    ...balance,
  };
}

// ─── Financial Summary ───────────────────────────────────────────────────────

export async function getFinanceSummary(
  clubId: string,
  query: GetFinanceSummaryQuery
) {
  const club = await financeRepo.findClubById(clubId);
  if (!club) {
    throw ApiError.notFound("Club not found");
  }

  const { dateFrom, dateTo } = query;

  const [balance, categoryBreakdown] = await Promise.all([
    financeRepo.calculateBalanceWithFilters(clubId, dateFrom, dateTo),
    financeRepo.calculateCategoryBreakdown(clubId, dateFrom, dateTo),
  ]);

  return {
    clubId,
    clubName: club.name,
    period: { dateFrom: dateFrom ?? null, dateTo: dateTo ?? null },
    ...balance,
    categoryBreakdown,
  };
}

// ─── Global Finance (Super Admin) ────────────────────────────────────────────

export async function getGlobalFinance(query: GetGlobalFinanceQuery) {
  const { page, limit, sort, clubId, type, category, dateFrom, dateTo } = query;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (clubId) filter.club = new mongoose.Types.ObjectId(clubId);
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) (filter.date as Record<string, Date>).$gte = dateFrom;
    if (dateTo) (filter.date as Record<string, Date>).$lte = dateTo;
  }

  const sortObj = buildSort(sort);
  const { transactions, total } = await financeRepo.findGlobalTransactions(
    filter,
    sortObj,
    skip,
    limit
  );

  return {
    transactions,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getGlobalSummary(query: GetGlobalSummaryQuery) {
  const { clubId, dateFrom, dateTo } = query;

  if (clubId) {
    const club = await financeRepo.findClubById(clubId);
    if (!club) {
      throw ApiError.notFound("Club not found");
    }
    const balance = await financeRepo.calculateBalanceWithFilters(
      clubId,
      dateFrom,
      dateTo
    );
    return {
      scope: "club",
      clubId,
      clubName: club.name,
      ...balance,
    };
  }

  // Global summary across all clubs
  const matchStage: Record<string, unknown> = {};
  if (dateFrom || dateTo) {
    matchStage.date = {};
    if (dateFrom) (matchStage.date as Record<string, Date>).$gte = dateFrom;
    if (dateTo) (matchStage.date as Record<string, Date>).$lte = dateTo;
  }

  const result = await Transaction.aggregate([
    ...(Object.keys(matchStage).length > 0
      ? [{ $match: matchStage }]
      : []),
    {
      $group: {
        _id: { club: "$club", type: "$type" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  const clubBalances = new Map<
    string,
    { totalIncome: number; totalExpenses: number; count: number }
  >();

  for (const group of result) {
    const clubIdStr = group._id.club.toString();
    if (!clubBalances.has(clubIdStr)) {
      clubBalances.set(clubIdStr, {
        totalIncome: 0,
        totalExpenses: 0,
        count: 0,
      });
    }
    const bal = clubBalances.get(clubIdStr)!;
    bal.count += group.count;
    if (group._id.type === "income") {
      bal.totalIncome = group.total;
    } else {
      bal.totalExpenses = group.total;
    }
  }

  let globalIncome = 0;
  let globalExpenses = 0;
  let totalCount = 0;

  for (const bal of clubBalances.values()) {
    globalIncome += bal.totalIncome;
    globalExpenses += bal.totalExpenses;
    totalCount += bal.count;
  }

  return {
    scope: "global",
    totalIncome: globalIncome,
    totalExpenses: globalExpenses,
    balance: globalIncome - globalExpenses,
    transactionCount: totalCount,
    clubCount: clubBalances.size,
  };
}
