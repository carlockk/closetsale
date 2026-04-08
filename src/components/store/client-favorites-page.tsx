"use client";

import { useEffect, useState } from "react";

import { ProductCard } from "@/components/product-card";

type Product = {
  id: string;
  slug: string;
  title: string;
  price: number;
  brand: string | null;
  category: { name: string };
  images: { url: string }[];
  variants: { id: string }[];
};

export function ClientFavoritesPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("closetsale_favorites") || "{\"state\":{\"items\":[]}}");
    const ids = favorites.state?.items || [];

    fetch("/api/products")
      .then((response) => response.json())
      .then((json) => setProducts(json.filter((product: Product) => ids.includes(product.id))));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <h1 className="font-serif text-5xl text-stone-950">Favoritos</h1>
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
