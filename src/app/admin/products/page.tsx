import { ProductForm } from "@/components/admin/product-form";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

type ProductsAdminPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function ProductsAdminPage({
  searchParams,
}: ProductsAdminPageProps) {
  const params = await searchParams;
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        images: { take: 1, orderBy: { sortOrder: "asc" } },
        variants: true,
      },
    }),
  ]);

  return (
    <div className="min-w-[840px] space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Catalogo</p>
        <h1 className="mt-2 font-serif text-3xl text-slate-950">Productos</h1>
        {params.message ? <p className="mt-3 text-sm text-emerald-700">{params.message}</p> : null}
      </div>

      <ProductForm categories={categories.map((category) => ({ id: category.id, name: category.name }))} />

      <div className="overflow-x-auto border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.18em] text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium">Variantes</th>
              <th className="px-4 py-3 font-medium">Precio</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-slate-200 text-slate-700">
                <td className="px-4 py-3 font-medium text-slate-950">{product.title}</td>
                <td className="px-4 py-3">{product.category.name}</td>
                <td className="px-4 py-3">{product.variants.length}</td>
                <td className="px-4 py-3 font-semibold text-slate-950">{formatCurrency(Number(product.price))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
