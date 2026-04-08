"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, ReceiptText, ShoppingBag } from "lucide-react";

import { useCartStore, useFavoriteStore } from "@/components/store/store";
import { formatCurrency } from "@/lib/utils";

function CountBadge({ count }: { count: number }) {
  if (count <= 0) {
    return null;
  }

  return (
    <span className="absolute -right-1.5 -top-1.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold leading-none text-white shadow-sm">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function ShortcutLink({
  href,
  label,
  count,
  children,
  className = "",
  iconClassName = "",
}: {
  href: string;
  label: string;
  count: number;
  children: React.ReactNode;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div className={className}>
      <Link href={href} aria-label={label} className={`group relative inline-flex text-stone-700 ${iconClassName}`}>
        {children}
        <CountBadge count={count} />
      </Link>
      <div className="pointer-events-none absolute left-1/2 top-full z-[70] mt-2 -translate-x-1/2 rounded-full bg-stone-900 px-3 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
        {label}
      </div>
    </div>
  );
}

export function StoreHeaderShortcuts() {
  const cartCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const favoriteCount = useFavoriteStore((state) => state.items.length);

  return (
    <>
      <ShortcutLink
        href="/orders"
        label="Mis compras"
        count={0}
        className="group relative hidden md:block"
      >
        <ReceiptText className="h-5 w-5" />
      </ShortcutLink>
      <ShortcutLink
        href="/favorites"
        label="Favoritos"
        count={favoriteCount}
        className="group relative hidden md:block"
      >
        <Heart className="h-5 w-5" fill={favoriteCount > 0 ? "currentColor" : "none"} />
      </ShortcutLink>
      <ShortcutLink
        href="/cart"
        label="Carrito"
        count={cartCount}
        className="group relative hidden md:block"
      >
        <ShoppingBag className="h-5 w-5" />
      </ShortcutLink>
      <Link
        href="/orders"
        aria-label="Mis compras"
        className="relative hidden text-stone-700 sm:inline-flex md:hidden"
      >
        <ReceiptText className="h-5 w-5" />
      </Link>
      <Link
        href="/favorites"
        aria-label="Favoritos"
        className="relative hidden text-stone-700 sm:inline-flex md:hidden"
      >
        <Heart className="h-5 w-5" fill={favoriteCount > 0 ? "currentColor" : "none"} />
        <CountBadge count={favoriteCount} />
      </Link>
      <Link
        href="/cart"
        aria-label="Carrito"
        className="relative hidden text-stone-700 sm:inline-flex md:hidden"
      >
        <ShoppingBag className="h-5 w-5" />
        <CountBadge count={cartCount} />
      </Link>
    </>
  );
}

export function MobileCartBar() {
  const pathname = usePathname();
  const items = useCartStore((state) => state.items);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (cartCount === 0 || pathname === "/checkout") {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] border-t border-stone-200 bg-white/95 px-4 py-3 shadow-[0_-12px_30px_rgba(28,25,23,0.12)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <Link
          href="/cart"
          aria-label="Ver carrito"
          className="relative inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-stone-900"
        >
          <ShoppingBag className="h-6 w-6" />
          <CountBadge count={cartCount} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Total</p>
          <p className="truncate text-2xl font-semibold text-stone-950">{formatCurrency(total)}</p>
        </div>
        <Link
          href="/checkout"
          className="inline-flex h-14 shrink-0 items-center justify-center rounded-2xl bg-stone-800 px-6 text-lg font-semibold uppercase tracking-[0.08em] text-white"
        >
          Pago
        </Link>
      </div>
    </div>
  );
}
