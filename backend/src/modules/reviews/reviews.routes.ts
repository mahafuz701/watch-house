import { Request, Response, Router } from "express";
import { requireAuth, optionalAuth } from "../../middleware/auth";
import { ah, ApiError } from "../../utils/ApiError";
import { ok } from "../../utils/respond";
import { prisma } from "../../db/prisma";

export const reviewsRouter = Router();

reviewsRouter.get(
  "/product/:productId",
  optionalAuth,
  ah(async (req: Request, res: Response) => {
    const reviews = await prisma.review.findMany({ where: { productId: req.params.productId, status: "APPROVED" }, include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } });
    ok(res, { reviews });
  })
);

reviewsRouter.post(
  "/",
  requireAuth,
  ah(async (req: Request, res: Response) => {
    const { productId, orderId, rating, title, body, images = "" } = req.body;
    if (!productId || !body || !Number.isInteger(rating) || rating < 1 || rating > 5) throw ApiError.badRequest("productId, body, and a rating from 1 to 5 are required.");
    const review = await prisma.review.create({ data: { userId: req.user!.id, productId, orderId: orderId || null, rating, title: title || null, body, images } });
    ok(res, { review }, undefined, 201);
  })
);
