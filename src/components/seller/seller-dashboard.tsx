import Link from "next/link";

import { SectionHeading } from "@/components/section-heading";
import {
  getPayoutHoldDays,
  getSellerFinanceSummary,
  getSellerOrderEligibleAt,
  isSellerOrderEligibleForPayout,
} from "@/lib/seller-finance";
import { formatCurrency, formatShortDate } from "@/lib/utils";

type SellerDashboardProps = {
  seller: {
    status: string;
    storeName: string;
    slug: string;
    description: string | null;
    products: Array<{ id: string; status: string }>;
    sellerOrders: Array<{
      id: string;
      status: string;
      createdAt?: Date | string;
      updatedAt?: Date | string;
      subtotal: unknown;
      commissionAmount: unknown;
      netAmount: unknown;
      payoutItems?: Array<{ payout: { status: string } }>;
      order?: {
        orderNumber?: string;
      };
    }>;
    payouts: Array<{
      id: string;
      status: string;
      netAmount: unknown;
      createdAt?: Date | string;
      paidAt?: Date | string | null;
      items?: Array<{
        id: string;
        sellerOrder: {
          order: {
            orderNumber: string;
          };
          netAmount: unknown;
        };
      }>;
    }>;
    payoutAccounts?: Array<{ id: string; verifiedAt?: Date | string | null }>;
  };
  message?: string;
};

export function SellerDashboard({ seller, message }: SellerDashboardProps) {
  const finance = getSellerFinanceSummary({
    sellerOrders: seller.sellerOrders,
    payouts: seller.payouts,
  });
  const recentOrders = [...seller.sellerOrders]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 4);
  const upcomingPayoutOrders = seller.sellerOrders
    .filter((order) => order.status === "DELIVERED" && !isSellerOrderEligibleForPayout(order))
    .sort((a, b) => new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime())
    .slice(0, 3);
  const recentPayouts = [...seller.payouts]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 3);
  const defaultAccount = seller.payoutAccounts?.[0] || null;
  const notifications = [
    !defaultAccount
      ? {
          id: "missing-account",
          tone: "amber",
          title: "Falta registrar tu cuenta de cobro",
          description: "Sin cuenta registrada no se podran emitir liquidaciones para tu tienda.",
          href: "/seller/finanzas",
          cta: "Registrar cuenta",
        }
      : null,
    defaultAccount && !defaultAccount.verifiedAt
      ? {
          id: "pending-account-verification",
          tone: "amber",
          title: "Tu cuenta de cobro esta pendiente",
          description: "Administracion debe verificarla antes de liberar pagos.",
          href: "/seller/finanzas",
          cta: "Ver finanzas",
        }
      : null,
    seller.sellerOrders.some(
      (order) => ["CONFIRMED", "PREPARING"].includes(order.status),
    )
      ? {
          id: "new-sale",
          tone: "emerald",
          title: "Tienes ventas por preparar",
          description: "Revisa tus pedidos seller y avanza el estado logistico de las ventas abiertas.",
          href: "/seller/orders",
          cta: "Ver pedidos",
        }
      : null,
    finance.pendingBalance > 0
      ? {
          id: "pending-balance",
          tone: "sky",
          title: "Tienes saldo listo para liquidacion",
          description: `Ya tienes ${formatCurrency(finance.pendingBalance)} disponible para siguiente payout.`,
          href: "/seller/finanzas",
          cta: "Revisar saldo",
        }
      : null,
    seller.payouts.some(
      (payout) => payout.status === "PAID",
    )
      ? {
          id: "recent-paid-payout",
          tone: "emerald",
          title: "Se registro una liquidacion pagada",
          description: "Tu historial financiero ya refleja una liquidacion reciente marcada como pagada.",
          href: "/seller/finanzas",
          cta: "Ver historial",
        }
      : null,
    seller.payouts.some((payout) => ["DRAFT", "PROCESSING"].includes(payout.status))
      ? {
          id: "payout-in-progress",
          tone: "stone",
          title: "Tienes una liquidacion en curso",
          description: "Existe al menos una liquidacion creada o procesandose para tu tienda.",
          href: "/seller/finanzas",
          cta: "Abrir finanzas",
        }
      : null,
  ].filter(Boolean) as Array<{
    id: string;
    tone: "amber" | "emerald" | "sky" | "stone";
    title: string;
    description: string;
    href: string;
    cta: string;
  }>;

  function getNotificationClassName(tone: "amber" | "emerald" | "sky" | "stone") {
    switch (tone) {
      case "amber":
        return "border-amber-200 bg-amber-50 text-amber-900";
      case "emerald":
        return "border-emerald-200 bg-emerald-50 text-emerald-900";
      case "sky":
        return "border-sky-200 bg-sky-50 text-sky-900";
      default:
        return "border-stone-200 bg-stone-50 text-stone-900";
    }
  }

  const dashboardCards = [
    {
      label: "Productos",
      value: String(seller.products.length),
      description:
        seller.products.length > 0
          ? "Productos asignados a tu tienda."
          : "Aun no tienes productos cargados en tu catalogo.",
    },
    {
      label: "Ventas",
      value: String(seller.sellerOrders.length),
      description:
        seller.sellerOrders.length > 0
          ? "Pedidos asociados a tu tienda."
          : "Tus ventas apareceran aqui cuando empieces a vender.",
    },
    {
      label: "Pendiente",
      value: formatCurrency(finance.pendingBalance),
      description: "Monto listo para futura liquidacion segun las ventas elegibles.",
    },
    {
      label: "Liquidado",
      value: formatCurrency(finance.paidBalance),
      description: "Pagos marcados como liquidados desde administracion.",
    },
  ];

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Seller panel"
        title={`Hola, ${seller.storeName}`}
      description="Panel minimo para gestionar tu tienda, revisar el estado y preparar la publicacion de productos."
    />

      {message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p> : null}

      {notifications.length > 0 ? (
        <section className="space-y-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Notificaciones</p>
            <h2 className="mt-2 font-serif text-3xl text-stone-950">Tu bandeja seller</h2>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {notifications.map((notification) => (
              <article
                key={notification.id}
                className={`border px-4 py-4 ${getNotificationClassName(notification.tone)}`}
              >
                <p className="text-sm font-semibold">{notification.title}</p>
                <p className="mt-2 text-sm leading-6 opacity-80">{notification.description}</p>
                <Link
                  href={notification.href}
                  className="mt-3 inline-flex text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline"
                >
                  {notification.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="border border-stone-200 bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Operacion seller</p>
          <h2 className="mt-2 font-serif text-3xl text-stone-950">Estado comercial</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="border border-stone-200 bg-stone-50 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Cuenta</p>
              <p className="mt-2 text-sm font-medium text-stone-950">
                {defaultAccount ? (defaultAccount.verifiedAt ? "Verificada" : "Pendiente") : "Falta registrar"}
              </p>
            </div>
            <div className="border border-stone-200 bg-stone-50 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Por despachar</p>
              <p className="mt-2 text-sm font-medium text-stone-950">
                {seller.sellerOrders.filter((order) => ["CONFIRMED", "PREPARING"].includes(order.status)).length} pedido(s)
              </p>
            </div>
            <div className="border border-stone-200 bg-stone-50 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">En hold</p>
              <p className="mt-2 text-sm font-medium text-stone-950">
                {upcomingPayoutOrders.length} venta(s)
              </p>
            </div>
          </div>
        </div>

        <div className="border border-stone-200 bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Proximas liquidaciones</p>
          <h2 className="mt-2 font-serif text-3xl text-stone-950">Hold de {getPayoutHoldDays()} dias</h2>
          <div className="mt-4 space-y-3">
            {upcomingPayoutOrders.length === 0 ? (
              <p className="text-sm text-stone-500">No tienes ventas en espera de liberacion.</p>
            ) : (
              upcomingPayoutOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-3 border border-stone-200 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-stone-950">
                      {order.order?.orderNumber || "Pedido seller"}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      Se libera {formatShortDate(getSellerOrderEligibleAt(order))}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-stone-950">{formatCurrency(Number(order.netAmount))}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardCards.map((card) => (
          <article key={card.label} className="rounded-[1.75rem] border border-stone-200 bg-white p-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">{card.label}</p>
            <p className="mt-3 font-serif text-3xl text-stone-950">{card.value}</p>
            <p className="mt-3 text-sm leading-6 text-stone-600">{card.description}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-[2rem] border border-stone-200 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Tu tienda</p>
          <h2 className="mt-2 font-serif text-3xl text-stone-950">{seller.storeName}</h2>
          <p className="mt-3 max-w-2xl text-stone-600">
            {seller.description || "Todavia no agregaste una descripcion para tu tienda."}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Slug</p>
              <p className="mt-2 font-mono text-sm text-stone-700">{seller.slug}</p>
            </div>
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Estado</p>
              <p className="mt-2 text-sm font-medium uppercase tracking-[0.18em] text-emerald-700">
                {seller.status}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/seller/orders"
              className="inline-flex border border-stone-900 px-5 py-2 text-sm uppercase tracking-[0.18em] text-stone-900 transition hover:bg-stone-900 hover:text-white"
            >
              Ver pedidos
            </Link>
            <Link
              href="/seller/products"
              className="inline-flex border border-stone-900 px-5 py-2 text-sm uppercase tracking-[0.18em] text-stone-900 transition hover:bg-stone-900 hover:text-white"
            >
              Gestionar productos
            </Link>
            <Link
              href="/seller/finanzas"
              className="inline-flex border border-stone-900 px-5 py-2 text-sm uppercase tracking-[0.18em] text-stone-900 transition hover:bg-stone-900 hover:text-white"
            >
              Ver finanzas
            </Link>
            <Link
              href="/profile"
              className="inline-flex border border-stone-200 px-5 py-2 text-sm uppercase tracking-[0.18em] text-stone-600 transition hover:border-stone-900 hover:text-stone-950"
            >
              Editar tienda
            </Link>
          </div>
        </section>

        <aside className="h-fit rounded-[2rem] bg-stone-950 p-6 text-stone-100">
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400">Checklist</p>
          <h3 className="mt-2 font-serif text-3xl text-white">Siguiente paso</h3>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-stone-300">
            <li>1. Completa tu informacion de tienda.</li>
            <li>2. Agrega o publica productos desde la seccion de productos seller.</li>
            <li>
              3. {seller.payoutAccounts?.length ? "Tu cuenta de cobro ya esta lista." : "Registra tu cuenta de cobro."}
            </li>
            <li>4. Revisa ventas, comisiones y liquidaciones en finanzas.</li>
          </ul>
          <p className="mt-6 text-sm text-stone-400">
            El seller panel ya controla catalogo y finanzas base para operar el marketplace.
          </p>
        </aside>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[2rem] border border-stone-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Ventas recientes</p>
              <h2 className="mt-2 font-serif text-3xl text-stone-950">Ultimos pedidos</h2>
            </div>
            <Link href="/seller/orders" className="text-xs uppercase tracking-[0.18em] text-stone-500 hover:text-stone-950">
              Ver todos
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-stone-500">Aun no tienes ventas registradas.</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-4 border border-stone-200 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-stone-950">{order.order?.orderNumber || "Pedido seller"}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-stone-500">{order.status}</p>
                  </div>
                  <p className="text-sm font-semibold text-stone-950">{formatCurrency(Number(order.netAmount))}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-stone-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Liquidaciones</p>
              <h2 className="mt-2 font-serif text-3xl text-stone-950">Historial rapido</h2>
            </div>
            <Link href="/seller/finanzas" className="text-xs uppercase tracking-[0.18em] text-stone-500 hover:text-stone-950">
              Ver finanzas
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {recentPayouts.length === 0 ? (
              <p className="text-sm text-stone-500">Todavia no se generan liquidaciones para tu tienda.</p>
            ) : (
              recentPayouts.map((payout) => (
                <div key={payout.id} className="border border-stone-200 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-stone-950">{formatCurrency(Number(payout.netAmount))}</p>
                    <span className="text-xs uppercase tracking-[0.14em] text-stone-500">{payout.status}</span>
                  </div>
                  {payout.items?.length ? (
                    <p className="mt-2 text-xs text-stone-500">
                      {payout.items.length} pedido(s): {payout.items.map((item) => item.sellerOrder.order.orderNumber).join(", ")}
                    </p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
