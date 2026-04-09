import Link from "next/link";

import { deleteSitePageAction } from "@/actions/admin";
import { AdminSideDrawer } from "@/components/admin/admin-side-drawer";
import { SitePageForm } from "@/components/admin/site-page-form";
import { requireAdmin } from "@/lib/auth";
import { getAdminSitePages } from "@/lib/site-pages";

type PagesAdminPageProps = {
  searchParams: Promise<{ message?: string; create?: string; edit?: string }>;
};

export default async function PagesAdminPage({ searchParams }: PagesAdminPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const pages = await getAdminSitePages();
  const isCreateMode = params.create === "1";
  const isDrawerOpen = isCreateMode || Boolean(params.edit);
  const pageToEdit = params.edit ? pages.find((page) => page.id === params.edit) || null : null;

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

    return query.size ? `/admin/pages?${query.toString()}` : "/admin/pages";
  }

  return (
    <div className="min-w-[840px] space-y-6">
      <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Contenido</p>
          <h1 className="mt-2 font-serif text-3xl text-slate-950">Paginas</h1>
          {params.message ? <p className="mt-3 text-sm text-emerald-700">{params.message}</p> : null}
        </div>
        <Link
          href={buildHref({ create: "1" })}
          className="bg-slate-900 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white"
        >
          Crear pagina
        </Link>
      </div>

      <div className="overflow-x-auto border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.18em] text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Titulo</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="border-t border-slate-200 text-slate-700">
                <td className="px-4 py-3 font-medium text-slate-950">{page.title}</td>
                <td className="px-4 py-3">/pages/{page.slug}</td>
                <td className="px-4 py-3">{page.isPublished ? "Publicada" : "Borrador"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={buildHref({ edit: page.id })}
                      className="inline-flex h-9 w-9 items-center justify-center border border-slate-300 text-slate-700 transition hover:bg-slate-900 hover:text-white"
                      aria-label={`Editar ${page.title}`}
                      title="Editar"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h4l10-10-4-4L4 16v4Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="m12 6 4 4" />
                      </svg>
                    </Link>
                    <form action={deleteSitePageAction}>
                      <input type="hidden" name="pageId" value={page.id} />
                      <button
                        type="submit"
                        className="inline-flex h-9 w-9 items-center justify-center border border-rose-200 text-rose-600 transition hover:bg-rose-600 hover:text-white"
                        aria-label={`Eliminar ${page.title}`}
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

      <AdminSideDrawer
        open={isDrawerOpen}
        closeHref={buildHref()}
        title={pageToEdit ? "Editar pagina" : "Crear pagina"}
      >
        <SitePageForm page={pageToEdit} />
      </AdminSideDrawer>
    </div>
  );
}
