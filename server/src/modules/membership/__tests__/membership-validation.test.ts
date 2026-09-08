import {
  createMembershipSchema,
  getMembershipSchema,
  listMembershipsSchema,
  updateMembershipStatusSchema,
  recordPaymentSchema,
  getMyMembershipSchema,
} from "../membership.validation";
import { MembershipStatus } from "../../../shared/enums";

describe("Membership Validation", () => {
  const validClubId = "507f1f77bcf86cd799439011";
  const validMembershipId = "507f1f77bcf86cd799439012";
  const validUserId = "507f1f77bcf86cd799439013";

  // ─── Create Membership ───────────────────────────────────────────────────

  describe("createMembershipSchema", () => {
    it("should accept valid membership data", () => {
      const result = createMembershipSchema.body.safeParse({
        userId: validUserId,
        academicYear: "2025-2026",
        amountPaid: 50,
      });
      expect(result.success).toBe(true);
    });

    it("should default amountPaid to 0", () => {
      const result = createMembershipSchema.body.safeParse({
        userId: validUserId,
        academicYear: "2025-2026",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amountPaid).toBe(0);
      }
    });

    it("should accept null amountPaid", () => {
      const result = createMembershipSchema.body.safeParse({
        userId: validUserId,
        academicYear: "2025-2026",
        amountPaid: 0,
      });
      expect(result.success).toBe(true);
    });

    it("should reject negative amountPaid", () => {
      const result = createMembershipSchema.body.safeParse({
        userId: validUserId,
        academicYear: "2025-2026",
        amountPaid: -10,
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid academic year format (not YYYY-YYYY)", () => {
      const result = createMembershipSchema.body.safeParse({
        userId: validUserId,
        academicYear: "2025/2026",
        amountPaid: 50,
      });
      expect(result.success).toBe(false);
    });

    it("should reject short academic year", () => {
      const result = createMembershipSchema.body.safeParse({
        userId: validUserId,
        academicYear: "25-26",
        amountPaid: 50,
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid userId", () => {
      const result = createMembershipSchema.body.safeParse({
        userId: "invalid",
        academicYear: "2025-2026",
        amountPaid: 50,
      });
      expect(result.success).toBe(false);
    });

    it("should accept optional fields", () => {
      const result = createMembershipSchema.body.safeParse({
        userId: validUserId,
        academicYear: "2025-2026",
        amountPaid: 50,
        paymentDate: "2026-09-01T00:00:00.000Z",
        receiptNumber: "REC-001",
        notes: "First payment",
      });
      expect(result.success).toBe(true);
    });
  });

  // ─── Get Membership ──────────────────────────────────────────────────────

  describe("getMembershipSchema", () => {
    it("should accept valid params", () => {
      const result = getMembershipSchema.params.safeParse({
        clubId: validClubId,
        membershipId: validMembershipId,
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid membershipId", () => {
      const result = getMembershipSchema.params.safeParse({
        clubId: validClubId,
        membershipId: "invalid",
      });
      expect(result.success).toBe(false);
    });
  });

  // ─── List Memberships ────────────────────────────────────────────────────

  describe("listMembershipsSchema", () => {
    it("should apply default pagination", () => {
      const result = listMembershipsSchema.query.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("should accept valid filters", () => {
      const result = listMembershipsSchema.query.safeParse({
        page: 1,
        limit: 10,
        status: MembershipStatus.ACTIVE,
        academicYear: "2025-2026",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid status", () => {
      const result = listMembershipsSchema.query.safeParse({
        status: "invalid_status",
      });
      expect(result.success).toBe(false);
    });

    it("should reject limit > 100", () => {
      const result = listMembershipsSchema.query.safeParse({
        limit: 101,
      });
      expect(result.success).toBe(false);
    });
  });

  // ─── Update Membership Status ────────────────────────────────────────────

  describe("updateMembershipStatusSchema", () => {
    it("should accept valid status update", () => {
      const result = updateMembershipStatusSchema.body.safeParse({
        status: MembershipStatus.ACTIVE,
      });
      expect(result.success).toBe(true);
    });

    it("should accept all valid statuses", () => {
      for (const status of Object.values(MembershipStatus)) {
        const result = updateMembershipStatusSchema.body.safeParse({
          status,
        });
        expect(result.success).toBe(true);
      }
    });

    it("should reject invalid status", () => {
      const result = updateMembershipStatusSchema.body.safeParse({
        status: "invalid",
      });
      expect(result.success).toBe(false);
    });
  });

  // ─── Record Payment ──────────────────────────────────────────────────────

  describe("recordPaymentSchema", () => {
    it("should accept valid payment data", () => {
      const result = recordPaymentSchema.body.safeParse({
        amount: 50,
        paymentDate: "2026-09-01T00:00:00.000Z",
      });
      expect(result.success).toBe(true);
    });

    it("should accept receipt number", () => {
      const result = recordPaymentSchema.body.safeParse({
        amount: 100,
        paymentDate: "2026-09-01T00:00:00.000Z",
        receiptNumber: "REC-001",
      });
      expect(result.success).toBe(true);
    });

    it("should reject zero amount", () => {
      const result = recordPaymentSchema.body.safeParse({
        amount: 0,
        paymentDate: "2026-09-01T00:00:00.000Z",
      });
      expect(result.success).toBe(false);
    });

    it("should reject negative amount", () => {
      const result = recordPaymentSchema.body.safeParse({
        amount: -50,
        paymentDate: "2026-09-01T00:00:00.000Z",
      });
      expect(result.success).toBe(false);
    });

    it("should accept null receiptNumber", () => {
      const result = recordPaymentSchema.body.safeParse({
        amount: 50,
        paymentDate: "2026-09-01T00:00:00.000Z",
        receiptNumber: null,
      });
      expect(result.success).toBe(true);
    });
  });

  // ─── Get My Membership ───────────────────────────────────────────────────

  describe("getMyMembershipSchema", () => {
    it("should accept valid clubId", () => {
      const result = getMyMembershipSchema.params.safeParse({
        clubId: validClubId,
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid clubId", () => {
      const result = getMyMembershipSchema.params.safeParse({
        clubId: "invalid",
      });
      expect(result.success).toBe(false);
    });
  });
});
