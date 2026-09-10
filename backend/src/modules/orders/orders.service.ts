import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/ApiError";
import { generateOrderNumber, money } from "../../utils/helpers";
import { processOrderPayment } from "../../services/payment";
import { notifyUser, notifyAdmins } from "../../services/notification.service";

export interface CheckoutInput {
  shipFullName: string;
  shipPhone: string;
  shipEmail?: string;
  shipDivision: string;
  shipDistrict: string;
  shipArea: string;
  shipFullAddress: string;
  paymentMethod: "COD" | "BKASH" | "NAGAD" | "CARD";
  note?: string;
}

const CUSTOMER_CANCELLABLE = new Set(["PENDING", "CONFIRMED", "PROCESSING"]);

export async function checkout(userId: string, input: CheckoutInput) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      coupon: true,
      items: {
        include: {
          product: {
            select: {
              id: true, name: true, sku: true, price: true, salePrice: true, stock: true, status: true,
              images: { where: { isPrimary: true }, select: { url: true } },
            },
          },
          variant: true,
        },
      },
    },
  });
  if (!cart || cart.items.length === 0) throw ApiError.badRequest("Your cart is empty.", "EMPTY_CART");

  // Validate every item is still purchasable & in stock
  for (const item of cart.items) {
    if (item.product.status !== "ACTIVE") throw ApiError.badRequest(`"${item.product.name}" is no longer available.`, "PRODUCT_UNAVAILABLE");
    const available = item.variant ? item.variant.stock : item.product.stock;
    if (available < item.quantity) {
      throw ApiError.badRequest(`Only ${Math.max(0, available)} unit(s) of "${item.product.name}" are in stock. Please adjust your cart.`, "OUT_OF_STOCK");
    }
  }

  // Server-authoritative totals
  let subTotal = 0;
  for (const i of cart.items) subTotal += i.price * i.quantity;
  let discount = 0;
  if (cart.coupon) {
    discount = cart.coupon.type === "PERCENT"
      ? Math.min(subTotal * cart.coupon.value / 100, cart.coupon.maxDiscount ?? subTotal)
      : Math.min(cart.coupon.value, subTotal);
  }
  const discounted = Math.max(0, subTotal - discount);
  const deliveryCharge = discounted >= 3000 ? 0 : 70;
  const total = money(discounted + deliveryCharge);

  const orderNumber = generateOrderNumber();
  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId,
      status: "PENDING",
      subTotal: money(subTotal),
      discount: money(discount),
      deliveryCharge,
      total,
      couponId: cart.coupon?.id || null,
      couponCode: cart.coupon?.code || null,
      note: input.note?.slice(0, 500) || null,
      shipFullName: input.shipFullName,
      shipPhone: input.shipPhone,
      shipEmail: input.shipEmail || null,
      shipDivision: input.shipDivision,
      shipDistrict: input.shipDistrict,
      shipArea: input.shipArea,
      shipFullAddress: input.shipFullAddress,
      items: {
        create: cart.items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          productName: i.product.name,
          productSku: i.product.sku,
          imageUrl: i.product.images?.[0]?.url ?? "",
          variantLabel: i.variant ? `${i.variant.color} / ${i.variant.size}` : null,
          unitPrice: i.price,
          quantity: i.quantity,
          total: money(i.price * i.quantity),
        })),
      },
    },
  });

  // Decrement stock + bump sales
  for (const i of cart.items) {
    if (i.variantId) {
      await prisma.productVariant.update({ where: { id: i.variantId }, data: { stock: { decrement: i.quantity } } });
    }
    await prisma.product.update({
      where: { id: i.productId },
      data: { stock: { decrement: i.quantity } },
    });
  }

  return order;
}