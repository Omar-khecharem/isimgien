import { Response } from "express";

export interface ApiResponseMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ApiResponse {
  static success<T>(res: Response, data: T, statusCode = 200, message?: string) {
    const body: Record<string, unknown> = {
      success: true,
      data,
    };
    if (message) body.message = message;
    return res.status(statusCode).json(body);
  }

  static created<T>(res: Response, data: T, message?: string) {
    return ApiResponse.success(res, data, 201, message);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    meta: ApiResponseMeta,
    message?: string
  ) {
    const body: Record<string, unknown> = {
      success: true,
      data,
      meta,
    };
    if (message) body.message = message;
    return res.status(200).json(body);
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }
}
