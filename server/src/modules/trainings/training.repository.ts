import mongoose from "mongoose";
import { Training, ITraining } from "../../models/training.model";
import { Registration, IRegistration } from "../../models/registration.model";
import { Form } from "../../models/form.model";
import { RegistrationStatus, RegistrationTargetType } from "../../shared/enums";

// ─── Training CRUD ───────────────────────────────────────────────────────────

export async function findTrainingById(id: string): Promise<ITraining | null> {
  return Training.findById(id);
}

export async function findTrainingByIdLean(id: string) {
  return Training.findById(id).populate("club", "name slug logo").populate("linkedForm", "title description").lean();
}

export async function createTraining(data: Partial<ITraining>): Promise<ITraining> {
  return Training.create(data);
}

export async function updateTraining(
  id: string,
  data: Partial<ITraining>
): Promise<ITraining | null> {
  return Training.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export async function deleteTraining(id: string): Promise<ITraining | null> {
  return Training.findByIdAndDelete(id);
}

export async function trainingExistsBySlug(
  clubId: string,
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const query: Record<string, unknown> = { club: clubId, slug };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return Training.exists(query).then(Boolean);
}

// ─── Training queries ────────────────────────────────────────────────────────

export async function findTrainingsPaginated(
  filter: Record<string, unknown>,
  sort: Record<string, 1 | -1>,
  skip: number,
  limit: number
) {
  const [trainings, total] = await Promise.all([
    Training.find(filter)
      .populate("club", "name slug logo")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Training.countDocuments(filter),
  ]);
  return { trainings, total };
}

export async function findUpcomingTrainings(
  sort: Record<string, 1 | -1>,
  skip: number,
  limit: number
) {
  const filter = {
    status: { $in: ["published", "registration_open", "registration_closed"] },
    date: { $gte: new Date() },
  };
  return findTrainingsPaginated(filter, sort, skip, limit);
}

export async function findTrainingsByClub(
  clubId: string,
  filter: Record<string, unknown>,
  sort: Record<string, 1 | -1>,
  skip: number,
  limit: number
) {
  const combinedFilter = { ...filter, club: clubId };
  const [trainings, total] = await Promise.all([
    Training.find(combinedFilter)
      .populate("linkedForm", "title description")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Training.countDocuments(combinedFilter),
  ]);
  return { trainings, total };
}

export async function incrementRegisteredCount(id: string): Promise<void> {
  await Training.findByIdAndUpdate(id, { $inc: { registeredCount: 1 } });
}

export async function decrementRegisteredCount(id: string): Promise<void> {
  await Training.findByIdAndUpdate(id, { $inc: { registeredCount: -1 } });
}

// ─── Registration queries ────────────────────────────────────────────────────

export async function findRegistration(
  userId: string,
  trainingId: string
): Promise<IRegistration | null> {
  return Registration.findOne({
    user: userId,
    targetType: RegistrationTargetType.TRAINING,
    target: trainingId,
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
  trainingId: string,
  status: RegistrationStatus | undefined,
  skip: number,
  limit: number
) {
  const filter: Record<string, unknown> = {
    targetType: RegistrationTargetType.TRAINING,
    target: trainingId,
  };
  if (status) {
    filter.status = status;
  }

  const [registrations, total] = await Promise.all([
    Registration.find(filter)
      .populate("user", "firstName lastName email studentId avatar")
      .populate("formResponse")
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
    targetType: RegistrationTargetType.TRAINING,
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
