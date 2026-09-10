import rateLimit from "express-rate-limit";
import { env } from "../config/env";

// API-wide safety valve.
export const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: parseInt(process.env.RATE_LIMIT_MAX || "200", 10),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, code: "RATE_LIMITED", message: "Too many requests. Please slow down." },
});

// Stricter limiter for auth & password endpoints (brute-force protection).
export const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: parseInt(process.env.AUTH_RATE_LIMIT_MAX || "20", 10),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only count failures
  message: { success: false, code: "RATE_LIMITED", message: "Too many attempts. Try again in 15 minutes." },
});