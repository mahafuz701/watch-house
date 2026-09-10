import { Request, Response } from "express";
import { Router } from "express";
import { optionalAuth } from "../../middleware/auth";
import { ok } from "../../utils/respond";
import { ah, ApiError } from "../../utils/ApiError";
import { prisma } from "../../db/prisma";
import { listProducts, serializeProduct, productInclude, ProductListQuery } from "./product.service";

export const productsRouter = Router();

const num = (v: unknown): number | undefined => (v === undefined || v === "") ? undefined : Number(v);
const bool = (v: unknown): boolean | undefined =>
  v === "true" || v === "1" ? true : v === "false" || v === "0" ? false : undefined;

function toQuery(q: Request["query"]): ProductListQuery {
  return {
    q: (q.q as string) || undefined,
    category: (q.category as string) || undefined,
    brand: (q.brand as string) || undefined,
    minPrice: (q.minPrice && num(q.minPrice)) || undefined,
    maxPrice: (q.maxPrice && num(q.maxPrice)) || undefined,
    rating: (q.rating && num(q.rating)) || undefined,
    inStock: bool(q.inStock),
    size: (q.size as string) || undefined,
    color: (q.color as string) || undefined,
    featured: bool(q.featured),
    bestSeller: bool(q.bestSeller),
    newArrival: bool(q.newArrival),
    flashSale: bool(q.flashSale),
    ids: (q.ids as string)?.split(",").filter(Boolean),
    sort: (q.sort as string) || "newest",
    page: (q.page && num(q.page)) || 1,
    perPage: (q.perPage && num(q.perPage)) || undefined,
    limit: (q.limit && num(q.limit)) || undefined,
  };
}

// GET /api/products — public list + filters
productsRouter.get(
  "/",
  optionalAuth,
  ah(async (req: Request, res: Response) => {
    const data = await listProducts(toQuery(req.query), req.user?.id);
    ok(res, data.items, { facets: data.facets, ...data.meta });
  })
);

// GET /api/products/suggestions?q=… — autocomplete
productsRouter.get(
  "/suggestions",
  ah(async (req: Request, res: Response) => {
    const q = (req.query.q as string) || "";
    if (q.trim().length < 2) return ok(res, { suggestions: [] });
    const items = await prisma.product.findMany({
      where: { status: "ACTIVE", OR: [{ name: { contains: q } }, { sku: { contains: q } }, { tags: { contains: q } }] },
      select: { id: true, name: true, slug: true, price: true, salePrice: true, images: { where: { isPrimary: true }, take: 1, select: { url: true } } },
      take: 8,
    });
    ok(res, {
      suggestions: items.map((p) => ({
        id: p.id, name: p.name, slug: p.slug,
        price: p.salePrice ?? p.price, listPrice: p.price, image: p.images[0]?.url,
      })),
    });
  })
);

// GET /api/products/featured
productsRouter.get(
  "/featured",
  optionalAuth,
  ah(async (req: Request, res: Response) => {
    const data = await listProducts({ featured: true, limit: 8, sort: "best_selling" }, req.user?.id);
    ok(res, data.items);
  })
);

// GET /api/products/best-sellers
productsRouter.get(
  "/best-sellers",
  optionalAuth,
  ah(async (req: Request, res: Response) => {
    const data = await listProducts({ bestSeller: true, limit: 8, sort: "best_selling" }, req.user?.id);
    ok(res, data.items);
  })
);

// GET /api/products/new-arrivals
productsRouter.get(
  "/new-arrivals",
  optionalAuth,
  ah(async (req: Request, res: Response) => {
    const data = await listProducts({ newArrival: true, limit: 8, sort: "newest" }, req.user?.id);
    ok(res, data.items);
  })
);

// GET /api/products/flash-sale
productsRouter.get(
  "/flash-sale",
  optionalAuth,
  ah(async (req: Request, res: Response) => {
    const data = await listProducts({ flashSale: true, limit: 8, sort: "best_selling" }, req.user?.id);
    ok(res, data.items);
  })
);
// GET /api/products/:slug — public product detail
productsRouter.get(
  "/:slug",
  optionalAuth,
  ah(async (req: Request, res: Response) => {
    if (req.params.slug === "suggestions" || req.params.slug === "featured") return;
    const product = await prisma.product.findFirst({
      where: { OR: [{ slug: req.params.slug }, { sku: req.params.slug }], status: "ACTIVE" },
      include: productInclude(req.user?.id),
    });
    if (!product) throw ApiError.notFound("Product not found.");

    const reviews = await prisma.review.findMany({
      where: { productId: product.id, status: "APPROVED" },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
    const related = await prisma.product.findMany({
      where: { status: "ACTIVE", categoryId: product.categoryId, id: { not: product.id } },
      include: productInclude(req.user?.id),
      take: 4,
    });
    const counts = await prisma.review.groupBy({
      by: ["rating"],
      where: { productId: product.id, status: "APPROVED" },
      _count: { id: true },
    });
    const map = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>;
    for (const c of counts) map[c.rating] = c._count.id;

    ok(res, {
      product: {
        ...serializeProduct(product),
        description: product.description,
        sku: product.sku,
        weight: product.weight,
        weightUnit: product.weightUnit,
        dimensions: { length: product.length, width: product.width, height: product.height },
        variants: product.variants,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
        reviews: reviews.map((r) => ({
          id: r.id, rating: r.rating, title: r.title, body: r.body, images: r.images,
          author: r.user.name, createdAt: r.createdAt,
        })),
        reviewSummary: { average: product.rating, count: product.reviewCount, ratingBreakdown: Object.entries(map).map(([stars, count]) => ({ stars: Number(stars), count })) },
      },
      related: related.map((p) => serializeProduct(p)),
    });
  })
);

// GET /api/products/recommended
productsRouter.get(
  "/recommended",
  optionalAuth,
  ah(async (req: Request, res: Response) => {
    const data = await listProducts({ limit: 8, sort: "best_selling" }, req.user?.id);
    ok(res, data.items);
  })
);