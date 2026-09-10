import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/ApiError";

export const CART_PRODUCT_SELECT = {
  id: true, name: true, slug: true, sku: true, price: true, salePrice: true, stock: true, status: true,
  images: { where: { isPrimary: true }, select: { url: true } },
  category: { select: { name: true, slug: true } },
} as const;

export async function getCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      coupon: true,
      items: {
        include: { product: { select: CART_PRODUCT_SELECT }, variant: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { coupon: true, items: { include: { product: { select: CART_PRODUCT_SELECT }, variant: true } } },
    });
  }
  return cart;
}

/** Price snapshot logic — server-authoritative, product + variant aware. */
export async function cartWithTotals(cart: any) {
  const settings = await settingsMap();
  const freeThreshold = Number(settings.free_delivery_threshold || "3000");
  const baseCharge = Number(settings.delivery_charge || "70");

  let subTotal = 0;
  let originalTotal = 0;
  let unavailableCount = 0;

  const items = cart.items.map((item: any) => {
    const p = item.product;
    const inStock = (item.variant ? item.variant.stock : p.stock) >= item.quantity;
    if (!inStock) unavailableCount++;
    const unit = item.price; // snapshot
    const list = item.variant ? (item.variant.price ?? unit) : (p.price ?? unit);
    originalTotal += list * item.quantity;
    subTotal += unit * item.quantity;
    return {
      id: item.id,
      productId: p.id,
      slug: p.slug,
      name: p.name,
      image: p.images[0]?.url ?? "",
      variantId: item.variantId,
      variantLabel: item.variant ? `${item.variant.color ?? ""} / ${item.variant.size ?? "One Size"}`.replace(/^ \/ /, "").trim() : null,
      price: unit,
      listPrice: list,
      quantity: item.quantity,
      inStock,
      stockAvailable: item.variant ? item.variant.stock : p.stock,
      total: unit * item.quantity,
    };
  });

  const discountFromCoupon = cart.coupon ? await couponDiscount(cart.coupon, subTotal) : 0;
  const discounted = Math.max(0, subTotal - discountFromCoupon);
  const deliveryCharge = discounted >= freeThreshold ? 0 : baseCharge;
  const total = discounted + deliveryCharge;

  return {
    items,
    count: items.reduce((s: number, i: any) => s + i.quantity, 0),
    subtotal: Math.round(subTotal * 100) / 100,
    originalTotal: Math.round(originalTotal * 100) / 100,
    discount: Math.round(discountFromCoupon * 100) / 100,
    coupon: cart.coupon ? { code: cart.coupon.code, type: cart.coupon.type, value: cart.coupon.value } : null,
    deliveryCharge,
    freeDeliveryThreshold: freeThreshold,
    total: Math.round(total * 100) / 100,
    unavailableCount,
  };
}

async function couponDiscount(coupon: any, subTotal: number) {
  if (!coupon || coupon.type === "FIXED") return coupon ? Math.min(coupon.value, subTotal) : 0;
  const raw = subTotal * coupon.value / 100;
  return Math.min(raw, coupon.maxDiscount ?? raw);
}

export async function applyCouponToCart(cartId: string, userId: string, code: string) {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!coupon || !coupon.isActive) throw ApiError.badRequest("This coupon code is invalid.", "INVALID_COUPON");
  const now = new Date();
  if (coupon.startsAt > now) throw ApiError.badRequest("This coupon is not active yet.", "INVALID_COUPON");
  if (coupon.expiresAt < now) throw ApiError.badRequest("This coupon has expired.", "INVALID_COUPON");
  if (coupon.usageLimit && coupon.totalUsed >= coupon.usageLimit)
    throw ApiError.badRequest("This coupon has reached its usage limit.", "INVALID_COUPON");

  const usedByUser = await prisma.order.count({
    where: { userId, couponId: coupon.id, status: { notIn: ["CANCELLED", "RETURNED"] } },
  });
  if (usedByUser >= coupon.perUserLimit)
    throw ApiError.badRequest("You have already used this coupon.", "INVALID_COUPON");

  const cart = await prisma.cart.findUnique({ where: { id: cartId }, include: { items: true } });
  if (!cart) throw ApiError.notFound();
  const subTotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  if (subTotal < coupon.minOrderAmount)
    throw ApiError.badRequest(`This coupon requires a minimum order of ৳${coupon.minOrderAmount.toLocaleString()}`, "INVALID_COUPON");

  await prisma.cart.update({ where: { id: cartId }, data: { couponId: coupon.id } });
}

let _settings: Record<string, string> | null = null;
async function settingsMap() {
  if (_settings) return _settings;
  const rows = await prisma.siteSetting.findMany();
  _settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return _settings;
}