import { Request, Response, NextFunction } from "express";
import { prisma } from "../db/prisma";
import { verifyAccess } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/** Reads the access token from the httpOnly cookie (or Authorization header for API clients). */
function readToken(req: Request): string | undefined {
  const bearer = req.headers.authorization;
  if (bearer && bearer.startsWith("Bearer ")) return bearer.slice(7);
  return req.cookies?.[process.env.ACCESS_TOKEN_COOKIE || "tw_access"];
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = readToken(req);
  if (!token) return next(ApiError.unauthorized());
  const payload = verifyAccess(token);
  if (!payload) return next(ApiError.unauthorized("Session expired, please sign in again.", "TOKEN_EXPIRED"));

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, role: true, status: true },
  });
  if (!user) return next(ApiError.unauthorized("Account no longer exists."));
  if (user.status !== "ACTIVE") return next(ApiError.forbidden("This account has been blocked.", "ACCOUNT_BLOCKED"));
  req.user = { ...user, name: user.name ?? "" };
  next();
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = readToken(req);
    if (token) {
      const payload = verifyAccess(token);
      if (payload) {
        const user = await prisma.user.findUnique({
          where: { id: payload.sub },
          select: { id: true, name: true, email: true, role: true, status: true },
        });
        if (user && user.status === "ACTIVE") req.user = { ...user, name: user.name ?? "" };
      }
    }
  } catch {
    /* guest */
  }
  next();
};

export const requireRole = (...roles: string[]) => (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
  next();
};