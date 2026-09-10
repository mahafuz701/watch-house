import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AccessPayload {
  sub: string; // user id
  role: string;
  typ: "access";
}

export interface RefreshPayload {
  sub: string;
  tid: string; // refresh token row id
  typ: "refresh";
}

export const signAccess = (userId: string, role: string): string =>
  jwt.sign({ sub: userId, role, typ: "access" }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL,
  });

export const signRefresh = (userId: string, tokenId: string): string =>
  jwt.sign({ sub: userId, tid: tokenId, typ: "refresh" }, env.JWT_REFRESH_SECRET, {
    expiresIn: `${env.JWT_REFRESH_TTL_DAYS}d`,
  });

export const verifyAccess = (token: string): AccessPayload | null => {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    if (decoded.typ !== "access") return null;
    return decoded as AccessPayload;
  } catch {
    return null;
  }
};

export const verifyRefresh = (token: string): RefreshPayload | null => {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    if (decoded.typ !== "refresh") return null;
    return decoded as RefreshPayload;
  } catch {
    return null;
  }
};