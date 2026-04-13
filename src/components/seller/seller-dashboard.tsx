import Link from "next/link";

import { SectionHeading } from "@/components/section-heading";

type SellerDashboardProps = {
  seller: {
    status: string;
    storeName: string;
    slug: string;
    description: string | null;
    products: Array<{ id: string; status: string }>;
    sellerOrders: Array<{ id: string; status: string; subtotal: unknown; netAmount: unknown }>;
    payouts: Array<{ id: string; status: string; netAmount: unknown }>;
  };
  message?: string;
};

export function SellerDashboard({ seller, message }: SellerDashboardProps) {
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
      label: "Pagos",
      value: String(seller.payouts.length),
      description: "Resumen de liquidaciones registradas para tu tienda.",
    },
    {
      label: "Neto",
      value: `$${Intl.NumberFormat("es-CL").format(
        seller.sellerOrders.reduce((sum, order) => sum + Number(order.netAmount), 0),
      )}`,
      description: "Monto neto acumulado antes de liquidaciones finales.",
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
              href="/seller/products"
              className="inline-flex border border-stone-900 px-5 py-2 text-sm uppercase tracking-[0.18em] text-stone-900 transition hover:bg-stone-900 hover:text-white"
            >
              Gestionar productos
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
            <li>3. Revisa ventas y liquidaciones cuando terminemos esas vistas.</li>
          </ul>
          <p className="mt-6 text-sm text-stone-400">
            Este panel ya esta listo para crecer a productos, pedidos y liquidaciones.
          </p>
        </aside>
      </div>
    </div>
  );
}
