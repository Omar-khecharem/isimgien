import { z } from "zod";

const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  role: z.enum(["super_admin", "club_leader", "student"]).optional(),
  isActive: z.coerce.boolean().optional(),
  sort: z.enum(["firstName", "-firstName", "createdAt", "-createdAt", "lastName", "-lastName"]).optional(),
});

export const listUsersSchema = {
  query: paginationQuery,
};

export const getUserSchema = {
  params: z.object({
    id: mongoId,
  }),
};

export const updateRoleSchema = {
  params: z.object({
    id: mongoId,
  }),
  body: z.object({
    role: z.enum(["super_admin", "club_leader", "student"]),
  }),
};

export const toggleActiveSchema = {
  params: z.object({
    id: mongoId,
  }),
};

export const deleteUserSchema = {
  params: z.object({
    id: mongoId,
  }),
};
