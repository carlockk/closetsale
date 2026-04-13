import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartPanel } from "@/components/store/add-to-cart-panel";
import { FavoriteToggle } from "@/components/store/favorite-toggle";
import { RecentProductTracker } from "@/components/store/recently-viewed";
import { ProductCard } from "@/components/product-card";
import { getProductBySlug } from "@/lib/store";

type SellerInfo = {
  storeName: string;
  slug: string;
  description?: string | null;
};

type ProductWithSeller = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>["product"] & {
  seller?: SellerInfo | null;
};

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const data = await getProductBySlug(slug);
  const product = data?.product as ProductWithSeller | null;

  if (!data || !product) {
    notFound();
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <RecentProductTracker productId={product.id} />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
          <div className="grid gap-5 md:grid-cols-2">
            {product.images.map((image) => (
              <div key={image.id} className="overflow-hidden bg-stone-100">
                <Image
                  src={image.url}
                  alt={image.alt || product.title}
                  width={900}
                  height={1100}
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="lg:sticky lg:top-28">
            <div className="border-b border-stone-200 pb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-stone-400">
                    {product.category.name}
                  </p>
                  <h1 className="mt-3 font-serif text-5xl text-stone-950">
                    {product.title}
                  </h1>
                </div>
                <FavoriteToggle productId={product.id} />
              </div>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">
                {product.description}
              </p>
            </div>

            {product.seller ? (
              <div className="border-b border-stone-200 py-6">
                <div className="rounded-[1.75rem] border border-stone-200 bg-stone-50 px-5 py-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Vendedor</p>
                  <Link
                    href={`/tienda/${product.seller.slug}`}
                    className="mt-2 block font-serif text-2xl text-stone-950 transition hover:text-stone-700"
                  >
                    {product.seller.storeName}
                  </Link>
                  {product.seller.description ? (
                    <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600">
                      {product.seller.description}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      Tienda colaboradora dentro de ClosetSale.
                    </p>
                  )}
                  <div className="mt-4">
                    <Link
                      href={`/tienda/${product.seller.slug}`}
                      className="inline-flex items-center border-b border-stone-900 pb-1 text-sm uppercase tracking-[0.2em] text-stone-900 transition hover:text-stone-700"
                    >
                      Ver tienda
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-8 border-b border-stone-200 py-6 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Marca</p>
                <p className="mt-2 text-sm text-stone-800">{product.brand || "No informada"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Color</p>
                <p className="mt-2 text-sm text-stone-800">{product.color || "Variable"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Variantes</p>
                <p className="mt-2 text-sm text-stone-800">{product.variants.length}</p>
              </div>
            </div>

            <AddToCartPanel product={product} />
          </div>
        </div>

        {data.moreFromSeller.length > 0 ? (
          <section className="mt-20 border-t border-stone-200 pt-10">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Misma tienda</p>
                <h2 className="mt-3 font-serif text-3xl text-stone-950">
                  Mas de {product.seller?.storeName}
                </h2>
              </div>
              {product.seller ? (
                <Link
                  href={`/tienda/${product.seller.slug}`}
                  className="inline-flex items-center border-b border-stone-900 pb-1 text-sm uppercase tracking-[0.2em] text-stone-900 transition hover:text-stone-700"
                >
                  Ver tienda completa
                </Link>
              ) : null}
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {data.moreFromSeller.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ) : null}

        {data.recommendedProducts.length > 0 ? (
          <section className="mt-20 border-t border-stone-200 pt-10">
            <h2 className="font-serif text-3xl text-stone-950">Te puede interesar</h2>
            <p className="mt-3 max-w-2xl text-stone-600">
              Una mezcla de productos relacionados y piezas con alto movimiento dentro de ClosetSale.
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {data.recommendedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ) : null}

        {data.relatedProducts.length > 0 ? (
          <section className="mt-20 border-t border-stone-200 pt-10">
            <h2 className="font-serif text-3xl text-stone-950">Productos asociados</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {data.relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
