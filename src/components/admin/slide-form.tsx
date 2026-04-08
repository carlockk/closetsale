"use client";

import { useEffect, useState } from "react";

import { createSlideAction } from "@/actions/admin";
import { CloudinaryUploader } from "@/components/store/cloudinary-uploader";

type SlideFormProps = {
  pages: Array<{ id: string; title: string; slug: string; isPublished: boolean }>;
  products: Array<{ id: string; title: string; slug: string }>;
};

export function SlideForm({ pages, products }: SlideFormProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [targetType, setTargetType] = useState<"none" | "page" | "product">("none");
  const [pageTarget, setPageTarget] = useState("");
  const [productTarget, setProductTarget] = useState("");
  const [href, setHref] = useState("");

  useEffect(() => {
    if (targetType === "page") {
      setHref(pageTarget);
      return;
    }

    if (targetType === "product") {
      setHref(productTarget);
      return;
    }

    setHref("");
  }, [pageTarget, productTarget, targetType]);

  return (
    <form action={createSlideAction} className="grid gap-4 border border-slate-200 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span>Titulo</span>
          <input name="title" className="border border-slate-200 px-3 py-2 outline-none" required />
        </label>
        <label className="grid gap-2 text-sm">
          <span>Destino</span>
          <select
            value={targetType}
            onChange={(event) => setTargetType(event.target.value as "none" | "page" | "product")}
            className="border border-slate-200 px-3 py-2 outline-none"
          >
            <option value="none">Sin enlace</option>
            <option value="page">Pagina creada</option>
            <option value="product">Producto existente</option>
          </select>
        </label>
      </div>
      {targetType === "page" ? (
        <label className="grid gap-2 text-sm">
          <span>Pagina</span>
          <select
            value={pageTarget}
            onChange={(event) => setPageTarget(event.target.value)}
            className="border border-slate-200 px-3 py-2 outline-none"
          >
            <option value="">Selecciona una pagina</option>
            {pages
              .filter((page) => page.isPublished)
              .map((page) => (
                <option key={page.id} value={`/pages/${page.slug}`}>
                  {page.title}
                </option>
              ))}
          </select>
        </label>
      ) : null}
      {targetType === "product" ? (
        <label className="grid gap-2 text-sm">
          <span>Producto</span>
          <select
            value={productTarget}
            onChange={(event) => setProductTarget(event.target.value)}
            className="border border-slate-200 px-3 py-2 outline-none"
          >
            <option value="">Selecciona un producto</option>
            {products.map((product) => (
              <option key={product.id} value={`/products/${product.slug}`}>
                {product.title}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="grid gap-2 text-sm">
        <span>Subtitulo</span>
        <textarea name="subtitle" rows={3} className="border border-slate-200 px-3 py-2 outline-none" />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <CloudinaryUploader onUploaded={setImageUrl} />
        <input
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          name="imageUrl"
          placeholder="La URL se completa al subir la imagen"
          className="min-w-72 flex-1 border border-slate-200 px-3 py-2 outline-none"
          required
        />
        <input
          type="number"
          name="sortOrder"
          placeholder="Orden"
          defaultValue={1}
          className="w-28 border border-slate-200 px-3 py-2 outline-none"
        />
      </div>
      <input type="hidden" name="href" value={href} />
      <button className="w-fit bg-slate-900 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white">
        Guardar slide
      </button>
    </form>
  );
}
