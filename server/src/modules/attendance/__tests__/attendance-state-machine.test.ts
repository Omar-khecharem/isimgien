import { AttendanceStatus } from "../../../shared/enums";
import {
  isValidTransition,
  validateAttendanceTransition,
} from "../attendance.service";

describe("Attendance State Machine", () => {
  describe("isValidTransition", () => {
    it("should allow NOT_ATTENDED -> CHECKED_IN", () => {
      expect(
        isValidTransition(AttendanceStatus.NOT_ATTENDED, AttendanceStatus.CHECKED_IN)
      ).toBe(true);
    });

    it("should allow NOT_ATTENDED -> ABSENT", () => {
      expect(
        isValidTransition(AttendanceStatus.NOT_ATTENDED, AttendanceStatus.ABSENT)
      ).toBe(true);
    });

    it("should allow CHECKED_IN -> CHECKED_OUT", () => {
      expect(
        isValidTransition(AttendanceStatus.CHECKED_IN, AttendanceStatus.CHECKED_OUT)
      ).toBe(true);
    });

    it("should allow CHECKED_IN -> INCOMPLETE", () => {
      expect(
        isValidTransition(AttendanceStatus.CHECKED_IN, AttendanceStatus.INCOMPLETE)
      ).toBe(true);
    });

    it("should NOT allow CHECKED_OUT -> any state", () => {
      expect(
        isValidTransition(AttendanceStatus.CHECKED_OUT, AttendanceStatus.CHECKED_IN)
      ).toBe(false);
      expect(
        isValidTransition(AttendanceStatus.CHECKED_OUT, AttendanceStatus.ABSENT)
      ).toBe(false);
      expect(
        isValidTransition(AttendanceStatus.CHECKED_OUT, AttendanceStatus.NOT_ATTENDED)
      ).toBe(false);
    });

    it("should NOT allow ABSENT -> any state", () => {
      expect(
        isValidTransition(AttendanceStatus.ABSENT, AttendanceStatus.CHECKED_IN)
      ).toBe(false);
      expect(
        isValidTransition(AttendanceStatus.ABSENT, AttendanceStatus.CHECKED_OUT)
      ).toBe(false);
      expect(
        isValidTransition(AttendanceStatus.ABSENT, AttendanceStatus.NOT_ATTENDED)
      ).toBe(false);
    });

    it("should NOT allow INCOMPLETE -> any state", () => {
      expect(
        isValidTransition(AttendanceStatus.INCOMPLETE, AttendanceStatus.CHECKED_IN)
      ).toBe(false);
      expect(
        isValidTransition(AttendanceStatus.INCOMPLETE, AttendanceStatus.CHECKED_OUT)
      ).toBe(false);
      expect(
        isValidTransition(AttendanceStatus.INCOMPLETE, AttendanceStatus.NOT_ATTENDED)
      ).toBe(false);
    });

    it("should NOT allow CHECKED_IN -> NOT_ATTENDED (no backwards)", () => {
      expect(
        isValidTransition(AttendanceStatus.CHECKED_IN, AttendanceStatus.NOT_ATTENDED)
      ).toBe(false);
    });

    it("should NOT allow CHECKED_IN -> ABSENT", () => {
      expect(
        isValidTransition(AttendanceStatus.CHECKED_IN, AttendanceStatus.ABSENT)
      ).toBe(false);
    });

    it("should NOT allow NOT_ATTENDED -> CHECKED_OUT (skip check-in)", () => {
      expect(
        isValidTransition(AttendanceStatus.NOT_ATTENDED, AttendanceStatus.CHECKED_OUT)
      ).toBe(false);
    });

    it("should NOT allow NOT_ATTENDED -> INCOMPLETE", () => {
      expect(
        isValidTransition(AttendanceStatus.NOT_ATTENDED, AttendanceStatus.INCOMPLETE)
      ).toBe(false);
    });
  });

  describe("validateAttendanceTransition", () => {
    it("should not throw for valid transitions", () => {
      expect(() =>
        validateAttendanceTransition(
          AttendanceStatus.NOT_ATTENDED,
          AttendanceStatus.CHECKED_IN
        )
      ).not.toThrow();
    });

    it("should throw for invalid transitions", () => {
      expect(() =>
        validateAttendanceTransition(
          AttendanceStatus.CHECKED_OUT,
          AttendanceStatus.CHECKED_IN
        )
      ).toThrow("Cannot transition attendance");
    });

    it("should throw for terminal state transitions", () => {
      expect(() =>
        validateAttendanceTransition(
          AttendanceStatus.ABSENT,
          AttendanceStatus.CHECKED_IN
        )
      ).toThrow("Cannot transition attendance");
    });

    it("should throw for CHECKED_IN -> ABSENT", () => {
      expect(() =>
        validateAttendanceTransition(
          AttendanceStatus.CHECKED_IN,
          AttendanceStatus.ABSENT
        )
      ).toThrow("Cannot transition attendance");
    });
  });

  describe("Complete workflow", () => {
    it("should follow: NOT_ATTENDED -> CHECKED_IN -> CHECKED_OUT", () => {
      let status = AttendanceStatus.NOT_ATTENDED;

      // Step 1: Check in
      expect(isValidTransition(status, AttendanceStatus.CHECKED_IN)).toBe(true);
      status = AttendanceStatus.CHECKED_IN;

      // Step 2: Check out
      expect(isValidTransition(status, AttendanceStatus.CHECKED_OUT)).toBe(true);
      status = AttendanceStatus.CHECKED_OUT;

      // Final state should be terminal
      expect(isValidTransition(status, AttendanceStatus.NOT_ATTENDED)).toBe(false);
      expect(status).toBe(AttendanceStatus.CHECKED_OUT);
    });

    it("should follow: NOT_ATTENDED -> ABSENT (no-show)", () => {
      let status = AttendanceStatus.NOT_ATTENDED;

      // Mark absent
      expect(isValidTransition(status, AttendanceStatus.ABSENT)).toBe(true);
      status = AttendanceStatus.ABSENT;

      // Terminal state
      expect(isValidTransition(status, AttendanceStatus.CHECKED_IN)).toBe(false);
    });

    it("should follow: NOT_ATTENDED -> CHECKED_IN -> INCOMPLETE (early leave)", () => {
      let status = AttendanceStatus.NOT_ATTENDED;

      // Check in
      expect(isValidTransition(status, AttendanceStatus.CHECKED_IN)).toBe(true);
      status = AttendanceStatus.CHECKED_IN;

      // Mark incomplete (no check-out)
      expect(isValidTransition(status, AttendanceStatus.INCOMPLETE)).toBe(true);
      status = AttendanceStatus.INCOMPLETE;

      // Terminal state
      expect(isValidTransition(status, AttendanceStatus.CHECKED_OUT)).toBe(false);
    });
  });
});
