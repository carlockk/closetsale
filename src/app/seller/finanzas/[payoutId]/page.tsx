import Link from "next/link";
import { notFound } from "next/navigation";

import { requireSeller } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatShortDate } from "@/lib/utils";

type SellerPayoutDetailPageProps = {
  params: Promise<{ payoutId: string }>;
};

export default async function SellerPayoutDetailPage({ params }: SellerPayoutDetailPageProps) {
  const [{ payoutId }, seller] = await Promise.all([params, requireSeller()]);

  const payout = await prisma.payout.findFirst({
    where: {
      id: payoutId,
      sellerId: seller.id,
    },
    include: {
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
    <div className="space-y-8">
      <div className="border-b border-stone-200 pb-4">
        <Link href="/seller/finanzas" className="text-[11px] uppercase tracking-[0.18em] text-stone-500 hover:text-stone-950">
          Volver a finanzas
        </Link>
        <p className="mt-4 text-[11px] uppercase tracking-[0.24em] text-stone-400">Liquidacion seller</p>
        <h1 className="mt-2 font-serif text-3xl text-stone-950">Detalle de liquidacion</h1>
        <p className="mt-3 max-w-3xl text-sm text-stone-600">
          Revisa exactamente que pedidos quedaron incluidos en esta liquidacion y su desglose neto.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="border border-stone-200 bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Estado</p>
          <p className="mt-3 font-serif text-3xl text-stone-950">{payout.status}</p>
        </article>
        <article className="border border-stone-200 bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Bruto</p>
          <p className="mt-3 font-serif text-3xl text-stone-950">{formatCurrency(Number(payout.grossAmount))}</p>
        </article>
        <article className="border border-stone-200 bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Comision</p>
          <p className="mt-3 font-serif text-3xl text-stone-950">{formatCurrency(Number(payout.commissionAmount))}</p>
        </article>
        <article className="border border-stone-200 bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Neto</p>
          <p className="mt-3 font-serif text-3xl text-stone-950">{formatCurrency(Number(payout.netAmount))}</p>
        </article>
        <article className="border border-stone-200 bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Periodo</p>
          <p className="mt-3 text-sm font-medium text-stone-950">
            {formatShortDate(payout.periodStart)} - {formatShortDate(payout.periodEnd)}
          </p>
          {payout.externalReference ? (
            <p className="mt-2 text-xs text-stone-500">Ref: {payout.externalReference}</p>
          ) : null}
        </article>
      </div>

      <section className="space-y-4">
        {payout.items.map((item) => (
          <article key={item.id} className="border border-stone-200 bg-white p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-stone-950">
                  {item.sellerOrder.order.orderNumber}
                </p>
                <p className="mt-2 text-sm text-stone-700">
                  {item.sellerOrder.order.customerName} · {item.sellerOrder.order.customerEmail}
                </p>
                {item.sellerOrder.order.shippingAddress ? (
                  <p className="mt-1 text-sm text-stone-500">{item.sellerOrder.order.shippingAddress}</p>
                ) : null}
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-stone-500">
                  Estado seller: {item.sellerOrder.status}
                </p>
              </div>
              <div className="grid gap-1 text-sm text-stone-600 lg:text-right">
                <p>Bruto: {formatCurrency(Number(item.grossAmount))}</p>
                <p>Comision: {formatCurrency(Number(item.commissionAmount))}</p>
                <p className="font-semibold text-stone-950">Neto: {formatCurrency(Number(item.netAmount))}</p>
              </div>
            </div>

            <div className="mt-4 border-t border-stone-200 pt-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Items del pedido</p>
              <div className="mt-3 space-y-2 text-sm text-stone-600">
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
