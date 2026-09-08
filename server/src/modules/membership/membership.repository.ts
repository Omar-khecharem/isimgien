import mongoose from "mongoose";
import {
  ClubMembership,
  IClubMembership,
} from "../../models/clubMembership.model";
import { User } from "../../models/user.model";
import { Club } from "../../models/club.model";

// ─── Membership CRUD ─────────────────────────────────────────────────────────

export async function findMembershipById(id: string) {
  return ClubMembership.findById(id)
    .populate("user", "firstName lastName email")
    .populate("club", "name slug")
    .lean();
}

export async function createMembership(
  data: Partial<IClubMembership>
): Promise<IClubMembership> {
  return ClubMembership.create(data);
}

export async function findMembershipsByClub(
  clubId: string,
  filter: Record<string, unknown>,
  sort: Record<string, 1 | -1>,
  skip: number,
  limit: number
) {
  const combinedFilter = { club: clubId, ...filter };
  const [memberships, total] = await Promise.all([
    ClubMembership.find(combinedFilter)
      .populate("user", "firstName lastName email")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    ClubMembership.countDocuments(combinedFilter),
  ]);
  return { memberships, total };
}

export async function findMembershipByClubAndUser(
  clubId: string,
  userId: string,
  academicYear: string
) {
  return ClubMembership.findOne({
    club: clubId,
    user: userId,
    academicYear,
  }).lean();
}

export async function updateMembershipById(
  id: string,
  update: Partial<IClubMembership>
) {
  return ClubMembership.findByIdAndUpdate(id, update, { new: true })
    .populate("user", "firstName lastName email")
    .populate("club", "name slug")
    .lean();
}

export async function addPayment(
  id: string,
  amount: number,
  paymentDate: Date,
  receiptNumber: string | null
) {
  return ClubMembership.findByIdAndUpdate(
    id,
    {
      $inc: { amountPaid: amount },
      paymentDate,
      receiptNumber: receiptNumber ?? null,
    },
    { new: true }
  )
    .populate("user", "firstName lastName email")
    .populate("club", "name slug")
    .lean();
}

// ─── Membership Stats ────────────────────────────────────────────────────────

export async function getMembershipStats(clubId: string) {
  const result = await ClubMembership.aggregate([
    { $match: { club: new mongoose.Types.ObjectId(clubId) } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalPaid: { $sum: "$amountPaid" },
      },
    },
  ]);

  const stats: Record<string, { count: number; totalPaid: number }> = {};
  for (const group of result) {
    stats[group._id] = { count: group.count, totalPaid: group.totalPaid };
  }

  return {
    active: stats.active ?? { count: 0, totalPaid: 0 },
    expired: stats.expired ?? { count: 0, totalPaid: 0 },
    pendingPayment: stats.pending_payment ?? { count: 0, totalPaid: 0 },
    totalMembers:
      (stats.active?.count ?? 0) +
      (stats.expired?.count ?? 0) +
      (stats.pending_payment?.count ?? 0),
    totalRevenue:
      (stats.active?.totalPaid ?? 0) +
      (stats.expired?.totalPaid ?? 0) +
      (stats.pending_payment?.totalPaid ?? 0),
  };
}

// ─── Club Queries ────────────────────────────────────────────────────────────

export async function findClubById(id: string) {
  return Club.findById(id);
}

export async function findUserById(id: string) {
  return User.findById(id).select("firstName lastName email role").lean();
}
