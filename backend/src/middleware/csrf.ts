import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const unsafePath = (p: string) =>
  !p.startsWith("/api/auth/") && !p.startsWith("/api/health") && !p.startsWith("/api/payments/webhook");

/** Double-submit cookie CSRF protection for state-changing requests. */
export function csrfProtect(req: Request, res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method) || unsafePath(req.path)) return next();

  const cookieToken = req.cookies?.[env.CSRF_COOKIE];
  const headerToken = req.headers["x-csrf-token"];
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(ApiError.forbidden("Invalid or missing security token. Refresh the page and try again.", "CSRF"));
  }
  next();
}

/** Issues the CSRF cookie to every session (initialized lazily). */
export function csrfInject(req: Request, res: Response, next: NextFunction) {
  if (!req.cookies?.[env.CSRF_COOKIE]) {
    const token = crypto.randomUUID();
    res.cookie(env.CSRF_COOKIE, token, {
      httpOnly: false,
      sameSite: "lax",
      secure: env.COOKIE_SECURE,
      path: "/",
      maxAge: 7 * 86400,
    });
    // remember it for downstream middleware in the same request
    req.cookies ??= {};
    req.cookies[env.CSRF_COOKIE] = token;
  }
  next();
}