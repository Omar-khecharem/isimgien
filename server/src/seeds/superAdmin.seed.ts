import { User } from "../models/user.model";
import { Role } from "../shared/enums/roles";

const SEED_EMAIL = "admin@isimg.dz";
const SEED_PASSWORD = "SuperAdmin2026!";
const SEED_FIRST_NAME = "Super";
const SEED_LAST_NAME = "Admin";

/**
 * Seed the unique Super Admin account.
 *
 * This function is idempotent: if the Super Admin already exists, it does nothing.
 * It uses `User.create()` which triggers the pre-save hook, but the hook allows
 * creation of a Super Admin when none exists yet.
 */
export async function seedSuperAdmin(): Promise<void> {
  const existing = await User.findOne({ role: Role.SUPER_ADMIN });

  if (existing) {
    console.log("[SEED] Super Admin already exists, skipping seed.");
    return;
  }

  const superAdmin = await User.create({
    firstName: SEED_FIRST_NAME,
    lastName: SEED_LAST_NAME,
    email: SEED_EMAIL,
    password: SEED_PASSWORD,
    role: Role.SUPER_ADMIN,
    isActive: true,
  });

  console.log(`[SEED] Super Admin created: ${superAdmin.email}`);
}
