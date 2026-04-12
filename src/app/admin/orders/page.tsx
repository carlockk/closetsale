import Link from "next/link";

import { updateOrderStatusAction } from "@/actions/admin";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

type AdminOrdersPageProps = {
  searchParams: Promise<{ message?: string }>;
};

const ORDER_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendiente" },
  { value: "PAID", label: "Pagado" },
  { value: "CANCELLED", label: "Cancelado" },
] as const;

function getOrderStatusLabel(status: string) {
  return ORDER_STATUS_OPTIONS.find((option) => option.value === status)?.label || status;
}

function getOrderStatusClassName(status: string) {
  switch (status) {
    case "PAID":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "CANCELLED":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const params = await searchParams;
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        orderBy: { id: "asc" },
        select: { id: true, title: true, quantity: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Pedidos</p>
        <h1 className="mt-2 font-serif text-3xl text-slate-950">Gestion de pedidos</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600">
          Aqui puedes revisar compras, validar estados y cancelar pedidos sin borrar historial.
        </p>
      </div>

      {params.message ? (
        <div className="border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {params.message}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        <div className="border border-slate-200 bg-white px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Total</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{orders.length}</p>
        </div>
        <div className="border border-slate-200 bg-white px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Pendientes</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {orders.filter((order) => order.status === "PENDING").length}
          </p>
        </div>
        <div className="border border-slate-200 bg-white px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Pagados</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {orders.filter((order) => order.status === "PAID").length}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="border border-slate-200 bg-white px-4 py-10 text-slate-500">
            Aun no hay pedidos registrados.
          </div>
        ) : (
          orders.map((order) => (
            <article key={order.id} className="border border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-semibold text-slate-950">{order.orderNumber}</p>
                    <span
                      className={`inline-flex border px-2 py-1 text-[11px] uppercase tracking-[0.18em] ${getOrderStatusClassName(order.status)}`}
                    >
                      {getOrderStatusLabel(order.status)}
                    </span>
                    {order.paymentProvider ? (
                      <span className="inline-flex border border-slate-200 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                        {order.paymentProvider.replaceAll("_", " ")}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-slate-700">
                    {order.customerName} · {order.customerEmail}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleString("es-CL")}
                  </p>
                  {order.shippingAddress ? (
                    <p className="mt-3 text-sm text-slate-600">{order.shippingAddress}</p>
                  ) : null}
                  {order.notes ? (
                    <p className="mt-2 text-sm text-slate-500">Nota: {order.notes}</p>
                  ) : null}
                </div>

                <div className="shrink-0 xl:text-right">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Total</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {formatCurrency(Number(order.total))}
                  </p>
                  {order.paidAt ? (
                    <p className="mt-2 text-sm text-slate-500">
                      Pagado: {new Date(order.paidAt).toLocaleString("es-CL")}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 grid gap-5 border-t border-slate-200 pt-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    Items
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4">
                        <span className="min-w-0">
                          {item.title} x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <form action={updateOrderStatusAction} className="space-y-3">
                    <input type="hidden" name="orderId" value={order.id} />
                    <label className="block">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        Estado admin
                      </span>
                      <select
                        name="status"
                        defaultValue={order.status}
                        className="mt-2 w-full border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                      >
                        {ORDER_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <button className="bg-slate-900 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-white transition hover:bg-slate-800">
                      Guardar estado
                    </button>
                  </form>

                  <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 pt-4">
                    <Link
                      href={`/orders/${order.orderNumber}?email=${encodeURIComponent(order.customerEmail)}`}
                      className="text-sm uppercase tracking-[0.18em] text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline"
                    >
                      Ver vista cliente
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
