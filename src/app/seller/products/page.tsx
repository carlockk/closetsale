import Image from "next/image";
import Link from "next/link";

import { getCurrentSellerProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { SectionHeading } from "@/components/section-heading";
import { SellerProductForm } from "@/components/seller/seller-product-form";
import { SellerSideDrawer } from "@/components/seller/seller-side-drawer";

type SellerProductsPageProps = {
  searchParams: Promise<{ message?: string; edit?: string; page?: string; create?: string }>;
};

const PAGE_SIZE = 10;

const PRODUCT_STATUS_META: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  ACTIVE: {
    label: "Activo",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  PENDING_REVIEW: {
    label: "En revision",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  DRAFT: {
    label: "Borrador",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  },
  REJECTED: {
    label: "Rechazado",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  ARCHIVED: {
    label: "Archivado",
    className: "border-stone-200 bg-stone-100 text-stone-600",
  },
};

function getProductStatusMeta(status: string) {
  return PRODUCT_STATUS_META[status] ?? PRODUCT_STATUS_META.DRAFT;
}

export default async function SellerProductsPage({ searchParams }: SellerProductsPageProps) {
  const params = await searchParams;
  const seller = await getCurrentSellerProfile();

  if (!seller) {
    return null;
  }

  const currentPage = Math.max(1, Number(params.page || "1") || 1);
  const isCreateMode = params.create === "1";
  const isDrawerOpen = isCreateMode || Boolean(params.edit);

  const [categories, totalProducts, products, productToEdit] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.count({ where: { sellerId: seller.id } }),
    prisma.product.findMany({
      where: { sellerId: seller.id },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        images: { take: 1, orderBy: { sortOrder: "asc" } },
        variants: { select: { id: true } },
      },
    }),
    params.edit
      ? prisma.product.findFirst({
          where: { id: params.edit, sellerId: seller.id },
          include: {
            images: { orderBy: { sortOrder: "asc" } },
          },
        })
      : Promise.resolve(null),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));
  const previousPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;
  const drawerTitle = isCreateMode ? "Nuevo producto" : productToEdit ? "Editar producto" : "Producto";

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

    return `/seller/products?${query.toString()}`;
  }

  const closeDrawerHref = buildPageHref(currentPage);
  const openCreateHref = buildPageHref(currentPage, { create: "1" });

  const counts = products.reduce(
    (accumulator, product) => {
      accumulator.total += 1;
      accumulator[product.status as keyof typeof accumulator] =
        (accumulator[product.status as keyof typeof accumulator] ?? 0) + 1;
      return accumulator;
    },
    {
      total: 0,
      ACTIVE: 0,
      PENDING_REVIEW: 0,
      DRAFT: 0,
      REJECTED: 0,
      ARCHIVED: 0,
    },
  );

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Seller / Productos"
        title="Gestion de catalogo"
        description="Crea, edita y revisa tus productos antes de que entren al flujo comercial del marketplace."
      />

      {params.message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {params.message}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-[1.75rem] border border-stone-200 bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Total</p>
          <p className="mt-3 font-serif text-3xl text-stone-950">{counts.total}</p>
          <p className="mt-3 text-sm leading-6 text-stone-600">Productos cargados en tu tienda.</p>
        </article>
        <article className="rounded-[1.75rem] border border-stone-200 bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Activos</p>
          <p className="mt-3 font-serif text-3xl text-stone-950">{counts.ACTIVE}</p>
          <p className="mt-3 text-sm leading-6 text-stone-600">Listos para publicar.</p>
        </article>
        <article className="rounded-[1.75rem] border border-stone-200 bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Revision</p>
          <p className="mt-3 font-serif text-3xl text-stone-950">{counts.PENDING_REVIEW}</p>
          <p className="mt-3 text-sm leading-6 text-stone-600">Esperando aprobacion.</p>
        </article>
        <article className="rounded-[1.75rem] border border-stone-200 bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Borradores</p>
          <p className="mt-3 font-serif text-3xl text-stone-950">{counts.DRAFT}</p>
          <p className="mt-3 text-sm leading-6 text-stone-600">Guardados como trabajo pendiente.</p>
        </article>
        <article className="rounded-[1.75rem] border border-stone-200 bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Archivados</p>
          <p className="mt-3 font-serif text-3xl text-stone-950">{counts.ARCHIVED}</p>
          <p className="mt-3 text-sm leading-6 text-stone-600">Ocultos del catalogo publico.</p>
        </article>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div className="text-sm text-stone-600">
          <p className="font-medium text-stone-900">Tu catalogo seller</p>
          <p className="mt-1">
            {totalProducts} producto(s) en {totalPages} pagina(s).
          </p>
        </div>
        <Link
          href={openCreateHref}
          className="inline-flex bg-stone-900 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white transition hover:bg-stone-800"
        >
          Nuevo producto
        </Link>
      </div>

      <div className="overflow-x-auto rounded-[1.75rem] border border-stone-200 bg-white shadow-sm">
        {products.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Catalogo vacio</p>
            <h3 className="mt-3 font-serif text-3xl text-stone-950">Aun no tienes productos</h3>
            <p className="mx-auto mt-3 max-w-xl text-stone-600">
              Crea tu primer producto para empezar a poblar tu tienda seller y preparar el catalogo.
            </p>
            <Link
              href={openCreateHref}
              className="mt-6 inline-flex bg-stone-900 px-5 py-3 text-[11px] uppercase tracking-[0.2em] text-white transition hover:bg-stone-800"
            >
              Crear primer producto
            </Link>
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-stone-50 text-[11px] uppercase tracking-[0.18em] text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Foto</th>
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Precio</th>
                <th className="px-4 py-3 font-medium">Variantes</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const meta = getProductStatusMeta(product.status);

                return (
                  <tr key={product.id} className="border-t border-stone-200 text-stone-700">
                    <td className="px-4 py-3">
                      <div className="relative h-16 w-16 overflow-hidden border border-stone-200 bg-stone-100">
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
                      <p className="font-medium text-stone-950">{product.title}</p>
                      <p className="mt-1 text-xs text-stone-500">/{product.slug}</p>
                    </td>
                    <td className="px-4 py-3">{product.category.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex border px-2 py-1 text-[11px] uppercase tracking-[0.18em] ${meta.className}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-stone-950">
                      {formatCurrency(Number(product.price))}
                    </td>
                    <td className="px-4 py-3">{product.variants.length}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/products/${product.slug}`}
                          className="inline-flex h-9 w-9 items-center justify-center border border-stone-300 text-stone-700 transition hover:bg-stone-900 hover:text-white"
                          aria-label={`Ver ${product.title}`}
                          title="Ver"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                          </svg>
                        </Link>
                        <Link
                          href={buildPageHref(currentPage, { edit: product.id })}
                          className="inline-flex h-9 w-9 items-center justify-center border border-stone-300 text-stone-700 transition hover:bg-stone-900 hover:text-white"
                          aria-label={`Editar ${product.title}`}
                          title="Editar"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h4l10-10-4-4L4 16v4Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="m12 6 4 4" />
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-stone-200 pt-4 text-sm text-stone-600">
        <p>
          Pagina {currentPage} de {totalPages} · {totalProducts} producto(s)
        </p>
        <div className="flex items-center gap-2">
          {previousPage ? (
            <Link
              href={buildPageHref(previousPage)}
              className="border border-stone-300 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-stone-700"
            >
              Anterior
            </Link>
          ) : (
            <span className="border border-stone-200 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-stone-300">
              Anterior
            </span>
          )}
          {nextPage ? (
            <Link
              href={buildPageHref(nextPage)}
              className="border border-stone-300 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-stone-700"
            >
              Siguiente
            </Link>
          ) : (
            <span className="border border-stone-200 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-stone-300">
              Siguiente
            </span>
          )}
        </div>
      </div>

      <SellerSideDrawer
        open={isDrawerOpen}
        closeHref={closeDrawerHref}
        title={drawerTitle}
      >
        <div className="space-y-4">
          {params.edit && !productToEdit ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              No encontramos ese producto. El formulario queda listo para crear uno nuevo.
            </div>
          ) : null}
          <SellerProductForm
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
                    status: productToEdit.status,
                    isFeatured: productToEdit.isFeatured,
                    images: productToEdit.images.map((image) => ({
                      id: image.id,
                      url: image.url,
                      alt: image.alt,
                    })),
                  }
                : null
            }
          />
        </div>
      </SellerSideDrawer>
    </div>
  );
}
