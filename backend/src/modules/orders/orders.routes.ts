import { Request, Response, Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { ah, ApiError } from "../../utils/ApiError";
import { ok } from "../../utils/respond";
import { prisma } from "../../db/prisma";
import { checkout } from "./orders.service";

export const ordersRouter = Router();
ordersRouter.use(requireAuth);

ordersRouter.get(
  "/",
  ah(async (req: Request, res: Response) => {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: { items: true, payments: true },
      orderBy: { createdAt: "desc" },
    });
    ok(res, { orders });
  })
);

ordersRouter.get(
  "/:orderNumber",
  ah(async (req: Request, res: Response) => {
    const order = await prisma.order.findFirst({
      where: { orderNumber: req.params.orderNumber, userId: req.user!.id },
      include: { items: true, payments: true },
    });
    if (!order) throw ApiError.notFound("Order not found.");
    ok(res, { order });
  })
);

ordersRouter.post(
  "/",
  ah(async (req: Request, res: Response) => {
    const required = ["shipFullName", "shipPhone", "shipDivision", "shipDistrict", "shipArea", "shipFullAddress", "paymentMethod"];
    const missing = required.find((field) => !req.body[field]);
    if (missing) throw ApiError.badRequest(`${missing} is required.`);
    const order = await checkout(req.user!.id, req.body);
    ok(res, { order }, undefined, 201);
  })
);

ordersRouter.post(
  "/:orderNumber/cancel",
  ah(async (req: Request, res: Response) => {
    const order = await prisma.order.findFirst({ where: { orderNumber: req.params.orderNumber, userId: req.user!.id } });
    if (!order) throw ApiError.notFound("Order not found.");
    if (!["PENDING", "CONFIRMED", "PROCESSING"].includes(order.status)) throw ApiError.badRequest("This order can no longer be cancelled.");
    const updated = await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED", cancelledAt: new Date(), cancelledReason: req.body.reason || "Cancelled by customer" } });
    ok(res, { order: updated });
  })
);
