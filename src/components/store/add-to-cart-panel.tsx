"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { useCartStore } from "@/components/store/store";
import { formatCurrency } from "@/lib/utils";

type Variant = {
  id: string;
  name: string;
  value: string;
  stock: number;
  priceDelta: unknown;
};

type AddToCartPanelProps = {
  product: {
    id: string;
    title: string;
    slug: string;
    price: unknown;
    images: { url: string }[];
    variants: Variant[];
  };
};

export function AddToCartPanel({ product }: AddToCartPanelProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const selectedVariant = product.variants.find((variant) => variant.id === selectedVariantId);
  const unitPrice = Number(product.price) + Number(selectedVariant?.priceDelta || 0);

  return (
    <div className="rounded-[1rem] border border-stone-200 bg-white p-6 shadow-sm">
      <p className="text-3xl font-semibold text-stone-950">{formatCurrency(unitPrice)}</p>

      {product.variants.length > 0 ? (
        <div className="mt-6">
          <p className="text-sm uppercase tracking-[0.25em] text-stone-400">Variantes</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariantId(variant.id)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  variant.id === selectedVariantId
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-700"
                }`}
              >
                {variant.name}: {variant.value}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex items-center gap-3">
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          className="w-24 rounded-full border border-stone-200 px-4 py-3 outline-none"
        />
        <button
          type="button"
          onClick={() => {
            addItem({
              productId: product.id,
              title: product.title,
              slug: product.slug,
              imageUrl: product.images[0]?.url || "",
              quantity,
              price: unitPrice,
              variantId: selectedVariant?.id,
              variantLabel: selectedVariant
                ? `${selectedVariant.name}: ${selectedVariant.value}`
                : undefined,
            });
            toast.success("Producto agregado al carrito");
          }}
          className="flex-1 rounded-full bg-stone-900 px-6 py-3 text-sm font-medium uppercase tracking-[0.22em] text-white transition hover:bg-stone-700"
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
}
