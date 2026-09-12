"use client";
import Link from "next/link";
import { products } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { useStore } from "@/context/StoreContext";
export default function WishlistPage() { const { wishlist } = useStore(); const items = products.filter((p) => wishlist.includes(p.id)); return <main className="px-5 py-12 lg:px-10 lg:py-20"><div className="mx-auto max-w-[1400px]"><p className="eyebrow">TMTwatch / Saved pieces</p><h1 className="section-title">Your wishlist</h1>{items.length ? <div className="mt-12 grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-4 lg:gap-x-5">{items.map((p) => <ProductCard key={p.id} product={p}/>)}</div> : <div className="border-t border-black/10 py-20 text-center"><p className="font-serif text-3xl">Nothing saved yet.</p><p className="mt-3 text-sm text-[#888780]">Keep the pieces that catch your eye close.</p><Link href="/shop" className="mt-6 inline-block bg-[#111] px-7 py-4 text-[10px] font-bold uppercase tracking-widest text-white">Explore collection</Link></div>}</div></main> }
