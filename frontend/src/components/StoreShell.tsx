"use client";
import { StoreProvider } from "@/context/StoreContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
export function StoreShell({ children }: { children: React.ReactNode }) { return <StoreProvider><Header/>{children}<Footer/></StoreProvider>; }
