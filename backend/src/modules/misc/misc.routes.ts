import { Request, Response, Router } from "express";
import { optionalAuth, requireAuth } from "../../middleware/auth";
import { ah } from "../../utils/ApiError";
import { ok } from "../../utils/respond";
import { prisma } from "../../db/prisma";

export const miscRouter = Router();

miscRouter.get(
  "/categories",
  ah(async (_req: Request, res: Response) => {
    const categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
    ok(res, { categories });
  })
);

miscRouter.get(
  "/brands",
  ah(async (_req: Request, res: Response) => {
    const brands = await prisma.brand.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
    ok(res, { brands });
  })
);

miscRouter.get(
  "/settings",
  ah(async (_req: Request, res: Response) => {
    const rows = await prisma.siteSetting.findMany();
    ok(res, { settings: Object.fromEntries(rows.map((row) => [row.key, row.value])) });
  })
);

miscRouter.get(
  "/notifications",
  requireAuth,
  ah(async (req: Request, res: Response) => {
    const notifications = await prisma.notification.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: "desc" }, take: 50 });
    ok(res, { notifications });
  })
);
