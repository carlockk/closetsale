"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ProductCard } from "@/components/product-card";

type CarouselProduct = {
  id: string;
  slug: string;
  title: string;
  price: unknown;
  brand: string | null;
  category: { name: string };
  images: { url: string }[];
  variants: { id: string }[];
  seller?: {
    storeName: string;
    slug: string;
  } | null;
};

export function FeaturedProductsCarousel({ products }: { products: CarouselProduct[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visibleCards, setVisibleCards] = useState(3);
  const touchPausedRef = useRef(false);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1280) {
        setVisibleCards(3);
        return;
      }

      if (window.innerWidth >= 768) {
        setVisibleCards(2);
        return;
      }

      setVisibleCards(1);
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const normalizedProducts = useMemo(() => {
    if (products.length === 0) {
      return [];
    }

    if (products.length >= visibleCards) {
      return products;
    }

    const filled = [...products];
    let index = 0;

    while (filled.length < visibleCards) {
      filled.push(products[index % products.length]);
      index += 1;
    }

    return filled;
  }, [products, visibleCards]);

  const canSlide = normalizedProducts.length > visibleCards;
  const pages = canSlide ? normalizedProducts.length : 1;

  useEffect(() => {
    if (!canSlide || paused) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrent((value) => (value + 1) % pages);
    }, 3500);

    return () => window.clearInterval(timer);
  }, [canSlide, paused, pages]);

  useEffect(() => {
    if (!canSlide && current !== 0) {
      setCurrent(0);
    }
  }, [canSlide, current]);

  const visibleProducts = Array.from({ length: visibleCards }, (_, index) => {
    return normalizedProducts[(current + index) % normalizedProducts.length];
  });

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        touchPausedRef.current = false;
        setPaused(false);
      }}
      onTouchStart={() => {
        if (!touchPausedRef.current) {
          touchPausedRef.current = true;
          setPaused(true);
        }
      }}
      className="relative"
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visibleProducts.map((product, index) => (
          <div key={`${product.id}-${index}`}>
            <ProductCard product={product} variant="home" />
          </div>
        ))}
      </div>

      {canSlide ? (
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrent((value) => (value - 1 + pages) % pages)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 text-stone-800 transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-950"
              aria-label="Productos anteriores"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setCurrent((value) => (value + 1) % pages)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 text-stone-800 transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-950"
              aria-label="Productos siguientes"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center rounded-full border border-stone-200 px-5 py-2 text-sm uppercase tracking-[0.24em] text-stone-800 transition hover:border-stone-300 hover:text-stone-950"
          >
            Ver mas
          </Link>
        </div>
      ) : (
        <div className="mt-6">
          <Link
            href="/products"
            className="inline-flex items-center rounded-full border border-stone-200 px-5 py-2 text-sm uppercase tracking-[0.24em] text-stone-800 transition hover:border-stone-300 hover:text-stone-950"
          >
            Ver mas
          </Link>
        </div>
      )}
    </div>
  );
}
