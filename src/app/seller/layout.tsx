import { requireSeller } from "@/lib/auth";
import { SellerSidebar } from "@/components/seller/seller-sidebar";

export default async function SellerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const seller = await requireSeller();

  return (
    <section className="min-h-screen bg-[#f5f1ea]">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
        <SellerSidebar seller={seller} />
        <main className="min-w-0 rounded-[2.5rem] bg-white shadow-sm ring-1 ring-stone-200">
          <div className="border-b border-stone-200 px-6 py-5 sm:px-8">
            <p className="text-xs uppercase tracking-[0.32em] text-stone-400">Seller</p>
            <h1 className="mt-2 font-serif text-4xl text-stone-950">Panel de vendedor</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
              Gestiona tu catalogo, publica productos y prepara el terreno para ventas y liquidaciones.
            </p>
          </div>
          <div className="px-6 py-6 sm:px-8">{children}</div>
        </main>
      </div>
    </section>
  );
}
