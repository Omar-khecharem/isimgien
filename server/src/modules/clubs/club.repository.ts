import mongoose from "mongoose";
import { Club, IClub } from "../../models/club.model";
import { ClubMembership, IClubMembership } from "../../models/clubMembership.model";
import { MembershipStatus } from "../../shared/enums";

// ─── Club queries ────────────────────────────────────────────────────────────

export async function findClubById(id: string): Promise<IClub | null> {
  return Club.findById(id);
}

export async function findClubBySlug(slug: string): Promise<IClub | null> {
  return Club.findOne({ slug });
}

export async function findClubByIdLean(id: string) {
  return Club.findById(id).lean();
}

export async function createClub(data: Partial<IClub>): Promise<IClub> {
  return Club.create(data);
}

export async function updateClub(
  id: string,
  data: Partial<IClub>
): Promise<IClub | null> {
  return Club.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export async function deactivateClub(id: string): Promise<IClub | null> {
  return Club.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
}

export async function findClubsPaginated(filter: Record<string, unknown>, sort: Record<string, 1 | -1>, skip: number, limit: number) {
  const [clubs, total] = await Promise.all([
    Club.find(filter).sort(sort).skip(skip).limit(limit).populate("leader", "firstName lastName email").lean(),
    Club.countDocuments(filter),
  ]);
  return { clubs, total };
}

export async function findActiveClubsPaginated(sort: Record<string, 1 | -1>, skip: number, limit: number) {
  return findClubsPaginated({ isActive: true }, sort, skip, limit);
}

export async function clubExistsBySlug(slug: string, excludeId?: string): Promise<boolean> {
  const query: Record<string, unknown> = { slug };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return Club.exists(query).then(Boolean);
}

export async function clubExistsByName(name: string, excludeId?: string): Promise<boolean> {
  const query: Record<string, unknown> = { name };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return Club.exists(query).then(Boolean);
}

// ─── Leader queries ──────────────────────────────────────────────────────────

export async function setClubLeader(
  clubId: string,
  leaderId: string
): Promise<IClub | null> {
  return Club.findByIdAndUpdate(
    clubId,
    { leader: leaderId },
    { new: true }
  );
}

export async function removeClubLeader(clubId: string): Promise<IClub | null> {
  return Club.findByIdAndUpdate(
    clubId,
    { leader: null },
    { new: true }
  );
}

export async function findClubByLeader(leaderId: string): Promise<IClub | null> {
  return Club.findOne({ leader: leaderId });
}

export async function findClubByLeaderPopulated(leaderId: string) {
  return Club.findOne({ leader: leaderId })
    .populate("leader", "firstName lastName email avatar")
    .lean();
}

// ─── Membership queries ──────────────────────────────────────────────────────

export async function findMembership(
  clubId: string,
  userId: string,
  academicYear: string
): Promise<IClubMembership | null> {
  return ClubMembership.findOne({ club: clubId, user: userId, academicYear });
}

export async function findActiveMembership(
  clubId: string,
  userId: string
): Promise<IClubMembership | null> {
  const now = new Date();
  return ClubMembership.findOne({
    club: clubId,
    user: userId,
    status: MembershipStatus.ACTIVE,
    academicYear: { $gte: `${now.getFullYear()}-${now.getFullYear() + 1}` },
  });
}

export async function createMembership(
  data: Partial<IClubMembership>
): Promise<IClubMembership> {
  return ClubMembership.create(data);
}

export async function updateMembershipStatus(
  id: string,
  status: MembershipStatus,
  updates?: Partial<Pick<IClubMembership, "amountPaid" | "paymentDate" | "receiptNumber">>
): Promise<IClubMembership | null> {
  return ClubMembership.findByIdAndUpdate(
    id,
    { status, ...updates },
    { new: true, runValidators: true }
  );
}

export async function findClubMembersPaginated(
  clubId: string,
  status: MembershipStatus | undefined,
  skip: number,
  limit: number
) {
  const filter: Record<string, unknown> = { club: clubId };
  if (status) {
    filter.status = status;
  }

  const [members, total] = await Promise.all([
    ClubMembership.find(filter)
      .populate("user", "firstName lastName email studentId avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ClubMembership.countDocuments(filter),
  ]);

  return { members, total };
}

export async function findUserMembershipsPaginated(
  userId: string,
  status: MembershipStatus | undefined,
  skip: number,
  limit: number
) {
  const filter: Record<string, unknown> = { user: userId };
  if (status) {
    filter.status = status;
  }

  const [memberships, total] = await Promise.all([
    ClubMembership.find(filter)
      .populate("club", "name slug logo description")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ClubMembership.countDocuments(filter),
  ]);

  return { memberships, total };
}

export async function countActiveMembers(clubId: string): Promise<number> {
  return ClubMembership.countDocuments({
    club: clubId,
    status: MembershipStatus.ACTIVE,
  });
}

// ─── Transaction helpers ─────────────────────────────────────────────────────

export async function withTransaction<T>(
  fn: (session: mongoose.ClientSession) => Promise<T>
): Promise<T> {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
