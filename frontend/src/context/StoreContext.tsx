"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Product } from "@/data/products";

type StoreContextValue = { cart: Product[]; wishlist: string[]; cartCount: number; addToCart: (product: Product) => void; removeFromCart: (id: string) => void; toggleWishlist: (id: string) => void; isWishlisted: (id: string) => boolean; };
const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem("tmt-cart") || "[]"));
      setWishlist(JSON.parse(localStorage.getItem("tmt-wishlist") || "[]"));
    } catch {
      localStorage.removeItem("tmt-cart");
      localStorage.removeItem("tmt-wishlist");
    } finally {
      setHydrated(true);
    }
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem("tmt-cart", JSON.stringify(cart)); }, [cart, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("tmt-wishlist", JSON.stringify(wishlist)); }, [wishlist, hydrated]);
  const addToCart = (product: Product) => setCart((items) => items.some((item) => item.id === product.id) ? items : [...items, product]);
  const removeFromCart = (id: string) => setCart((items) => items.filter((item) => item.id !== id));
  const toggleWishlist = (id: string) => setWishlist((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  return <StoreContext.Provider value={{ cart, wishlist, cartCount: cart.length, addToCart, removeFromCart, toggleWishlist, isWishlisted: (id) => wishlist.includes(id) }}>{children}</StoreContext.Provider>;
}
export function useStore() { const value = useContext(StoreContext); if (!value) throw new Error("useStore must be used inside StoreProvider"); return value; }
