"use client";

import Image from "next/image";
import { useState } from "react";

import { createSellerProductAction, updateSellerProductAction } from "@/actions/seller";
import { CloudinaryUploader } from "@/components/store/cloudinary-uploader";
import { safeSlug } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
};

type EditableProduct = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  brand: string | null;
  color: string | null;
  categoryId: string;
  status: string;
  isFeatured: boolean;
  images: Array<{ id: string; url: string; alt: string | null }>;
};

type SellerProductFormProps = {
  categories: Category[];
  product?: EditableProduct | null;
};

export function SellerProductForm({ categories, product }: SellerProductFormProps) {
  const isEditing = Boolean(product);
  const [title, setTitle] = useState(product?.title ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [images, setImages] = useState<string[]>(product?.images.map((image) => image.url) ?? []);
  const [imageInput, setImageInput] = useState("");

  function handleTitleChange(value: string) {
    setTitle(value);

    const currentAutoSlug = safeSlug(title);
    if (!slug || slug === currentAutoSlug) {
      setSlug(safeSlug(value));
    }
  }

  return (
    <form
      action={isEditing ? updateSellerProductAction : createSellerProductAction}
      className="grid min-w-0 gap-5 rounded-[1.75rem] border border-stone-200 bg-white p-5"
    >
      {isEditing ? <input type="hidden" name="productId" value={product?.id} /> : null}
      <input type="hidden" name="variants" value="[]" />

      <div className="border-b border-stone-200 pb-4">
        <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Producto</p>
        <h3 className="mt-2 font-serif text-2xl text-stone-950">
          {isEditing ? "Editar producto" : "Nuevo producto"}
        </h3>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Cada guardado envia el producto a revision antes de publicarlo en el marketplace.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-stone-700">
          <span>Titulo</span>
          <input
            name="title"
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            className="min-w-0 w-full border border-stone-200 px-3 py-2 outline-none"
            required
          />
        </label>
        <label className="grid gap-2 text-sm text-stone-700">
          <span>Slug</span>
          <input
            name="slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className="min-w-0 w-full border border-stone-200 px-3 py-2 outline-none"
            required
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm text-stone-700">
        <span>Descripcion</span>
        <textarea
          name="description"
          rows={5}
          defaultValue={product?.description ?? ""}
          className="min-w-0 w-full border border-stone-200 px-3 py-2 outline-none"
          required
        />
      </label>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="grid gap-2 text-sm text-stone-700">
          <span>Precio</span>
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={product?.price ?? ""}
            className="min-w-0 w-full border border-stone-200 px-3 py-2 outline-none"
            required
          />
        </label>
        <label className="grid gap-2 text-sm text-stone-700">
          <span>Precio compare</span>
          <input
            name="compareAtPrice"
            type="number"
            min="0"
            step="0.01"
            defaultValue={product?.compareAtPrice ?? ""}
            className="min-w-0 w-full border border-stone-200 px-3 py-2 outline-none"
          />
        </label>
        <label className="grid gap-2 text-sm text-stone-700">
          <span>Marca</span>
          <input
            name="brand"
            defaultValue={product?.brand ?? ""}
            className="min-w-0 w-full border border-stone-200 px-3 py-2 outline-none"
          />
        </label>
        <label className="grid gap-2 text-sm text-stone-700">
          <span>Color</span>
          <input
            name="color"
            defaultValue={product?.color ?? ""}
            className="min-w-0 w-full border border-stone-200 px-3 py-2 outline-none"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm text-stone-700">
        <span>Categoria</span>
        <select
          name="categoryId"
          defaultValue={product?.categoryId ?? ""}
          className="min-w-0 w-full border border-stone-200 px-3 py-2 outline-none"
          required
        >
          <option value="">Selecciona una categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid min-w-0 gap-3 rounded-[1.5rem] border border-stone-200 p-4">
        <div className="grid min-w-0 gap-3 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0">
            <CloudinaryUploader onUploaded={(url) => setImages((current) => [...current, url])} />
          </div>
          <input
            value={imageInput}
            onChange={(event) => setImageInput(event.target.value)}
            placeholder="Pegar URL de imagen"
            className="min-w-0 w-full border border-stone-200 px-3 py-2 outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (!imageInput.trim()) {
                return;
              }

              setImages((current) => [...current, imageInput.trim()]);
              setImageInput("");
            }}
            className="bg-stone-900 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-white"
          >
            Agregar URL
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((image, index) => (
            <div key={`${image}-${index}`} className="rounded-[1.25rem] border border-stone-200 p-2">
              <div className="relative aspect-square overflow-hidden rounded-[1rem] bg-stone-100">
                <Image
                  src={image}
                  alt={title || "Imagen del producto"}
                  fill
                  sizes="220px"
                  className="object-cover"
                />
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="truncate text-xs text-stone-500">Imagen {index + 1}</p>
                <button
                  type="button"
                  onClick={() => setImages((current) => current.filter((_, currentIndex) => currentIndex !== index))}
                  className="text-[11px] uppercase tracking-[0.18em] text-rose-600"
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>

        <input type="hidden" name="imageUrls" value={JSON.stringify(images)} />
      </div>

      <button className="w-fit bg-stone-900 px-5 py-3 text-[11px] uppercase tracking-[0.2em] text-white transition hover:bg-stone-800">
        {isEditing ? "Actualizar y enviar a revision" : "Guardar y enviar a revision"}
      </button>
    </form>
  );
}
