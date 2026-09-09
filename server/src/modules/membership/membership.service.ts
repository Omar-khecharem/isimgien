import mongoose from "mongoose";
import * as membershipRepo from "./membership.repository";
import { ApiError } from "../../shared/utils/ApiError";
import { MembershipStatus } from "../../shared/enums";
import { ClubMembership } from "../../models/clubMembership.model";
import type {
  CreateMembershipInput,
  ListMembershipsQuery,
  RecordPaymentInput,
} from "./membership.validation";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildSort(sort?: string): Record<string, 1 | -1> {
  if (!sort) return { createdAt: -1 };
  if (sort.startsWith("-")) {
    return { [sort.slice(1)]: -1 };
  }
  return { [sort]: 1 };
}

function getCurrentAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  // Academic year starts in September
  if (month >= 8) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
}

// ─── Create Membership ───────────────────────────────────────────────────────

export async function createMembership(
  clubId: string,
  input: CreateMembershipInput,
  actorId: string
) {
  const club = await membershipRepo.findClubById(clubId);
  if (!club) {
    throw ApiError.notFound("Club not found");
  }

  const user = await membershipRepo.findUserById(input.userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  // Check for duplicate membership
  const existing = await membershipRepo.findMembershipByClubAndUser(
    clubId,
    input.userId,
    input.academicYear
  );
  if (existing) {
    throw ApiError.conflict(
      "User already has a membership for this club and academic year"
    );
  }

  const membership = await membershipRepo.createMembership({
    club: new mongoose.Types.ObjectId(clubId),
    user: new mongoose.Types.ObjectId(input.userId),
    academicYear: input.academicYear,
    status:
      input.amountPaid >= club.settings.membershipFee
        ? MembershipStatus.ACTIVE
        : MembershipStatus.PENDING_PAYMENT,
    amountPaid: input.amountPaid,
    paymentDate: input.paymentDate ?? null,
    receiptNumber: input.receiptNumber ?? null,
    notes: input.notes ?? null,
  });

  return membership.toJSON();
}

// ─── Get Membership ──────────────────────────────────────────────────────────

export async function getMembership(clubId: string, membershipId: string) {
  const membership = await membershipRepo.findMembershipById(membershipId);
  if (!membership) {
    throw ApiError.notFound("Membership not found");
  }
  const membershipClubId = (membership.club as any).toString();
  if (membershipClubId !== clubId) {
    throw ApiError.forbidden("Membership does not belong to this club");
  }
  return membership;
}

// ─── List Memberships ────────────────────────────────────────────────────────

export async function listMemberships(
  clubId: string,
  query: ListMembershipsQuery
) {
  const { page, limit, sort, status, academicYear, search } = query;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (academicYear) filter.academicYear = academicYear;
  if (search) {
    // Search via user populate - we handle this client-side for now
    // or use a regex on receiptNumber
    filter.receiptNumber = { $regex: search, $options: "i" };
  }

  const sortObj = buildSort(sort);
  const { memberships, total } = await membershipRepo.findMembershipsByClub(
    clubId,
    filter,
    sortObj,
    skip,
    limit
  );

  return {
    memberships,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// ─── Update Membership Status ────────────────────────────────────────────────

export async function updateMembershipStatus(
  clubId: string,
  membershipId: string,
  status: MembershipStatus
) {
  const existing = await membershipRepo.findMembershipById(membershipId);
  if (!existing) {
    throw ApiError.notFound("Membership not found");
  }
  const existingClubId = (existing.club as any).toString();
  if (existingClubId !== clubId) {
    throw ApiError.forbidden("Membership does not belong to this club");
  }

  const updated = await membershipRepo.updateMembershipById(membershipId, {
    status,
  });
  return updated;
}

// ─── Record Payment ──────────────────────────────────────────────────────────

export async function recordPayment(
  clubId: string,
  membershipId: string,
  input: RecordPaymentInput
) {
  const club = await membershipRepo.findClubById(clubId);
  if (!club) {
    throw ApiError.notFound("Club not found");
  }

  const existing = await membershipRepo.findMembershipById(membershipId);
  if (!existing) {
    throw ApiError.notFound("Membership not found");
  }
  const existingClubId = (existing.club as any).toString();
  if (existingClubId !== clubId) {
    throw ApiError.forbidden("Membership does not belong to this club");
  }

  const updated = await membershipRepo.addPayment(
    membershipId,
    input.amount,
    input.paymentDate,
    input.receiptNumber ?? null
  );

  if (!updated) {
    throw ApiError.internal("Failed to record payment");
  }

  // Auto-activate if fully paid
  const newAmountPaid =
    (existing.amountPaid ?? 0) + input.amount;
  if (newAmountPaid >= club.settings.membershipFee) {
    await membershipRepo.updateMembershipById(membershipId, {
      status: MembershipStatus.ACTIVE,
    });
  }

  return (await membershipRepo.findMembershipById(membershipId))!;
}

// ─── Get My Membership (Student) ─────────────────────────────────────────────

export async function getMyMembership(clubId: string, userId: string) {
  const academicYear = getCurrentAcademicYear();
  const membership = await membershipRepo.findMembershipByClubAndUser(
    clubId,
    userId,
    academicYear
  );
  if (!membership) {
    throw ApiError.notFound(
      "No membership found for current academic year"
    );
  }
  return membership;
}

// ─── Membership Stats ────────────────────────────────────────────────────────

export async function getMembershipStats(clubId: string) {
  const club = await membershipRepo.findClubById(clubId);
  if (!club) {
    throw ApiError.notFound("Club not found");
  }

  const stats = await membershipRepo.getMembershipStats(clubId);
  return {
    clubId,
    clubName: club.name,
    membershipFee: club.settings.membershipFee,
    ...stats,
  };
}

// ─── Global Memberships (Super Admin) ────────────────────────────────────────

export async function getGlobalMemberships(
  query: ListMembershipsQuery & { clubId?: string }
) {
  const { page, limit, sort, status, academicYear, clubId } = query;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (clubId) filter.club = new mongoose.Types.ObjectId(clubId);
  if (status) filter.status = status;
  if (academicYear) filter.academicYear = academicYear;

  const sortObj = buildSort(sort);

  const [memberships, total] = await Promise.all([
    ClubMembership.find(filter)
      .populate("user", "firstName lastName email")
      .populate("club", "name slug")
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean(),
    ClubMembership.countDocuments(filter),
  ]);

  return {
    memberships,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
