import Image from "next/image";
import Link from "next/link";

import { FavoriteToggle } from "@/components/store/favorite-toggle";
import { formatCurrency } from "@/lib/utils";

type ProductCardProps = {
  product: {
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
  variant?: "default" | "home";
};

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const image = product.images[0]?.url || "https://via.placeholder.com/800x1000";
  const isHome = variant === "home";

  return (
    <article
      className={`group bg-white transition ${
        isHome ? "border border-stone-200 p-3" : ""
      }`}
    >
      <div className={`relative overflow-hidden bg-stone-100 ${isHome ? "" : ""}`}>
        <Link href={`/products/${product.slug}`}>
          <Image
            src={image}
            alt={product.title}
            width={800}
            height={1000}
            className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.02]"
          />
        </Link>
        <div className="absolute right-3 top-3">
          <FavoriteToggle productId={product.id} />
        </div>
      </div>
      <div className={isHome ? "px-1 pb-1 pt-4" : "pt-4"}>
        <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">
          {product.category.name}
        </p>
        {product.seller ? (
          <Link
            href={`/tienda/${product.seller.slug}`}
            className="mt-1 block text-[11px] uppercase tracking-[0.2em] text-stone-500 transition hover:text-stone-800"
          >
            Vendido por {product.seller.storeName}
          </Link>
        ) : null}
        <Link href={`/products/${product.slug}`} className="mt-2 block text-base font-medium text-stone-900">
          {product.title}
        </Link>
        <div className="mt-2 flex items-center justify-between gap-4">
          <p className="text-sm text-stone-500">{product.brand || "Seleccion editor"}</p>
          <p className="text-base font-semibold text-stone-950">
            {formatCurrency(Number(product.price))}
          </p>
        </div>
      </div>
    </article>
  );
}
