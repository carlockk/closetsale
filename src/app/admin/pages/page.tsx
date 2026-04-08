import Link from "next/link";

import { AdminSideDrawer } from "@/components/admin/admin-side-drawer";
import { SitePageForm } from "@/components/admin/site-page-form";
import { requireAdmin } from "@/lib/auth";
import { getAdminSitePages } from "@/lib/site-pages";

type PagesAdminPageProps = {
  searchParams: Promise<{ message?: string; create?: string }>;
};

export default async function PagesAdminPage({ searchParams }: PagesAdminPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const pages = await getAdminSitePages();
  const isDrawerOpen = params.create === "1";

  return (
    <div className="min-w-[840px] space-y-6">
      <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Contenido</p>
          <h1 className="mt-2 font-serif text-3xl text-slate-950">Paginas</h1>
          {params.message ? <p className="mt-3 text-sm text-emerald-700">{params.message}</p> : null}
        </div>
        <Link
          href="/admin/pages?create=1"
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
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="border-t border-slate-200 text-slate-700">
                <td className="px-4 py-3 font-medium text-slate-950">{page.title}</td>
                <td className="px-4 py-3">/pages/{page.slug}</td>
                <td className="px-4 py-3">{page.isPublished ? "Publicada" : "Borrador"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminSideDrawer open={isDrawerOpen} closeHref="/admin/pages" title="Crear pagina">
        <SitePageForm />
      </AdminSideDrawer>
    </div>
  );
}
