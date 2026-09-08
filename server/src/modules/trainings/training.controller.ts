import { Request, Response } from "express";
import * as trainingService from "./training.service";
import { ApiResponse } from "../../shared/utils/apiResponse";
import { asyncHandler } from "../../shared/utils/asyncHandler";

// ─── Club Leader: Training CRUD ──────────────────────────────────────────────

export const createTraining = asyncHandler(
  async (req: Request, res: Response) => {
    const training = await trainingService.createTraining(
      req.params.clubId,
      req.body,
      req.user!.id
    );
    ApiResponse.created(res, training, "Training created successfully");
  }
);

export const updateTraining = asyncHandler(
  async (req: Request, res: Response) => {
    const training = await trainingService.updateTraining(
      req.params.clubId,
      req.params.id,
      req.body
    );
    ApiResponse.success(res, training, 200, "Training updated successfully");
  }
);

export const deleteTraining = asyncHandler(
  async (req: Request, res: Response) => {
    await trainingService.deleteTraining(req.params.clubId, req.params.id);
    ApiResponse.success(res, null, 200, "Training deleted successfully");
  }
);

export const transitionStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const training = await trainingService.transitionStatus(
      req.params.clubId,
      req.params.id,
      req.body
    );
    ApiResponse.success(res, training, 200, "Training status updated");
  }
);

// ─── Club Leader: Get training details ───────────────────────────────────────

export const getTraining = asyncHandler(
  async (req: Request, res: Response) => {
    const training = await trainingService.getTrainingById(
      req.params.clubId,
      req.params.id
    );
    ApiResponse.success(res, training);
  }
);

export const listClubTrainings = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await trainingService.listClubTrainings(
      req.params.clubId,
      req.query as any
    );
    ApiResponse.paginated(res, result.trainings, result.meta);
  }
);

// ─── Club Leader: Registration management ────────────────────────────────────

export const getTrainingRegistrations = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await trainingService.getTrainingRegistrations(
      req.params.clubId,
      req.params.id,
      req.query as any
    );
    ApiResponse.paginated(res, result.registrations, result.meta);
  }
);

// ─── Student: Browse & Register ──────────────────────────────────────────────

export const listPublicTrainings = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await trainingService.listPublicTrainings(req.query as any);
    ApiResponse.paginated(res, result.trainings, result.meta);
  }
);

export const getPublicTraining = asyncHandler(
  async (req: Request, res: Response) => {
    const training = await trainingService.getPublicTrainingById(req.params.id);
    ApiResponse.success(res, training);
  }
);

export const registerForTraining = asyncHandler(
  async (req: Request, res: Response) => {
    const registration = await trainingService.registerForTraining(
      req.user!.id,
      req.params.id
    );
    ApiResponse.created(res, registration, "Registration submitted");
  }
);

export const cancelRegistration = asyncHandler(
  async (req: Request, res: Response) => {
    const registration = await trainingService.cancelRegistration(
      req.user!.id,
      req.params.id
    );
    ApiResponse.success(res, registration, 200, "Registration cancelled");
  }
);

export const getMyRegistrations = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 20 } = req.query;
    const result = await trainingService.getUserRegistrations(
      req.user!.id,
      Number(page),
      Number(limit)
    );
    ApiResponse.paginated(res, result.registrations, result.meta);
  }
);
