import Link from "next/link";

import {
  createSellerPayoutAction,
  updatePayoutStatusAction,
  updateSellerOrderStatusAction,
} from "@/actions/admin";
import { prisma } from "@/lib/prisma";
import {
  getPayoutHoldDays,
  getSellerFinanceSummary,
  getSellerOrderEligibleAt,
  isSellerOrderEligibleForPayout,
} from "@/lib/seller-finance";
import { formatCurrency, formatShortDate } from "@/lib/utils";

type AdminPayoutsPageProps = {
  searchParams: Promise<{ message?: string }>;
};

const SELLER_ORDER_STATUS_OPTIONS = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

const PAYOUT_STATUS_OPTIONS = ["DRAFT", "PROCESSING", "PAID", "FAILED", "CANCELLED"] as const;

export default async function AdminPayoutsPage({ searchParams }: AdminPayoutsPageProps) {
  const params = await searchParams;

  const [sellers, payouts] = await Promise.all([
    prisma.sellerProfile.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        storeName: true,
        slug: true,
        payoutAccounts: {
          where: { isDefault: true },
          take: 1,
          select: {
            id: true,
            provider: true,
            label: true,
            verifiedAt: true,
          },
        },
        sellerOrders: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            status: true,
            subtotal: true,
            commissionAmount: true,
            netAmount: true,
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
        },
        payouts: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            netAmount: true,
          },
        },
      },
    }),
    prisma.payout.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        seller: {
          select: {
            storeName: true,
            slug: true,
          },
        },
        items: {
          select: {
            id: true,
            sellerOrderId: true,
            netAmount: true,
            sellerOrder: {
              select: {
                order: {
                  select: {
                    orderNumber: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  const eligibleOrdersCount = sellers.reduce(
    (sum, seller) => sum + seller.sellerOrders.filter(isSellerOrderEligibleForPayout).length,
    0,
  );
  const pendingAmount = sellers.reduce((sum, seller) => {
    const finance = getSellerFinanceSummary({
      sellerOrders: seller.sellerOrders,
      payouts: seller.payouts,
    });

    return sum + finance.pendingBalance;
  }, 0);
  const paidAmount = payouts
    .filter((payout) => payout.status === "PAID")
    .reduce((sum, payout) => sum + Number(payout.netAmount), 0);

  return (
    <div className="min-w-[860px] space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Liquidaciones</p>
        <h1 className="mt-2 font-serif text-3xl text-slate-950">Control de pagos a sellers</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600">
          El marketplace cobra, retiene la comision y liquida solo pedidos seller marcados como entregados.
        </p>
      </div>

      {params.message ? (
        <div className="border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {params.message}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        <div className="border border-slate-200 bg-white px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Pedidos elegibles</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{eligibleOrdersCount}</p>
        </div>
        <div className="border border-slate-200 bg-white px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Pendiente por liquidar</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(pendingAmount)}</p>
        </div>
        <div className="border border-slate-200 bg-white px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Liquidado</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(paidAmount)}</p>
        </div>
      </div>

      <section className="space-y-4">
        {sellers.map((seller) => {
          const eligibleOrders = seller.sellerOrders.filter(isSellerOrderEligibleForPayout);
          const finance = getSellerFinanceSummary({
            sellerOrders: seller.sellerOrders,
            payouts: seller.payouts,
          });

          return (
            <article key={seller.id} className="border border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold text-slate-950">{seller.storeName}</p>
                    <span className="border border-slate-200 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-600">
                      /{seller.slug}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Cuenta: {seller.payoutAccounts[0]?.label || seller.payoutAccounts[0]?.provider || "No registrada"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Verificacion: {seller.payoutAccounts[0]?.verifiedAt ? "Cuenta verificada" : seller.payoutAccounts[0] ? "Pendiente de validacion" : "Sin cuenta"}
                  </p>
                </div>

                <div className="grid gap-1 text-sm text-slate-600 xl:text-right">
                  <p>Ventas: {seller.sellerOrders.length}</p>
                  <p>Elegibles: {eligibleOrders.length}</p>
                  <p>Pendiente: {formatCurrency(finance.pendingBalance)}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                <form action={createSellerPayoutAction}>
                  <input type="hidden" name="sellerId" value={seller.id} />
                  <button
                    disabled={!seller.payoutAccounts[0] || !seller.payoutAccounts[0].verifiedAt || eligibleOrders.length === 0}
                    className="bg-slate-900 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Crear liquidacion
                  </button>
                </form>
              </div>

              <div className="mt-5 overflow-x-auto border border-slate-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Fecha</th>
                      <th className="px-4 py-3 font-medium">Estado</th>
                      <th className="px-4 py-3 font-medium">Bruto</th>
                      <th className="px-4 py-3 font-medium">Comision</th>
                      <th className="px-4 py-3 font-medium">Neto</th>
                      <th className="px-4 py-3 font-medium">Liquidacion</th>
                      <th className="px-4 py-3 font-medium">Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seller.sellerOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                          Sin pedidos seller.
                        </td>
                      </tr>
                    ) : (
                      seller.sellerOrders.slice(0, 8).map((order) => (
                        <tr key={order.id} className="border-t border-slate-200 text-slate-700">
                          <td className="px-4 py-3">{formatShortDate(order.createdAt)}</td>
                          <td className="px-4 py-3">
                            <form action={updateSellerOrderStatusAction} className="flex items-center gap-2">
                              <input type="hidden" name="sellerOrderId" value={order.id} />
                              <select
                                name="status"
                                defaultValue={order.status}
                                className="border border-slate-200 px-2 py-2 text-xs text-slate-900 outline-none"
                              >
                                {SELLER_ORDER_STATUS_OPTIONS.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                              <button className="border border-slate-200 px-2 py-2 text-[11px] uppercase tracking-[0.12em] text-slate-700">
                                Guardar
                              </button>
                            </form>
                          </td>
                          <td className="px-4 py-3">{formatCurrency(Number(order.subtotal))}</td>
                          <td className="px-4 py-3">{formatCurrency(Number(order.commissionAmount))}</td>
                          <td className="px-4 py-3 font-semibold text-slate-950">
                            {formatCurrency(Number(order.netAmount))}
                          </td>
                          <td className="px-4 py-3">
                            {order.payoutItems[0] ? (
                              <span className="inline-flex border border-slate-200 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-700">
                                {order.payoutItems[0].payout.status}
                              </span>
                            ) : (
                              <>
                                <span className={`inline-flex border px-2 py-1 text-[11px] uppercase tracking-[0.18em] ${
                                  isSellerOrderEligibleForPayout(order)
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-stone-200 bg-stone-100 text-stone-600"
                                }`}>
                                  {isSellerOrderEligibleForPayout(order) ? "Elegible" : "En espera"}
                                </span>
                                {order.status === "DELIVERED" && !isSellerOrderEligibleForPayout(order) ? (
                                  <p className="mt-2 text-[11px] text-slate-500">
                                    Disponible desde {formatShortDate(getSellerOrderEligibleAt(order))}
                                  </p>
                                ) : null}
                              </>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            {isSellerOrderEligibleForPayout(order)
                              ? `Listo para liquidar`
                              : order.status === "DELIVERED"
                                ? `Hold de ${getPayoutHoldDays()} dias`
                                : "Bloqueado"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          );
        })}
      </section>

      <section className="space-y-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Historial</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">Liquidaciones creadas</h2>
        </div>
        <div className="overflow-x-auto border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Seller</th>
                <th className="px-4 py-3 font-medium">Periodo</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Neto</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Referencia</th>
                <th className="px-4 py-3 font-medium">Actualizar</th>
              </tr>
            </thead>
            <tbody>
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Aun no existen liquidaciones.
                  </td>
                </tr>
              ) : (
                payouts.map((payout) => (
                  <tr key={payout.id} className="border-t border-slate-200 text-slate-700">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-950">{payout.seller.storeName}</p>
                      <p className="text-xs text-slate-500">/{payout.seller.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p>
                          {formatShortDate(payout.periodStart)} - {formatShortDate(payout.periodEnd)}
                        </p>
                        <div className="mt-1 space-y-1 text-xs text-slate-500">
                          {payout.items.map((item) => (
                            <p key={item.id}>
                              {item.sellerOrder.order.orderNumber} · {formatCurrency(Number(item.netAmount))}
                            </p>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{payout.items.length}</td>
                    <td className="px-4 py-3 font-semibold text-slate-950">
                      {formatCurrency(Number(payout.netAmount))}
                    </td>
                    <td className="px-4 py-3">{payout.status}</td>
                    <td className="px-4 py-3">{payout.externalReference || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/admin/payouts/${payout.id}`}
                          className="text-[11px] uppercase tracking-[0.12em] text-slate-500 underline-offset-4 hover:text-slate-950 hover:underline"
                        >
                          Ver detalle
                        </Link>
                        <form action={updatePayoutStatusAction} className="flex items-center gap-2">
                          <input type="hidden" name="payoutId" value={payout.id} />
                          <select
                            name="status"
                            defaultValue={payout.status}
                            className="border border-slate-200 px-2 py-2 text-xs text-slate-900 outline-none"
                          >
                            {PAYOUT_STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <input
                            name="externalReference"
                            defaultValue={payout.externalReference || ""}
                            placeholder="Referencia"
                            className="w-32 border border-slate-200 px-2 py-2 text-xs text-slate-900 outline-none"
                          />
                          <button className="border border-slate-200 px-2 py-2 text-[11px] uppercase tracking-[0.12em] text-slate-700">
                            Guardar
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
