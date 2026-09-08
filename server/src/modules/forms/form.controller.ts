import { Request, Response } from "express";
import * as formService from "./form.service";
import * as responseService from "./response.service";
import { ApiResponse } from "../../shared/utils/apiResponse";
import { asyncHandler } from "../../shared/utils/asyncHandler";

// ─── Club Leader: Form CRUD ──────────────────────────────────────────────────

export const createForm = asyncHandler(async (req: Request, res: Response) => {
  const form = await formService.createForm(
    req.params.clubId,
    req.body,
    req.user!.id
  );
  ApiResponse.created(res, form, "Form created successfully");
});

export const updateForm = asyncHandler(async (req: Request, res: Response) => {
  const form = await formService.updateForm(
    req.params.clubId,
    req.params.id,
    req.body
  );
  ApiResponse.success(res, form, 200, "Form updated successfully");
});

export const deleteForm = asyncHandler(async (req: Request, res: Response) => {
  await formService.deleteForm(req.params.clubId, req.params.id);
  ApiResponse.success(res, null, 200, "Form deleted successfully");
});

// ─── Club Leader: Get form details ───────────────────────────────────────────

export const getForm = asyncHandler(async (req: Request, res: Response) => {
  const form = await formService.getFormById(
    req.params.clubId,
    req.params.id
  );
  ApiResponse.success(res, form);
});

export const listClubForms = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await formService.listClubForms(
      req.params.clubId,
      req.query as any
    );
    ApiResponse.paginated(res, result.forms, result.meta);
  }
);

// ─── Club Leader: Question Management ────────────────────────────────────────

export const addQuestion = asyncHandler(
  async (req: Request, res: Response) => {
    const form = await formService.addQuestion(
      req.params.clubId,
      req.params.id,
      req.body
    );
    ApiResponse.created(res, form, "Question added successfully");
  }
);

export const updateQuestion = asyncHandler(
  async (req: Request, res: Response) => {
    const form = await formService.updateQuestion(
      req.params.clubId,
      req.params.id,
      req.params.questionId,
      req.body
    );
    ApiResponse.success(res, form, 200, "Question updated successfully");
  }
);

export const deleteQuestion = asyncHandler(
  async (req: Request, res: Response) => {
    const form = await formService.deleteQuestion(
      req.params.clubId,
      req.params.id,
      req.params.questionId
    );
    ApiResponse.success(res, form, 200, "Question deleted successfully");
  }
);

export const reorderQuestions = asyncHandler(
  async (req: Request, res: Response) => {
    const form = await formService.reorderQuestions(
      req.params.clubId,
      req.params.id,
      req.body
    );
    ApiResponse.success(res, form, 200, "Questions reordered successfully");
  }
);

// ─── Club Leader: Publish/Unpublish ──────────────────────────────────────────

export const publishForm = asyncHandler(
  async (req: Request, res: Response) => {
    const form = await formService.publishForm(
      req.params.clubId,
      req.params.id
    );
    ApiResponse.success(res, form, 200, "Form published successfully");
  }
);

export const unpublishForm = asyncHandler(
  async (req: Request, res: Response) => {
    const form = await formService.unpublishForm(
      req.params.clubId,
      req.params.id
    );
    ApiResponse.success(res, form, 200, "Form unpublished successfully");
  }
);

// ─── Club Leader: Response Management ────────────────────────────────────────

export const listFormResponses = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await responseService.listFormResponses(
      req.params.clubId,
      req.params.id,
      req.query as any
    );
    ApiResponse.paginated(res, result.responses, result.meta);
  }
);

export const getResponseStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await responseService.getResponseStats(
      req.params.clubId,
      req.params.id
    );
    ApiResponse.success(res, stats);
  }
);

// ─── Public: Get published form ──────────────────────────────────────────────

export const getPublicForm = asyncHandler(
  async (req: Request, res: Response) => {
    const form = await formService.getPublicFormById(req.params.id);
    ApiResponse.success(res, form);
  }
);
