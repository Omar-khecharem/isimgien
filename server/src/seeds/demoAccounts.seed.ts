import { User } from "../models/user.model";
import { Role } from "../shared/enums/roles";

interface DemoUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  studentId?: string;
}

const DEMO_USERS: DemoUser[] = [
  {
    firstName: "Super",
    lastName: "Admin",
    email: "admin@isimg.dz",
    password: "SuperAdmin2026!",
    role: Role.SUPER_ADMIN,
  },
  {
    firstName: "Ahmed",
    lastName: "Benali",
    email: "ahmed@student.isimg.dz",
    password: "Student2026!",
    role: Role.STUDENT,
    studentId: "STU-2026-001",
  },
  {
    firstName: "Fatima",
    lastName: "Zeroual",
    email: "fatima@student.isimg.dz",
    password: "Student2026!",
    role: Role.STUDENT,
    studentId: "STU-2026-002",
  },
  {
    firstName: "Yacine",
    lastName: "Hadj",
    email: "yacine@leader.isimg.dz",
    password: "Leader2026!",
    role: Role.CLUB_LEADER,
  },
];

export async function seedDemoAccounts(): Promise<void> {
  console.log("[SEED] Checking demo accounts...");

  for (const userData of DEMO_USERS) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) {
      console.log(`[SEED] ${userData.email} already exists, skipping.`);
      continue;
    }

    const doc: Record<string, unknown> = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      isActive: true,
    };
    if (userData.studentId) {
      doc.studentId = userData.studentId;
    }

    const user = await User.create(doc);

    console.log(`[SEED] Created ${user.role}: ${user.email}`);
  }

  console.log("[SEED] Demo accounts ready.");
}
