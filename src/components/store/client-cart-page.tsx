"use client";

import Image from "next/image";
import Link from "next/link";

import { useCartStore } from "@/components/store/store";
import { formatCurrency } from "@/lib/utils";

export function ClientCartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <h1 className="font-serif text-5xl text-stone-950">Carrito</h1>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="rounded-[1rem] bg-white p-8 text-stone-500 ring-1 ring-stone-200">
              Tu carrito esta vacio. <Link href="/products" className="underline">Ir al catalogo</Link>
            </div>
          ) : (
            items.map((item) => (
              <article key={`${item.productId}-${item.variantId}`} className="grid gap-4 rounded-[1rem] bg-white p-4 ring-1 ring-stone-200 md:grid-cols-[120px_1fr_auto] md:items-center">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  width={120}
                  height={140}
                  className="aspect-[4/5] rounded-[0.85rem] object-cover"
                />
                <div>
                  <p className="font-medium text-stone-900">{item.title}</p>
                  {item.variantLabel ? <p className="text-sm text-stone-500">{item.variantLabel}</p> : null}
                  <p className="mt-2 font-semibold">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(event) =>
                      updateQuantity(item.productId, item.variantId, Number(event.target.value))
                    }
                    className="w-20 rounded-full border border-stone-200 px-4 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="text-sm text-stone-500 underline"
                  >
                    Quitar
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        <aside className="h-fit rounded-[1rem] bg-stone-900 p-6 text-white">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Resumen</p>
          <div className="mt-6 flex items-center justify-between">
            <span>Total</span>
            <strong className="text-2xl">{formatCurrency(total)}</strong>
          </div>
          <Link
            href="/checkout"
            className="mt-6 inline-flex w-full justify-center rounded-full bg-[#d5b26f] px-6 py-3 text-sm font-medium uppercase tracking-[0.2em] text-stone-950"
          >
            Continuar compra
          </Link>
        </aside>
      </div>
    </div>
  );
}
