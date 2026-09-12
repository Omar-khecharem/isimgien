import mongoose from "mongoose";
import * as trainingRepo from "./training.repository";
import { ApiError } from "../../shared/utils/ApiError";
import { TrainingStatus, RegistrationStatus, RegistrationTargetType } from "../../shared/enums";
import { Form } from "../../models/form.model";
import type {
  CreateTrainingInput,
  UpdateTrainingInput,
  TransitionTrainingStatusInput,
  ListClubTrainingsQuery,
  ListPublicTrainingsQuery,
} from "./training.validation";

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
 * Valid state transitions for Training.
 * Source → allowed targets.
 */
const VALID_TRANSITIONS: Record<TrainingStatus, TrainingStatus[]> = {
  [TrainingStatus.DRAFT]: [TrainingStatus.PUBLISHED, TrainingStatus.REGISTRATION_OPEN, TrainingStatus.CANCELLED],
  [TrainingStatus.PUBLISHED]: [
    TrainingStatus.REGISTRATION_OPEN,
    TrainingStatus.IN_PROGRESS,
    TrainingStatus.CANCELLED,
  ],
  [TrainingStatus.REGISTRATION_OPEN]: [
    TrainingStatus.REGISTRATION_CLOSED,
    TrainingStatus.CANCELLED,
  ],
  [TrainingStatus.REGISTRATION_CLOSED]: [
    TrainingStatus.IN_PROGRESS,
    TrainingStatus.CANCELLED,
  ],
  [TrainingStatus.IN_PROGRESS]: [TrainingStatus.COMPLETED, TrainingStatus.CANCELLED],
  [TrainingStatus.COMPLETED]: [],
  [TrainingStatus.CANCELLED]: [],
};

function validateTransition(current: TrainingStatus, target: TrainingStatus) {
  const allowed = VALID_TRANSITIONS[current];
  if (!allowed.includes(target)) {
    throw ApiError.badRequest(
      `Cannot transition training from "${current}" to "${target}"`
    );
  }
}

// ─── CRUD Operations ─────────────────────────────────────────────────────────

export async function createTraining(
  clubId: string,
  input: CreateTrainingInput,
  creatorId: string
) {
  const slug = input.slug || slugify(input.title);

  const slugExists = await trainingRepo.trainingExistsBySlug(clubId, slug);
  if (slugExists) {
    throw ApiError.conflict("A training with this slug already exists in this club");
  }

  if (input.linkedFormId) {
    const form = await Form.findById(input.linkedFormId);
    if (!form) {
      throw ApiError.notFound("Registration form not found");
    }
    if (form.club.toString() !== clubId) {
      throw ApiError.badRequest("Form does not belong to this club");
    }
  }

  const training = await trainingRepo.createTraining({
    club: new mongoose.Types.ObjectId(clubId),
    title: input.title,
    slug,
    description: input.description,
    poster: input.poster ?? null,
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    location: input.location,
    capacity: input.capacity ?? null,
    requiresValidation: input.requiresValidation ?? false,
    linkedForm: input.linkedFormId
      ? new mongoose.Types.ObjectId(input.linkedFormId)
      : null,
    createdBy: new mongoose.Types.ObjectId(creatorId),
    status: TrainingStatus.DRAFT,
    registeredCount: 0,
  });

  return training.toJSON();
}

export async function updateTraining(
  clubId: string,
  trainingId: string,
  input: UpdateTrainingInput
) {
  const training = await trainingRepo.findTrainingById(trainingId);
  if (!training) {
    throw ApiError.notFound("Training not found");
  }
  if (training.club.toString() !== clubId) {
    throw ApiError.forbidden("Training does not belong to this club");
  }

  if (training.status === TrainingStatus.COMPLETED || training.status === TrainingStatus.CANCELLED) {
    throw ApiError.badRequest("Cannot update a completed or cancelled training");
  }

  if (input.slug && input.slug !== training.slug) {
    const slugExists = await trainingRepo.trainingExistsBySlug(
      clubId,
      input.slug,
      trainingId
    );
    if (slugExists) {
      throw ApiError.conflict("A training with this slug already exists in this club");
    }
  }

  if (input.linkedFormId) {
    const form = await Form.findById(input.linkedFormId);
    if (!form) {
      throw ApiError.notFound("Registration form not found");
    }
    if (form.club.toString() !== clubId) {
      throw ApiError.badRequest("Form does not belong to this club");
    }
  }

  const updateData: Record<string, unknown> = { ...input };
  if ("linkedFormId" in input) {
    updateData.linkedForm = input.linkedFormId
      ? new mongoose.Types.ObjectId(input.linkedFormId)
      : null;
    delete updateData.linkedFormId;
  }

  const updated = await trainingRepo.updateTraining(trainingId, updateData as any);
  return updated!.toJSON();
}

export async function deleteTraining(clubId: string, trainingId: string) {
  const training = await trainingRepo.findTrainingById(trainingId);
  if (!training) {
    throw ApiError.notFound("Training not found");
  }
  if (training.club.toString() !== clubId) {
    throw ApiError.forbidden("Training does not belong to this club");
  }
  if (training.status === TrainingStatus.IN_PROGRESS) {
    throw ApiError.badRequest("Cannot delete a training that is in progress");
  }
  if (training.status === TrainingStatus.COMPLETED) {
    throw ApiError.badRequest("Cannot delete a completed training");
  }

  await trainingRepo.deleteTraining(trainingId);
}

// ─── State Machine ───────────────────────────────────────────────────────────

export async function transitionStatus(
  clubId: string,
  trainingId: string,
  input: TransitionTrainingStatusInput
) {
  const training = await trainingRepo.findTrainingById(trainingId);
  if (!training) {
    throw ApiError.notFound("Training not found");
  }
  if (training.club.toString() !== clubId) {
    throw ApiError.forbidden("Training does not belong to this club");
  }

  validateTransition(training.status, input.status);

  const updated = await trainingRepo.updateTraining(trainingId, {
    status: input.status,
  } as any);

  return updated!.toJSON();
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getTrainingById(clubId: string, trainingId: string) {
  const training = await trainingRepo.findTrainingByIdLean(trainingId);
  if (!training) {
    throw ApiError.notFound("Training not found");
  }
  if ((training.club as any)._id?.toString() !== clubId) {
    throw ApiError.forbidden("Training does not belong to this club");
  }
  return training;
}

export async function listClubTrainings(
  clubId: string,
  query: ListClubTrainingsQuery
) {
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
  const { trainings, total } = await trainingRepo.findTrainingsByClub(
    clubId,
    filter,
    sortObj,
    skip,
    limit
  );

  return {
    trainings,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function listPublicTrainings(query: ListPublicTrainingsQuery) {
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
        TrainingStatus.PUBLISHED,
        TrainingStatus.REGISTRATION_OPEN,
        TrainingStatus.REGISTRATION_CLOSED,
      ],
    };
  }
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) (filter.date as Record<string, Date>).$gte = dateFrom;
    if (dateTo) (filter.date as Record<string, Date>).$lte = dateTo;
  }

  const sortObj = buildSort(sort || "-date");
  const { trainings, total } = await trainingRepo.findTrainingsPaginated(
    filter,
    sortObj,
    skip,
    limit
  );

  return {
    trainings,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getPublicTrainingById(trainingId: string) {
  const training = await trainingRepo.findTrainingByIdLean(trainingId);
  if (!training) {
    throw ApiError.notFound("Training not found");
  }
  return training;
}

// ─── Registration ────────────────────────────────────────────────────────────

export async function registerForTraining(
  userId: string,
  trainingId: string
) {
  const training = await trainingRepo.findTrainingById(trainingId);
  if (!training) {
    throw ApiError.notFound("Training not found");
  }

  const openStatuses = [
    TrainingStatus.PUBLISHED,
    TrainingStatus.REGISTRATION_OPEN,
  ];
  if (!openStatuses.includes(training.status)) {
    throw ApiError.badRequest("Registration is not open for this training");
  }

  if (
    training.capacity !== null &&
    training.registeredCount >= training.capacity
  ) {
    throw ApiError.conflict("This training is at full capacity");
  }

  const existing = await trainingRepo.findRegistration(userId, trainingId);
  if (existing) {
    if (existing.status === RegistrationStatus.CANCELLED) {
      await trainingRepo.withTransaction(async (session) => {
        await trainingRepo.updateRegistration(
          existing._id.toString(),
          { status: RegistrationStatus.PENDING }
        );
        await trainingRepo.incrementRegisteredCount(trainingId);
      });
      const updated = await trainingRepo.findRegistration(userId, trainingId);
      return updated!.toJSON();
    }
    throw ApiError.conflict("You are already registered for this training");
  }

  await trainingRepo.withTransaction(async (session) => {
    await trainingRepo.createRegistration({
      user: new mongoose.Types.ObjectId(userId),
      targetType: RegistrationTargetType.TRAINING,
      target: new mongoose.Types.ObjectId(trainingId),
      status: training.requiresValidation
        ? RegistrationStatus.PENDING
        : RegistrationStatus.APPROVED,
    } as any);

    await trainingRepo.incrementRegisteredCount(trainingId);
  });

  const registration = await trainingRepo.findRegistration(userId, trainingId);
  return registration!.toJSON();
}

export async function cancelRegistration(userId: string, trainingId: string) {
  const registration = await trainingRepo.findRegistration(userId, trainingId);
  if (!registration) {
    throw ApiError.notFound("Registration not found");
  }
  if (
    registration.status === RegistrationStatus.CANCELLED ||
    registration.status === RegistrationStatus.REJECTED
  ) {
    throw ApiError.badRequest("Registration is already cancelled or rejected");
  }

  await trainingRepo.withTransaction(async (session) => {
    await trainingRepo.updateRegistration(registration._id.toString(), {
      status: RegistrationStatus.CANCELLED,
    } as any);
    await trainingRepo.decrementRegisteredCount(trainingId);
  });

  const updated = await trainingRepo.findRegistration(userId, trainingId);
  return updated!.toJSON();
}

export async function getTrainingRegistrations(
  clubId: string,
  trainingId: string,
  query: { page: number; limit: number; status?: string }
) {
  const training = await trainingRepo.findTrainingById(trainingId);
  if (!training) {
    throw ApiError.notFound("Training not found");
  }
  if (training.club.toString() !== clubId) {
    throw ApiError.forbidden("Training does not belong to this club");
  }

  const { page, limit, status } = query;
  const skip = (page - 1) * limit;

  const { registrations, total } = await trainingRepo.findRegistrationsPaginated(
    trainingId,
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
  const { registrations, total } = await trainingRepo.findUserRegistrations(
    userId,
    skip,
    limit
  );
  return {
    registrations,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
