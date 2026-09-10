// Central environment configuration — every secret lives here, never in the frontend.
import "dotenv/config";
import { resolve } from "path";

function num(v, d) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: num(process.env.PORT, 4000),
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  SITE_URL: process.env.SITE_URL || "http://localhost:3000",
  SITE_NAME: process.env.SITE_NAME || "Tuhin Watch House",

  DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "dev_access_secret_change_me",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_change_me",
  JWT_ACCESS_TTL: process.env.JWT_ACCESS_TTL || "15m",
  JWT_REFRESH_TTL_DAYS: num(process.env.JWT_REFRESH_TTL_DAYS, 7),
  ACCESS_TOKEN_COOKIE: process.env.ACCESS_TOKEN_COOKIE || "tw_access",
  REFRESH_TOKEN_COOKIE: process.env.REFRESH_TOKEN_COOKIE || "tw_refresh",
  CSRF_COOKIE: process.env.CSRF_COOKIE || "tw_csrf",
  COOKIE_SECURE: process.env.COOKIE_SECURE === "true",

  PAYMENT_MODE: process.env.PAYMENT_MODE || "sandbox",
  COURIER_MODE: process.env.COURIER_MODE || "offline",

  UPLOAD_DIR: process.env.UPLOAD_DIR || "public/uploads",
  MAX_UPLOAD_MB: num(process.env.MAX_UPLOAD_MB, 8),
  UPLOAD_PATH: resolve(process.cwd(), process.env.UPLOAD_DIR || "public/uploads"),

  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: num(process.env.SMTP_PORT, 587),
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  SMTP_FROM: process.env.SMTP_FROM || "Tuhin Watch House <no-reply@tuhinwatch.com>",
  SMS_PROVIDER: process.env.SMS_PROVIDER || "log",
};

export const isProd = env.NODE_ENV === "production";
export const isDev = env.NODE_ENV !== "production";