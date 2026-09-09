import { User } from "../../models/user.model";
import { ApiError } from "../../shared/utils/ApiError";
import { Role } from "../../shared/enums/roles";

export interface ListUsersQuery {
  page: number;
  limit: number;
  search?: string;
  role?: Role;
  isActive?: boolean;
  sort?: string;
}

function buildSort(sort?: string): Record<string, 1 | -1> {
  if (!sort) return { createdAt: -1 };
  const desc = sort.startsWith("-");
  const field = desc ? sort.slice(1) : sort;
  return { [field]: desc ? -1 : 1 };
}

export async function listUsers(query: ListUsersQuery) {
  const { page, limit, search, role, isActive, sort } = query;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (role) {
    filter.role = role;
  }

  if (typeof isActive === "boolean") {
    filter.isActive = isActive;
  }

  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const sortObj = buildSort(sort);

  const [users, total] = await Promise.all([
    User.find(filter).sort(sortObj).skip(skip).limit(limit).select("-password").lean(),
    User.countDocuments(filter),
  ]);

  return {
    users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getUserById(id: string) {
  const user = await User.findById(id).select("-password").lean();
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  return user;
}

export async function updateUserRole(id: string, role: Role) {
  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  if (user.role === Role.SUPER_ADMIN && role !== Role.SUPER_ADMIN) {
    throw ApiError.forbidden("Cannot change the role of a Super Admin");
  }

  user.role = role;
  await user.save();

  const userObj = user.toObject() as unknown as Record<string, unknown>;
  delete userObj.password;
  return userObj;
}

export async function toggleUserActive(id: string) {
  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  if (user.role === Role.SUPER_ADMIN) {
    throw ApiError.forbidden("Cannot deactivate a Super Admin");
  }

  user.isActive = !user.isActive;
  await user.save();

  const userObj = user.toObject() as unknown as Record<string, unknown>;
  delete userObj.password;
  return userObj;
}

export async function deleteUser(id: string) {
  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  if (user.role === Role.SUPER_ADMIN) {
    throw ApiError.forbidden("Cannot delete a Super Admin");
  }

  await User.findByIdAndDelete(id);
}
