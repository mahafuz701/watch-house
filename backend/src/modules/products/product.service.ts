import { prisma } from "../../db/prisma";
import { Prisma } from "@prisma/client";
import { paginate, clamp } from "../../utils/helpers";

export const productInclude = (wishlistUserId?: string) =>
  ({
    category: { select: { id: true, name: true, slug: true } },
    brand: { select: { id: true, name: true, slug: true } },
    images: { select: { id: true, url: true, alt: true, sortOrder: true, isPrimary: true }, orderBy: { sortOrder: "asc" as const } },
    variants: {
      where: { status: "ACTIVE" },
      select: { id: true, size: true, color: true, colorHex: true, price: true, salePrice: true, stock: true },
      orderBy: { price: "asc" as const },
    },
    ...(wishlistUserId
      ? { wishlistItems: { where: { wishlist: { userId: wishlistUserId } }, select: { id: true } } }
      : {}),
  });

export function serializeProduct(p: any, baseUrl = "") {
  const primary = p.images?.find((i: any) => i.isPrimary) || p.images?.[0];
  const variants = p.variants || [];
  let stock = p.stock;
  for (const v of variants) stock = Math.max(stock, v.stock);

  let minVariant = null;
  if (variants.length) {
    minVariant = [...variants].sort((a: any, b: any) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price))[0];
  }
  const effectivePrice = minVariant ? (minVariant.salePrice ?? minVariant.price) : (p.salePrice ?? p.price);
  const listPrice = minVariant ? minVariant.price : p.price;
  const discountPercent = Math.round(((listPrice - effectivePrice) / listPrice) * 100);
  const toUrl = (u: string) => (u || "").startsWith("/") ? `${baseUrl}${u}` : u;

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    shortDescription: p.shortDescription,
    price: effectivePrice,
    listPrice,
    discountPercent,
    currency: "BDT",
    image: toUrl(primary?.url || ""),
    gallery: (p.images || []).map((i: any) => toUrl(i.url)),
    category: p.category,
    brand: p.brand,
    tags: p.tags ? p.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
    rating: p.rating,
    reviewCount: p.reviewCount,
    stock,
    inStock: stock > 0,
    isFeatured: p.isFeatured,
    isBestSeller: p.isBestSeller,
    isNewArrival: p.isNewArrival,
    hasVariants: variants.length > 0,
    variantCount: variants.length,
    inWishlist: !!(p.wishlistItems && p.wishlistItems.length > 0),
  };
}

export interface ProductListQuery {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  size?: string;
  color?: string;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  flashSale?: boolean;
  sort?: string;
  page?: number;
  perPage?: number;
  limit?: number;
  wishlistOnly?: boolean;
  ids?: string[];
}

export function buildProductWhere(q: ProductListQuery): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { status: "ACTIVE" };
  const and: Prisma.ProductWhereInput[] = [];

  if (q.ids && q.ids.length) and.push({ id: { in: q.ids } });
  if (q.featured) and.push({ isFeatured: true });
  if (q.bestSeller) and.push({ isBestSeller: true });
  if (q.newArrival) and.push({ isNewArrival: true });
  if (q.flashSale) and.push({ salePrice: { not: null } });
  if (q.inStock) and.push({ OR: [{ stock: { gt: 0 } }, { variants: { some: { stock: { gt: 0 }, status: "ACTIVE" } } }] });
  if (q.category) and.push({ category: { slug: q.category } });
  if (q.brand) and.push({ brand: { slug: q.brand } });
  if (q.minPrice !== undefined || q.maxPrice !== undefined) {
    const range: Prisma.FloatFilter = {};
    if (q.minPrice !== undefined) range.gte = q.minPrice;
    if (q.maxPrice !== undefined) range.lte = q.maxPrice;
    and.push({ OR: [{ price: range }, { salePrice: range }] });
  }
  if (q.rating && q.rating > 0) and.push({ rating: { gte: q.rating } });
  if (q.size || q.color) {
    const vq: Prisma.ProductVariantWhereInput = { status: "ACTIVE", stock: { gt: 0 } };
    if (q.size) vq.size = q.size;
    if (q.color) vq.color = q.color;
    and.push({ variants: { some: vq } });
  }
  if (q.q && q.q.trim()) {
    const term = q.q.trim();
    and.push({
      OR: [
        { name: { contains: term } },
        { sku: { contains: term } },
        { tags: { contains: term } },
        { category: { name: { contains: term } } },
        { brand: { name: { contains: term } } },
      ],
    });
  }
  if (and.length) where.AND = and;
  return where;
}