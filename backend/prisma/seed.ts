// ═══════════════════════════════════════════════════════════════════════
// TUHIN WATCH HOUSE — Database Seed
// Creates realistic demo data: users, categories, brands, 32 products,
// variants, coupons, orders in every status, reviews, notifications.
// Run: npm run seed  (or `npm run db:seed` from the repo root)
// ═══════════════════════════════════════════════════════════════════════

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── helpers ─────────────────────────────────────────────────────────────
const slugify = (s) =>
  s.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

const daysFromNow = (d) => new Date(Date.now() + d * 86400000);
const img = (n) => `/uploads/products/${n}.jpg`;

const PASSWORD = "Password123!";
const desc = (name) =>
  `${name} — engineered for precision and designed for elegance. Every piece is crafted with a Japanese quartz movement or Swiss-grade automatic calibre, sapphire-coated crystal, and a stainless-steel or Italian-leather finish. Water resistant to 5 ATM with a 2-year international warranty. Perfect for daily wear, business, and special occasions.`;

// ─── seed data ───────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: "Men's Collection", slug: "mens-collection", sortOrder: 1, imageUrl: img("cat-1"), description: "Bold, rugged and refined timepieces for men." },
  { name: "Women's Collection", slug: "womens-collection", sortOrder: 2, imageUrl: img("cat-2"), description: "Elegant watches designed for the modern woman." },
  { name: "Smart Watches", slug: "smart-watches", sortOrder: 3, imageUrl: img("cat-3"), description: "Stay connected with health, fitness and notifications." },
  { name: "Luxury", slug: "luxury", sortOrder: 4, imageUrl: img("cat-4"), description: "Premium materials, limited editions, timeless class." },
  { name: "Sports", slug: "sports", sortOrder: 5, imageUrl: img("cat-5"), description: "For athletes and adventurers. Built to perform." },
  { name: "Classic & Dress", slug: "classic-dress", sortOrder: 6, imageUrl: img("cat-6"), description: "Clean dials and sophisticated straps for formal wear." },
  { name: "Casual", slug: "casual", sortOrder: 7, imageUrl: img("cat-7"), description: "Everyday pieces that pair with anything." },
  { name: "Chronograph", slug: "chronograph", sortOrder: 8, imageUrl: img("cat-8"), description: "Stopwatch functions meet multi-subdial precision." },
];

const BRANDS = [
  { name: "Aurora", slug: "aurora", imageUrl: img("brand-1"), description: "Swiss-inspired elegance since 1998." },
  { name: "Chronos", slug: "chronos", imageUrl: img("brand-2"), description: "Precision chronographs for the connoisseur." },
  { name: "Lumina", slug: "lumina", imageUrl: img("brand-3"), description: "Watches that glow with quiet confidence." },
  { name: "Meridian", slug: "meridian", imageUrl: img("brand-4"), description: "World-time mastery and travel companions." },
  { name: "Novane", slug: "novane", imageUrl: img("brand-5"), description: "Sporty performance for active lifestyles." },
  { name: "Vertex", slug: "vertex", imageUrl: img("brand-6"), description: "Minimalist design, maximum legibility." },
  { name: "TimeCraft", slug: "timecraft", imageUrl: img("brand-7"), description: "Heritage craftsmanship, modern reliability." },
  { name: "Zenitha", slug: "zenitha", imageUrl: img("brand-8"), description: "Luxury Swiss movements, hand-finished." },
// size, color, hex, price, salePrice, stock
const V = (...rows) => rows.map((r) => ({ size: r[0], color: r[1], colorHex: r[2], price: r[3], salePrice: r[4], stock: r[5] }));

const PRODUCTS = [
  {
    name: "Aurora Heritage Automatic 42mm",
    category: "Men's Collection", brand: "Aurora", price: 24800, salePrice: 19600,
    stock: 18, images: [1, 2, 3], featured: true, best: true, tags: "automatic,luxury,men",
    variants: V(["42mm", "Black", "#1F2937", 24800, 19600, 8], ["42mm", "Silver", "#C0C0C0", 24800, 19600, 6], ["40mm", "Black", "#1F2937", 23800, 18800, 4]),
  },
  {
    name: "Lumina Rose Gold Mesh 38mm",
    category: "Women's Collection", brand: "Lumina", price: 15800, salePrice: 12600,
    stock: 24, images: [4, 5, 6], featured: true, best: true, tags: "rose-gold,mesh,women",
    variants: V(["38mm", "Rose Gold", "#B76E79", 15800, 12600, 12], ["36mm", "Rose Gold", "#B76E79", 14800, 11800, 12]),
  },
  {
    name: "Vertex Minimalist Quartz 40mm",
    category: "Classic & Dress", brand: "Vertex", price: 8900, salePrice: 7490,
    stock: 42, images: [7, 8, 9], featured: true, best: true, tags: "minimal,quartz,unisex",
    variants: V(["40mm", "Silver", "#C0C0C0", 8900, 7490, 20], ["40mm", "Gold", "#D4AF37", 9200, 7690, 12], ["36mm", "Silver", "#C0C0C0", 8400, 7090, 10]),
  },
  {
    name: "Chronos Racing Chronograph 44mm",
    category: "Chronograph", brand: "Chronos", price: 19800, salePrice: null,
    stock: 12, images: [10, 11, 12], featured: true, best: false, tags: "chronograph,sport,racing",
    variants: V(["44mm", "Black", "#111827", 19800, null, 6], ["44mm", "Steel", "#71717A", 19800, null, 6]),
  },
  {
    name: "Zenitha Royal Automatic 41mm",
    category: "Luxury", brand: "Zenitha", price: 64500, salePrice: 54900,
    stock: 5, images: [13, 14, 15], featured: true, best: false, tags: "luxury,automatic,limited",
    variants: V(["41mm", "Gold", "#D4AF37", 68000, 57900, 2], ["41mm", "Steel", "#9CA3AF", 64500, 54900, 3]),
  },
  {
    name: "Novane Fitness Pro Smart Watch",
    category: "Smart Watches", brand: "Novane", price: 12500, salePrice: 9900,
    stock: 60, images: [16, 17, 18], featured: true, best: true, tags: "smart,amoled,fitness",
    variants: V(["46mm", "Black", "#111827", 12900, 9900, 30], ["46mm", "Silver", "#CBD5E1", 12500, 9900, 30]),
  },
  {
    name: "Meridian GMT World Timer 43mm",
    category: "Men's Collection", brand: "Meridian", price: 28600, salePrice: null,
    stock: 15, images: [19, 20, 21], featured: true, best: false, tags: "gmt,world-timer,travel",
    variants: V(["43mm", "Blue", "#2563EB", 28600, null, 8], ["43mm", "Black", "#111827", 28600, null, 7]),
  },
  {
    name: "TimeCraft Classic Leather 39mm",
    category: "Classic & Dress", brand: "TimeCraft", price: 11900, salePrice: 8990,
    stock: 38, images: [22, 23, 24], featured: true, best: true, tags: "leather,classic,dress",
    variants: V(["39mm", "Brown", "#92400E", 11900, 8990, 15], ["39mm", "Black", "#1F2937", 11900, 8990, 13], ["41mm", "Brown", "#92400E", 12400, 9490, 10]),
  },
];
{
    name: "Aurora Silk Datejust 36mm",
    category: "Women's Collection", brand: "Aurora", price: 21800, salePrice: 17400,
    stock: 9, images: [25, 26, 27], featured: false, best: true, tags: "datejust,women,elegant",
    variants: V(["36mm", "White", "#F3F4F6", 21800, 17400, 5], ["36mm", "Champagne", "#E7C9A9", 22400, 17900, 4]),
  },
  {
    name: "Novane Aqua Diver 45mm",
    category: "Sports", brand: "Novane", price: 21900, salePrice: 17900,
    stock: 21, images: [28, 29, 30], featured: false, best: true, tags: "diver,sport,water",
    variants: V(["45mm", "Blue", "#1E3A8A", 21900, 17900, 11], ["45mm", "Black", "#111827", 21900, 17900, 10]),
  },
  {
    name: "Vertex Mono Automatic 38mm",
    category: "Casual", brand: "Vertex", price: 14900, salePrice: null,
    stock: 26, images: [31, 32, 33], featured: false, best: false, tags: "minimal,automatic,casual",
    variants: V(["38mm", "Black", "#111827", 14900, null, 14], ["38mm", "Ivory", "#F8F5F0", 14900, null, 12]),
  },
  {
    name: "Chronos Pilot GMT 42mm",
    category: "Men's Collection", brand: "Chronos", price: 31500, salePrice: 25900,
    stock: 8, images: [34, 35, 36], featured: false, best: true, tags: "pilot,gmt,military",
    variants: V(["42mm", "Green", "#166534", 31500, 25900, 4], ["42mm", "Black", "#111827", 31500, 25900, 4]),
  },
  {
    name: "Lumina Pearl Mini 30mm",
    category: "Women's Collection", brand: "Lumina", price: 9900, salePrice: 8490,
    stock: 33, images: [37, 38, 39], featured: false, best: false, tags: "mini,pearl,women",
    variants: V(["30mm", "White", "#F3F4F6", 9900, 8490, 17], ["30mm", "Pink", "#F9A8D4", 10200, 8690, 16]),
  },
  {
    name: "Zenitha Grand Automatique 40mm",
    category: "Luxury", brand: "Zenitha", price: 98000, salePrice: 84000,
    stock: 3, images: [40, 41, 42], featured: false, best: false, tags: "luxury,premium,limited",
    variants: V(["40mm", "Rose Gold", "#B76E79", 102000, 88000, 1], ["40mm", "Gold", "#D4AF37", 98000, 84000, 2]),
  },
  {
    name: "Novane Pulse HR Sport 47mm",
    category: "Sports", brand: "Novane", price: 17900, salePrice: 13900,
    stock: 16, images: [43, 44, 45], featured: false, best: false, tags: "sport,hr,durable",
    variants: V(["47mm", "Neon", "#22C55E", 17900, 13900, 8], ["47mm", "Black", "#111827", 17900, 13900, 8]),
  },
  {
    name: "Meridian Ocean Blue 39mm",
    category: "Casual", brand: "Meridian", price: 13500, salePrice: 10800,
    stock: 29, images: [46, 47, 48], featured: false, best: false, tags: "casual,ocean,blue",
    variants: V(["39mm", "Blue", "#3B82F6", 13500, 10800, 15], ["39mm", "Teal", "#14B8A6", 13900, 11100, 14]),
  },
];
{
    name: "TimeCraft Steel Bracelet 41mm",
    category: "Men's Collection", brand: "TimeCraft", price: 16800, salePrice: 12900,
    stock: 22, images: [49, 50, 51], featured: false, best: true, tags: "steel,bracelet,daily",
    variants: V(["41mm", "Steel", "#CBD5E1", 16800, 12900, 12], ["41mm", "Black", "#1F2937", 16800, 12900, 10]),
  },
  {
    name: "Aurora Diamond Petite 28mm",
    category: "Women's Collection", brand: "Aurora", price: 26900, salePrice: 22900,
    stock: 7, images: [52, 53, 54], featured: false, best: false, tags: "diamond,luxury,women",
    variants: V(["28mm", "Silver", "#E5E7EB", 26900, 22900, 4], ["28mm", "Gold", "#D4AF37", 27900, 23900, 3]),
  },
  {
    name: "Vertex Tidesk Quartz 41mm",
    category: "Casual", brand: "Vertex", price: 9900, salePrice: 8490,
    stock: 44, images: [55, 56, 57], featured: false, best: false, tags: "casual,minimal",
    variants: V(["41mm", "Sand", "#D6C7A8", 9900, 8490, 22], ["41mm", "Navy", "#1E3A8A", 10200, 8690, 22]),
  },
  {
    name: "Chronos Steel Chrono 43mm",
    category: "Chronograph", brand: "Chronos", price: 22400, salePrice: 18400,
    stock: 11, images: [58, 59, 60], featured: false, best: false, tags: "chronograph,steel",
    variants: V(["43mm", "Steel", "#CBD5E1", 22400, 18400, 6], ["43mm", "Black", "#111827", 22400, 18400, 5]),
  },
  {
    name: "Novane Fit Band 2",
    category: "Smart Watches", brand: "Novane", price: 5900, salePrice: 4490,
    stock: 75, images: [61, 62, 63], featured: false, best: true, tags: "smart,fitness,band",
    variants: V(["One Size", "Black", "#111827", 5900, 4490, 40], ["One Size", "Pink", "#F9A8D4", 5900, 4490, 35]),
  },
  {
    name: "Lumina Aurora Gleam 35mm",
    category: "Women's Collection", brand: "Lumina", price: 13900, salePrice: 10900,
    stock: 19, images: [64, 65, 66], featured: false, best: false, tags: "women,gleam,quartz",
    variants: V(["35mm", "Gold", "#D4AF37", 13900, 10900, 10], ["35mm", "Silver", "#E5E7EB", 13900, 10900, 9]),
  },
  {
    name: "Zenitha Skeleton Tourbillon 42mm",
    category: "Luxury", brand: "Zenitha", price: 145000, salePrice: null,
    stock: 2, images: [67, 68, 69], featured: false, best: false, tags: "tourbillon,skeleton,luxury",
    variants: V(["42mm", "Rose Gold", "#B76E79", 149000, null, 1], ["42mm", "Steel", "#CBD5E1", 145000, null, 1]),
  },
  {
    name: "TimeCraft Vintage Auto 37mm",
    category: "Classic & Dress", brand: "TimeCraft", price: 21400, salePrice: 18200,
    stock: 13, images: [70, 71, 72], featured: false, best: false, tags: "vintage,automatic,dress",
    variants: V(["37mm", "Cream", "#F1E5C8", 21400, 18200, 7], ["37mm", "Black", "#111827", 21400, 18200, 6]),
  },
  {
    name: "Meridian Compass Outdoor 44mm",
    category: "Sports", brand: "Meridian", price: 19900, salePrice: 15900,
    stock: 14, images: [73, 74, 75], featured: false, best: false, tags: "outdoor,compass,sport",
    variants: V(["44mm", "Green", "#166534", 19900, 15900, 7], ["44mm", "Orange", "#EA580C", 19900, 15900, 7]),
  },
];
{
    name: "Vertex Dual Tone 40mm",
    category: "Casual", brand: "Vertex", price: 12900, salePrice: 9990,
    stock: 27, images: [76, 77, 78], featured: false, best: false, tags: "dual-tone,casual",
    variants: V(["40mm", "Gold/Steel", "#C9A227", 12900, 9990, 14], ["40mm", "Steel", "#CBD5E1", 12500, 9790, 13]),
  },
  {
    name: "Chronos Aviation Navitimer 46mm",
    category: "Chronograph", brand: "Chronos", price: 38500, salePrice: 29900,
    stock: 6, images: [79, 80, 81], featured: false, best: false, tags: "aviation,navitimer,chronograph",
    variants: V(["46mm", "Black", "#111827", 38500, 29900, 3], ["46mm", "Steel", "#CBD5E1", 38500, 29900, 3]),
  },
  {
    name: "Novane Sea Master Eco 42mm",
    category: "Sports", brand: "Novane", price: 16400, salePrice: 12900,
    stock: 20, images: [82, 83, 84], featured: false, best: false, tags: "eco,sport,sea",
    variants: V(["42mm", "Green", "#2E7D32", 16400, 12900, 10], ["42mm", "Grey", "#6B7280", 16400, 12900, 10]),
  },
  {
    name: "Aurora Moonphase 39mm",
    category: "Classic & Dress", brand: "Aurora", price: 32800, salePrice: 26900,
    stock: 10, images: [85, 86, 87], featured: false, best: false, tags: "moonphase,classic",
    variants: V(["39mm", "Silver", "#E5E7EB", 32800, 26900, 5], ["39mm", "Blue", "#2563EB", 32800, 26900, 5]),
  },
  {
    name: "Zenitha Quartz Regent 34mm",
    category: "Women's Collection", brand: "Zenitha", price: 29800, salePrice: 24900,
    stock: 8, images: [88, 89, 90], featured: false, best: false, tags: "regent,women,luxury",
    variants: V(["34mm", "White", "#F3F4F6", 29800, 24900, 4], ["34mm", "Blue", "#3B82F6", 29800, 24900, 4]),
  },
  {
    name: "Lumina Solaris Unisex 36mm",
    category: "Casual", brand: "Lumina", price: 11400, salePrice: 9490,
    stock: 31, images: [91, 92, 93], featured: false, best: false, tags: "unisex,solaris",
    variants: V(["36mm", "Silver", "#E5E7EB", 11400, 9490, 16], ["36mm", "Black", "#1F2937", 11400, 9490, 15]),
  },
  {
    name: "Meridian Heritage Bronze 40mm",
    category: "Men's Collection", brand: "Meridian", price: 23900, salePrice: 19900,
    stock: 12, images: [94, 95, 96], featured: false, best: false, tags: "bronze,heritage,men",
    variants: V(["40mm", "Bronze", "#A97142", 23900, 19900, 6], ["40mm", "Green", "#14532D", 23900, 19900, 6]),
  },
];

const COUPONS = [
  { code: "WELCOME10", type: "PERCENT", value: 10, minOrderAmount: 2000, maxDiscount: 1000, perUserLimit: 1, active: true, startsIn: -30, expiresIn: 335 },
  { code: "SAVE500", type: "FIXED", value: 500, minOrderAmount: 5000, perUserLimit: 2, active: true, startsIn: -15, expiresIn: 30 },
  { code: "FLASH20", type: "PERCENT", value: 20, minOrderAmount: 3000, maxDiscount: 1500, perUserLimit: 1, active: true, startsIn: -2, expiresIn: 2 },
  { code: "WINTER15", type: "PERCENT", value: 15, minOrderAmount: 4000, maxDiscount: 2000, perUserLimit: 3, active: true, startsIn: -60, expiresIn: 120 },
  { code: "MEGA1500", type: "FIXED", value: 1500, minOrderAmount: 15000, perUserLimit: 1, active: true, startsIn: -5, expiresIn: 5 },
];
// ═══════════════════════════════════════════════════════════════════════
// Seed execution
// ═══════════════════════════════════════════════════════════════════════

async function seedUsers() {
  const hash = await bcrypt.hash(PASSWORD, 10);
  const users = [
    { name: "Tuhin Admin", email: "admin@tuhinwatch.com", phone: "+8801711000001", role: "ADMIN" },
    { name: "Rahim Uddin", email: "customer@tuhinwatch.com", phone: "+8801711000002", role: "CUSTOMER" },
    { name: "Ayesha Siddiqua", email: "ayesha@example.com", phone: "+8801811000003", role: "CUSTOMER" },
    { name: "Tanvir Hasan", email: "tanvir@example.com", phone: "+8801911000004", role: "CUSTOMER" },
    { name: "Nusrat Jahan", email: "nusrat@example.com", phone: "+8801511000005", role: "CUSTOMER" },
    { name: "Mehedi Hassan", email: "mehedi@example.com", phone: "+8801611000006", role: "CUSTOMER" },
  ];
  const out = {};
  for (const u of users) {
    const saved = await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role },
      create: { name: u.name, email: u.email, phone: u.phone, role: u.role, passwordHash: hash, emailVerified: true },
    });
    out[u.email] = saved;
  }
  return out;
}

const REVIEW_BODIES = [
  "Absolutely stunning watch. The finishing is flawless and it keeps perfect time. Highly recommended!",
  "Beautiful piece, looks far more expensive than it is. Delivery was fast and packaging was premium.",
  "Great value for money. The strap is comfortable and the dial is really elegant.",
  "Bought this as a gift and the recipient loved it. Will definitely order again.",
  "Excellent quality and the customer service was very helpful throughout.",
];

async function seedOrders(users, productRows) {
  const customerUsers = Object.values(users).filter((u) => u.role === "CUSTOMER");
  const now = Date.now();
  // [daysAgo, status, paymentStatus, method, items[[productIdx, qty, variantIdx]], couponCode]
  const orderDefs = [
    [1, "DELIVERED", "PAID", "BKASH", [[0, 1, 0], [5, 2, 0]], null],
    [2, "DELIVERED", "PAID", "CARD", [[2, 1, 1]], "WELCOME10"],
    [3, "SHIPPED", "PAID", "NAGAD", [[7, 1, 1], [17, 1, 0]], null],
    [4, "OUT_FOR_DELIVERY", "PAID", "BKASH", [[1, 2, 0]], "SAVE500"],
    [5, "PACKED", "UNPAID", "COD", [[9, 1, 0], [19, 1, 0]], "FLASH20"],
    [6, "PROCESSING", "PAID", "CARD", [[3, 1, 1]], null],
    [8, "CONFIRMED", "UNPAID", "COD", [[11, 1, 0], [22, 1, 1]], null],
    [10, "PENDING", "UNPAID", "COD", [[4, 1, 1]], "MEGA1500"],
    [12, "CANCELLED", "REFUNDED", "CARD", [[13, 1, 1]], null],
    [15, "RETURNED", "REFUNDED", "BKASH", [[6, 1, 0]], null],
    [20, "DELIVERED", "PAID", "COD", [[24, 1, 0]], "WINTER15"],
    [25, "DELIVERED", "PAID", "NAGAD", [[27, 1, 1]], null],
    [30, "DELIVERED", "PAID", "BKASH", [[29, 1, 0], [30, 2, 1]], "WELCOME10"],
  ];

  for (let i = 0; i < orderDefs.length; i++) {
    const [daysAgo, status, paymentStatus, method, items, couponCode] = orderDefs[i];
    const user = customerUsers[i % customerUsers.length];
    const addrRows = await prisma.address.findMany({ where: { userId: user.id }, take: 1 });
    const addr = addrRows[0];
    if (!addr) continue;

    let subTotal = 0;
    const orderItems = [];
    for (const [pIdx, qty, vIdx] of items) {
      const { product, def } = productRows[pIdx % productRows.length];
      const variant = def.variants[vIdx % def.variants.length];
      const unitPrice = variant.salePrice ?? variant.price;
      subTotal += unitPrice * qty;
      orderItems.push({
        productId: product.id, productName: product.name, productSku: product.sku,
        imageUrl: `/uploads/products/prod-${String(def.images[vIdx % def.images.length]).padStart(2, "0")}.jpg`,
        variantLabel: `${variant.color} / ${variant.size}`, unitPrice, quantity: qty, total: unitPrice * qty,
      });
    }

    let discount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon) {
        discount = coupon.type === "PERCENT"
          ? Math.min(subTotal * coupon.value / 100, coupon.maxDiscount ?? subTotal)
          : Math.min(coupon.value, subTotal);
        discount = Math.round(discount);
        await prisma.coupon.update({ where: { id: coupon.id }, data: { totalUsed: { increment: 1 } } });
      }
    }
    const total = Math.max(0, subTotal - discount);
    const orderNumber = `TW-${new Date(now - daysAgo * 86400000).toISOString().slice(0, 10).replace(/-/g, "")}-${String(100000 + i * 7)}`;

    await prisma.order.upsert({
      where: { orderNumber },
      update: {},
      create: {
        orderNumber, userId: user.id, status, paymentStatus,
        subTotal, discount, deliveryCharge: 70, total: total + 70, couponCode,
        shipFullName: addr.fullName, shipPhone: addr.phone, shipEmail: addr.email,
        shipDivision: addr.division, shipDistrict: addr.district, shipArea: addr.area, shipFullAddress: addr.fullAddress,
        courierName: status === "SHIPPED" || status === "OUT_FOR_DELIVERY" || status === "DELIVERED" ? "Pathao" : null,
        trackingId: ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(status) ? `PTH-${10000 + i * 37}` : null,
        placedAt: new Date(now - daysAgo * 86400000),
        cancelledAt: status === "CANCELLED" ? new Date(now - (daysAgo - 1) * 86400000) : null,
        cancelledReason: status === "CANCELLED" ? "Customer requested cancellation" : null,
        refundAmount: paymentStatus === "REFUNDED" ? total : null,
        refundedAt: paymentStatus === "REFUNDED" ? new Date(now - (daysAgo - 1) * 86400000) : null,
        deliveredAt: status === "DELIVERED" ? new Date(now - (daysAgo - 1) * 86400000) : null,
        items: { create: orderItems },
        payments: {
          create: [{
            method, gateway: method === "CARD" ? "SSLCommerz" : method === "COD" ? "internal" : method,
            status: paymentStatus === "PAID" ? "SUCCESS" : paymentStatus === "REFUNDED" ? "REFUNDED" : "PENDING",
            amount: total, transactionId: paymentStatus === "PAID" || paymentStatus === "REFUNDED" ? `TXN-${1000000 + i * 911}` : null,
            paidAt: paymentStatus === "PAID" ? new Date(now - daysAgo * 86400000) : null,
          }],
        },
      },
    });

    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { salesCount: { increment: item.quantity }, stock: { decrement: item.quantity } },
      });
    }
  }
  console.log(`✔ ${orderDefs.length} demo orders across all statuses`);
}
async function main() {
  console.log("🌱 Seeding Tuhin Watch House…");
  const users = await seedUsers();

  // Categories & brands
  const catById = {};
  for (const c of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, imageUrl: c.imageUrl, description: c.description, sortOrder: c.sortOrder, isActive: true },
      create: { name: c.name, slug: c.slug, imageUrl: c.imageUrl, description: c.description, sortOrder: c.sortOrder },
    });
    catById[c.name] = row;
  }
  const brandById = {};
  for (const b of BRANDS) {
    const row = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { imageUrl: b.imageUrl, description: b.description, isActive: true },
      create: { name: b.name, slug: b.slug, imageUrl: b.imageUrl, description: b.description },
    });
    brandById[b.name] = row;
  }

  // Products + variants + images + inventory
  let skuCounter = 100;
  const productRows = [];
  for (const p of PRODUCTS) {
    const category = catById[p.category];
    const brand = brandById[p.brand];
    const slug = slugify(p.name);
    const sku = `TW-${category.slug.slice(0, 4).toUpperCase()}-${skuCounter++}`;
    const discount = p.salePrice ? Math.round(((p.price - p.salePrice) / p.price) * 100) : 0;
    const data = {
      name: p.name, sku, price: p.price, salePrice: p.salePrice, discountPercent: discount,
      stock: p.stock, categoryId: category.id, brandId: brand.id, tags: p.tags,
      isFeatured: p.featured, isBestSeller: p.best, isNewArrival: true, status: "ACTIVE",
      shortDescription: `${p.name} — premium timepiece from ${brand.name}.`,
      description: desc(p.name), metaTitle: `${p.name} | Tuhin Watch House`,
      metaDescription: `Buy ${p.name} at Tuhin Watch House. ${discount > 0 ? discount + "% off" : "Premium quality"}. Fast delivery across Bangladesh.`,
    };
    const existing = await prisma.product.findUnique({ where: { slug } });
    const product = existing
      ? await prisma.product.update({ where: { id: existing.id }, data })
      : await prisma.product.create({ data });
    productRows.push({ product, def: p });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    for (let i = 0; i < p.images.length; i++) {
      await prisma.productImage.create({ data: { productId: product.id, url: img(p.images[i]), alt: `${p.name} image ${i + 1}`, sortOrder: i, isPrimary: i === 0 } });
    }
    await prisma.productVariant.deleteMany({ where: { productId: product.id } });
    for (const v of p.variants) {
      await prisma.productVariant.create({
        data: {
          productId: product.id, sku: `${sku}-${v.color.replace(/[^A-Za-z0-9]/g, "").toUpperCase()}`,
          size: v.size, color: v.color, colorHex: v.colorHex, price: v.price, salePrice: v.salePrice, stock: v.stock,
        },
      });
    }
    const inv = await prisma.inventory.findUnique({ where: { productId: product.id } });
    if (inv) await prisma.inventory.update({ where: { id: inv.id }, data: { quantityOnHand: p.stock, lowStockAlert: p.stock < 10 } });
    else await prisma.inventory.create({ data: { productId: product.id, quantityOnHand: p.stock, lowStockAlert: p.stock < 10 } });
  }
// Coupons
  for (const c of COUPONS) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: { isActive: c.active },
      create: {
        code: c.code, type: c.type, value: c.value, minOrderAmount: c.minOrderAmount, maxDiscount: c.maxDiscount,
        startsAt: daysFromNow(c.startsIn), expiresAt: daysFromNow(c.expiresIn),
        usageLimit: c.type === "FIXED" ? null : 1000, perUserLimit: c.perUserLimit, isActive: c.active,
      },
    });
  }

  // Addresses
  const customerUsers = Object.values(users).filter((u) => u.role === "CUSTOMER");
  const addrTemplates = [
    { label: "Home", fullName: "Rahim Uddin", phone: "+8801711000002", email: "customer@tuhinwatch.com", division: "Dhaka", district: "Dhaka", area: "Dhanmondi", fullAddress: "House 12, Road 5, Dhanmondi" },
    { label: "Office", fullName: "Rahim Uddin", phone: "+8801711000002", email: "customer@tuhinwatch.com", division: "Dhaka", district: "Dhaka", area: "Gulshan", fullAddress: "Level 7, BTI Building, Gulshan 1" },
  ];
  for (let i = 0; i < customerUsers.length; i++) {
    const t = addrTemplates[i % addrTemplates.length];
    const rest = {
      fullName: customerUsers[i].name, phone: customerUsers[i].phone, email: customerUsers[i].email,
      division: t.division, district: t.district, area: t.area, fullAddress: t.fullAddress, isDefault: true,
    };
    const addr = await prisma.address.findFirst({ where: { userId: customerUsers[i].id, label: t.label } });
    if (addr) await prisma.address.update({ where: { id: addr.id }, data: rest });
    else await prisma.address.create({ data: { userId: customerUsers[i].id, label: t.label, ...rest } });
  }

  console.log(`✔ ${productRows.length} products, ${CATEGORIES.length} categories, ${BRANDS.length} brands, ${COUPONS.length} coupons`);

  await seedOrders(users, productRows);
  await seedReviews(users, productRows);
  await seedNotifications(users);
  await seedSettings();

  console.log("✅ Seed complete.");
  console.log("   Admin login:    admin@tuhinwatch.com / " + PASSWORD);
  console.log("   Customer login: customer@tuhinwatch.com / " + PASSWORD);
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
async function seedReviews(users, productRows) {
  const customerUsers = Object.values(users).filter((u) => u.role === "CUSTOMER");
  const reviewDefs = [
    // [productIdx, userIdx, rating, daysAgo, status, hasImages]
    [0, 0, 5, 2, "APPROVED", true], [0, 1, 4, 1, "APPROVED", false],
    [1, 0, 5, 4, "APPROVED", true], [2, 0, 4, 3, "APPROVED", false],
    [2, 2, 5, 20, "APPROVED", false], [3, 1, 4, 6, "PENDING", false],
    [5, 3, 5, 1, "APPROVED", false], [5, 4, 4, 9, "APPROVED", false],
    [7, 2, 5, 5, "APPROVED", true], [9, 3, 4, 8, "APPROVED", false],
    [11, 4, 5, 7, "PENDING", false], [16, 5, 5, 12, "APPROVED", true],
    [20, 1, 3, 15, "PENDING", false], [24, 5, 4, 18, "APPROVED", false],
  ];
  let n = 0;
  for (const [pIdx, uIdx, rating, daysAgo, status, hasImages] of reviewDefs) {
    const { product } = productRows[pIdx % productRows.length];
    const user = customerUsers[uIdx % customerUsers.length];
    const existing = await prisma.review.findUnique({ where: { userId_productId: { userId: user.id, productId: product.id } } });
    if (existing) continue;
    await prisma.review.create({
      data: {
        userId: user.id, productId: product.id, rating,
        title: REVIEW_BODIES[n % REVIEW_BODIES.length].slice(0, 24),
        body: REVIEW_BODIES[n % REVIEW_BODIES.length],
        images: hasImages ? `/uploads/products/prod-${String((pIdx * 5) % 96 + 1).padStart(2, "0")}.jpg` : "",
        status, createdAt: new Date(Date.now() - daysAgo * 86400000),
      },
    });
    n++;
  }
  const products = await prisma.product.findMany();
  for (const p of products) {
    const agg = await prisma.review.aggregate({
      where: { productId: p.id, status: "APPROVED" }, _avg: { rating: true }, _count: { id: true },
    });
    await prisma.product.update({
      where: { id: p.id },
      data: { rating: Math.round((agg._avg.rating ?? 0) * 10) / 10, reviewCount: agg._count.id },
    });
  }
  console.log(`✔ ${n} reviews seeded`);
}

async function seedNotifications(users) {
  const customerUsers = Object.values(users).filter((u) => u.role === "CUSTOMER");
  const admin = Object.values(users).find((u) => u.role === "ADMIN");
  const notes = [
    { type: "WELCOME", title: "Welcome to Tuhin Watch House 🎉", body: "Thanks for joining. Use code WELCOME10 for 10% off your first order.", link: "/shop" },
    { type: "ORDER_CONFIRMED", title: "Order confirmed", body: "Your order has been confirmed and is being prepared.", link: "/account/orders" },
    { type: "ORDER_SHIPPED", title: "Your order has shipped 🚚", body: "Track your package with Pathao. Delivery in 1–2 days.", link: "/account/orders" },
  ];
  for (const c of customerUsers) {
    for (const [i, note] of notes.entries()) {
      await prisma.notification.create({
        data: {
          userId: c.id, targetRole: "CUSTOMER", type: note.type, title: note.title, body: note.body, link: note.link,
          createdAt: new Date(Date.now() - (i + 1) * 86400000), readAt: i === 0 ? null : new Date(Date.now() - 3600000),
        },
      });
    }
  }
  await prisma.notification.create({
    data: { userId: admin.id, targetRole: "ADMIN", type: "NEW_ORDER", title: "New order received", body: "Order placed via bKash. Review it in the dashboard.", link: "/admin/orders" },
  });
  console.log("✔ notifications seeded");
}

async function seedSettings() {
  const settings = [
    { key: "announcement", value: "Free delivery on orders over ৳3,000 • Use code WELCOME10 for 10% off your first order" },
    { key: "contact_email", value: "support@tuhinwatch.com" },
    { key: "contact_phone", value: "+880 1711-000001" },
    { key: "contact_address", value: "House 22, Road 5, Dhanmondi, Dhaka 1205, Bangladesh" },
    { key: "free_delivery_threshold", value: "3000" },
    { key: "delivery_charge", value: "70" },
    { key: "instagram", value: "https://instagram.com/tuhinwatch" },
    { key: "facebook", value: "https://facebook.com/tuhinwatch" },
    { key: "youtube", value: "https://youtube.com/@tuhinwatch" },
    { key: "tiktok", value: "https://tiktok.com/@tuhinwatch" },
  ];
  for (const s of settings) {
    await prisma.siteSetting.upsert({ where: { key: s.key }, update: { value: s.value }, create: { key: s.key, value: s.value } });
  }
  console.log("✔ site settings seeded");
}
];