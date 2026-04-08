import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import "./globals.css";

import { AppShell } from "@/components/app-shell";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { MobileCartBar } from "@/components/store/store-shortcuts";

const heading = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClosetSale",
  description: "Ecommerce con admin, carrito, favoritos, slider y Neon/Postgres.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${heading.variable} ${body.variable}`}>
      <body className="flex min-h-screen flex-col overflow-x-hidden bg-[#f3ede3] text-stone-900 antialiased">
        <Providers />
        <div className="public-header">
          <SiteHeader />
        </div>
        <main className="public-main flex-1 overflow-x-hidden pb-24 md:pb-0">
          <AppShell>{children}</AppShell>
        </main>
        <div className="public-cart">
          <MobileCartBar />
        </div>
        <div className="public-footer">
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
