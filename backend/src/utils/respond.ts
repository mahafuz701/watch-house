import { Response } from "express";

/** Consistent success envelope: { success, data?, meta? } */
export function ok<T>(res: Response, data: T, meta?: Record<string, unknown>, status = 200): Response {
  const body: Record<string, unknown> = { success: true };
  if (data !== undefined) body.data = data;
  if (meta) body.meta = meta;
  return res.status(status).json(body);
}