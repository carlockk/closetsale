import Link from "next/link";
import { notFound } from "next/navigation";

import { getSession } from "@/lib/auth";
import { getOrderForViewer } from "@/lib/order-history";
import { formatCurrency } from "@/lib/utils";

type OrderDetailPageProps = {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ email?: string }>;
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: OrderDetailPageProps) {
  const [{ orderNumber }, { email }] = await Promise.all([params, searchParams]);
  const session = await getSession();
  const order = await getOrderForViewer(orderNumber, {
    userId: session?.userId || null,
    email: email || session?.email || null,
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
      <div className="border-b border-stone-200 pb-6">
        <p className="text-xs uppercase tracking-[0.32em] text-stone-400">Compra</p>
        <h1 className="mt-3 font-serif text-5xl text-stone-950">{order.orderNumber}</h1>
        <p className="mt-4 text-stone-600">
          {new Date(order.createdAt).toLocaleString("es-CL")} · {order.status}
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <section className="rounded-[1.5rem] bg-white p-6 ring-1 ring-stone-200">
          <h2 className="text-lg font-semibold text-stone-950">Detalle del pedido</h2>
          <div className="mt-5 space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 border-b border-stone-100 pb-4 last:border-0 last:pb-0 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium text-stone-950">{item.title}</p>
                  <p className="mt-1 text-sm text-stone-500">Cantidad: {item.quantity}</p>
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="mt-2 inline-flex text-sm text-stone-700 underline-offset-4 hover:underline"
                  >
                    Ver producto
                  </Link>
                </div>
                <div className="text-sm text-stone-700 md:text-right">
                  <p>{formatCurrency(Number(item.unitPrice))} c/u</p>
                  <p className="mt-1 font-semibold text-stone-950">
                    {formatCurrency(Number(item.lineTotal))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="h-fit rounded-[1.5rem] bg-stone-900 p-6 text-white">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Resumen</p>
          <div className="mt-5 space-y-3 text-sm">
            <p>{order.customerName}</p>
            <p>{order.customerEmail}</p>
            {order.customerPhone ? <p>{order.customerPhone}</p> : null}
            {order.shippingAddress ? <p>{order.shippingAddress}</p> : null}
            {order.notes ? <p>Nota: {order.notes}</p> : null}
          </div>
          <div className="mt-6 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between text-sm text-stone-300">
              <span>Subtotal</span>
              <span>{formatCurrency(Number(order.subtotal))}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatCurrency(Number(order.total))}</span>
            </div>
          </div>
          <Link
            href="/orders"
            className="mt-6 inline-flex rounded-full bg-white px-5 py-2 text-sm uppercase tracking-[0.2em] text-stone-900"
          >
            Volver a mis compras
          </Link>
        </aside>
      </div>
    </div>
  );
}
