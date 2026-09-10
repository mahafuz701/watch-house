import { Request, Response } from "express";
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { ok } from "../../utils/respond";
import { ah, ApiError } from "../../utils/ApiError";
import { prisma } from "../../db/prisma";
import { updateProfile, changePassword } from "../auth/auth.service";
import * as schemas from "../auth/auth.schemas";

export const accountRouter = Router();
accountRouter.use(requireAuth);

// ─── profile ─────────────────────────────────────────────────────────────

accountRouter.get(
  "/me",
  ah(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, phone: true, role: true, avatarUrl: true, emailVerified: true, createdAt: true },
    });
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    ok(res, { user, addresses });
  })
);

accountRouter.put(
  "/profile",
  validate(schemas.updateProfileSchema),
  ah(async (req: Request, res: Response) => {
    const user = await updateProfile(req.user!.id, req.body);
    ok(res, { user, message: "Profile updated." });
  })
);

accountRouter.put(
  "/password",
  validate(schemas.changePasswordSchema),
  ah(async (req: Request, res: Response) => {
    await changePassword(req.user!.id, req.body);
    ok(res, { message: "Password changed. Please sign in again." });
  })
);

// ─── addresses ───────────────────────────────────────────────────────────

accountRouter.get(
  "/addresses",
  ah(async (req: Request, res: Response) => {
    const addresses = await prisma.address.findMany({ where: { userId: req.user!.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] });
    ok(res, { addresses });
  })
);

accountRouter.post(
  "/addresses",
  validate(schemas.addressSchema),
  ah(async (req: Request, res: Response) => {
    const { isDefault, ...rest } = req.body;
    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } });
    }
    const count = await prisma.address.count({ where: { userId: req.user!.id } });
    const address = await prisma.address.create({
      data: { userId: req.user!.id, isDefault: isDefault || count === 0, ...rest },
    });
    ok(res, { address }, undefined, 201);
  })
);

accountRouter.put(
  "/addresses/:id",
  validate(schemas.addressSchema),
  ah(async (req: Request, res: Response) => {
    const { isDefault, ...rest } = req.body;
    const owned = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!owned) throw ApiError.notFound("Address not found.");
    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } });
    }
    const address = await prisma.address.update({ where: { id: owned.id }, data: { isDefault: isDefault || owned.isDefault, ...rest } });
    ok(res, { address, message: "Address updated." });
  })
);

accountRouter.delete(
  "/addresses/:id",
  ah(async (req: Request, res: Response) => {
    const owned = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!owned) throw ApiError.notFound("Address not found.");
    await prisma.address.delete({ where: { id: owned.id } });
    // keep at least one default address
    const remaining = await prisma.address.count({ where: { userId: req.user!.id } });
    if (remaining > 0) {
      const anyDefault = await prisma.address.findFirst({ where: { userId: req.user!.id, isDefault: true } });
      if (!anyDefault) {
        const first = await prisma.address.findFirst({ where: { userId: req.user!.id } });
        if (first) await prisma.address.update({ where: { id: first.id }, data: { isDefault: true } });
      }
    }
    ok(res, { message: "Address deleted." });
  })
);