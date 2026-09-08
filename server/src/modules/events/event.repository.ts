import mongoose from "mongoose";
import { Event, IEvent } from "../../models/event.model";
import { Registration, IRegistration } from "../../models/registration.model";
import { RegistrationStatus, RegistrationTargetType } from "../../shared/enums";

// ─── Event CRUD ──────────────────────────────────────────────────────────────

export async function findEventById(id: string): Promise<IEvent | null> {
  return Event.findById(id);
}

export async function findEventByIdLean(id: string) {
  return Event.findById(id).populate("club", "name slug logo").lean();
}

export async function createEvent(data: Partial<IEvent>): Promise<IEvent> {
  return Event.create(data);
}

export async function updateEvent(
  id: string,
  data: Partial<IEvent>
): Promise<IEvent | null> {
  return Event.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export async function deleteEvent(id: string): Promise<IEvent | null> {
  return Event.findByIdAndDelete(id);
}

export async function eventExistsBySlug(
  clubId: string,
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const query: Record<string, unknown> = { club: clubId, slug };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return Event.exists(query).then(Boolean);
}

// ─── Event queries ───────────────────────────────────────────────────────────

export async function findEventsPaginated(
  filter: Record<string, unknown>,
  sort: Record<string, 1 | -1>,
  skip: number,
  limit: number
) {
  const [events, total] = await Promise.all([
    Event.find(filter)
      .populate("club", "name slug logo")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Event.countDocuments(filter),
  ]);
  return { events, total };
}

export async function findEventsByClub(
  clubId: string,
  filter: Record<string, unknown>,
  sort: Record<string, 1 | -1>,
  skip: number,
  limit: number
) {
  const combinedFilter = { ...filter, club: clubId };
  const [events, total] = await Promise.all([
    Event.find(combinedFilter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Event.countDocuments(combinedFilter),
  ]);
  return { events, total };
}

export async function incrementRegisteredCount(id: string): Promise<void> {
  await Event.findByIdAndUpdate(id, { $inc: { registeredCount: 1 } });
}

export async function decrementRegisteredCount(id: string): Promise<void> {
  await Event.findByIdAndUpdate(id, { $inc: { registeredCount: -1 } });
}

// ─── Registration queries ────────────────────────────────────────────────────

export async function findRegistration(
  userId: string,
  eventId: string
): Promise<IRegistration | null> {
  return Registration.findOne({
    user: userId,
    targetType: RegistrationTargetType.EVENT,
    target: eventId,
  });
}

export async function createRegistration(
  data: Partial<IRegistration>
): Promise<IRegistration> {
  return Registration.create(data);
}

export async function updateRegistration(
  id: string,
  data: Partial<IRegistration>
): Promise<IRegistration | null> {
  return Registration.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export async function findRegistrationsPaginated(
  eventId: string,
  status: RegistrationStatus | undefined,
  skip: number,
  limit: number
) {
  const filter: Record<string, unknown> = {
    targetType: RegistrationTargetType.EVENT,
    target: eventId,
  };
  if (status) {
    filter.status = status;
  }

  const [registrations, total] = await Promise.all([
    Registration.find(filter)
      .populate("user", "firstName lastName email studentId avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Registration.countDocuments(filter),
  ]);

  return { registrations, total };
}

export async function findUserRegistrations(
  userId: string,
  skip: number,
  limit: number
) {
  const filter = {
    user: userId,
    targetType: RegistrationTargetType.EVENT,
  };

  const [registrations, total] = await Promise.all([
    Registration.find(filter)
      .populate({
        path: "target",
        populate: { path: "club", select: "name slug logo" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Registration.countDocuments(filter),
  ]);

  return { registrations, total };
}

// ─── Transaction helper ──────────────────────────────────────────────────────

export async function withTransaction<T>(
  fn: (session: mongoose.ClientSession) => Promise<T>
): Promise<T> {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
