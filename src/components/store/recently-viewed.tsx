"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";

import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { useRecentStore } from "@/components/store/store";

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
        .slice(0, 4) as Product[],
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
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {selected.map((product) => (
          <ProductCard key={product.id} product={product} variant="home" />
        ))}
      </div>
    </section>
  );
}
