"use client";

import { FormEvent, useState } from "react";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

const details = [
  { icon: Mail, label: "Email us", value: "hello@tmtwatch.com", href: "mailto:hello@tmtwatch.com" },
  { icon: Phone, label: "Call us", value: "+880 1700 000 000", href: "tel:+8801700000000" },
  { icon: MapPin, label: "Visit us", value: "Gulshan, Dhaka, Bangladesh", href: "#visit" },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
    event.currentTarget.reset();
  }

  return (
    <main>
      <section className="bg-[#161616] px-5 py-20 text-white sm:py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-350">
          <p className="eyebrow text-[#e7cc75]">We&apos;re here to help</p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[.9] tracking-tighter sm:text-8xl">Let&apos;s talk<br/><i className="font-light text-[#e7cc75]">about time.</i></h1>
          <p className="mt-7 max-w-lg text-sm leading-6 text-white/60 sm:mt-8 sm:text-base sm:leading-7">Have a question about a watch, an order, or finding the right fit? Our team would love to hear from you.</p>
        </div>
      </section>

      <section className="px-5 py-16 sm:py-20 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-350 gap-12 sm:gap-16 lg:grid-cols-[.8fr_1.2fr] lg:gap-28">
          <div>
            <p className="eyebrow">Contact details</p>
            <h2 className="mt-3 font-serif text-4xl leading-none sm:text-5xl">A considered answer is never far away.</h2>
            <div className="mt-8 grid gap-6 sm:mt-10 sm:gap-7">
              {details.map(({ icon: Icon, label, value, href }) => (
                <a key={label} href={href} className="group flex items-start gap-4 border-b border-black/10 pb-6">
                  <Icon className="mt-0.5 shrink-0 text-[#c9a227]" size={20} strokeWidth={1.5}/>
                  <span><span className="block text-[10px] font-bold uppercase tracking-[.18em] text-[#9a9a93]">{label}</span><span className="mt-1 block text-sm text-[#34342f] transition group-hover:text-[#c9a227]">{value}</span></span>
                </a>
              ))}
            </div>
            <div id="visit" className="mt-10 flex gap-4 border-l-2 border-[#c9a227] pl-5 text-sm leading-6 text-[#73736d]">
              <MessageCircle className="mt-1 shrink-0 text-[#c9a227]" size={18} strokeWidth={1.5}/>
              <p>Our customer care team replies within one business day, Sunday through Thursday.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="min-w-0 bg-[#f0eee9] p-5 sm:p-10">
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="grid gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#73736d]">Your name<input required name="name" className="border-b border-black/20 bg-transparent px-0 py-3 text-sm font-normal normal-case tracking-normal text-[#111] outline-none transition focus:border-[#c9a227]"/></label>
              <label className="grid gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#73736d]">Email address<input required type="email" name="email" className="border-b border-black/20 bg-transparent px-0 py-3 text-sm font-normal normal-case tracking-normal text-[#111] outline-none transition focus:border-[#c9a227]"/></label>
            </div>
            <label className="mt-6 grid gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#73736d]">What can we help with?<select name="topic" defaultValue="order" className="border-b border-black/20 bg-transparent px-0 py-3 text-sm font-normal normal-case tracking-normal text-[#111] outline-none"><option value="order">An existing order</option><option value="product">Choosing a watch</option><option value="return">Returns and exchanges</option><option value="other">Something else</option></select></label>
            <label className="mt-6 grid gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#73736d]">Your message<textarea required name="message" rows={5} className="resize-y border-b border-black/20 bg-transparent px-0 py-3 text-sm font-normal normal-case tracking-normal text-[#111] outline-none transition focus:border-[#c9a227]"/></label>
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
              <button type="submit" className="w-full bg-[#111] px-7 py-4 text-[10px] font-bold uppercase tracking-[.16em] text-white hover:bg-[#c9a227] sm:w-auto">Send message</button>
              {sent && <p role="status" className="text-sm text-[#73736d]">Thank you. We&apos;ll be in touch soon.</p>}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}