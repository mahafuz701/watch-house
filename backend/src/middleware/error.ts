import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ApiError } from "../utils/ApiError";
import { isProd } from "../config/env";
import { Prisma } from "@prisma/client";

const isPrismaError = (e: unknown): boolean => e instanceof Prisma.PrismaClientKnownRequestError;

/** Central error handler — consistent shape, no internals leaked. */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ success: false, code: err.code, message: err.message, details: err.details });
  }

  // Unique constraint violations → 409
  if (isPrismaError(err) && err.code === "P2002") {
    return res.status(409).json({ success: false, code: "DUPLICATE", message: "A record with that value already exists." });
  }
  // Record not found → 404
  if (isPrismaError(err) && err.code === "P2025") {
    return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Resource not found." });
  }

  if (err instanceof SyntaxError) {
    return res.status(400).json({ success: false, code: "BAD_JSON", message: "Invalid JSON in request body." });
  }

  console.error(`[${req.method} ${req.path}]`, err?.message || err);
  res.status(500).json({
    success: false,
    code: "INTERNAL_ERROR",
    message: "Something went wrong on our end. Please try again.",
    // hide internals in production
    ...(isProd ? {} : { debug: err?.message }),
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ success: false, code: "NOT_FOUND", message: `No route for ${req.method} ${req.path}` });
};