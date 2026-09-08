import { Request, Response, NextFunction } from "express";
import { ApiError, ErrorCode } from "../shared/utils/ApiError";
import { config } from "../config";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
  }

  if (err.name === "MulterError") {
    const multerErr = err as any;
    if (multerErr.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        error: {
          code: ErrorCode.PAYLOAD_TOO_LARGE,
          message: "File size exceeds the limit",
        },
      });
    }
    return res.status(400).json({
      success: false,
      error: {
        code: ErrorCode.BAD_REQUEST,
        message: multerErr.message,
      },
    });
  }

  console.error("[ERROR]", err);

  return res.status(500).json({
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: config.isDevelopment
        ? err.message
        : "Internal server error",
    },
  });
}
