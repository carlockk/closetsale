import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatShortDate } from "@/lib/utils";

type AdminPayoutDetailPageProps = {
  params: Promise<{ payoutId: string }>;
};

export default async function AdminPayoutDetailPage({ params }: AdminPayoutDetailPageProps) {
  const { payoutId } = await params;
  await requireAdmin();

  const payout = await prisma.payout.findUnique({
    where: { id: payoutId },
    include: {
      seller: {
        select: {
          storeName: true,
          slug: true,
        },
      },
      items: {
        orderBy: {
          sellerOrder: {
            createdAt: "asc",
          },
        },
        include: {
          sellerOrder: {
            include: {
              order: {
                select: {
                  orderNumber: true,
                  customerName: true,
                  customerEmail: true,
                  shippingAddress: true,
                },
              },
              items: {
                select: {
                  id: true,
                  title: true,
                  quantity: true,
                  lineTotal: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!payout) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <Link href="/admin/payouts" className="text-[11px] uppercase tracking-[0.18em] text-slate-500 hover:text-slate-950">
          Volver a liquidaciones
        </Link>
        <p className="mt-4 text-[11px] uppercase tracking-[0.24em] text-slate-400">Liquidacion admin</p>
        <h1 className="mt-2 font-serif text-3xl text-slate-950">
          {payout.seller.storeName} · detalle de payout
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600">
          Revisa el desglose completo de la liquidacion antes o despues de marcarla como pagada.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <div className="border border-slate-200 bg-white px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Seller</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{payout.seller.storeName}</p>
          <p className="mt-1 text-xs text-slate-500">/{payout.seller.slug}</p>
        </div>
        <div className="border border-slate-200 bg-white px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Estado</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{payout.status}</p>
        </div>
        <div className="border border-slate-200 bg-white px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Bruto</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{formatCurrency(Number(payout.grossAmount))}</p>
        </div>
        <div className="border border-slate-200 bg-white px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Comision</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{formatCurrency(Number(payout.commissionAmount))}</p>
        </div>
        <div className="border border-slate-200 bg-white px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Neto</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{formatCurrency(Number(payout.netAmount))}</p>
        </div>
        <div className="border border-slate-200 bg-white px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Periodo</p>
          <p className="mt-2 text-sm font-medium text-slate-950">
            {formatShortDate(payout.periodStart)} - {formatShortDate(payout.periodEnd)}
          </p>
          {payout.externalReference ? (
            <p className="mt-2 text-xs text-slate-500">Ref: {payout.externalReference}</p>
          ) : null}
        </div>
      </div>

      <section className="space-y-4">
        {payout.items.map((item) => (
          <article key={item.id} className="border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-950">{item.sellerOrder.order.orderNumber}</p>
                <p className="mt-2 text-sm text-slate-700">
                  {item.sellerOrder.order.customerName} · {item.sellerOrder.order.customerEmail}
                </p>
                {item.sellerOrder.order.shippingAddress ? (
                  <p className="mt-1 text-sm text-slate-500">{item.sellerOrder.order.shippingAddress}</p>
                ) : null}
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">
                  Estado seller: {item.sellerOrder.status}
                </p>
              </div>

              <div className="grid gap-1 text-sm text-slate-600 xl:text-right">
                <p>Bruto: {formatCurrency(Number(item.grossAmount))}</p>
                <p>Comision: {formatCurrency(Number(item.commissionAmount))}</p>
                <p className="font-semibold text-slate-950">Neto: {formatCurrency(Number(item.netAmount))}</p>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Items</p>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                {item.sellerOrder.items.map((orderItem) => (
                  <div key={orderItem.id} className="flex items-center justify-between gap-4">
                    <span>{orderItem.title} x{orderItem.quantity}</span>
                    <span>{formatCurrency(Number(orderItem.lineTotal))}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
