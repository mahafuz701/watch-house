"use client";
import Link from "next/link";
import { useState } from "react";
import { Heart, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export function Header() {
  const [open, setOpen] = useState(false); const { cartCount, wishlist } = useStore();
  const nav = [["Shop", "/shop"], ["Men's", "/shop?category=Men's"], ["Women's", "/shop?category=Women's"], ["Smart Watches", "/shop?category=Smart"], ["Luxury", "/shop?category=Luxury"], ["New Arrivals", "/shop?sort=new"], ["Sale", "/shop?sale=true"], ["Contact", "/contact"]];
  return <>
    <div className="bg-[#111] px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-white">Complimentary delivery on orders over ৳3,000</div>
    <header className="sticky top-0 z-40 border-b border-black/8 bg-[#f9f8f5]/95 backdrop-blur-md"><div className="mx-auto flex h-20 max-w-350 items-center justify-between px-5 lg:px-10">
      <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={22}/></button>
      <Link href="/" className="font-serif text-2xl font-bold tracking-[-0.06em] text-[#111]">TMT<span className="text-[#c9a227]">watch</span><sup className="ml-0.5 font-sans text-[9px] tracking-normal">.com</sup></Link>
      <nav className="hidden items-center gap-7 lg:flex">{nav.map(([label, href]) => <Link key={label} href={href} className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#4f504c] transition hover:text-[#c9a227]">{label}</Link>)}</nav>
      <div className="flex items-center gap-4"><Link href="/shop" aria-label="Search"><Search size={19}/></Link><Link href="/wishlist" className="relative" aria-label="Wishlist"><Heart size={19}/>{wishlist.length > 0 && <b className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#c9a227] text-[9px] text-white">{wishlist.length}</b>}</Link><Link href="/account" className="hidden sm:block" aria-label="Account"><UserRound size={19}/></Link><Link href="/cart" className="relative" aria-label="Cart"><ShoppingBag size={19}/>{cartCount > 0 && <b className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#111] text-[9px] text-white">{cartCount}</b>}</Link></div>
    </div></header>
    {open && <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setOpen(false)}><aside className="h-full w-[85%] max-w-sm bg-[#f9f8f5] p-6" onClick={(event) => event.stopPropagation()}><div className="mb-12 flex items-center justify-between"><span className="font-serif text-xl font-bold">Menu</span><button onClick={() => setOpen(false)} aria-label="Close menu"><X/></button></div><nav className="grid gap-6">{nav.map(([label, href]) => <Link onClick={() => setOpen(false)} key={label} href={href} className="border-b border-black/10 pb-4 text-sm font-bold uppercase tracking-widest">{label}</Link>)}</nav></aside></div>}
  </>;
}
