import bcrypt from "bcryptjs";
import { randomUUID, digest } from "node:crypto";
import { prisma } from "../../db/prisma";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { signAccess, signRefresh, verifyRefresh } from "../../utils/jwt";
import { setAuthCookies, clearAuthCookies } from "../../utils/cookies";
import { notifyUser } from "../../services/notification.service";
import { sendEmail, buildEmail } from "../../services/email.service";
import type { Response } from "express";

// ─── token helpers ───────────────────────────────────────────────────────

const sha256hex = (v: string) => Buffer.from(digest("SHA-256", v)).toString("hex");

async function issueSession(res: Response, user: { id: string; role: string }) {
  // Rotating refresh token: revoke existing, create a fresh row + cookie.
  await prisma.refreshToken.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
  const rtRow = await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256hex(randomUUID()),
      device: "web",
      expiresAt: new Date(Date.now() + env.JWT_REFRESH_TTL_DAYS * 86400000),
    },
  });
  setAuthCookies(res, signAccess(user.id, user.role), signRefresh(user.id, rtRow.id), randomUUID());
}

export interface AuthUserView {
  id: string; name: string; email: string; phone: string | null; role: string; avatarUrl: string | null;
}

export const toUserView = (u: AuthUserView) => ({
  id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, avatarUrl: u.avatarUrl,
});

// ─── commands ────────────────────────────────────────────────────────────

export async function register(input: { name: string; email: string; phone: string; password: string }) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw ApiError.conflict("An account with this email already exists. Sign in instead.");
  const phoneTaken = await prisma.user.findUnique({ where: { phone: input.phone } });
  if (phoneTaken) throw ApiError.conflict("This phone number is already registered.");

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      name: input.name, email: input.email, phone: input.phone, passwordHash,
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  void notifyUser(user.id, "WELCOME", "Welcome to Tuhin Watch House 🎉", "Use code WELCOME10 for 10% off your first order.", "/shop");
  return { userId: user.id };
}

export async function login(res: Response, input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, name: true, email: true, phone: true, role: true, passwordHash: true, status: true, avatarUrl: true },
  });
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw ApiError.unauthorized("Incorrect email or password.", "INVALID_CREDENTIALS");
  }
  if (user.status !== "ACTIVE") throw ApiError.forbidden("This account is blocked. Contact support.", "ACCOUNT_BLOCKED");

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await issueSession(res, user);
  return toUserView(user);
}

export async function refreshSession(res: Response, refreshToken: string | undefined) {
  if (!refreshToken) throw ApiError.unauthorized();
  const payload = verifyRefresh(refreshToken);
  if (!payload) throw new ApiError(401, "Session expired, please sign in again.", "TOKEN_EXPIRED");

  const row = await prisma.refreshToken.findUnique({ where: { id: payload.tid } });
  if (!row || row.revokedAt || row.expiresAt < new Date()) {
    clearAuthCookies(res);
    throw new ApiError(401, "Session expired, please sign in again.", "TOKEN_EXPIRED");
  }
  await prisma.refreshToken.update({ where: { id: row.id }, data: { revokedAt: new Date() } });

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, phone: true, role: true, status: true, avatarUrl: true },
  });
  if (!user || user.status !== "ACTIVE") throw ApiError.unauthorized();
  await issueSession(res, user);
  return toUserView(user);
}

export async function logout(res: Response, refreshToken: string | undefined) {
  if (refreshToken) {
    const payload = verifyRefresh(refreshToken);
    if (payload) {
      await prisma.refreshToken.updateMany({ where: { id: payload.tid, revokedAt: null }, data: { revokedAt: new Date() } });
    }
  }
  clearAuthCookies(res);
}

export async function forgotPassword(input: { email: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) return; // don't leak which emails are registered
  const token = randomUUID();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256hex(token),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });
  const link = `${env.SITE_URL}/reset-password/${token}`;
  void sendEmail({
    to: user.email,
    subject: "Reset your Tuhin Watch House password",
    html: buildEmail(user.name || "there", { text: "Reset password", href: link },
      `<p>We received a request to reset your password. This link expires in <b>1 hour</b>.</p>`),
  });
}
export async function resetPassword(input: { token: string; password: string }) {
  const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash: sha256hex(input.token) } });
  if (!row || row.usedAt || row.expiresAt < new Date()) throw ApiError.badRequest("This reset link is invalid or expired.", "BAD_TOKEN");
  const passwordHash = await bcrypt.hash(input.password, 10);
  await prisma.$transaction([
    prisma.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: row.userId }, data: { passwordHash } }),
    prisma.refreshToken.updateMany({ where: { userId: row.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
  ]);
}

export async function changePassword(userId: string, input: { currentPassword: string; newPassword: string }) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  if (!user) throw ApiError.unauthorized();
  if (!(await bcrypt.compare(input.currentPassword, user.passwordHash))) {
    throw ApiError.badRequest("Your current password is incorrect.", "INVALID_PASSWORD");
  }
  const passwordHash = await bcrypt.hash(input.newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  await prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
}

export async function updateProfile(userId: string, input: { name?: string; phone?: string; avatarUrl?: string }) {
  const data: Record<string, string> = {};
  if (input.name) data.name = input.name;
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl;
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, phone: true, role: true, avatarUrl: true },
  });
  return toUserView(user);
}