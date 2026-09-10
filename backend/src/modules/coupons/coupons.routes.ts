import { Request, Response, Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { ah, ApiError } from "../../utils/ApiError";
import { ok } from "../../utils/respond";
import { prisma } from "../../db/prisma";

export const couponsRouter = Router();

couponsRouter.get(
  "/:code",
  requireAuth,
  ah(async (req: Request, res: Response) => {
    const coupon = await prisma.coupon.findUnique({ where: { code: req.params.code.trim().toUpperCase() } });
    const now = new Date();
    if (!coupon || !coupon.isActive || coupon.startsAt > now || coupon.expiresAt < now) throw ApiError.notFound("Coupon is not available.");
    ok(res, { coupon: { code: coupon.code, type: coupon.type, value: coupon.value, minOrderAmount: coupon.minOrderAmount, maxDiscount: coupon.maxDiscount } });
  })
);
