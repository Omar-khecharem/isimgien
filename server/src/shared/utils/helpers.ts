import { z } from "zod";

// ─── Shared Validators ──────────────────────────────────────────────────────

export const mongoId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

// ─── Shared Helpers ─────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildSort(
  sort?: string,
  defaultSort: Record<string, 1 | -1> = { createdAt: -1 }
): Record<string, 1 | -1> {
  if (!sort) return defaultSort;
  if (sort.startsWith("-")) {
    return { [sort.slice(1)]: -1 };
  }
  return { [sort]: 1 };
}

export const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
