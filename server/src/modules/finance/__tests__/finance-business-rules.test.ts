import mongoose from "mongoose";
import { MembershipStatus } from "../../../shared/enums";

// ─── Balance Calculation Tests ───────────────────────────────────────────────

describe("Finance Business Rules", () => {
  describe("Balance calculation logic", () => {
    function calculateBalance(
      transactions: Array<{ type: string; amount: number }>
    ) {
      let totalIncome = 0;
      let totalExpenses = 0;

      for (const t of transactions) {
        if (t.type === "income") {
          totalIncome += t.amount;
        } else if (t.type === "expense") {
          totalExpenses += t.amount;
        }
      }

      return {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        transactionCount: transactions.length,
      };
    }

    it("should calculate balance with mixed transactions", () => {
      const transactions = [
        { type: "income", amount: 500 },
        { type: "income", amount: 300 },
        { type: "expense", amount: 200 },
        { type: "expense", amount: 100 },
      ];
      const result = calculateBalance(transactions);
      expect(result.totalIncome).toBe(800);
      expect(result.totalExpenses).toBe(300);
      expect(result.balance).toBe(500);
      expect(result.transactionCount).toBe(4);
    });

    it("should handle empty transactions", () => {
      const result = calculateBalance([]);
      expect(result.totalIncome).toBe(0);
      expect(result.totalExpenses).toBe(0);
      expect(result.balance).toBe(0);
      expect(result.transactionCount).toBe(0);
    });

    it("should handle only income", () => {
      const transactions = [
        { type: "income", amount: 100 },
        { type: "income", amount: 200 },
      ];
      const result = calculateBalance(transactions);
      expect(result.balance).toBe(300);
    });

    it("should handle only expenses (negative balance)", () => {
      const transactions = [
        { type: "expense", amount: 100 },
        { type: "expense", amount: 200 },
      ];
      const result = calculateBalance(transactions);
      expect(result.balance).toBe(-300);
    });
  });

  describe("Category breakdown", () => {
    function calculateCategoryBreakdown(
      transactions: Array<{
        type: string;
        category: string;
        amount: number;
      }>
    ) {
      const breakdown = new Map<string, { total: number; count: number }>();

      for (const t of transactions) {
        const key = `${t.type}:${t.category}`;
        const existing = breakdown.get(key) ?? { total: 0, count: 0 };
        breakdown.set(key, {
          total: existing.total + t.amount,
          count: existing.count + 1,
        });
      }

      return Array.from(breakdown.entries()).map(([key, value]) => ({
        type: key.split(":")[0],
        category: key.split(":")[1],
        ...value,
      }));
    }

    it("should group by category", () => {
      const transactions = [
        { type: "income", category: "membership_fee", amount: 50 },
        { type: "income", category: "membership_fee", amount: 50 },
        { type: "income", category: "event_revenue", amount: 200 },
        { type: "expense", category: "equipment", amount: 100 },
      ];
      const breakdown = calculateCategoryBreakdown(transactions);
      expect(breakdown).toHaveLength(3);

      const membershipFee = breakdown.find(
        (b) => b.category === "membership_fee"
      );
      expect(membershipFee?.total).toBe(100);
      expect(membershipFee?.count).toBe(2);

      const equipment = breakdown.find((b) => b.category === "equipment");
      expect(equipment?.total).toBe(100);
      expect(equipment?.count).toBe(1);
    });
  });

  describe("Filter by date range", () => {
    it("should filter transactions by date range", () => {
      const transactions = [
        { date: new Date("2026-01-15"), amount: 100 },
        { date: new Date("2026-06-15"), amount: 200 },
        { date: new Date("2026-12-15"), amount: 300 },
      ];
      const dateFrom = new Date("2026-03-01");
      const dateTo = new Date("2026-09-30");

      const filtered = transactions.filter(
        (t) => t.date >= dateFrom && t.date <= dateTo
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].amount).toBe(200);
    });
  });
});

// ─── Membership Business Rules ───────────────────────────────────────────────

describe("Membership Business Rules", () => {
  describe("Academic year calculation", () => {
    function getCurrentAcademicYear(date: Date): string {
      const year = date.getFullYear();
      const month = date.getMonth(); // 0-indexed
      if (month >= 8) {
        return `${year}-${year + 1}`;
      }
      return `${year - 1}-${year}`;
    }

    it("should return current year range for September", () => {
      const result = getCurrentAcademicYear(new Date("2026-09-01"));
      expect(result).toBe("2026-2027");
    });

    it("should return previous year range for August", () => {
      const result = getCurrentAcademicYear(new Date("2026-08-31"));
      expect(result).toBe("2025-2026");
    });

    it("should return previous year range for January", () => {
      const result = getCurrentAcademicYear(new Date("2026-01-15"));
      expect(result).toBe("2025-2026");
    });

    it("should return current year range for December", () => {
      const result = getCurrentAcademicYear(new Date("2026-12-01"));
      expect(result).toBe("2026-2027");
    });
  });

  describe("Auto-activation on payment", () => {
    it("should activate membership when fully paid", () => {
      const membershipFee = 100;
      const currentPaid = 60;
      const newPayment = 50;
      const totalPaid = currentPaid + newPayment;

      const shouldActivate = totalPaid >= membershipFee;
      expect(shouldActivate).toBe(true);
    });

    it("should not activate when still underpaid", () => {
      const membershipFee = 100;
      const currentPaid = 30;
      const newPayment = 20;
      const totalPaid = currentPaid + newPayment;

      const shouldActivate = totalPaid >= membershipFee;
      expect(shouldActivate).toBe(false);
    });

    it("should activate on exact payment", () => {
      const membershipFee = 100;
      const currentPaid = 50;
      const newPayment = 50;
      const totalPaid = currentPaid + newPayment;

      const shouldActivate = totalPaid >= membershipFee;
      expect(shouldActivate).toBe(true);
    });
  });

  describe("Duplicate prevention", () => {
    const existingMemberships = [
      { club: "club1", user: "user1", academicYear: "2025-2026" },
      { club: "club1", user: "user1", academicYear: "2026-2027" },
    ];

    it("should detect duplicate for same club/user/year", () => {
      const newMembership = {
        club: "club1",
        user: "user1",
        academicYear: "2025-2026",
      };
      const isDuplicate = existingMemberships.some(
        (m) =>
          m.club === newMembership.club &&
          m.user === newMembership.user &&
          m.academicYear === newMembership.academicYear
      );
      expect(isDuplicate).toBe(true);
    });

    it("should allow different year for same club/user", () => {
      const newMembership = {
        club: "club1",
        user: "user1",
        academicYear: "2027-2028",
      };
      const isDuplicate = existingMemberships.some(
        (m) =>
          m.club === newMembership.club &&
          m.user === newMembership.user &&
          m.academicYear === newMembership.academicYear
      );
      expect(isDuplicate).toBe(false);
    });

    it("should allow same year for different club", () => {
      const newMembership = {
        club: "club2",
        user: "user1",
        academicYear: "2025-2026",
      };
      const isDuplicate = existingMemberships.some(
        (m) =>
          m.club === newMembership.club &&
          m.user === newMembership.user &&
          m.academicYear === newMembership.academicYear
      );
      expect(isDuplicate).toBe(false);
    });
  });

  describe("Status transitions", () => {
    const VALID_STATUSES = [
      MembershipStatus.ACTIVE,
      MembershipStatus.EXPIRED,
      MembershipStatus.PENDING_PAYMENT,
    ];

    it("should allow all valid status values", () => {
      for (const status of VALID_STATUSES) {
        expect(VALID_STATUSES).toContain(status);
      }
    });

    it("should have exactly 3 status values", () => {
      expect(VALID_STATUSES).toHaveLength(3);
    });
  });
});
