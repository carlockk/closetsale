"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";

import { SectionHeading } from "@/components/section-heading";
import { useRecentStore } from "@/components/store/store";
import { formatCurrency } from "@/lib/utils";

type Product = {
  id: string;
  slug: string;
  title: string;
  price: unknown;
  brand: string | null;
  category: { name: string };
  images: { url: string }[];
  variants: { id: string }[];
};

export function RecentProductTracker({ productId }: { productId: string }) {
  const push = useRecentStore((state) => state.push);

  useEffect(() => {
    push(productId);

    const storageKey = `closetsale-product-view:${productId}`;
    const lastTrackedAt = Number(window.localStorage.getItem(storageKey) || "0");
    const now = Date.now();
    const THROTTLE_MS = 1000 * 60 * 30;

    if (now - lastTrackedAt < THROTTLE_MS) {
      return;
    }

    window.localStorage.setItem(storageKey, String(now));
    void fetch(`/api/products/${productId}/view`, {
      method: "POST",
    }).catch(() => {
      window.localStorage.removeItem(storageKey);
    });
  }, [productId, push]);

  return null;
}

export function RecentlyViewedProducts({ products }: { products: Product[] }) {
  const ids = useRecentStore((state) => state.items);

  const selected = useMemo(
    () =>
      ids
        .map((id) => products.find((product) => product.id === id))
        .filter(Boolean)
        .slice(0, 5) as Product[],
    [ids, products],
  );

  if (selected.length === 0) {
    return (
      <div className="rounded-[1rem] border border-dashed border-stone-300 p-8 text-center text-stone-500">
        Aun no hay productos recientes. Explora el{" "}
        <Link href="/products" className="underline">
          catalogo
        </Link>
        .
      </div>
    );
  }

  return (
    <section className="mt-20">
      <SectionHeading
        eyebrow="Vistos recientemente"
        title="Retoma donde quedaste"
      />
      <div
        className={`grid gap-3 md:grid-cols-2 lg:grid-cols-3 ${
          selected.length >= 5
            ? "xl:grid-cols-5"
            : selected.length === 4
              ? "xl:grid-cols-4"
              : "xl:grid-cols-3"
        }`}
      >
        {selected.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group flex items-center gap-4 border border-stone-200 bg-white p-3 transition hover:border-stone-300 hover:bg-stone-50"
          >
            <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-stone-100">
              <Image
                src={product.images[0]?.url || "https://via.placeholder.com/800x1000"}
                alt={product.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
                sizes="80px"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400">
                {product.category.name}
              </p>
              <p className="mt-2 line-clamp-2 text-sm font-medium text-stone-900">
                {product.title}
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="truncate text-sm text-stone-500">{product.brand || "Seleccion editor"}</p>
                <p className="text-sm font-semibold text-stone-950">
                  {formatCurrency(Number(product.price))}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
