import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "../utils/ApiError";

type Source = "body" | "query" | "params";

/** Zod-based request validation. Throws 400 (or 422) with the first field error. */
export const validate =
  (schema: ZodSchema, sources: Source[] = ["body"]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      for (const src of sources) {
        const target = src === "body" ? req.body : src === "query" ? req.query : req.params;
        const result = schema.safeParse(target);
        if (!result.success) {
          const first = result.error.issues[0];
          const path = first.path.join(".");
          const msg = first.message.toLowerCase().includes("required")
            ? `The ${path || "field"} field is required.`
            : first.message;
          return next(ApiError.badRequest(path ? `${path}: ${msg}` : msg, "VALIDATION_ERROR", result.error.issues));
        }
        if (src === "body") req.body = result.data;
        if (src === "query") (req as Request).query = result.data;
      }
      next();
    } catch (e) {
      next(e);
    }
  };