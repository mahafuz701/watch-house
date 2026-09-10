import { Request, Response } from "express";
import { Router } from "express";
import { requireAuth, optionalAuth } from "../../middleware/auth";
import { ok } from "../../utils/respond";
import { ah, ApiError } from "../../utils/ApiError";
import { prisma } from "../../db/prisma";
import { serializeProduct, productInclude } from "../products/product.service";

export const wishlistRouter = Router();

// GET /api/wishlist — user wishlist (auth) OR guest by ?ids=
wishlistRouter.get(
  "/",
  optionalAuth,
  ah(async (req: Request, res: Response) => {
    if (req.user) {
      const wishlist = await prisma.wishlist.findUnique({
        where: { userId: req.user.id },
        include: { items: { include: { product: { include: productInclude() }, variant: true }, orderBy: { createdAt: "desc" } } },
      });
      ok(res, {
        items: (wishlist?.items || []).map((i: any) => ({
          id: i.id, product: serializeProduct(i.product), variant: i.variant ? { id: i.variant.id, color: i.variant.color, size: i.variant.size } : null,
        })),
      });
    } else {
      const ids = ((req.query.ids as string) || "").split(",").filter(Boolean);
      const products = ids.length ? await prisma.product.findMany({ where: { id: { in: ids }, status: "ACTIVE" }, include: productInclude() }) : [];
      ok(res, { items: products.map((p) => ({ id: p.id, product: serializeProduct(p) })) });
    }
  })
);

// POST /api/wishlist/items  { productId, variantId? }
wishlistRouter.post(
  "/items",
  requireAuth,
  ah(async (req: Request, res: Response) => {
    const { productId, variantId } = req.body;
    const product = await prisma.product.findFirst({ where: { id: productId, status: "ACTIVE" } });
    if (!product) throw ApiError.notFound("Product not found.");
    const wishlist = await prisma.wishlist.upsert({
      where: { userId: req.user!.id },
      update: {},
      create: { userId: req.user!.id },
    });
    const existing = await prisma.wishlistItem.findFirst({ where: { wishlistId: wishlist.id, productId, variantId: variantId || null } });
    if (!existing) {
      await prisma.wishlistItem.create({ data: { wishlistId: wishlist.id, productId, variantId: variantId || null } });
    }
    const count = await prisma.wishlistItem.count({ where: { wishlistId: wishlist.id } });
    ok(res, { saved: true, count }, undefined, 201);
  })
);

// DELETE /api/wishlist/items/:id
wishlistRouter.delete(
  "/items/:id",
  requireAuth,
  ah(async (req: Request, res: Response) => {
    const wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user!.id } });
    const item = wishlist ? await prisma.wishlistItem.findFirst({ where: { id: req.params.id, wishlistId: wishlist.id } }) : null;
    if (!item) throw ApiError.notFound("Wishlist item not found.");
    await prisma.wishlistItem.delete({ where: { id: item.id } });
    const count = await prisma.wishlistItem.count({ where: { wishlistId: wishlist.id } });
    ok(res, { removed: true, count });
  })
);

// DELETE /api/wishlist/items/by-product/:productId
wishlistRouter.delete(
  "/items/by-product/:productId",
  requireAuth,
  ah(async (req: Request, res: Response) => {
    const wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user!.id } });
    if (wishlist) {
      await prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id, productId: req.params.productId } });
    }
    ok(res, { removed: true });
  })
);