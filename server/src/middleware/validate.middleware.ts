import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiError, ErrorCode } from "../shared/utils/ApiError";

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const errors: Record<string, string> = {};

    if (schemas.body) {
      try {
        req.body = schemas.body.parse(req.body);
      } catch (err) {
        if (err instanceof ZodError) {
          err.errors.forEach((e) => {
            errors[`body.${e.path.join(".")}`] = e.message;
          });
        }
      }
    }

    if (schemas.query) {
      try {
        req.query = schemas.query.parse(req.query) as any;
      } catch (err) {
        if (err instanceof ZodError) {
          err.errors.forEach((e) => {
            errors[`query.${e.path.join(".")}`] = e.message;
          });
        }
      }
    }

    if (schemas.params) {
      try {
        req.params = schemas.params.parse(req.params) as any;
      } catch (err) {
        if (err instanceof ZodError) {
          err.errors.forEach((e) => {
            errors[`params.${e.path.join(".")}`] = e.message;
          });
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return next(ApiError.validation(errors));
    }

    next();
  };
}
