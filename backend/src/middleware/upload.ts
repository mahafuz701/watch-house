import multer from "multer";
import { randomUUID } from "node:crypto";
import { extname } from "path";
import { mkdirSync } from "fs";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

mkdirSync(env.UPLOAD_PATH, { recursive: true });

const ALLOWED = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const storage = multer.diskStorage({
  destination: env.UPLOAD_PATH,
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${randomUUID().slice(0, 8)}${extname(file.originalname).toLowerCase()}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    if (!ALLOWED.has(ext)) return cb(ApiError.badRequest("Only JPG, PNG, WEBP or GIF images are allowed.", "BAD_FILE_TYPE"));
    cb(null, true);
  },
});

export const uploadPath = env.UPLOAD_PATH;

export function localUrl(filename: string): string {
  return `/uploads/products/${filename}`;
}