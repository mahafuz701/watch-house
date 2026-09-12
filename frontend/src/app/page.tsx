import Link from "next/link";
import { ArrowUpRight, ChevronRight, ShieldCheck, Truck, RotateCcw, CreditCard } from "lucide-react";
import { categories, products } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";

const trust = [{ icon: ShieldCheck, title: "Authentic products", text: "Every piece, guaranteed genuine." }, { icon: Truck, title: "Fast delivery", text: "Nationwide delivery in 2–4 days." }, { icon: RotateCcw, title: "Easy returns", text: "A considered 7-day return window." }, { icon: CreditCard, title: "Secure payment", text: "Pay safely, however you prefer." }];
const newArrivals = products.filter((product) => product.isNew).slice(0, 4);
const best = products.filter((product) => product.isBestSeller).slice(0, 4);

export default function Home() {
  return (
  <main>
    <section className="relative min-h-[680px] overflow-hidden bg-[#dedbd3]">
      <img src="https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=1800&q=90" alt="TMT watch collection" className="absolute inset-0 h-full w-full object-cover object-center md:object-[center_58%]"/>
      <div className="absolute inset-0 bg-gradient-to-r from-[#111]/80 via-[#111]/35 to-transparent"/>
      <div className="absolute bottom-0 right-0 top-0 hidden w-1/3 bg-[#c9a227]/10 mix-blend-screen lg:block"/>
      <div className="relative mx-auto flex min-h-[680px] max-w-[1400px] items-center px-5 py-24 lg:px-10">
        <div className="max-w-xl text-white">
          <p className="mb-7 text-[10px] font-bold uppercase tracking-[0.3em] text-[#e7cc75]">The 2026 collection</p>
          <h1 className="font-serif text-6xl leading-[.95] tracking-[-0.05em] sm:text-8xl">Time, designed<br/><i className="font-light">to impress.</i></h1>
          <p className="mt-7 max-w-md text-base leading-7 text-white/75">Discover stylish watches designed for every moment, every style, and every story.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/shop" className="bg-[#c9a227] px-7 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-[#111]">Shop now <ArrowUpRight className="ml-2 inline" size={14}/></Link>
            <Link href="/shop?category=Luxury" className="border border-white/50 px-7 py-4 text-[10px] font-bold uppercase tracking-[0.16em] transition hover:bg-white hover:text-[#111]">Explore collection</Link>
          </div>
        </div>
      </div>
    </section>
    <section className="border-b border-black/8 bg-white">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 divide-x divide-y divide-black/8 sm:grid-cols-4 sm:divide-y-0">
        {trust.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-3 p-6 lg:p-8">
            <Icon size={22} strokeWidth={1.4} className="shrink-0 text-[#c9a227]"/>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-[#888780]">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
    <section className="px-5 py-24 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="eyebrow">Find your signature</p>
            <h2 className="section-title">Shop by category</h2>
          </div>
          <Link href="/shop" className="hidden text-[10px] font-bold uppercase tracking-widest sm:block">View all <ChevronRight className="ml-1 inline" size={14}/></Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {categories.map((category) => (
            <Link href={`/shop?category=${category.slug}`} key={category.name} className="group relative aspect-[.9] overflow-hidden bg-[#e8e6df]">
              <img src={category.image} alt={category.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"/>
              <div className="absolute bottom-0 p-5 text-white lg:p-7">
                <h3 className="font-serif text-2xl lg:text-3xl">{category.name}</h3>
                <p className="mt-1 text-xs text-white/65">{category.description}</p>
                <span className="mt-4 inline-block border-b border-[#e7cc75] pb-1 text-[9px] font-bold uppercase tracking-widest text-[#e7cc75]">Shop now</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
    <section className="bg-[#f0eee9] px-5 py-24 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="eyebrow">Just in</p>
            <h2 className="section-title">New arrivals</h2>
          </div>
          <Link href="/shop?sort=new" className="text-[10px] font-bold uppercase tracking-widest">See the edit <ChevronRight className="ml-1 inline" size={14}/></Link>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 lg:gap-x-5">
          {newArrivals.map((product) => <ProductCard key={product.id} product={product}/>)}
        </div>
      </div>
    </section>
    <section className="px-5 py-24 lg:px-10">
      <div className="mx-auto grid max-w-[1400px] overflow-hidden bg-[#161616] md:grid-cols-2">
        <div className="flex flex-col justify-center p-10 text-white lg:p-20">
          <p className="eyebrow text-[#c9a227]">The TMT point of view</p>
          <h2 className="font-serif text-5xl leading-none tracking-tight lg:text-7xl">Find your<br/><i className="font-light">perfect timepiece.</i></h2>
          <p className="mt-6 max-w-sm text-sm leading-7 text-white/55">The right watch does more than tell time. It gives the day a little more intention.</p>
          <Link href="/shop" className="mt-8 w-fit bg-white px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#111]">Shop collection <ArrowUpRight className="ml-2 inline" size={14}/></Link>
        </div>
        <img src="https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1100&q=90" alt="Luxury watch detail" className="h-full min-h-[400px] w-full object-cover"/>
      </div>
    </section>
    <section className="bg-[#f0eee9] px-5 py-24 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10">
          <p className="eyebrow">Most wanted</p>
          <h2 className="section-title">Best sellers</h2>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 lg:gap-x-5">
          {best.map((product) => <ProductCard key={product.id} product={product}/>)}
        </div>
      </div>
    </section>
    <section className="px-5 py-24 lg:px-10">
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 md:grid-cols-2">
        <div>
          <p className="eyebrow">For the active hour</p>
          <h2 className="section-title max-w-lg">Smart time.<br/><i className="font-light">Smarter life.</i></h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-[#73736d]">Keep up with your day without compromising on the details. Our smart collection pairs useful technology with a point of view.</p>
          <Link href="/shop?category=Smart" className="mt-7 inline-block bg-[#111] px-7 py-4 text-[10px] font-bold uppercase tracking-widest text-white">Explore smart watches <ArrowUpRight className="ml-2 inline" size={14}/></Link>
        </div>
        <img src="https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=1100&q=90" alt="Smart watch on wrist" className="aspect-square w-full object-cover"/>
      </div>
    </section>
    <section className="border-t border-black/8 px-5 py-24 lg:px-10">
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow">A note from our customers</p>
        <blockquote className="mt-8 font-serif text-3xl leading-tight text-[#24241f] md:text-5xl">“The Classic Black is understated in exactly the right way. It has become the one thing I never leave home without.”</blockquote>
        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9a9a93]">— Farhan, verified TMT customer</p>
      </div>
    </section>
    <section className="bg-[#c9a227] px-5 py-16 lg:px-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#fff8dc]">The TMT letter</p>
        <h2 className="mt-3 font-serif text-4xl text-white">Stay ahead of time.</h2>
        <p className="mt-3 text-sm text-white/75">New drops, considered stories, and 10% off your first order.</p>
        <div className="mt-7 flex w-full max-w-md border-b border-white/60 pb-3">
          <input placeholder="Your email address" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/70"/>
          <button className="text-[10px] font-bold uppercase tracking-widest text-white">Subscribe</button>
        </div>
      </div>
    </section>
  </main>
  );
}
