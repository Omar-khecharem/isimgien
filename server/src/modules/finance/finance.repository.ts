import mongoose from "mongoose";
import { Transaction, ITransaction } from "../../models/transaction.model";
import { Club, IClub } from "../../models/club.model";

// ─── Transaction CRUD ────────────────────────────────────────────────────────

export async function findTransactionById(id: string) {
  return Transaction.findById(id)
    .populate("recordedBy", "firstName lastName email")
    .populate("relatedMembership")
    .lean();
}

export async function createTransaction(
  data: Partial<ITransaction>
): Promise<ITransaction> {
  return Transaction.create(data);
}

export async function findTransactionsByClub(
  clubId: string,
  filter: Record<string, unknown>,
  sort: Record<string, 1 | -1>,
  skip: number,
  limit: number
) {
  const combinedFilter = { club: clubId, ...filter };
  const [transactions, total] = await Promise.all([
    Transaction.find(combinedFilter)
      .populate("recordedBy", "firstName lastName email")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Transaction.countDocuments(combinedFilter),
  ]);
  return { transactions, total };
}

export async function findGlobalTransactions(
  filter: Record<string, unknown>,
  sort: Record<string, 1 | -1>,
  skip: number,
  limit: number
) {
  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .populate("club", "name slug")
      .populate("recordedBy", "firstName lastName email")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Transaction.countDocuments(filter),
  ]);
  return { transactions, total };
}

// ─── Balance Calculation ─────────────────────────────────────────────────────

export async function calculateBalance(clubId: string): Promise<{
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}> {
  const result = await Transaction.aggregate([
    { $match: { club: new mongoose.Types.ObjectId(clubId) } },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  let totalIncome = 0;
  let totalExpenses = 0;
  let transactionCount = 0;

  for (const group of result) {
    transactionCount += group.count;
    if (group._id === "income") {
      totalIncome = group.total;
    } else if (group._id === "expense") {
      totalExpenses = group.total;
    }
  }

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    transactionCount,
  };
}

export async function calculateBalanceWithFilters(
  clubId: string,
  dateFrom?: Date,
  dateTo?: Date
): Promise<{
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}> {
  const matchStage: Record<string, unknown> = {
    club: new mongoose.Types.ObjectId(clubId),
  };

  if (dateFrom || dateTo) {
    matchStage.date = {};
    if (dateFrom) (matchStage.date as Record<string, Date>).$gte = dateFrom;
    if (dateTo) (matchStage.date as Record<string, Date>).$lte = dateTo;
  }

  const result = await Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  let totalIncome = 0;
  let totalExpenses = 0;
  let transactionCount = 0;

  for (const group of result) {
    transactionCount += group.count;
    if (group._id === "income") {
      totalIncome = group.total;
    } else if (group._id === "expense") {
      totalExpenses = group.total;
    }
  }

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    transactionCount,
  };
}

export async function calculateCategoryBreakdown(
  clubId: string,
  dateFrom?: Date,
  dateTo?: Date
) {
  const matchStage: Record<string, unknown> = {
    club: new mongoose.Types.ObjectId(clubId),
  };

  if (dateFrom || dateTo) {
    matchStage.date = {};
    if (dateFrom) (matchStage.date as Record<string, Date>).$gte = dateFrom;
    if (dateTo) (matchStage.date as Record<string, Date>).$lte = dateTo;
  }

  const result = await Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { type: "$type", category: "$category" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.type": 1, "_id.category": 1 } },
  ]);

  return result.map((r) => ({
    type: r._id.type,
    category: r._id.category,
    total: r.total,
    count: r.count,
  }));
}

// ─── Club Queries ────────────────────────────────────────────────────────────

export async function findClubById(id: string) {
  return Club.findById(id);
}
