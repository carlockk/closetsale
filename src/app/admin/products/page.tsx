import Image from "next/image";
import Link from "next/link";

import { deleteProductAction } from "@/actions/admin";
import { AdminSideDrawer } from "@/components/admin/admin-side-drawer";
import { ProductForm } from "@/components/admin/product-form";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

type ProductsAdminPageProps = {
  searchParams: Promise<{ message?: string; edit?: string; page?: string; create?: string }>;
};

const PAGE_SIZE = 12;

export default async function ProductsAdminPage({
  searchParams,
}: ProductsAdminPageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page || "1") || 1);
  const isCreateMode = params.create === "1";
  const isDrawerOpen = isCreateMode || Boolean(params.edit);
  const [categories, totalProducts, products, productToEdit] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.count(),
    prisma.product.findMany({
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        images: { take: 1, orderBy: { sortOrder: "asc" } },
        variants: true,
      },
    }),
    params.edit
      ? prisma.product.findUnique({
          where: { id: params.edit },
          include: {
            images: { orderBy: { sortOrder: "asc" } },
            variants: { orderBy: { createdAt: "asc" } },
          },
        })
      : Promise.resolve(null),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));
  const previousPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  function buildPageHref(page: number, extra?: Record<string, string>) {
    const query = new URLSearchParams();

    query.set("page", String(page));

    if (params.message) {
      query.set("message", params.message);
    }

    if (extra) {
      Object.entries(extra).forEach(([key, value]) => {
        query.set(key, value);
      });
    }

    return `/admin/products?${query.toString()}`;
  }

  const closeDrawerHref = buildPageHref(currentPage);
  const openCreateHref = buildPageHref(currentPage, { create: "1" });

  return (
    <div className="min-w-[980px] space-y-6">
      <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Catalogo</p>
          <h1 className="mt-2 font-serif text-3xl text-slate-950">Productos</h1>
          {params.message ? <p className="mt-3 text-sm text-emerald-700">{params.message}</p> : null}
        </div>
        <Link
          href={openCreateHref}
          className="bg-slate-900 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white"
        >
          Crear producto
        </Link>
      </div>

      <div className="overflow-x-auto border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.18em] text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Foto</th>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium">Variantes</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-slate-200 text-slate-700">
                <td className="px-4 py-3">
                  <div className="relative h-16 w-16 overflow-hidden border border-slate-200 bg-slate-100">
                    {product.images[0]?.url ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.images[0].alt || product.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-950">{product.title}</p>
                  <p className="mt-1 text-xs text-slate-500">/{product.slug}</p>
                </td>
                <td className="px-4 py-3">{product.category.name}</td>
                <td className="px-4 py-3">{product.variants.length}</td>
                <td className="px-4 py-3 font-semibold text-slate-950">
                  {formatCurrency(Number(product.price))}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={buildPageHref(currentPage, { edit: product.id })}
                      className="inline-flex h-9 w-9 items-center justify-center border border-slate-300 text-slate-700 transition hover:bg-slate-900 hover:text-white"
                      aria-label={`Editar ${product.title}`}
                      title="Editar"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h4l10-10-4-4L4 16v4Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="m12 6 4 4" />
                      </svg>
                    </Link>
                    <form action={deleteProductAction}>
                      <input type="hidden" name="productId" value={product.id} />
                      <button
                        type="submit"
                        className="inline-flex h-9 w-9 items-center justify-center border border-rose-200 text-rose-600 transition hover:bg-rose-600 hover:text-white"
                        aria-label={`Eliminar ${product.title}`}
                        title="Eliminar"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 11v6" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 7l1 12h10l1-12" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 7V4h6v3" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-600">
        <p>
          Pagina {currentPage} de {totalPages} · {totalProducts} producto(s)
        </p>
        <div className="flex items-center gap-2">
          {previousPage ? (
            <Link
              href={buildPageHref(previousPage)}
              className="border border-slate-300 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-700"
            >
              Anterior
            </Link>
          ) : (
            <span className="border border-slate-200 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-300">
              Anterior
            </span>
          )}
          {nextPage ? (
            <Link
              href={buildPageHref(nextPage)}
              className="border border-slate-300 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-700"
            >
              Siguiente
            </Link>
          ) : (
            <span className="border border-slate-200 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-300">
              Siguiente
            </span>
          )}
        </div>
      </div>

      <AdminSideDrawer
        open={isDrawerOpen}
        closeHref={closeDrawerHref}
        title={productToEdit ? "Editar producto" : "Crear producto"}
      >
        <ProductForm
          compact
          categories={categories.map((category) => ({ id: category.id, name: category.name }))}
          product={
            productToEdit
              ? {
                  id: productToEdit.id,
                  title: productToEdit.title,
                  slug: productToEdit.slug,
                  description: productToEdit.description,
                  price: Number(productToEdit.price),
                  compareAtPrice: productToEdit.compareAtPrice
                    ? Number(productToEdit.compareAtPrice)
                    : null,
                  brand: productToEdit.brand,
                  color: productToEdit.color,
                  categoryId: productToEdit.categoryId,
                  images: productToEdit.images.map((image) => ({
                    id: image.id,
                    url: image.url,
                    alt: image.alt,
                  })),
                  variants: productToEdit.variants.map((variant) => ({
                    id: variant.id,
                    name: variant.name,
                    value: variant.value,
                    stock: variant.stock,
                    priceDelta: Number(variant.priceDelta),
                  })),
                }
              : null
          }
        />
      </AdminSideDrawer>
    </div>
  );
}
