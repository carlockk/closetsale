import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderDetailPaymentState } from "@/components/store/order-detail-payment-state";
import { getSession } from "@/lib/auth";
import { getOrderForViewer } from "@/lib/order-history";
import { formatCurrency } from "@/lib/utils";

type OrderDetailPageProps = {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ email?: string; payment?: string; message?: string }>;
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: OrderDetailPageProps) {
  const [{ orderNumber }, { email, payment, message }] = await Promise.all([
    params,
    searchParams,
  ]);
  const session = await getSession();
  const order = await getOrderForViewer(orderNumber, {
    userId: session?.userId || null,
    email: email || session?.email || null,
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="bg-white">
      <OrderDetailPaymentState
        email={email || order.customerEmail}
        orderNumber={order.orderNumber}
        payment={payment}
      />
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="border-b border-stone-200 pb-6">
          <p className="text-xs uppercase tracking-[0.32em] text-stone-400">Compra</p>
          <h1 className="mt-3 font-serif text-5xl text-stone-950">{order.orderNumber}</h1>
          <p className="mt-4 text-stone-600">
            {new Date(order.createdAt).toLocaleString("es-CL")} · {order.status}
          </p>
        </div>

        {payment || message ? (
          <div className="mt-8 border border-stone-200 px-5 py-5 text-stone-700">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Pago</p>
            <p className="mt-2 font-serif text-2xl text-stone-950">
              {message ||
                (payment === "approved"
                  ? "Pedido confirmado"
                  : payment === "cancelled"
                    ? "No se pudo completar el pago"
                    : "Tu pago esta pendiente de confirmacion")}
            </p>
            <p className="mt-3 text-sm text-stone-600">
              {payment === "approved"
                ? "Tu compra ya esta registrada. Desde aqui puedes revisar el detalle y seguir navegando."
                : payment === "cancelled"
                  ? "Puedes revisar este pedido y, si quieres, volver a intentarlo mas tarde."
                  : "Mercado Pago aun esta procesando la transaccion. Este pedido se actualizara cuando la confirmacion termine."}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <Link
                href="/"
                className="bg-stone-900 px-5 py-2 text-sm uppercase tracking-[0.2em] text-white transition hover:bg-stone-800"
              >
                Ir a inicio
              </Link>
              <Link
                href="/orders"
                className="text-sm uppercase tracking-[0.18em] text-stone-600 underline-offset-4 hover:text-stone-950 hover:underline"
              >
                Ver mis compras
              </Link>
            </div>
          </div>
        ) : null}

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0">
            <div className="border-b border-stone-200 pb-4">
              <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Pedido</p>
              <h2 className="mt-2 font-serif text-3xl text-stone-950">Detalle de compra</h2>
            </div>

            <div className="mt-6 divide-y divide-stone-200 border-y border-stone-200">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 py-5 md:flex-row md:items-start md:justify-between"
                >
                  <div className="flex min-w-0 gap-4">
                    <div className="h-24 w-20 shrink-0 overflow-hidden bg-stone-100">
                      <Image
                        src={item.product.images[0]?.url || "https://via.placeholder.com/320x400"}
                        alt={item.title}
                        width={320}
                        height={400}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-stone-950">{item.title}</p>
                      <p className="mt-1 text-sm text-stone-500">Cantidad: {item.quantity}</p>
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="mt-2 inline-flex text-sm text-stone-700 underline-offset-4 hover:underline"
                      >
                        Ver producto
                      </Link>
                    </div>
                  </div>
                  <div className="shrink-0 text-sm text-stone-700 md:text-right">
                    <p>{formatCurrency(Number(item.unitPrice))} c/u</p>
                    <p className="mt-1 font-semibold text-stone-950">
                      {formatCurrency(Number(item.lineTotal))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="h-fit border-l border-stone-200 pl-0 lg:pl-8">
            <div className="border-b border-stone-200 pb-4">
              <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Resumen</p>
              <h2 className="mt-2 font-serif text-3xl text-stone-950">Datos del pedido</h2>
            </div>

            <div className="grid gap-6 border-b border-stone-200 py-6 text-sm text-stone-700">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Cliente</p>
                <div className="mt-2 space-y-1">
                  <p>{order.customerName}</p>
                  <p>{order.customerEmail}</p>
                  {order.customerPhone ? <p>{order.customerPhone}</p> : null}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Entrega</p>
                <div className="mt-2 space-y-1">
                  {order.shippingAddress ? <p>{order.shippingAddress}</p> : <p>Sin direccion registrada</p>}
                  {order.notes ? <p>Nota: {order.notes}</p> : null}
                </div>
              </div>
            </div>

            <div className="border-b border-stone-200 py-6">
              <div className="flex items-center justify-between text-sm text-stone-500">
                <span>Subtotal</span>
                <span>{formatCurrency(Number(order.subtotal))}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-lg font-semibold text-stone-950">
                <span>Total</span>
                <span>{formatCurrency(Number(order.total))}</span>
              </div>
            </div>

            <div className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/orders"
                  className="inline-flex border border-stone-900 px-5 py-2 text-sm uppercase tracking-[0.2em] text-stone-900 transition hover:bg-stone-900 hover:text-white"
                >
                  Volver a mis compras
                </Link>
                <Link
                  href="/"
                  className="text-sm uppercase tracking-[0.18em] text-stone-600 underline-offset-4 hover:text-stone-950 hover:underline"
                >
                  Ir a inicio
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
