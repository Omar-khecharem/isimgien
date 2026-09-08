import { Request, Response } from "express";
import * as eventService from "./event.service";
import { ApiResponse } from "../../shared/utils/apiResponse";
import { asyncHandler } from "../../shared/utils/asyncHandler";

// ─── Club Leader: Event CRUD ─────────────────────────────────────────────────

export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await eventService.createEvent(
    req.params.clubId,
    req.body,
    req.user!.id
  );
  ApiResponse.created(res, event, "Event created successfully");
});

export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await eventService.updateEvent(
    req.params.clubId,
    req.params.id,
    req.body
  );
  ApiResponse.success(res, event, 200, "Event updated successfully");
});

export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  await eventService.deleteEvent(req.params.clubId, req.params.id);
  ApiResponse.success(res, null, 200, "Event deleted successfully");
});

export const transitionStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const event = await eventService.transitionStatus(
      req.params.clubId,
      req.params.id,
      req.body
    );
    ApiResponse.success(res, event, 200, "Event status updated");
  }
);

// ─── Club Leader: Get event details ──────────────────────────────────────────

export const getEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await eventService.getEventById(
    req.params.clubId,
    req.params.id
  );
  ApiResponse.success(res, event);
});

export const listClubEvents = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await eventService.listClubEvents(
      req.params.clubId,
      req.query as any
    );
    ApiResponse.paginated(res, result.events, result.meta);
  }
);

// ─── Club Leader: Registration management ────────────────────────────────────

export const getEventRegistrations = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await eventService.getEventRegistrations(
      req.params.clubId,
      req.params.id,
      req.query as any
    );
    ApiResponse.paginated(res, result.registrations, result.meta);
  }
);

// ─── Student: Browse & Register ──────────────────────────────────────────────

export const listPublicEvents = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await eventService.listPublicEvents(req.query as any);
    ApiResponse.paginated(res, result.events, result.meta);
  }
);

export const getPublicEvent = asyncHandler(
  async (req: Request, res: Response) => {
    const event = await eventService.getPublicEventById(req.params.id);
    ApiResponse.success(res, event);
  }
);

export const registerForEvent = asyncHandler(
  async (req: Request, res: Response) => {
    const registration = await eventService.registerForEvent(
      req.user!.id,
      req.params.id
    );
    ApiResponse.created(res, registration, "Registration submitted");
  }
);

export const cancelRegistration = asyncHandler(
  async (req: Request, res: Response) => {
    const registration = await eventService.cancelRegistration(
      req.user!.id,
      req.params.id
    );
    ApiResponse.success(res, registration, 200, "Registration cancelled");
  }
);

export const getMyRegistrations = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 20 } = req.query;
    const result = await eventService.getUserRegistrations(
      req.user!.id,
      Number(page),
      Number(limit)
    );
    ApiResponse.paginated(res, result.registrations, result.meta);
  }
);
