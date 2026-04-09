import Link from "next/link";

import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/actions/admin";
import { AdminSideDrawer } from "@/components/admin/admin-side-drawer";
import { prisma } from "@/lib/prisma";

type CategoriesPageProps = {
  searchParams: Promise<{ message?: string; create?: string; edit?: string }>;
};

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const params = await searchParams;
  const isCreateMode = params.create === "1";
  const isDrawerOpen = isCreateMode || Boolean(params.edit);
  const [categories, categoryToEdit] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ parentId: "asc" }, { name: "asc" }],
      include: {
        parent: true,
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    }),
    params.edit
      ? prisma.category.findUnique({
          where: { id: params.edit },
          include: {
            parent: true,
            _count: {
              select: {
                children: true,
                products: true,
              },
            },
          },
        })
      : Promise.resolve(null),
  ]);
  const rootCategories = categories.filter((category) => !category.parentId);

  function buildHref(extra?: Record<string, string>) {
    const query = new URLSearchParams();

    if (params.message) {
      query.set("message", params.message);
    }

    if (extra) {
      Object.entries(extra).forEach(([key, value]) => {
        query.set(key, value);
      });
    }

    return query.size ? `/admin/categories?${query.toString()}` : "/admin/categories";
  }

  const closeDrawerHref = buildHref();
  const openCreateHref = buildHref({ create: "1" });
  const blockedParentIds = new Set(
    categoryToEdit
      ? [categoryToEdit.id, ...categories.filter((category) => category.parentId === categoryToEdit.id).map((category) => category.id)]
      : [],
  );
  const editableParents = rootCategories.filter((category) => !blockedParentIds.has(category.id));
  const formAction = categoryToEdit ? updateCategoryAction : createCategoryAction;
  const drawerTitle = categoryToEdit ? "Editar categoria" : "Crear categoria";

  return (
    <div className="min-w-[720px] space-y-6">
      <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Catalogo</p>
          <h1 className="mt-2 font-serif text-3xl text-slate-950">Categorias</h1>
          {params.message ? <p className="mt-3 text-sm text-emerald-700">{params.message}</p> : null}
        </div>
        <Link
          href={openCreateHref}
          className="bg-slate-900 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white"
        >
          Crear categoria
        </Link>
      </div>

      <div className="overflow-x-auto border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.18em] text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Relacion</th>
              <th className="px-4 py-3 font-medium">Uso</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-t border-slate-200 text-slate-700">
                <td className="px-4 py-3 font-medium text-slate-950">{category.name}</td>
                <td className="px-4 py-3">/{category.slug}</td>
                <td className="px-4 py-3">{category.parent ? `Hija de ${category.parent.name}` : "Raiz"}</td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {category._count.children} subcategoria(s) · {category._count.products} producto(s)
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={buildHref({ edit: category.id })}
                      className="inline-flex h-9 w-9 items-center justify-center border border-slate-300 text-slate-700 transition hover:bg-slate-900 hover:text-white"
                      aria-label={`Editar ${category.name}`}
                      title="Editar"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h4l10-10-4-4L4 16v4Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="m12 6 4 4" />
                      </svg>
                    </Link>
                    <form action={deleteCategoryAction}>
                      <input type="hidden" name="categoryId" value={category.id} />
                      <button
                        type="submit"
                        className="inline-flex h-9 w-9 items-center justify-center border border-rose-200 text-rose-600 transition hover:bg-rose-600 hover:text-white"
                        aria-label={`Eliminar ${category.name}`}
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

      <AdminSideDrawer open={isDrawerOpen} closeHref={closeDrawerHref} title={drawerTitle}>
        <form action={formAction} className="grid gap-4 border border-slate-200 bg-white p-4">
          {categoryToEdit ? <input type="hidden" name="categoryId" value={categoryToEdit.id} /> : null}
          <div className="grid gap-4 md:grid-cols-3">
            <input
              name="name"
              placeholder="Nombre categoria"
              className="min-w-0 border border-slate-200 px-3 py-2 text-sm"
              defaultValue={categoryToEdit?.name || ""}
              required
            />
            <input
              name="slug"
              placeholder="slug-opcional"
              className="min-w-0 border border-slate-200 px-3 py-2 text-sm"
              defaultValue={categoryToEdit?.slug || ""}
            />
            <select
              name="parentId"
              className="min-w-0 border border-slate-200 px-3 py-2 text-sm"
              defaultValue={categoryToEdit?.parentId || ""}
            >
              <option value="">Sin categoria padre</option>
              {(categoryToEdit ? editableParents : rootCategories)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>
          <textarea
            name="description"
            placeholder="Descripcion"
            rows={3}
            className="min-w-0 border border-slate-200 px-3 py-2 text-sm"
            defaultValue={categoryToEdit?.description || ""}
          />
          {categoryToEdit ? (
            <p className="text-xs leading-5 text-slate-500">
              Solo se permiten dos niveles: categoria raiz y subcategoria. Si esta categoria ya tiene
              subcategorias, primero debes moverlas o eliminarlas antes de convertirla en hija.
            </p>
          ) : null}
          <button className="w-fit bg-slate-900 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white">
            {categoryToEdit ? "Guardar cambios" : "Crear categoria"}
          </button>
        </form>
      </AdminSideDrawer>
    </div>
  );
}
