import { Request, Response, NextFunction } from "express";
import { Role } from "../../../shared/enums/roles";
import {
  requireStudentOrAbove,
  requireClubLeaderOrSuperAdmin,
  requireSuperAdmin,
} from "../attendance.policies";

function createMockRequest(user?: { id: string; email: string; role: Role }) {
  return {
    user,
    params: {},
    body: {},
    query: {},
  } as Request;
}

function createMockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
}

function createMockNext() {
  return jest.fn() as NextFunction;
}

describe("Attendance Policies (Authorization)", () => {
  describe("requireStudentOrAbove", () => {
    it("should allow any authenticated user", () => {
      const req = createMockRequest({
        id: "user1",
        email: "test@test.com",
        role: Role.STUDENT,
      });
      const res = createMockResponse();
      const next = createMockNext();

      requireStudentOrAbove(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it("should allow CLUB_LEADER", () => {
      const req = createMockRequest({
        id: "user1",
        email: "leader@test.com",
        role: Role.CLUB_LEADER,
      });
      const res = createMockResponse();
      const next = createMockNext();

      requireStudentOrAbove(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it("should allow SUPER_ADMIN", () => {
      const req = createMockRequest({
        id: "user1",
        email: "admin@test.com",
        role: Role.SUPER_ADMIN,
      });
      const res = createMockResponse();
      const next = createMockNext();

      requireStudentOrAbove(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it("should reject unauthenticated user", () => {
      const req = createMockRequest(undefined);
      const res = createMockResponse();
      const next = createMockNext();

      requireStudentOrAbove(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Authentication required" })
      );
    });
  });

  describe("requireSuperAdmin", () => {
    it("should allow SUPER_ADMIN", () => {
      const req = createMockRequest({
        id: "user1",
        email: "admin@test.com",
        role: Role.SUPER_ADMIN,
      });
      const res = createMockResponse();
      const next = createMockNext();

      requireSuperAdmin(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it("should reject CLUB_LEADER", () => {
      const req = createMockRequest({
        id: "user1",
        email: "leader@test.com",
        role: Role.CLUB_LEADER,
      });
      const res = createMockResponse();
      const next = createMockNext();

      requireSuperAdmin(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Super Admin access required" })
      );
    });

    it("should reject STUDENT", () => {
      const req = createMockRequest({
        id: "user1",
        email: "student@test.com",
        role: Role.STUDENT,
      });
      const res = createMockResponse();
      const next = createMockNext();

      requireSuperAdmin(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Super Admin access required" })
      );
    });

    it("should reject unauthenticated user", () => {
      const req = createMockRequest(undefined);
      const res = createMockResponse();
      const next = createMockNext();

      requireSuperAdmin(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Authentication required" })
      );
    });
  });

  describe("requireClubLeaderOrSuperAdmin", () => {
    it("should allow SUPER_ADMIN without club ownership check", () => {
      const req = createMockRequest({
        id: "user1",
        email: "admin@test.com",
        role: Role.SUPER_ADMIN,
      });
      req.params = { clubId: "club123" };
      const res = createMockResponse();
      const next = createMockNext();

      requireClubLeaderOrSuperAdmin(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it("should reject STUDENT", () => {
      const req = createMockRequest({
        id: "user1",
        email: "student@test.com",
        role: Role.STUDENT,
      });
      req.params = { clubId: "club123" };
      const res = createMockResponse();
      const next = createMockNext();

      requireClubLeaderOrSuperAdmin(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Club Leader access required" })
      );
    });

    it("should reject unauthenticated user", () => {
      const req = createMockRequest(undefined);
      req.params = { clubId: "club123" };
      const res = createMockResponse();
      const next = createMockNext();

      requireClubLeaderOrSuperAdmin(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Authentication required" })
      );
    });

    it("should reject CLUB_LEADER without clubId param", () => {
      const req = createMockRequest({
        id: "user1",
        email: "leader@test.com",
        role: Role.CLUB_LEADER,
      });
      req.params = {};
      const res = createMockResponse();
      const next = createMockNext();

      requireClubLeaderOrSuperAdmin(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Club identifier is required" })
      );
    });
  });
});
