import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { getPublicSellerStore } from "@/lib/store";

type SellerStorePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SellerStorePage({ params }: SellerStorePageProps) {
  const { slug } = await params;
  const data = await getPublicSellerStore(slug);

  if (!data) {
    notFound();
  }

  const { seller, products } = data;
  const joinedYear = new Date(seller.createdAt).getFullYear();

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <section className="grid gap-8 border-b border-stone-200 pb-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Tienda</p>
            <h1 className="mt-4 font-serif text-5xl leading-[0.95] text-stone-950 md:text-7xl">
              {seller.storeName}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600">
              {seller.description || "Tienda activa dentro de ClosetSale con productos seleccionados y publicados por su propio seller."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/products?seller=${seller.slug}`}
                className="inline-flex items-center rounded-full bg-stone-900 px-6 py-3 text-sm uppercase tracking-[0.2em] text-white transition hover:bg-stone-800"
              >
                Ver catalogo
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center rounded-full border border-stone-200 px-6 py-3 text-sm uppercase tracking-[0.2em] text-stone-700 transition hover:border-stone-300 hover:text-stone-950"
              >
                Explorar todo
              </Link>
            </div>
          </div>

          <div className="border border-stone-200 bg-stone-950 p-5 text-white">
            <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden border border-white/10 bg-white/5">
                {seller.logoUrl ? (
                  <Image
                    src={seller.logoUrl}
                    alt={seller.storeName}
                    width={160}
                    height={160}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-serif text-3xl text-white">
                    {seller.storeName.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Perfil seller</p>
                <p className="mt-2 font-serif text-3xl text-white">{seller.storeName}</p>
                <p className="mt-2 text-sm text-stone-300">Activo en ClosetSale desde {joinedYear}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Productos</p>
                <p className="mt-2 font-serif text-3xl text-white">{seller.metrics.products}</p>
              </div>
              <div className="border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Ventas</p>
                <p className="mt-2 font-serif text-3xl text-white">{seller.metrics.sellerOrders}</p>
              </div>
              <div className="border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Slug</p>
                <p className="mt-2 break-all text-sm text-stone-200">/{seller.slug}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <SectionHeading
            eyebrow="Catalogo de la tienda"
            title={`Productos de ${seller.storeName}`}
            description="Explora todas las piezas activas publicadas por este seller dentro de ClosetSale."
          />

          {products.length === 0 ? (
            <div className="border border-stone-200 px-6 py-10 text-stone-500">
              Esta tienda todavia no tiene productos activos publicados.
            </div>
          ) : (
            <div className="grid gap-x-5 gap-y-10 md:grid-cols-2 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
