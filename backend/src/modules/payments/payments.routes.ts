import { Request, Response, Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { ah, ApiError } from "../../utils/ApiError";
import { ok } from "../../utils/respond";
import { prisma } from "../../db/prisma";
import { verifyGatewayPayment } from "../../services/payment";

export const paymentsRouter = Router();
paymentsRouter.use(requireAuth);

paymentsRouter.get(
  "/:orderId",
  ah(async (req: Request, res: Response) => {
    const order = await prisma.order.findFirst({ where: { id: req.params.orderId, userId: req.user!.id }, include: { payments: true } });
    if (!order) throw ApiError.notFound("Order not found.");
    ok(res, { payments: order.payments });
  })
);

paymentsRouter.post(
  "/:orderId/verify",
  ah(async (req: Request, res: Response) => {
    const order = await prisma.order.findFirst({ where: { id: req.params.orderId, userId: req.user!.id }, include: { payments: true } });
    if (!order) throw ApiError.notFound("Order not found.");
    const payment = order.payments.find((item) => item.status === "PENDING");
    if (!payment || !req.body.reference) throw ApiError.badRequest("A pending payment and reference are required.");
    const result = await verifyGatewayPayment(req.body.reference, order.total, req.body.gatewayPayload || {}, payment.gateway);
    const updated = await prisma.payment.update({ where: { id: payment.id }, data: { status: result.status === "PAID" ? "SUCCESS" : "FAILED", transactionId: result.transactionId, verifiedAt: new Date(), paidAt: result.status === "PAID" ? new Date() : null, failureReason: result.failureReason } });
    if (result.status === "PAID") await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID" } });
    ok(res, { payment: updated });
  })
);
