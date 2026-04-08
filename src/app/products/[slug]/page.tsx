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
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <RecentProductTracker productId={data.product.id} />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(24rem,0.8fr)] lg:items-start">
        <div className="grid gap-5 md:grid-cols-2">
          {data.product.images.map((image) => (
            <div key={image.id} className="overflow-hidden rounded-[1.5rem]">
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

        <div className="space-y-6 lg:sticky lg:top-28">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-stone-400">
                {data.product.category.name}
              </p>
              <h1 className="mt-3 font-serif text-5xl text-stone-950">
                {data.product.title}
              </h1>
              <p className="mt-4 text-lg text-stone-600">{data.product.description}</p>
            </div>
            <FavoriteToggle productId={data.product.id} />
          </div>

          <div className="rounded-[1rem] bg-white p-6 ring-1 ring-stone-200">
            <p className="text-sm uppercase tracking-[0.2em] text-stone-400">Detalles</p>
            <div className="mt-4 grid gap-2 text-stone-700">
              <p>Marca: {data.product.brand || "No informada"}</p>
              <p>Color: {data.product.color || "Variable"}</p>
              <p>Variantes disponibles: {data.product.variants.length}</p>
            </div>
          </div>

          <AddToCartPanel product={data.product} />
        </div>
      </div>

      <section className="mt-20">
        <h2 className="font-serif text-3xl text-stone-950">Productos asociados</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {data.relatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
