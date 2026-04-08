"use client";

import Link from "next/link";

import { useCartStore, useFavoriteStore } from "@/components/store/store";

export function HeaderBadges() {
  const cartCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const favoriteCount = useFavoriteStore((state) => state.items.length);

  return (
    <div className="hidden items-center gap-2 md:flex">
      <Link href="/favorites" className="rounded-full bg-white px-3 py-1 text-xs text-stone-600">
        {favoriteCount} favoritos
      </Link>
      <Link href="/cart" className="rounded-full bg-stone-900 px-3 py-1 text-xs text-white">
        {cartCount} en carrito
      </Link>
    </div>
  );
}
