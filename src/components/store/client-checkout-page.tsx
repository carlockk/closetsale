"use client";

import { useEffect } from "react";
import Link from "next/link";

import { checkoutAction } from "@/actions/checkout";
import { saveGuestOrderReference } from "@/components/store/order-history-page";
import { useCartStore } from "@/components/store/store";
import { formatCurrency } from "@/lib/utils";

export function ClientCheckoutPage({
  message,
  orderNumber,
  email,
}: {
  message?: string;
  orderNumber?: string;
  email?: string;
}) {
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    if (message === "Pedido confirmado") {
      clear();
    }
  }, [clear, message]);

  useEffect(() => {
    if (message === "Pedido confirmado" && orderNumber && email) {
      saveGuestOrderReference({ orderNumber, email });
    }
  }, [email, message, orderNumber]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <h1 className="font-serif text-5xl text-stone-950">Checkout</h1>
      {message ? (
        <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-stone-700 ring-1 ring-stone-200">
          {message}
          {orderNumber ? (
            <div className="mt-3">
              <Link
                href={`/orders/${orderNumber}${email ? `?email=${encodeURIComponent(email)}` : ""}`}
                className="inline-flex text-sm uppercase tracking-[0.18em] text-stone-950 underline-offset-4 hover:underline"
              >
                Ver detalle de compra
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <form action={checkoutAction} className="grid gap-4 rounded-[1rem] bg-white p-6 ring-1 ring-stone-200">
          <div className="grid gap-4 md:grid-cols-2">
            <input name="customerName" placeholder="Nombre completo" className="rounded-2xl border border-stone-200 px-4 py-3" required />
            <input name="customerEmail" type="email" placeholder="Correo" className="rounded-2xl border border-stone-200 px-4 py-3" required />
          </div>
          <input name="customerPhone" placeholder="Telefono" className="rounded-2xl border border-stone-200 px-4 py-3" />
          <textarea name="shippingAddress" placeholder="Direccion de envio" rows={4} className="rounded-2xl border border-stone-200 px-4 py-3" required />
          <textarea name="notes" placeholder="Notas" rows={3} className="rounded-2xl border border-stone-200 px-4 py-3" />
          <input
            type="hidden"
            name="items"
            value={JSON.stringify(
              items.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
              })),
            )}
          />
          <button className="rounded-full bg-stone-900 px-6 py-3 text-sm uppercase tracking-[0.2em] text-white">
            Confirmar pedido
          </button>
        </form>

        <aside className="h-fit rounded-[1rem] bg-stone-900 p-6 text-white">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Tu pedido</p>
          <div className="mt-6 space-y-3">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} className="flex items-center justify-between gap-3 text-sm">
                <span>{item.title} x{item.quantity}</span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
            <span>Total</span>
            <strong className="text-2xl">{formatCurrency(total)}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
}
