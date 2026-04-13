import Link from "next/link";

import { FeaturedProductsCarousel } from "@/components/featured-products-carousel";
import { HeroSlider } from "@/components/hero-slider";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { RecentlyViewedProducts } from "@/components/store/recently-viewed";
import { getHomeData, getProducts } from "@/lib/store";

export default async function Home() {
  const data = await getHomeData();
  const allProducts = await getProducts();
  const visibleCategories = data.categories.slice(0, 4);
  const hasMoreCategories = data.categories.length > visibleCategories.length;
  const featuredProducts = data.featuredProducts.slice(0, 6);
  const latestProducts = data.latestProducts.slice(0, 3);
  const mostViewedProducts = data.mostViewed.slice(0, 4);
  const topSellers = data.topSellers.slice(0, 3);

  return (
    <div className="pb-8">
      <div className="relative left-1/2 w-[100dvw] max-w-[100dvw] -translate-x-1/2 overflow-hidden">
        <HeroSlider slides={data.slides} />
      </div>

      <div className="mx-auto max-w-7xl px-1.5 py-10 lg:px-2">
        <section className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_320px]">
          <div>
            <SectionHeading
              eyebrow="Mas vendidos"
              title="Piezas que giran rapido"
              description="Una seleccion con salida real dentro de ClosetSale. Menos ruido, mejores prendas y una lectura mas clara del catalogo."
            />
            <div className="grid gap-6 md:grid-cols-2">
              {data.bestSelling.map((product) => (
                <ProductCard key={product.id} product={product} variant="home" />
              ))}
            </div>
            <div className="mt-6">
              <Link
                href="/products"
                className="inline-flex items-center rounded-full border border-stone-200 px-5 py-2 text-sm uppercase tracking-[0.24em] text-stone-800 transition hover:border-stone-300 hover:text-stone-950"
              >
                Ver mas
              </Link>
            </div>
          </div>

          <aside className="border border-stone-200 bg-stone-950 p-8 text-white">
            <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Explora</p>
            <h2 className="mt-3 font-serif text-4xl text-white">Categorias clave</h2>
            <p className="mt-4 text-sm leading-6 text-stone-300">
              Una entrada mas limpia para navegar por el marketplace sin convertir esta columna en un panel pesado.
            </p>

            <div className="mt-8 space-y-5">
              {visibleCategories.map((category) => (
                <div key={category.id} className="border-b border-white/10 pb-5">
                  <Link
                    href={`/products?category=${category.slug}`}
                    className="font-serif text-3xl text-white transition hover:text-stone-300"
                  >
                    {category.name}
                  </Link>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                    {category.children.slice(0, 3).map((child) => (
                      <Link
                        key={child.id}
                        href={`/products?category=${child.slug}`}
                        className="text-sm text-stone-400 transition hover:text-white"
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
                  className="inline-flex items-center rounded-full border border-white/20 px-5 py-2 text-sm uppercase tracking-[0.24em] text-white transition hover:border-white/40 hover:bg-white/10"
                >
                  Ver todo el catalogo
                </Link>
              </div>
            ) : null}
          </aside>
        </section>

        <section
          className={`mt-24 grid gap-10 border-t border-stone-200 pt-12 ${
            topSellers.length > 0 ? "lg:grid-cols-[0.85fr_1.15fr]" : ""
          }`}
        >
          {topSellers.length > 0 ? (
            <div>
              <SectionHeading
                eyebrow="Sellers destacados"
                title="Tiendas con mas movimiento"
                description="Una lectura publica del marketplace basada en ventas registradas y catalogo activo."
              />
              <div className="space-y-4">
                {topSellers.map((seller, index) => (
                  <Link
                    key={seller.id}
                    href={`/tienda/${seller.slug}`}
                    className="block border-b border-stone-200 pb-4 transition hover:border-stone-400"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.28em] text-stone-400">
                          Top {index + 1}
                        </p>
                        <h3 className="mt-2 font-serif text-3xl text-stone-950">{seller.storeName}</h3>
                      </div>
                      <p className="text-sm text-stone-500">{seller.metrics.orders} ventas</p>
                    </div>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600">
                      {seller.description || "Seller activo con catalogo propio y traccion dentro de ClosetSale."}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <div className={topSellers.length === 0 ? "w-full" : ""}>
            <SectionHeading
              eyebrow="Destacados"
              title="Seleccion principal"
              description="Una capa mas curada del catalogo para mantener el home nítido, deseable y facil de recorrer."
            />
            <FeaturedProductsCarousel products={featuredProducts} />
          </div>
        </section>

        {mostViewedProducts.length > 0 ? (
          <section className="mt-24 border-t border-stone-200 pt-12">
            <SectionHeading
              eyebrow="Mas vistos"
              title="Lo que mas estan mirando"
              description="Productos con mayor atencion real dentro del sitio."
            />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {mostViewedProducts.map((product) => (
                <ProductCard key={product.id} product={product} variant="home" />
              ))}
            </div>
            <div className="mt-6">
              <Link
                href="/products"
                className="inline-flex items-center rounded-full border border-stone-200 px-5 py-2 text-sm uppercase tracking-[0.24em] text-stone-800 transition hover:border-stone-300 hover:text-stone-950"
              >
                Ver mas
              </Link>
            </div>
          </section>
        ) : null}

        <section className="mt-24 border-t border-stone-200 pt-12">
          <div className="border border-stone-200 bg-stone-950 px-6 py-6 text-white md:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Marketplace</p>
                <h2 className="mt-3 font-serif text-3xl text-white md:text-4xl">
                  Compra por tienda, descubre por afinidad.
                </h2>
                <p className="mt-3 text-sm leading-6 text-stone-300 md:text-base">
                  El home deja leer sellers, movimiento real y rutas de exploracion mas claras sin
                  recargar la portada.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:min-w-[22rem]">
                <div className="border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Tiendas</p>
                  <p className="mt-2 font-serif text-3xl text-white">{data.topSellers.length}</p>
                  <p className="mt-2 text-sm text-stone-300">Sellers visibles en el ranking publico.</p>
                </div>
                <div className="border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Visitas</p>
                  <p className="mt-2 font-serif text-3xl text-white">{mostViewedProducts.length}</p>
                  <p className="mt-2 text-sm text-stone-300">Productos con atencion activa en la portada.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 border-t border-stone-200 pt-12">
          <div className="max-w-3xl">
            <SectionHeading
              eyebrow="Nuevos ingresos"
              title="Ultimas piezas"
              description="Lo ultimo en entrar, mostrado con menos densidad para no saturar la portada."
            />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {latestProducts.map((product) => (
              <ProductCard key={product.id} product={product} variant="home" />
            ))}
          </div>
          <div className="mt-6">
            <Link
              href="/products"
              className="inline-flex items-center rounded-full border border-stone-200 px-5 py-2 text-sm uppercase tracking-[0.24em] text-stone-800 transition hover:border-stone-300 hover:text-stone-950"
            >
              Ver mas
            </Link>
          </div>
        </section>

        <section className="mt-12 border-t border-stone-200 pt-12">
          <RecentlyViewedProducts products={allProducts} />
        </section>
      </div>
    </div>
  );
}
