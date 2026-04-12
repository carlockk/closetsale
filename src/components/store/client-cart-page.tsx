"use client";

import Image from "next/image";
import Link from "next/link";

import { SectionHeading } from "@/components/section-heading";
import { useCartStore } from "@/components/store/store";
import { formatCurrency } from "@/lib/utils";

export function ClientCartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <SectionHeading
          eyebrow="Carrito"
          title="Revisa tu seleccion"
          description="Ajusta cantidades, elimina piezas y continua cuando tu pedido quede listo."
        />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <div className="border-b border-stone-200 pb-4">
              <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Productos</p>
              <h2 className="mt-2 font-serif text-3xl text-stone-950">Tu carrito</h2>
            </div>

          {items.length === 0 ? (
            <div className="mt-6 border border-stone-200 px-6 py-10 text-stone-500">
              Tu carrito esta vacio.{" "}
              <Link href="/products" className="text-stone-950 underline underline-offset-4">
                Ir al catalogo
              </Link>
            </div>
          ) : (
            <div className="mt-6 divide-y divide-stone-200 border-t border-stone-200">
              {items.map((item) => (
                <article
                  key={`${item.productId}-${item.variantId}`}
                  className="grid gap-5 py-6 md:grid-cols-[140px_minmax(0,1fr)_auto] md:items-center"
                >
                  <div className="relative overflow-hidden bg-stone-100">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      width={140}
                      height={176}
                      className="aspect-[4/5] w-full object-cover md:w-[140px]"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">
                      Seleccion
                    </p>
                    <p className="mt-2 font-serif text-2xl text-stone-950">{item.title}</p>
                    {item.variantLabel ? (
                      <p className="mt-2 text-sm text-stone-500">{item.variantLabel}</p>
                    ) : null}
                    <p className="mt-4 text-sm font-semibold text-stone-950">
                      {formatCurrency(item.price)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 md:justify-end">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(event) =>
                        updateQuantity(item.productId, item.variantId, Number(event.target.value))
                      }
                      className="w-20 border border-stone-200 px-4 py-2 text-stone-900 outline-none transition focus:border-stone-900"
                    />
                    <p className="min-w-24 text-right text-sm text-stone-950">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="text-sm uppercase tracking-[0.16em] text-stone-500 underline-offset-4 hover:text-stone-950 hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
          </div>

          <aside className="h-fit border-l border-stone-200 pl-0 lg:pl-8">
            <div className="border-b border-stone-200 pb-4">
              <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Resumen</p>
              <h2 className="mt-2 font-serif text-3xl text-stone-950">Tu pedido</h2>
            </div>

            <div className="mt-6 space-y-4">
              {items.length === 0 ? (
                <p className="text-sm text-stone-500">Aun no has agregado productos.</p>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4 text-sm text-stone-700"
                  >
                    <span className="min-w-0">
                      {item.title} x{item.quantity}
                    </span>
                    <span className="shrink-0 text-stone-950">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 border-t border-stone-200 pt-4">
              <div className="flex items-center justify-between text-sm text-stone-500">
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-lg font-semibold text-stone-950">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-stone-200 pt-6">
              <Link
                href="/checkout"
                className="bg-stone-900 px-6 py-3 text-sm uppercase tracking-[0.2em] text-white transition hover:bg-stone-800"
              >
                Continuar compra
              </Link>
              <Link
                href="/products"
                className="text-sm uppercase tracking-[0.18em] text-stone-600 underline-offset-4 hover:text-stone-950 hover:underline"
              >
                Seguir comprando
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
