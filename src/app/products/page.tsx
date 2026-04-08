import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { getCategoryTree, getProducts } from "@/lib/store";

type ProductsPageProps = {
  searchParams: Promise<{ category?: string; search?: string }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts({ category: params.category, search: params.search }),
    getCategoryTree(),
  ]);
  const activeCategory = categories.find((category) => category.slug === params.category) ||
    categories.flatMap((category) => category.children).find((category) => category.slug === params.category) ||
    null;

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <SectionHeading
        eyebrow="Tienda"
        title={activeCategory ? activeCategory.name : "Explora todo el catalogo"}
        description="Descubre el inventario completo y filtra por categoria segun lo que busques."
      />

      <div className="mb-8 flex flex-wrap gap-2 lg:hidden">
        <Link
          href="/products"
          className={`border px-4 py-2 text-sm ${
            !params.category
              ? "border-stone-900 bg-stone-900 text-white"
              : "border-stone-200 bg-white text-stone-700"
          }`}
        >
          Todo
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className={`border px-4 py-2 text-sm ${
              params.category === category.slug
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-stone-200 bg-white text-stone-700"
            }`}
          >
            {category.name}
          </Link>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden h-fit border-r border-stone-200 pr-6 lg:block">
          <div className="border-b border-stone-200 pb-4">
            <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Categorias</p>
            <h2 className="mt-2 font-serif text-3xl text-stone-950">Tienda</h2>
          </div>
          <div className="mt-5 space-y-1">
            <Link
              href="/products"
              className={`block border-b px-0 py-3 text-sm transition ${
                !params.category
                  ? "border-stone-900 font-medium text-stone-950"
                  : "border-stone-200 text-stone-700 hover:text-stone-950"
              }`}
            >
              Todo el catalogo
            </Link>
            {categories.map((category) => (
              <div key={category.id} className="border-b border-stone-200">
                <Link
                  href={`/products?category=${category.slug}`}
                  className={`block px-0 py-3 text-sm font-medium transition ${
                    params.category === category.slug
                      ? "text-stone-950"
                      : "text-stone-800 hover:text-stone-950"
                  }`}
                >
                  {category.name}
                </Link>
                {category.children.length > 0 ? (
                  <div className="space-y-1 pb-3 pl-4">
                    {category.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/products?category=${child.slug}`}
                        className={`block px-0 py-1.5 text-sm transition ${
                          params.category === child.slug
                            ? "font-medium text-stone-950"
                            : "text-stone-500 hover:text-stone-900"
                        }`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </aside>

        <div>
          {products.length === 0 ? (
            <div className="border border-stone-200 px-6 py-10 text-stone-500">
              No encontramos productos para esta categoria.
            </div>
          ) : (
            <div className="grid gap-x-5 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
