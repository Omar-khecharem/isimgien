import mongoose from "mongoose";
import * as eventRepo from "./event.repository";
import { ApiError } from "../../shared/utils/ApiError";
import { EventStatus, RegistrationStatus, RegistrationTargetType } from "../../shared/enums";
import type {
  CreateEventInput,
  UpdateEventInput,
  TransitionEventStatusInput,
  ListClubEventsQuery,
  ListPublicEventsQuery,
} from "./event.validation";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildSort(sort?: string): Record<string, 1 | -1> {
  if (!sort) return { createdAt: -1 };
  if (sort.startsWith("-")) {
    return { [sort.slice(1)]: -1 };
  }
  return { [sort]: 1 };
}

/**
 * Valid state transitions for Event.
 * Source → allowed targets.
 */
const VALID_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  [EventStatus.DRAFT]: [EventStatus.PUBLISHED, EventStatus.CANCELLED],
  [EventStatus.PUBLISHED]: [
    EventStatus.REGISTRATION_OPEN,
    EventStatus.IN_PROGRESS,
    EventStatus.CANCELLED,
  ],
  [EventStatus.REGISTRATION_OPEN]: [
    EventStatus.REGISTRATION_CLOSED,
    EventStatus.CANCELLED,
  ],
  [EventStatus.REGISTRATION_CLOSED]: [
    EventStatus.IN_PROGRESS,
    EventStatus.CANCELLED,
  ],
  [EventStatus.IN_PROGRESS]: [EventStatus.COMPLETED, EventStatus.CANCELLED],
  [EventStatus.COMPLETED]: [],
  [EventStatus.CANCELLED]: [],
};

function validateTransition(current: EventStatus, target: EventStatus) {
  const allowed = VALID_TRANSITIONS[current];
  if (!allowed.includes(target)) {
    throw ApiError.badRequest(
      `Cannot transition event from "${current}" to "${target}"`
    );
  }
}

// ─── CRUD Operations ─────────────────────────────────────────────────────────

export async function createEvent(
  clubId: string,
  input: CreateEventInput,
  creatorId: string
) {
  const slug = input.slug || slugify(input.title);

  const slugExists = await eventRepo.eventExistsBySlug(clubId, slug);
  if (slugExists) {
    throw ApiError.conflict("An event with this slug already exists in this club");
  }

  const event = await eventRepo.createEvent({
    club: new mongoose.Types.ObjectId(clubId),
    title: input.title,
    slug,
    description: input.description,
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    location: input.location,
    capacity: input.capacity ?? null,
    isPublic: input.isPublic ?? true,
    createdBy: new mongoose.Types.ObjectId(creatorId),
    status: EventStatus.DRAFT,
    registeredCount: 0,
  });

  return event.toJSON();
}

export async function updateEvent(
  clubId: string,
  eventId: string,
  input: UpdateEventInput
) {
  const event = await eventRepo.findEventById(eventId);
  if (!event) {
    throw ApiError.notFound("Event not found");
  }
  if (event.club.toString() !== clubId) {
    throw ApiError.forbidden("Event does not belong to this club");
  }

  if (event.status !== EventStatus.DRAFT) {
    throw ApiError.badRequest("Only draft events can be updated");
  }

  if (input.slug && input.slug !== event.slug) {
    const slugExists = await eventRepo.eventExistsBySlug(
      clubId,
      input.slug,
      eventId
    );
    if (slugExists) {
      throw ApiError.conflict("An event with this slug already exists in this club");
    }
  }

  const updated = await eventRepo.updateEvent(eventId, input as any);
  return updated!.toJSON();
}

export async function deleteEvent(clubId: string, eventId: string) {
  const event = await eventRepo.findEventById(eventId);
  if (!event) {
    throw ApiError.notFound("Event not found");
  }
  if (event.club.toString() !== clubId) {
    throw ApiError.forbidden("Event does not belong to this club");
  }
  if (event.status === EventStatus.IN_PROGRESS) {
    throw ApiError.badRequest("Cannot delete an event that is in progress");
  }
  if (event.status === EventStatus.COMPLETED) {
    throw ApiError.badRequest("Cannot delete a completed event");
  }

  await eventRepo.deleteEvent(eventId);
}

// ─── State Machine ───────────────────────────────────────────────────────────

export async function transitionStatus(
  clubId: string,
  eventId: string,
  input: TransitionEventStatusInput
) {
  const event = await eventRepo.findEventById(eventId);
  if (!event) {
    throw ApiError.notFound("Event not found");
  }
  if (event.club.toString() !== clubId) {
    throw ApiError.forbidden("Event does not belong to this club");
  }

  validateTransition(event.status, input.status);

  const updated = await eventRepo.updateEvent(eventId, {
    status: input.status,
  } as any);

  return updated!.toJSON();
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getEventById(clubId: string, eventId: string) {
  const event = await eventRepo.findEventByIdLean(eventId);
  if (!event) {
    throw ApiError.notFound("Event not found");
  }
  if ((event.club as any)._id?.toString() !== clubId) {
    throw ApiError.forbidden("Event does not belong to this club");
  }
  return event;
}

export async function listClubEvents(clubId: string, query: ListClubEventsQuery) {
  const { page, limit, search, sort, status, dateFrom, dateTo } = query;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { club: clubId };
  if (status) {
    filter.status = status;
  }
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) (filter.date as Record<string, Date>).$gte = dateFrom;
    if (dateTo) (filter.date as Record<string, Date>).$lte = dateTo;
  }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const sortObj = buildSort(sort);
  const { events, total } = await eventRepo.findEventsByClub(
    clubId,
    filter,
    sortObj,
    skip,
    limit
  );

  return {
    events,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function listPublicEvents(query: ListPublicEventsQuery) {
  const { page, limit, sort, clubId, status, dateFrom, dateTo } = query;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (clubId) {
    filter.club = clubId;
  }
  if (status) {
    filter.status = status;
  } else {
    filter.status = {
      $in: [
        EventStatus.PUBLISHED,
        EventStatus.REGISTRATION_OPEN,
        EventStatus.REGISTRATION_CLOSED,
      ],
    };
  }
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) (filter.date as Record<string, Date>).$gte = dateFrom;
    if (dateTo) (filter.date as Record<string, Date>).$lte = dateTo;
  }

  const sortObj = buildSort(sort || "-date");
  const { events, total } = await eventRepo.findEventsPaginated(
    filter,
    sortObj,
    skip,
    limit
  );

  return {
    events,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getPublicEventById(eventId: string) {
  const event = await eventRepo.findEventByIdLean(eventId);
  if (!event) {
    throw ApiError.notFound("Event not found");
  }
  return event;
}

// ─── Registration ────────────────────────────────────────────────────────────

export async function registerForEvent(userId: string, eventId: string) {
  const event = await eventRepo.findEventById(eventId);
  if (!event) {
    throw ApiError.notFound("Event not found");
  }

  const openStatuses = [EventStatus.PUBLISHED, EventStatus.REGISTRATION_OPEN];
  if (!openStatuses.includes(event.status)) {
    throw ApiError.badRequest("Registration is not open for this event");
  }

  if (event.capacity !== null && event.registeredCount >= event.capacity) {
    throw ApiError.conflict("This event is at full capacity");
  }

  const existing = await eventRepo.findRegistration(userId, eventId);
  if (existing) {
    if (existing.status === RegistrationStatus.CANCELLED) {
      const updated = await eventRepo.updateRegistration(
        existing._id.toString(),
        { status: RegistrationStatus.PENDING }
      );
      await eventRepo.incrementRegisteredCount(eventId);
      return updated!.toJSON();
    }
    throw ApiError.conflict("You are already registered for this event");
  }

  await eventRepo.withTransaction(async () => {
    await eventRepo.createRegistration({
      user: new mongoose.Types.ObjectId(userId),
      targetType: RegistrationTargetType.EVENT,
      target: new mongoose.Types.ObjectId(eventId),
      status: RegistrationStatus.APPROVED,
    } as any);

    await eventRepo.incrementRegisteredCount(eventId);
  });

  const registration = await eventRepo.findRegistration(userId, eventId);
  return registration!.toJSON();
}

export async function cancelRegistration(userId: string, eventId: string) {
  const registration = await eventRepo.findRegistration(userId, eventId);
  if (!registration) {
    throw ApiError.notFound("Registration not found");
  }
  if (
    registration.status === RegistrationStatus.CANCELLED ||
    registration.status === RegistrationStatus.REJECTED
  ) {
    throw ApiError.badRequest("Registration is already cancelled or rejected");
  }

  await eventRepo.withTransaction(async () => {
    await eventRepo.updateRegistration(registration._id.toString(), {
      status: RegistrationStatus.CANCELLED,
    } as any);
    await eventRepo.decrementRegisteredCount(eventId);
  });

  const updated = await eventRepo.findRegistration(userId, eventId);
  return updated!.toJSON();
}

export async function getEventRegistrations(
  clubId: string,
  eventId: string,
  query: { page: number; limit: number; status?: string }
) {
  const event = await eventRepo.findEventById(eventId);
  if (!event) {
    throw ApiError.notFound("Event not found");
  }
  if (event.club.toString() !== clubId) {
    throw ApiError.forbidden("Event does not belong to this club");
  }

  const { page, limit, status } = query;
  const skip = (page - 1) * limit;

  const { registrations, total } = await eventRepo.findRegistrationsPaginated(
    eventId,
    status as RegistrationStatus | undefined,
    skip,
    limit
  );

  return {
    registrations,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getUserRegistrations(userId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;
  const { registrations, total } = await eventRepo.findUserRegistrations(
    userId,
    skip,
    limit
  );
  return {
    registrations,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
