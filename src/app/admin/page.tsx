import { SalesChart } from "@/components/admin/sales-chart";
import { formatCurrency } from "@/lib/utils";
import { getAdminDashboardData } from "@/lib/store";

type AdminPageProps = {
  searchParams: Promise<{ from?: string; to?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const dashboard = await getAdminDashboardData(params.from, params.to);

  return (
    <div className="min-w-[720px] space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Dashboard</p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <h1 className="font-serif text-3xl text-slate-950">Resumen de ventas</h1>
          <form className="flex flex-wrap gap-2">
            <input type="date" name="from" defaultValue={params.from} className="border border-slate-200 px-3 py-2 text-sm" />
            <input type="date" name="to" defaultValue={params.to} className="border border-slate-200 px-3 py-2 text-sm" />
            <button className="bg-slate-900 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white">
              Filtrar
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="border border-slate-200 px-4 py-4"><p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Ventas</p><p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(dashboard.metrics.totalSales)}</p></div>
        <div className="border border-slate-200 px-4 py-4"><p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Ordenes</p><p className="mt-2 text-2xl font-semibold text-slate-950">{dashboard.metrics.totalOrders}</p></div>
        <div className="border border-slate-200 px-4 py-4"><p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Productos</p><p className="mt-2 text-2xl font-semibold text-slate-950">{dashboard.metrics.productCount}</p></div>
        <div className="border border-slate-200 px-4 py-4"><p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Usuarios</p><p className="mt-2 text-2xl font-semibold text-slate-950">{dashboard.metrics.userCount}</p></div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Tendencia</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">Ventas por dia</h2>
        </div>
        <SalesChart data={dashboard.salesByDay} />
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Actividad</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">Ventas recientes</h2>
        </div>
        <div className="overflow-x-auto border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Orden</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Correo</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.orders.map((order) => (
                <tr key={order.id} className="border-t border-slate-200 text-slate-700">
                  <td className="px-4 py-3 font-medium text-slate-950">{order.orderNumber}</td>
                  <td className="px-4 py-3">{order.customerName}</td>
                  <td className="px-4 py-3">{order.customerEmail}</td>
                  <td className="px-4 py-3">{order.status}</td>
                  <td className="px-4 py-3 font-semibold text-slate-950">{formatCurrency(Number(order.total))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
