import type { Metadata } from "next";
import "./globals.css";
import { StoreShell } from "@/components/StoreShell";

export const metadata: Metadata = {
  title: "TMTwatch.com — Time, Designed to Impress.",
  description: "Premium watches for every moment, every style, and every story.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col"><StoreShell>{children}</StoreShell></body>
    </html>
  );
}
