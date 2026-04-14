"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getSellerFinanceSummary } from "@/lib/seller-finance";
import { formatCurrency } from "@/lib/utils";

type SellerSidebarProps = {
  seller: {
    storeName: string;
    slug: string;
    status: string;
    products: Array<{ id: string; status: string }>;
    sellerOrders: Array<{
      id: string;
      status: string;
      subtotal: unknown;
      commissionAmount: unknown;
      netAmount: unknown;
      payoutItems?: Array<{ payout: { status: string } }>;
    }>;
    payouts: Array<{ id: string; status: string; netAmount: unknown }>;
  };
};

const links = [
  { href: "/seller", label: "Dashboard" },
  { href: "/seller/products", label: "Productos" },
  { href: "/seller/orders", label: "Pedidos" },
  { href: "/seller/finanzas", label: "Finanzas" },
  { href: "/profile", label: "Perfil" },
] as const;

function getLinkClassName(pathname: string, href: string) {
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return [
    "block rounded-2xl px-4 py-3 text-[11px] uppercase tracking-[0.22em] transition",
    isActive
      ? "bg-stone-950 text-white"
      : "border border-stone-200 bg-white text-stone-600 hover:border-stone-900 hover:text-stone-950",
  ].join(" ");
}

export function SellerSidebar({ seller }: SellerSidebarProps) {
  const pathname = usePathname();

  const activeProducts = seller.products.filter((product) => product.status === "ACTIVE").length;
  const finance = getSellerFinanceSummary({
    sellerOrders: seller.sellerOrders,
    payouts: seller.payouts,
  });
  const paidPayouts = seller.payouts.filter((payout) => payout.status === "PAID").length;

  return (
    <aside className="flex h-fit flex-col gap-4 rounded-[2.25rem] border border-stone-200 bg-white p-5 shadow-sm lg:sticky lg:top-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400">Tu tienda</p>
        <h2 className="mt-2 font-serif text-3xl text-stone-950">{seller.storeName}</h2>
        <p className="mt-2 break-all text-xs text-stone-500">/{seller.slug}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        <div className="rounded-2xl bg-stone-50 p-4">
          <p className="text-[11px] uppercase tracking-[0.22em] text-stone-400">Estado</p>
          <p className="mt-2 text-sm font-medium uppercase tracking-[0.18em] text-emerald-700">
            {seller.status}
          </p>
        </div>
        <div className="rounded-2xl bg-stone-50 p-4">
          <p className="text-[11px] uppercase tracking-[0.22em] text-stone-400">Activos</p>
          <p className="mt-2 font-serif text-2xl text-stone-950">{activeProducts}</p>
        </div>
        <div className="rounded-2xl bg-stone-50 p-4">
          <p className="text-[11px] uppercase tracking-[0.22em] text-stone-400">Neto</p>
          <p className="mt-2 font-serif text-2xl text-stone-950">{formatCurrency(finance.netSales)}</p>
        </div>
      </div>

      <nav className="grid gap-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={getLinkClassName(pathname, link.href)}>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="rounded-3xl border border-stone-200 bg-[#f9f6f0] p-4">
        <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Resumen rapido</p>
        <div className="mt-3 grid gap-3 text-sm text-stone-600">
          <p>Productos: {seller.products.length}</p>
          <p>Ventas: {seller.sellerOrders.length}</p>
          <p>Pendiente: {formatCurrency(finance.pendingBalance)}</p>
          <p>Liquidaciones: {paidPayouts}</p>
        </div>
      </div>
    </aside>
  );
}
