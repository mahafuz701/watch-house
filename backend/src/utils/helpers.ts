import { digest } from "node:crypto";

export const slugify = (s: string): string =>
  s.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

export const randomHex = (bytes = 16): string => {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
};

export const sha256 = (v: string): string => Buffer.from(digest("SHA-256", v)).toString("hex");

export const generateOrderNumber = (date = new Date()): string => {
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `TW-${ymd}-${rand}`;
};

export const generateCouponCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
};

/** Round a monetary value to 2 decimals (BDT taka). */
export const money = (v: number): number => Math.round(v * 100) / 100;

/** Pagination meta builder. */
export const paginate = (page: number, perPage: number, total: number) => {
  const safePage = Math.max(1, page);
  const safePer = Math.min(100, Math.max(1, perPage));
  const totalPages = Math.max(1, Math.ceil(total / safePer));
  return {
    page: safePage,
    perPage: safePer,
    total,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
  };
};

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));