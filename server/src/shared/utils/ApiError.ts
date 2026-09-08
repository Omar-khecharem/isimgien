export enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  BAD_REQUEST = "BAD_REQUEST",
  PAYLOAD_TOO_LARGE = "PAYLOAD_TOO_LARGE",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

const statusCodeMap: Record<ErrorCode, number> = {
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.BAD_REQUEST]: 400,
  [ErrorCode.PAYLOAD_TOO_LARGE]: 413,
  [ErrorCode.INTERNAL_ERROR]: 500,
};

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: Record<string, string>;

  constructor(
    code: ErrorCode,
    message: string,
    details?: Record<string, string>
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCodeMap[code];
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: Record<string, string>) {
    return new ApiError(ErrorCode.BAD_REQUEST, message, details);
  }

  static unauthorized(message = "Authentication required") {
    return new ApiError(ErrorCode.UNAUTHORIZED, message);
  }

  static forbidden(message = "Insufficient permissions") {
    return new ApiError(ErrorCode.FORBIDDEN, message);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(ErrorCode.NOT_FOUND, message);
  }

  static conflict(message: string) {
    return new ApiError(ErrorCode.CONFLICT, message);
  }

  static validation(details: Record<string, string>) {
    return new ApiError(
      ErrorCode.VALIDATION_ERROR,
      "Validation failed",
      details
    );
  }

  static internal(message = "Internal server error") {
    return new ApiError(ErrorCode.INTERNAL_ERROR, message);
  }
}
