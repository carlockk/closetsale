import Image from "next/image";
import { notFound } from "next/navigation";

import { AddToCartPanel } from "@/components/store/add-to-cart-panel";
import { FavoriteToggle } from "@/components/store/favorite-toggle";
import { RecentProductTracker } from "@/components/store/recently-viewed";
import { ProductCard } from "@/components/product-card";
import { getProductBySlug } from "@/lib/store";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const data = await getProductBySlug(slug);

  if (!data) {
    notFound();
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <RecentProductTracker productId={data.product.id} />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
          <div className="grid gap-5 md:grid-cols-2">
            {data.product.images.map((image) => (
              <div key={image.id} className="overflow-hidden bg-stone-100">
                <Image
                  src={image.url}
                  alt={image.alt || data.product.title}
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
                    {data.product.category.name}
                  </p>
                  <h1 className="mt-3 font-serif text-5xl text-stone-950">
                    {data.product.title}
                  </h1>
                </div>
                <FavoriteToggle productId={data.product.id} />
              </div>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">
                {data.product.description}
              </p>
            </div>

            <div className="grid gap-8 border-b border-stone-200 py-6 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Marca</p>
                <p className="mt-2 text-sm text-stone-800">{data.product.brand || "No informada"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Color</p>
                <p className="mt-2 text-sm text-stone-800">{data.product.color || "Variable"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Variantes</p>
                <p className="mt-2 text-sm text-stone-800">{data.product.variants.length}</p>
              </div>
            </div>

            <AddToCartPanel product={data.product} />
          </div>
        </div>

        <section className="mt-20 border-t border-stone-200 pt-10">
          <h2 className="font-serif text-3xl text-stone-950">Productos asociados</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {data.relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
