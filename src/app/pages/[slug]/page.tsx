import { notFound } from "next/navigation";

import { getSitePageBySlug } from "@/lib/site-pages";

type SitePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PublicSitePage({ params }: SitePageProps) {
  const { slug } = await params;
  const page = await getSitePageBySlug(slug);

  if (!page || !page.isPublished) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <div className="border-b border-stone-200 pb-6">
        <p className="text-xs uppercase tracking-[0.32em] text-stone-400">Pagina</p>
        <h1 className="mt-3 font-serif text-5xl text-stone-950">{page.title}</h1>
        {page.excerpt ? <p className="mt-4 text-lg text-stone-600">{page.excerpt}</p> : null}
      </div>
      <article
        className="mt-8 max-w-none text-stone-700 [&_a]:text-stone-950 [&_a]:underline [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-4xl [&_h2]:text-stone-950 [&_h3]:mt-6 [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:text-stone-900 [&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-[1.5rem] [&_li]:ml-5 [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_p]:my-4 [&_p]:leading-7 [&_ul]:my-4 [&_ul]:list-disc"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
