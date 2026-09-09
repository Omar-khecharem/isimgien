import mongoose from "mongoose";
import * as clubRepo from "./club.repository";
import { ApiError } from "../../shared/utils/ApiError";
import { MembershipStatus } from "../../shared/enums";
import { Role } from "../../shared/enums/roles";
import { User } from "../../models/user.model";
import type {
  CreateClubInput,
  UpdateClubInput,
  ListClubsQuery,
  AssignLeaderInput,
  GetClubMembersQuery,
  InviteMemberInput,
  JoinClubInput,
  GetMyMembershipsQuery,
} from "./club.validation";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildSort(sort?: string): Record<string, 1 | -1> {
  if (!sort) return { createdAt: -1 };
  if (sort.startsWith("-")) {
    return { [sort.slice(1)]: -1 };
  }
  return { [sort]: 1 };
}

// ─── Super Admin operations ──────────────────────────────────────────────────

export async function createClub(input: CreateClubInput) {
  const slug = input.slug || slugify(input.name);

  const [slugExists, nameExists] = await Promise.all([
    clubRepo.clubExistsBySlug(slug),
    clubRepo.clubExistsByName(input.name),
  ]);

  if (slugExists) {
    throw ApiError.conflict("A club with this slug already exists");
  }
  if (nameExists) {
    throw ApiError.conflict("A club with this name already exists");
  }

  const club = await clubRepo.createClub({
    ...input,
    slug,
  } as any);

  return club.toJSON();
}

export async function updateClub(id: string, input: UpdateClubInput) {
  const existing = await clubRepo.findClubById(id);
  if (!existing) {
    throw ApiError.notFound("Club not found");
  }

  if (input.slug && input.slug !== existing.slug) {
    const slugExists = await clubRepo.clubExistsBySlug(input.slug, id);
    if (slugExists) {
      throw ApiError.conflict("A club with this slug already exists");
    }
  }

  if (input.name && input.name !== existing.name) {
    const nameExists = await clubRepo.clubExistsByName(input.name, id);
    if (nameExists) {
      throw ApiError.conflict("A club with this name already exists");
    }
  }

  const updated = await clubRepo.updateClub(id, input as any);
  return updated!.toJSON();
}

export async function deactivateClub(id: string) {
  const existing = await clubRepo.findClubById(id);
  if (!existing) {
    throw ApiError.notFound("Club not found");
  }
  if (!existing.isActive) {
    throw ApiError.badRequest("Club is already deactivated");
  }

  const updated = await clubRepo.deactivateClub(id);
  return updated!.toJSON();
}

export async function getClubById(id: string) {
  const club = await clubRepo.findClubById(id);
  if (!club) {
    throw ApiError.notFound("Club not found");
  }
  return club.toJSON();
}

export async function listClubs(query: ListClubsQuery) {
  const { page, limit, search, isActive, sort } = query;
  const { skip } = { skip: (page - 1) * limit };

  const filter: Record<string, unknown> = {};
  if (typeof isActive === "boolean") {
    filter.isActive = isActive;
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const sortObj = buildSort(sort);
  const { clubs, total } = await clubRepo.findClubsPaginated(
    filter,
    sortObj,
    skip,
    limit
  );

  return {
    clubs,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function listActiveClubs(query: ListClubsQuery) {
  const { page, limit, search, sort } = query;
  const { skip } = { skip: (page - 1) * limit };

  const filter: Record<string, unknown> = { isActive: true };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const sortObj = buildSort(sort);
  const { clubs, total } = await clubRepo.findClubsPaginated(
    filter,
    sortObj,
    skip,
    limit
  );

  return {
    clubs,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function assignLeader(clubId: string, input: AssignLeaderInput) {
  const club = await clubRepo.findClubById(clubId);
  if (!club) {
    throw ApiError.notFound("Club not found");
  }

  const user = await User.findById(input.userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  if (user.role === Role.SUPER_ADMIN) {
    throw ApiError.badRequest("Cannot assign Super Admin as club leader");
  }

  if (club.leader && club.leader.toString() === input.userId) {
    throw ApiError.badRequest("This user is already the leader of this club");
  }

  // Check if this user already leads another club
  const existingClub = await clubRepo.findClubByLeader(input.userId);
  if (existingClub && existingClub._id.toString() !== clubId) {
    throw ApiError.badRequest(
      `This user is already the leader of "${existingClub.name}"`
    );
  }

  const updated = await clubRepo.setClubLeader(clubId, input.userId);
  return updated!.toJSON();
}

export async function removeLeader(clubId: string) {
  const club = await clubRepo.findClubById(clubId);
  if (!club) {
    throw ApiError.notFound("Club not found");
  }
  if (!club.leader) {
    throw ApiError.badRequest("This club has no assigned leader");
  }

  const updated = await clubRepo.removeClubLeader(clubId);
  return updated!.toJSON();
}

export async function getClubMembers(clubId: string, query: GetClubMembersQuery) {
  const club = await clubRepo.findClubById(clubId);
  if (!club) {
    throw ApiError.notFound("Club not found");
  }

  const { page, limit, status } = query;
  const { skip } = { skip: (page - 1) * limit };

  const { members, total } = await clubRepo.findClubMembersPaginated(
    clubId,
    status as MembershipStatus | undefined,
    skip,
    limit
  );

  return {
    members,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─── Club Leader operations ──────────────────────────────────────────────────

export async function updateClubByLeader(
  clubId: string,
  leaderId: string,
  input: UpdateClubInput
) {
  const club = await clubRepo.findClubById(clubId);
  if (!club) {
    throw ApiError.notFound("Club not found");
  }

  // Leaders cannot change name, slug, or settings (those are Super Admin only)
  const { name, slug, settings, ...allowedUpdates } = input;

  if (Object.keys(allowedUpdates).length === 0) {
    throw ApiError.badRequest("No updatable fields provided");
  }

  const updated = await clubRepo.updateClub(clubId, allowedUpdates);
  return updated!.toJSON();
}

export async function inviteMember(clubId: string, input: InviteMemberInput) {
  const club = await clubRepo.findClubById(clubId);
  if (!club) {
    throw ApiError.notFound("Club not found");
  }

  const user = await User.findById(input.userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  if (user.role === Role.SUPER_ADMIN) {
    throw ApiError.badRequest("Cannot invite Super Admin");
  }

  const existingMembership = await clubRepo.findMembership(
    clubId,
    input.userId,
    input.academicYear
  );
  if (existingMembership) {
    throw ApiError.conflict(
      "This user already has a membership record for this academic year"
    );
  }

  const membership = await clubRepo.createMembership({
    club: new mongoose.Types.ObjectId(clubId),
    user: new mongoose.Types.ObjectId(input.userId),
    academicYear: input.academicYear,
    status: MembershipStatus.ACTIVE,
  });

  return membership.toJSON();
}

// ─── Student operations ──────────────────────────────────────────────────────

export async function joinClub(clubId: string, userId: string, input: JoinClubInput) {
  const club = await clubRepo.findClubById(clubId);
  if (!club) {
    throw ApiError.notFound("Club not found");
  }
  if (!club.isActive) {
    throw ApiError.badRequest("This club is not currently accepting members");
  }

  const existingMembership = await clubRepo.findMembership(
    clubId,
    userId,
    input.academicYear
  );
  if (existingMembership) {
    throw ApiError.conflict(
      "You already have a membership record for this club for this academic year"
    );
  }

  const membership = await clubRepo.createMembership({
    club: new mongoose.Types.ObjectId(clubId),
    user: new mongoose.Types.ObjectId(userId),
    academicYear: input.academicYear,
    status: club.settings.membershipFee > 0
      ? MembershipStatus.PENDING_PAYMENT
      : MembershipStatus.ACTIVE,
  });

  return membership.toJSON();
}

export async function getMyMemberships(userId: string, query: GetMyMembershipsQuery) {
  const { page, limit, status } = query;
  const { skip } = { skip: (page - 1) * limit };

  const { memberships, total } = await clubRepo.findUserMembershipsPaginated(
    userId,
    status as MembershipStatus | undefined,
    skip,
    limit
  );

  return {
    memberships,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
