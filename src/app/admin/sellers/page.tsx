import { updateSellerCommissionAction, updateSellerStatusAction } from "@/actions/admin";
import { getDefaultCommissionRate } from "@/lib/marketplace";
import { prisma } from "@/lib/prisma";

type AdminSellersPageProps = {
  searchParams: Promise<{ message?: string }>;
};

const SELLER_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendiente" },
  { value: "ACTIVE", label: "Activo" },
  { value: "SUSPENDED", label: "Suspendido" },
  { value: "REJECTED", label: "Rechazado" },
] as const;

function getSellerStatusClassName(status: string) {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "REJECTED":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "SUSPENDED":
      return "border-slate-200 bg-slate-100 text-slate-600";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

export default async function AdminSellersPage({
  searchParams,
}: AdminSellersPageProps) {
  const params = await searchParams;
  const sellers = await prisma.sellerProfile.findMany({
    orderBy: { requestedAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      products: {
        select: {
          id: true,
          status: true,
        },
      },
      sellerOrders: {
        select: {
          id: true,
          netAmount: true,
          status: true,
        },
      },
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
    },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Sellers</p>
        <h1 className="mt-2 font-serif text-3xl text-slate-950">Gestion de vendedores</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600">
          Revisa solicitudes, aprueba tiendas y controla el estado operativo de cada seller.
        </p>
      </div>

      {params.message ? (
        <div className="border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {params.message}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-4">
        <div className="border border-slate-200 bg-white px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Total</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{sellers.length}</p>
        </div>
        <div className="border border-slate-200 bg-white px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Pendientes</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {sellers.filter((seller) => seller.status === "PENDING").length}
          </p>
        </div>
        <div className="border border-slate-200 bg-white px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Activos</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {sellers.filter((seller) => seller.status === "ACTIVE").length}
          </p>
        </div>
        <div className="border border-slate-200 bg-white px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Suspendidos</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {sellers.filter((seller) => seller.status === "SUSPENDED").length}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {sellers.length === 0 ? (
          <div className="border border-slate-200 bg-white px-4 py-10 text-slate-500">
            Aun no hay sellers registrados.
          </div>
        ) : (
          sellers.map((seller) => {
            const totalNet = seller.sellerOrders.reduce(
              (sum, order) => sum + Number(order.netAmount),
              0,
            );

            return (
              <article key={seller.id} className="border border-slate-200 bg-white p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-semibold text-slate-950">{seller.storeName}</p>
                      <span
                        className={`inline-flex border px-2 py-1 text-[11px] uppercase tracking-[0.18em] ${getSellerStatusClassName(seller.status)}`}
                      >
                        {seller.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">
                      {seller.user.name} · {seller.user.email}
                    </p>
                    <p className="mt-1 font-mono text-xs text-slate-500">{seller.slug}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Comision: {Number(seller.commissionRate ?? getDefaultCommissionRate())}%
                    </p>
                    {seller.description ? (
                      <p className="mt-3 max-w-3xl text-sm text-slate-600">
                        {seller.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-2 text-sm text-slate-600 xl:text-right">
                    <p>Solicitud: {new Date(seller.requestedAt).toLocaleString("es-CL")}</p>
                    <p>Productos: {seller.products.length}</p>
                    <p>Ventas asociadas: {seller.sellerOrders.length}</p>
                    <p>Neto acumulado: ${Intl.NumberFormat("es-CL").format(totalNet)}</p>
                    <p>
                      Cuenta de cobro: {seller.payoutAccounts[0]?.label || seller.payoutAccounts[0]?.provider || "No registrada"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 border-t border-slate-200 pt-4 xl:grid-cols-2">
                  <form action={updateSellerStatusAction} className="flex flex-wrap items-end gap-3">
                    <input type="hidden" name="sellerId" value={seller.id} />
                    <label className="grid gap-2 text-sm text-slate-700">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        Estado seller
                      </span>
                      <select
                        name="status"
                        defaultValue={seller.status}
                        className="min-w-48 border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                      >
                        {SELLER_STATUS_OPTIONS.map((option) => (
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
                  <form action={updateSellerCommissionAction} className="flex flex-wrap items-end gap-3">
                    <input type="hidden" name="sellerId" value={seller.id} />
                    <label className="grid gap-2 text-sm text-slate-700">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        Comision seller
                      </span>
                      <input
                        name="commissionRate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        defaultValue={Number(seller.commissionRate ?? getDefaultCommissionRate())}
                        className="w-32 border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                      />
                    </label>
                    <button className="bg-slate-900 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-white transition hover:bg-slate-800">
                      Guardar comision
                    </button>
                  </form>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
