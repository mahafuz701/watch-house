export type Product = {
  id: string; name: string; brand: string; category: string; price: number; oldPrice?: number; discount?: number;
  rating: number; reviewCount: number; image: string; gallery: string[]; description: string; shortDescription: string;
  sku: string; stock: number; colors: string[]; strapMaterial: string; movement: string; caseMaterial: string;
  caseSize: string; waterResistance: string; features: string[]; warranty: string; isNew?: boolean; isBestSeller?: boolean; isSale?: boolean;
};

const watchImages = [
  "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=900&q=85",
  "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&q=85",
  "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=900&q=85",
  "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=900&q=85",
  "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=900&q=85",
  "https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=900&q=85",
];

const make = (id: string, name: string, category: string, price: number, image: number, extra: Partial<Product> = {}): Product => ({
  id, name, brand: "TMT Original", category, price, rating: 4.8, reviewCount: 42,
  image: watchImages[image % watchImages.length], gallery: [watchImages[image % watchImages.length], watchImages[(image + 1) % watchImages.length]],
  description: "A considered timepiece built for modern routines, with a balanced case profile and details that reward a closer look.",
  shortDescription: "Refined proportions. Everyday confidence.", sku: `TMT-${id.toUpperCase()}`, stock: 12,
  colors: ["Black", "Silver"], strapMaterial: "Stainless Steel", movement: "Quartz", caseMaterial: "316L Stainless Steel",
  caseSize: "40mm", waterResistance: "5 ATM", features: ["Scratch-resistant mineral glass", "Japanese precision movement", "Adjustable bracelet"], warranty: "2 years international warranty", ...extra,
});

export const products: Product[] = [
  make("classic-black", "TMT Classic Black", "Men's", 2490, 0, { oldPrice: 3290, discount: 24, isBestSeller: true, strapMaterial: "Leather" }),
  make("chronograph-steel", "TMT Chronograph Steel", "Men's", 5490, 1, { oldPrice: 6990, discount: 21, isNew: true, movement: "Quartz", features: ["Three sub-dials", "Tachymeter bezel", "Luminous hands"] }),
  make("executive-gold", "TMT Executive Gold", "Luxury", 7990, 2, { oldPrice: 9990, discount: 20, isBestSeller: true, colors: ["Gold", "Black"] }),
  make("urban-sport", "TMT Urban Sport", "Sports", 3990, 3, { isNew: true, strapMaterial: "Silicone", waterResistance: "10 ATM" }),
  make("royal-automatic", "TMT Royal Automatic", "Luxury", 12990, 4, { isNew: true, movement: "Automatic", caseSize: "42mm", features: ["Open-heart dial", "Automatic self-winding", "Sapphire-coated glass"] }),
  make("minimal-silver", "TMT Minimal Silver", "Men's", 2990, 5, { isBestSeller: true, strapMaterial: "Mesh" }),
  make("elegant-rose", "TMT Elegant Rose", "Women's", 3490, 2, { colors: ["Rose Gold", "Silver"], strapMaterial: "Mesh", isNew: true }),
  make("classic-women-gold", "TMT Classic Women Gold", "Women's", 4490, 0, { oldPrice: 5290, discount: 15, colors: ["Gold", "Rose Gold"] }),
  make("active-smart-s1", "TMT Active Smart S1", "Smart", 5990, 3, { oldPrice: 6990, discount: 14, isBestSeller: true, movement: "Smart", strapMaterial: "Silicone", features: ["Heart-rate tracking", "Sleep monitoring", "7-day battery"] }),
  make("pro-smart-x", "TMT Pro Smart X", "Smart", 8990, 4, { movement: "Smart", strapMaterial: "Silicone", isNew: true, features: ["AMOLED display", "Bluetooth calling", "100+ sports modes"] }),
  make("couple-classic", "TMT Couple Classic", "Couple", 6990, 1, { oldPrice: 7990, discount: 12, isBestSeller: true, caseSize: "38mm / 42mm" }),
  make("luxury-black", "TMT Luxury Black Edition", "Luxury", 10990, 2, { oldPrice: 13990, discount: 21, colors: ["Black"], caseMaterial: "Black IP Steel", isSale: true }),
  make("field-brown", "TMT Field Brown", "Men's", 2790, 3, { strapMaterial: "Leather", colors: ["Brown", "Black"] }),
  make("midnight-blue", "TMT Midnight Blue", "Men's", 3290, 1, { colors: ["Blue", "Silver"], isNew: true }),
  make("pearl-minimal", "TMT Pearl Minimal", "Women's", 2890, 5, { strapMaterial: "Mesh", colors: ["Silver", "Rose Gold"] }),
  make("celeste-fashion", "TMT Celeste Fashion", "Women's", 3790, 0, { oldPrice: 4490, discount: 16, isSale: true, colors: ["Blue", "Silver"] }),
  make("pulse-fit", "TMT Pulse Fit", "Smart", 4490, 3, { movement: "Smart", strapMaterial: "Silicone", features: ["Activity rings", "SpO2 monitoring", "Message alerts"] }),
  make("amoled-pro", "TMT AMOLED Pro", "Smart", 7490, 4, { movement: "Smart", strapMaterial: "Silicone", isBestSeller: true, features: ["Always-on AMOLED", "GPS tracking", "Voice assistant"] }),
  make("heritage-mechanical", "TMT Heritage Mechanical", "Luxury", 8990, 1, { movement: "Mechanical", caseSize: "41mm", isNew: true }),
  make("racer-chrono", "TMT Racer Chrono", "Sports", 4790, 2, { oldPrice: 5990, discount: 20, isSale: true, waterResistance: "10 ATM" }),
  make("everyday-mesh", "TMT Everyday Mesh", "Men's", 2290, 5, { strapMaterial: "Mesh", isBestSeller: true }),
  make("luna-classic", "TMT Luna Classic", "Women's", 3190, 0, { colors: ["Gold", "Rose Gold"], isNew: true }),
  make("duo-signature", "TMT Duo Signature", "Couple", 8990, 4, { oldPrice: 9990, discount: 10, colors: ["Black", "Rose Gold"] }),
  make("commute-smart", "TMT Commute Smart", "Smart", 5290, 3, { movement: "Smart", strapMaterial: "Silicone", isSale: true, oldPrice: 5990, discount: 12 }),
];

export const categories = [
  { name: "Men's Watches", slug: "Men's", description: "Confident classics for every hour.", image: watchImages[0] },
  { name: "Women's Watches", slug: "Women's", description: "Elegant details, beautifully timed.", image: watchImages[2] },
  { name: "Smart Watches", slug: "Smart", description: "Intelligent time for active lives.", image: watchImages[3] },
  { name: "Luxury Watches", slug: "Luxury", description: "The art of the finishing touch.", image: watchImages[4] },
  { name: "Sports Watches", slug: "Sports", description: "Made to move with you.", image: watchImages[1] },
  { name: "Couple Watches", slug: "Couple", description: "Two wrists. One story.", image: watchImages[5] },
];

export const getProduct = (id: string) => products.find((product) => product.id === id);
export const formatPrice = (price: number) => `৳${price.toLocaleString("en-BD")}`;
