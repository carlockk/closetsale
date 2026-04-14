import { upsertSellerPayoutAccountAction } from "@/actions/seller";
import { requireSeller } from "@/lib/auth";
import { getSellerFinanceSummary, isSellerOrderEligibleForPayout } from "@/lib/seller-finance";
import { formatCurrency, formatShortDate } from "@/lib/utils";

type SellerFinancePageProps = {
  searchParams: Promise<{ message?: string }>;
};

function readAccountDetails(details: unknown) {
  if (!details || typeof details !== "object") {
    return {
      holderName: "",
      accountNumber: "",
      bankName: "",
      email: "",
      notes: "",
    };
  }

  const data = details as Record<string, unknown>;

  return {
    holderName: String(data.holderName || ""),
    accountNumber: String(data.accountNumber || ""),
    bankName: String(data.bankName || ""),
    email: String(data.email || ""),
    notes: String(data.notes || ""),
  };
}

export default async function SellerFinancePage({ searchParams }: SellerFinancePageProps) {
  const params = await searchParams;
  const seller = await requireSeller();
  const finance = getSellerFinanceSummary({
    sellerOrders: seller.sellerOrders,
    payouts: seller.payouts,
  });
  const defaultAccount = seller.payoutAccounts[0] || null;
  const accountDetails = readAccountDetails(defaultAccount?.details);

  const sortedOrders = [...seller.sellerOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const sortedPayouts = [...seller.payouts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="space-y-8">
      <div className="border-b border-stone-200 pb-4">
        <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Seller / Finanzas</p>
        <h1 className="mt-2 font-serif text-3xl text-stone-950">Ventas, comisiones y liquidaciones</h1>
        <p className="mt-3 max-w-3xl text-sm text-stone-600">
          La plataforma cobra la venta, calcula la comision y liquida tu saldo cuando el pedido ya es elegible.
        </p>
      </div>

      {params.message ? (
        <div className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {params.message}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="border border-stone-200 bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Bruto</p>
          <p className="mt-3 font-serif text-3xl text-stone-950">{formatCurrency(finance.grossSales)}</p>
        </article>
        <article className="border border-stone-200 bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Comisiones</p>
          <p className="mt-3 font-serif text-3xl text-stone-950">{formatCurrency(finance.commissionTotal)}</p>
        </article>
        <article className="border border-stone-200 bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Neto</p>
          <p className="mt-3 font-serif text-3xl text-stone-950">{formatCurrency(finance.netSales)}</p>
        </article>
        <article className="border border-stone-200 bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Pendiente</p>
          <p className="mt-3 font-serif text-3xl text-stone-950">{formatCurrency(finance.pendingBalance)}</p>
        </article>
        <article className="border border-stone-200 bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Liquidado</p>
          <p className="mt-3 font-serif text-3xl text-stone-950">{formatCurrency(finance.paidBalance)}</p>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <section className="border border-stone-200 bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Ventas seller</p>
              <h2 className="mt-2 text-xl font-semibold text-stone-950">Pedidos y saldo generado</h2>
            </div>
            <div className="text-right text-xs text-stone-500">
              Elegible para liquidacion: pedido marcado como <span className="font-semibold text-stone-900">DELIVERED</span>.
            </div>
          </div>

          <div className="mt-5 overflow-x-auto border border-stone-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-stone-50 text-[11px] uppercase tracking-[0.18em] text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Bruto</th>
                  <th className="px-4 py-3 font-medium">Comision</th>
                  <th className="px-4 py-3 font-medium">Neto</th>
                  <th className="px-4 py-3 font-medium">Liquidable</th>
                </tr>
              </thead>
              <tbody>
                {sortedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-stone-500">
                      Aun no tienes ventas asociadas a tu tienda.
                    </td>
                  </tr>
                ) : (
                  sortedOrders.map((order) => {
                    const eligible = isSellerOrderEligibleForPayout(order);

                    return (
                      <tr key={order.id} className="border-t border-stone-200 text-stone-700">
                        <td className="px-4 py-3">{formatShortDate(order.createdAt)}</td>
                        <td className="px-4 py-3">{order.status}</td>
                        <td className="px-4 py-3">{formatCurrency(Number(order.subtotal))}</td>
                        <td className="px-4 py-3">{formatCurrency(Number(order.commissionAmount))}</td>
                        <td className="px-4 py-3 font-semibold text-stone-950">
                          {formatCurrency(Number(order.netAmount))}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex border px-2 py-1 text-[11px] uppercase tracking-[0.18em] ${
                              eligible
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-stone-200 bg-stone-100 text-stone-500"
                            }`}
                          >
                            {eligible ? "Si" : "No"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-6">
          <div className="border border-stone-200 bg-white p-6">
            <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Cuenta de cobro</p>
            <h2 className="mt-2 text-xl font-semibold text-stone-950">Donde recibes tus liquidaciones</h2>
            <p className="mt-3 text-sm text-stone-600">
              Guarda la cuenta que administracion usara para pagarte las liquidaciones.
            </p>

            <form action={upsertSellerPayoutAccountAction} className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm text-stone-700">
                <span>Proveedor</span>
                <input
                  name="provider"
                  defaultValue={defaultAccount?.provider || "Transferencia bancaria"}
                  className="border border-stone-200 px-4 py-3 outline-none transition focus:border-stone-900"
                />
              </label>
              <label className="grid gap-2 text-sm text-stone-700">
                <span>Tipo de cuenta</span>
                <input
                  name="accountType"
                  defaultValue={defaultAccount?.accountType || "Cuenta corriente"}
                  className="border border-stone-200 px-4 py-3 outline-none transition focus:border-stone-900"
                />
              </label>
              <label className="grid gap-2 text-sm text-stone-700">
                <span>Titular</span>
                <input
                  name="holderName"
                  defaultValue={accountDetails.holderName}
                  className="border border-stone-200 px-4 py-3 outline-none transition focus:border-stone-900"
                />
              </label>
              <label className="grid gap-2 text-sm text-stone-700">
                <span>Numero de cuenta</span>
                <input
                  name="accountNumber"
                  defaultValue={accountDetails.accountNumber}
                  className="border border-stone-200 px-4 py-3 outline-none transition focus:border-stone-900"
                />
              </label>
              <label className="grid gap-2 text-sm text-stone-700">
                <span>Banco</span>
                <input
                  name="bankName"
                  defaultValue={accountDetails.bankName}
                  className="border border-stone-200 px-4 py-3 outline-none transition focus:border-stone-900"
                />
              </label>
              <label className="grid gap-2 text-sm text-stone-700">
                <span>Correo de pago</span>
                <input
                  name="email"
                  type="email"
                  defaultValue={accountDetails.email}
                  className="border border-stone-200 px-4 py-3 outline-none transition focus:border-stone-900"
                />
              </label>
              <label className="grid gap-2 text-sm text-stone-700">
                <span>Notas</span>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={accountDetails.notes}
                  className="border border-stone-200 px-4 py-3 outline-none transition focus:border-stone-900"
                />
              </label>
              <button className="bg-stone-900 px-5 py-3 text-sm uppercase tracking-[0.18em] text-white transition hover:bg-stone-800">
                Guardar cuenta
              </button>
            </form>
          </div>

          <div className="border border-stone-200 bg-white p-6">
            <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Liquidaciones</p>
            <h2 className="mt-2 text-xl font-semibold text-stone-950">Historial de pagos</h2>
            <div className="mt-5 space-y-3">
              {sortedPayouts.length === 0 ? (
                <p className="text-sm text-stone-500">Todavia no tienes liquidaciones registradas.</p>
              ) : (
                sortedPayouts.map((payout) => (
                  <article key={payout.id} className="border border-stone-200 px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-stone-950">{formatCurrency(Number(payout.netAmount))}</p>
                        <p className="mt-1 text-xs text-stone-500">
                          {payout.paidAt ? `Pagado ${formatShortDate(payout.paidAt)}` : `Creado ${formatShortDate(payout.createdAt)}`}
                        </p>
                      </div>
                      <span className="inline-flex border px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-700">
                        {payout.status}
                      </span>
                    </div>
                    {payout.externalReference ? (
                      <p className="mt-2 text-xs text-stone-500">Referencia: {payout.externalReference}</p>
                    ) : null}
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
