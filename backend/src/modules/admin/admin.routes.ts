import { Request, Response, Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { ah, ApiError } from "../../utils/ApiError";
import { ok } from "../../utils/respond";
import { prisma } from "../../db/prisma";

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole("ADMIN", "STAFF"));

adminRouter.get(
  "/orders",
  ah(async (_req: Request, res: Response) => {
    const orders = await prisma.order.findMany({ include: { user: { select: { name: true, email: true, phone: true } }, items: true }, orderBy: { createdAt: "desc" } });
    ok(res, { orders });
  })
);

adminRouter.patch(
  "/orders/:id",
  ah(async (req: Request, res: Response) => {
    const { status, deliveryStatus, paymentStatus } = req.body;
    if (!status && !deliveryStatus && !paymentStatus) throw ApiError.badRequest("At least one order status is required.");
    const order = await prisma.order.update({ where: { id: req.params.id }, data: { status, deliveryStatus, paymentStatus } });
    ok(res, { order });
  })
);

adminRouter.get(
  "/stats",
  ah(async (_req: Request, res: Response) => {
    const [orders, users, products] = await Promise.all([prisma.order.count(), prisma.user.count(), prisma.product.count()]);
    ok(res, { orders, users, products });
  })
);
