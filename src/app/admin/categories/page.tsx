import { createCategoryAction } from "@/actions/admin";
import { prisma } from "@/lib/prisma";

type CategoriesPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const params = await searchParams;
  const categories = await prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
    include: { parent: true },
  });

  return (
    <div className="min-w-[720px] space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Catalogo</p>
        <h1 className="mt-2 font-serif text-3xl text-slate-950">Categorias</h1>
        {params.message ? <p className="mt-3 text-sm text-emerald-700">{params.message}</p> : null}
      </div>

      <form action={createCategoryAction} className="grid gap-4 border border-slate-200 p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <input name="name" placeholder="Nombre categoria" className="border border-slate-200 px-3 py-2 text-sm" required />
            <input name="slug" placeholder="slug-opcional" className="border border-slate-200 px-3 py-2 text-sm" />
            <select name="parentId" className="border border-slate-200 px-3 py-2 text-sm">
              <option value="">Sin categoria padre</option>
              {categories.filter((category) => !category.parentId).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <textarea name="description" placeholder="Descripcion" rows={3} className="border border-slate-200 px-3 py-2 text-sm" />
          <button className="w-fit bg-slate-900 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white">
            Crear categoria
          </button>
      </form>

      <div className="overflow-x-auto border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.18em] text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Relacion</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-t border-slate-200 text-slate-700">
                <td className="px-4 py-3 font-medium text-slate-950">{category.name}</td>
                <td className="px-4 py-3">/{category.slug}</td>
                <td className="px-4 py-3">{category.parent ? `Hija de ${category.parent.name}` : "Raiz"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
