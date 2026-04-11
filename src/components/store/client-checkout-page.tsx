"use client";

import { useEffect } from "react";
import Link from "next/link";

import { checkoutAction } from "@/actions/checkout";
import { SectionHeading } from "@/components/section-heading";
import { saveGuestOrderReference } from "@/components/store/order-history-page";
import { useCartStore } from "@/components/store/store";
import { formatCurrency } from "@/lib/utils";

export function ClientCheckoutPage({
  message,
  orderNumber,
  email,
  isMercadoPagoReady,
}: {
  message?: string;
  orderNumber?: string;
  email?: string;
  isMercadoPagoReady: boolean;
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
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <SectionHeading
          eyebrow="Checkout"
          title="Finaliza tu compra"
          description="Completa tus datos y revisa el pedido antes de continuar con el pago."
        />

        {message ? (
          <div className="mb-8 border border-stone-200 px-5 py-4 text-stone-700">
            <p>{message}</p>
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

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <div className="border-b border-stone-200 pb-4">
              <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Pago</p>
              <h2 className="mt-2 font-serif text-3xl text-stone-950">Metodo de pago</h2>
            </div>

            <div className="mt-5 border-b border-stone-200 pb-6 text-sm text-stone-600">
              {isMercadoPagoReady ? (
                <div className="space-y-2">
                  <p>Seras redirigido a Mercado Pago para elegir y completar el pago.</p>
                  <p>Podras pagar con tarjeta, transferencia y otros medios disponibles segun tu cuenta y tu pais.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p>La pasarela de pago todavia no esta conectada en este entorno.</p>
                  <p>Por eso ahora el checkout solo confirma el pedido y no muestra opciones como tarjeta, efectivo o transferencia.</p>
                </div>
              )}
            </div>

            <form action={checkoutAction} className="mt-8">
              <div className="border-b border-stone-200 pb-4">
                <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Datos</p>
                <h2 className="mt-2 font-serif text-3xl text-stone-950">Informacion de contacto</h2>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <input
                  name="customerName"
                  placeholder="Nombre completo"
                  className="border border-stone-200 px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
                  required
                />
                <input
                  name="customerEmail"
                  type="email"
                  placeholder="Correo"
                  className="border border-stone-200 px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
                  required
                />
              </div>

              <div className="mt-4 grid gap-4">
                <input
                  name="customerPhone"
                  placeholder="Telefono"
                  className="border border-stone-200 px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
                />
                <textarea
                  name="shippingAddress"
                  placeholder="Direccion de envio"
                  rows={4}
                  className="border border-stone-200 px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
                  required
                />
                <textarea
                  name="notes"
                  placeholder="Notas"
                  rows={3}
                  className="border border-stone-200 px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
                />
              </div>

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

              <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-stone-200 pt-6">
                <button className="bg-stone-900 px-6 py-3 text-sm uppercase tracking-[0.2em] text-white transition hover:bg-stone-800">
                  {isMercadoPagoReady ? "Continuar al pago" : "Confirmar pedido"}
                </button>
                <Link
                  href="/cart"
                  className="text-sm uppercase tracking-[0.18em] text-stone-600 underline-offset-4 hover:text-stone-950 hover:underline"
                >
                  Volver al carrito
                </Link>
              </div>
            </form>
          </div>

          <aside className="h-fit border-l border-stone-200 pl-0 lg:pl-8">
            <div className="border-b border-stone-200 pb-4">
              <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Resumen</p>
              <h2 className="mt-2 font-serif text-3xl text-stone-950">Tu pedido</h2>
            </div>

            <div className="mt-6 space-y-4">
              {items.map((item) => (
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
              ))}
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
          </aside>
        </div>
      </div>
    </div>
  );
}
