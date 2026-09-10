import { Request, Response } from "express";
import { ok } from "../../utils/respond";
import { ah } from "../../utils/ApiError";
import { prisma } from "../../db/prisma";
import * as service from "./auth.service";

export const doRegister = ah(async (req: Request, res: Response) => {
  const result = await service.register(req.body);
  ok(res, result, undefined, 201);
});

export const doLogin = ah(async (req: Request, res: Response) => {
  const user = await service.login(res, req.body);
  ok(res, user);
});

export const doRefresh = ah(async (req: Request, res: Response) => {
  const user = await service.refreshSession(res, req.cookies?.[process.env.REFRESH_TOKEN_COOKIE || "tw_refresh"]);
  ok(res, user);
});

export const doLogout = ah(async (req: Request, res: Response) => {
  await service.logout(res, req.cookies?.[process.env.REFRESH_TOKEN_COOKIE || "tw_refresh"]);
  ok(res, { signedOut: true });
});

export const doForgot = ah(async (req: Request, res: Response) => {
  await service.forgotPassword(req.body);
  // Always same message (prevents account enumeration).
  ok(res, { message: "If that email exists, a password reset link has been sent." });
});

export const doReset = ah(async (req: Request, res: Response) => {
  await service.resetPassword(req.body);
  ok(res, { message: "Password updated. You can now sign in." });
});

export const doMe = ah(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, phone: true, role: true, avatarUrl: true, emailVerified: true, createdAt: true },
  });
  const unread = await prisma.notification.count({ where: { userId: req.user!.id, readAt: null } });
  ok(res, { user, unreadNotifications: unread });
});