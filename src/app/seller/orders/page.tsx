import Link from "next/link";

import { updateSellerOwnOrderStatusAction } from "@/actions/seller";
import { requireSeller } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatShortDate } from "@/lib/utils";

type SellerOrdersPageProps = {
  searchParams: Promise<{ status?: string; message?: string }>;
};

function getStatusClassName(status: string) {
  switch (status) {
    case "DELIVERED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "SHIPPED":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "PREPARING":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "CONFIRMED":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "CANCELLED":
    case "REFUNDED":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-stone-200 bg-stone-100 text-stone-600";
  }
}

const STATUS_OPTIONS = [
  { value: "ALL", label: "Todos" },
  { value: "PENDING", label: "Pendientes" },
  { value: "CONFIRMED", label: "Confirmados" },
  { value: "PREPARING", label: "Preparando" },
  { value: "SHIPPED", label: "Enviados" },
  { value: "DELIVERED", label: "Entregados" },
  { value: "CANCELLED", label: "Cancelados" },
] as const;

const SELLER_ORDER_STATUS_VALUES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

type SellerOrderStatusValue = (typeof SELLER_ORDER_STATUS_VALUES)[number];

function getSellerOrderStatusFilter(status: string | undefined): SellerOrderStatusValue | undefined {
  if (!status || status === "ALL") {
    return undefined;
  }

  return SELLER_ORDER_STATUS_VALUES.find((value) => value === status);
}

function getSellerNextStatus(status: string) {
  switch (status) {
    case "CONFIRMED":
      return { value: "PREPARING", label: "Marcar preparando" };
    case "PREPARING":
      return { value: "SHIPPED", label: "Marcar enviado" };
    default:
      return null;
  }
}

export default async function SellerOrdersPage({ searchParams }: SellerOrdersPageProps) {
  const params = await searchParams;
  const seller = await requireSeller();
  const currentStatus = params.status || "ALL";
  const statusFilter = getSellerOrderStatusFilter(params.status);

  const sellerOrders = await prisma.sellerOrder.findMany({
    where: {
      sellerId: seller.id,
      status: statusFilter,
    },
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          customerEmail: true,
          customerPhone: true,
          shippingAddress: true,
          notes: true,
          createdAt: true,
          status: true,
          paymentProvider: true,
          paidAt: true,
        },
      },
      items: {
        select: {
          id: true,
          title: true,
          quantity: true,
          unitPrice: true,
          lineTotal: true,
          product: {
            select: {
              slug: true,
            },
          },
        },
      },
      payoutItems: {
        select: {
          payout: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      },
    },
  });

  const metrics = {
    total: sellerOrders.length,
    open: sellerOrders.filter((order) =>
      ["PENDING", "CONFIRMED", "PREPARING", "SHIPPED"].includes(order.status),
    ).length,
    delivered: sellerOrders.filter((order) => order.status === "DELIVERED").length,
    cancelled: sellerOrders.filter((order) =>
      ["CANCELLED", "REFUNDED"].includes(order.status),
    ).length,
    net: sellerOrders.reduce((sum, order) => sum + Number(order.netAmount), 0),
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-stone-200 pb-4">
        <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Seller / Pedidos</p>
        <h1 className="mt-2 font-serif text-3xl text-stone-950">Pedidos de tu tienda</h1>
        <p className="mt-3 max-w-3xl text-sm text-stone-600">
          Revisa las ventas que ya entraron a tu tienda, su estado operativo y el detalle que se usara para tus liquidaciones.
        </p>
      </div>

      {params.message ? (
        <div className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {params.message}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="border border-stone-200 bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Total</p>
          <p className="mt-3 font-serif text-3xl text-stone-950">{metrics.total}</p>
        </article>
        <article className="border border-stone-200 bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Abiertos</p>
          <p className="mt-3 font-serif text-3xl text-stone-950">{metrics.open}</p>
        </article>
        <article className="border border-stone-200 bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Entregados</p>
          <p className="mt-3 font-serif text-3xl text-stone-950">{metrics.delivered}</p>
        </article>
        <article className="border border-stone-200 bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Cancelados</p>
          <p className="mt-3 font-serif text-3xl text-stone-950">{metrics.cancelled}</p>
        </article>
        <article className="border border-stone-200 bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Neto</p>
          <p className="mt-3 font-serif text-3xl text-stone-950">{formatCurrency(metrics.net)}</p>
        </article>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-4">
        {STATUS_OPTIONS.map((option) => {
          const href = option.value === "ALL" ? "/seller/orders" : `/seller/orders?status=${option.value}`;
          const isActive = currentStatus === option.value;

          return (
            <Link
              key={option.value}
              href={href}
              className={`border px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition ${
                isActive
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-200 text-stone-600 hover:border-stone-900 hover:text-stone-950"
              }`}
            >
              {option.label}
            </Link>
          );
        })}
      </div>

      <div className="space-y-4">
        {sellerOrders.length === 0 ? (
          <div className="border border-stone-200 bg-white px-4 py-10 text-stone-500">
            No hay pedidos seller con ese filtro.
          </div>
        ) : (
          sellerOrders.map((sellerOrder) => (
            <article key={sellerOrder.id} className="border border-stone-200 bg-white p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-semibold text-stone-950">{sellerOrder.order.orderNumber}</p>
                    <span
                      className={`inline-flex border px-2 py-1 text-[11px] uppercase tracking-[0.18em] ${getStatusClassName(sellerOrder.status)}`}
                    >
                      {sellerOrder.status}
                    </span>
                    <span className="inline-flex border border-stone-200 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-500">
                      Pedido general: {sellerOrder.order.status}
                    </span>
                    {sellerOrder.payoutItems[0] ? (
                      <span className="inline-flex border border-stone-200 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-500">
                        Liquidacion: {sellerOrder.payoutItems[0].payout.status}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 text-sm text-stone-700">
                    {sellerOrder.order.customerName} · {sellerOrder.order.customerEmail}
                  </p>
                  <p className="mt-1 text-sm text-stone-500">
                    Compra: {new Date(sellerOrder.order.createdAt).toLocaleString("es-CL")} · Seller order: {formatShortDate(sellerOrder.createdAt)}
                  </p>
                  {sellerOrder.order.customerPhone ? (
                    <p className="mt-1 text-sm text-stone-500">Telefono: {sellerOrder.order.customerPhone}</p>
                  ) : null}
                  {sellerOrder.order.shippingAddress ? (
                    <p className="mt-3 text-sm text-stone-600">{sellerOrder.order.shippingAddress}</p>
                  ) : null}
                  {sellerOrder.order.notes ? (
                    <p className="mt-2 text-sm text-stone-500">Nota: {sellerOrder.order.notes}</p>
                  ) : null}
                </div>

                <div className="shrink-0 xl:text-right">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Neto seller</p>
                  <p className="mt-2 text-2xl font-semibold text-stone-950">
                    {formatCurrency(Number(sellerOrder.netAmount))}
                  </p>
                  <p className="mt-2 text-sm text-stone-500">
                    Bruto: {formatCurrency(Number(sellerOrder.subtotal))}
                  </p>
                  <p className="mt-1 text-sm text-stone-500">
                    Comision: {formatCurrency(Number(sellerOrder.commissionAmount))}
                  </p>
                  {sellerOrder.order.paidAt ? (
                    <p className="mt-2 text-sm text-stone-500">
                      Pagado: {new Date(sellerOrder.order.paidAt).toLocaleString("es-CL")}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 grid gap-5 border-t border-stone-200 pt-4 lg:grid-cols-[minmax(0,1fr)_240px]">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Items de tu tienda</p>
                  <div className="mt-3 space-y-2 text-sm text-stone-600">
                    {sellerOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4 border-b border-stone-100 pb-2 last:border-b-0 last:pb-0">
                        <div className="min-w-0">
                          <p className="font-medium text-stone-900">{item.title}</p>
                          <p className="mt-1 text-xs text-stone-500">
                            Cantidad: {item.quantity} · Unitario: {formatCurrency(Number(item.unitPrice))}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-semibold text-stone-950">{formatCurrency(Number(item.lineTotal))}</p>
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="mt-1 inline-block text-xs uppercase tracking-[0.14em] text-stone-500 underline-offset-4 hover:text-stone-900 hover:underline"
                          >
                            Ver producto
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="border border-stone-200 bg-stone-50 px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Estado operativo</p>
                    {getSellerNextStatus(sellerOrder.status) ? (
                      <form action={updateSellerOwnOrderStatusAction} className="mt-2 space-y-3">
                        <input type="hidden" name="sellerOrderId" value={sellerOrder.id} />
                        <input type="hidden" name="currentStatus" value={sellerOrder.status} />
                        <input type="hidden" name="status" value={getSellerNextStatus(sellerOrder.status)?.value} />
                        <input type="hidden" name="statusFilter" value={currentStatus} />
                        <p className="text-sm text-stone-700">
                          Puedes avanzar este pedido al siguiente estado operativo desde tu panel.
                        </p>
                        <button className="border border-stone-900 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-stone-900 transition hover:bg-stone-900 hover:text-white">
                          {getSellerNextStatus(sellerOrder.status)?.label}
                        </button>
                      </form>
                    ) : (
                      <p className="mt-2 text-sm text-stone-700">
                        {sellerOrder.status === "SHIPPED"
                          ? "Esperando confirmacion final de entrega por administracion."
                          : "Este estado ya no puede ser movido desde el panel seller."}
                      </p>
                    )}
                  </div>
                  <div className="border border-stone-200 bg-stone-50 px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Referencia cliente</p>
                    <Link
                      href={`/orders/${sellerOrder.order.orderNumber}?email=${encodeURIComponent(sellerOrder.order.customerEmail)}`}
                      className="mt-2 inline-block text-sm uppercase tracking-[0.18em] text-stone-700 underline-offset-4 hover:text-stone-950 hover:underline"
                    >
                      Abrir vista del comprador
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
