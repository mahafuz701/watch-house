import { Request, Response } from "express";
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { ok } from "../../utils/respond";
import { ah, ApiError } from "../../utils/ApiError";
import { prisma } from "../../db/prisma";
import { getCart, applyCouponToCart, cartWithTotals } from "./cart.service";

export const cartRouter = Router();
cartRouter.use(requireAuth);

// GET /api/cart
cartRouter.get(
  "/",
  ah(async (req: Request, res: Response) => {
    const cart = await getCart(req.user!.id);
    ok(res, cartWithTotals(cart));
  })
);

// POST /api/cart/items  { productId, variantId?, quantity }
cartRouter.post(
  "/items",
  ah(async (req: Request, res: Response) => {
    const { productId, variantId, quantity = 1 } = req.body;
    if (!productId) throw ApiError.badRequest("productId is required.");
    const qty = Math.max(1, Math.min(99, Number(quantity)));

    const product = await prisma.product.findFirst({ where: { id: productId, status: "ACTIVE" } });
    if (!product) throw ApiError.notFound("Product not found.");

    let variant = null;
    if (variantId) {
      variant = await prisma.productVariant.findFirst({ where: { id: variantId, productId, status: "ACTIVE" } });
      if (!variant) throw ApiError.notFound("This product option is no longer available.");
    }

    const cart = await getCart(req.user!.id);
    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId, variantId: variantId || null },
    });
    const price = variant ? (variant.salePrice ?? variant.price) : (product.salePrice ?? product.price);
    const available = variant ? variant.stock : product.stock;

    if (existing) {
      const newQty = Math.min(existing.quantity + qty, Math.max(1, available));
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: newQty, price } });
    } else {
      if (available < qty) throw ApiError.badRequest(`Only ${Math.max(0, available)} unit(s) in stock.`, "OUT_OF_STOCK");
      await prisma.cartItem.create({ data: { cartId: cart.id, productId, variantId: variantId || null, quantity: qty, price } });
    }
    const fresh = await getCart(req.user!.id);
    ok(res, cartWithTotals(fresh), undefined, 201);
  })
);

// PATCH /api/cart/items/:id  { quantity }
cartRouter.patch(
  "/items/:id",
  ah(async (req: Request, res: Response) => {
    const cart = await getCart(req.user!.id);
    const item = await prisma.cartItem.findFirst({ where: { id: req.params.id, cartId: cart.id } });
    if (!item) throw ApiError.notFound("Cart item not found.");

    const maxStock = await stockFor(item);
    const qty = Math.max(0, Math.min(99, Number(req.body.quantity)));
    if (qty === 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      if (maxStock < qty) throw ApiError.badRequest(`Only ${Math.max(0, maxStock)} units available.`, "OUT_OF_STOCK");
      await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: qty } });
    }
    const fresh = await getCart(req.user!.id);
    ok(res, cartWithTotals(fresh));
  })
);

// DELETE /api/cart/items/:id
cartRouter.delete(
  "/items/:id",
  ah(async (req: Request, res: Response) => {
    const cart = await getCart(req.user!.id);
    const item = await prisma.cartItem.findFirst({ where: { id: req.params.id, cartId: cart.id } });
    if (!item) throw ApiError.notFound("Cart item not found.");
    await prisma.cartItem.delete({ where: { id: item.id } });
    const fresh = await getCart(req.user!.id);
    ok(res, cartWithTotals(fresh));
  })
);

// POST /api/cart/coupon  { code }
cartRouter.post(
  "/coupon",
  ah(async (req: Request, res: Response) => {
    const cart = await getCart(req.user!.id);
    const { code, remove } = req.body;
    if (remove) {
      await prisma.cart.update({ where: { id: cart.id }, data: { couponId: null } });
      const fresh = await getCart(req.user!.id);
      return ok(res, cartWithTotals(fresh));
    }
    await applyCouponToCart(cart.id, req.user!.id, code);
    const fresh = await getCart(req.user!.id);
    ok(res, cartWithTotals(fresh));
  })
);

async function stockFor(item: { productId: string; variantId: string | null }) {
  if (item.variantId) {
    const v = await prisma.productVariant.findUnique({ where: { id: item.variantId } });
    return v?.stock ?? 0;
  }
  const p = await prisma.product.findUnique({ where: { id: item.productId } });
  return p?.stock ?? 0;
}