import { Response } from "express";
import { env } from "../config/env";

const MAX_AGE_MS = 1000; // access token cookie is refreshed often, not persisted

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
  csrfToken: string
): void {
  const base = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env.COOKIE_SECURE,
    path: "/",
  };
  // Access: short-lived, session-only.
  res.cookie(env.ACCESS_TOKEN_COOKIE, accessToken, { ...base, maxAge: MAX_AGE_MS });
  // Refresh: long-lived, rotation tracked server-side.
  res.cookie(env.REFRESH_TOKEN_COOKIE, refreshToken, {
    ...base,
    maxAge: env.JWT_REFRESH_TTL_DAYS * 86400,
  });
  // CSRF double-submit token (readable by JS so the client can echo it back).
  res.cookie(env.CSRF_COOKIE, csrfToken, {
    httpOnly: false,
    sameSite: "lax" as const,
    secure: env.COOKIE_SECURE,
    path: "/",
    maxAge: env.JWT_REFRESH_TTL_DAYS * 86400,
  });
}

export function clearAuthCookies(res: Response): void {
  const opts = { httpOnly: true, sameSite: "lax" as const, secure: env.COOKIE_SECURE, path: "/" };
  res.clearCookie(env.ACCESS_TOKEN_COOKIE, opts);
  res.clearCookie(env.REFRESH_TOKEN_COOKIE, opts);
  res.clearCookie(env.CSRF_COOKIE, { ...opts, httpOnly: false });
}