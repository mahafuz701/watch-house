// Domain error with HTTP status — thrown by services, turned into a JSON
// response by the error-handling middleware. Never leaks internals to clients.
export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, message: string, code = "API_ERROR", details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(msg = "Invalid request", code = "BAD_REQUEST", details?: unknown) {
    return new ApiError(400, msg, code, details);
  }
  static unauthorized(msg = "Authentication required", code = "UNAUTHORIZED") {
    return new ApiError(401, msg, code);
  }
  static forbidden(msg = "You do not have permission to do this", code = "FORBIDDEN") {
    return new ApiError(403, msg, code);
  }
  static notFound(msg = "Resource not found", code = "NOT_FOUND") {
    return new ApiError(404, msg, code);
  }
  static conflict(msg = "Resource already exists", code = "CONFLICT") {
    return new ApiError(409, msg, code);
  }
}

// Wraps an async handler so thrown errors reach the error middleware.
export const ah =
  (fn) =>
  (...args) =>
    fn(...args).catch(args[2]);