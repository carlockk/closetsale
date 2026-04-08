import Link from "next/link";

import { HeroSlider } from "@/components/hero-slider";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { RecentlyViewedProducts } from "@/components/store/recently-viewed";
import { getHomeData, getProducts } from "@/lib/store";

export default async function Home() {
  const data = await getHomeData();
  const allProducts = await getProducts();
  const visibleCategories = data.categories.slice(0, 5);
  const hasMoreCategories = data.categories.length > visibleCategories.length;

  return (
    <div className="pb-8">
      <div className="relative left-1/2 w-[100dvw] max-w-[100dvw] -translate-x-1/2 overflow-hidden">
        <HeroSlider slides={data.slides} />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <section className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
          <SectionHeading
            eyebrow="Mas vendidos"
            title="Piezas que giran rapido"
            description="Descubre prendas que otras personas ya eligieron por su estilo, estado y personalidad."
          />
            <div className="grid gap-6 md:grid-cols-2">
              {data.bestSelling.map((product) => (
                <ProductCard key={product.id} product={product} variant="home" />
              ))}
            </div>
          </div>
          <div className="bg-stone-900 p-8 text-white">
            <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Categorias</p>
            <div className="mt-8 space-y-6">
              {visibleCategories.map((category) => (
                <div key={category.id} className="border-b border-white/10 pb-5">
                  <Link href={`/products?category=${category.slug}`} className="font-serif text-3xl">
                    {category.name}
                  </Link>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {category.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/products?category=${child.slug}`}
                        className="rounded-full bg-white/10 px-4 py-2 text-sm text-stone-200"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {hasMoreCategories ? (
              <div className="mt-8">
                <Link
                  href="/products"
                  className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm uppercase tracking-[0.24em] text-stone-100 transition hover:bg-white/15"
                >
                  Ver mas
                </Link>
              </div>
            ) : null}
          </div>
        </section>

        <section className="mt-20">
          <SectionHeading
            eyebrow="Destacados"
            title="Seleccion principal"
            description="Encuentra ropa con identidad propia, lista para seguir contando historia en un nuevo closet."
          />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {data.featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} variant="home" />
            ))}
          </div>
        </section>

        <section className="mt-20">
          <SectionHeading
            eyebrow="Nuevos ingresos"
            title="Ultimos productos"
          />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {data.latestProducts.map((product) => (
              <ProductCard key={product.id} product={product} variant="home" />
            ))}
          </div>
        </section>

        <RecentlyViewedProducts products={allProducts} />
      </div>
    </div>
  );
}
