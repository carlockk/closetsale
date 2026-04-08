import Image from "next/image";

import { SlideForm } from "@/components/admin/slide-form";
import { prisma } from "@/lib/prisma";
import { getAdminSitePages } from "@/lib/site-pages";

type SliderPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function SliderPage({ searchParams }: SliderPageProps) {
  const params = await searchParams;
  const [slides, pages, products] = await Promise.all([
    prisma.slide.findMany({ orderBy: { sortOrder: "asc" } }),
    getAdminSitePages(),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { title: "asc" },
      select: { id: true, title: true, slug: true },
    }),
  ]);

  return (
    <div className="min-w-[840px] space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Contenido</p>
        <h1 className="mt-2 font-serif text-3xl text-slate-950">Slider</h1>
        {params.message ? <p className="mt-3 text-sm text-emerald-700">{params.message}</p> : null}
      </div>

      <SlideForm pages={pages} products={products} />

      <div className="grid gap-4 lg:grid-cols-2">
        {slides.map((slide) => (
          <div key={slide.id} className="overflow-hidden border border-slate-200 p-3">
            <Image
              src={slide.imageUrl}
              alt={slide.title}
              width={1200}
              height={700}
              className="aspect-[16/10] w-full object-cover"
            />
            <div className="p-4">
              <p className="font-medium text-slate-900">{slide.title}</p>
              <p className="text-sm text-slate-500">{slide.href || "/"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
