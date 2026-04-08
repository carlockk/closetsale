"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { createProductAction, updateProductAction } from "@/actions/admin";
import { CloudinaryUploader } from "@/components/store/cloudinary-uploader";
import { safeSlug } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
};

type ProductVariantInput = {
  name: string;
  value: string;
  stock: number;
  priceDelta: number;
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
  images: Array<{ id: string; url: string; alt: string | null }>;
  variants: Array<{
    id: string;
    name: string;
    value: string;
    stock: number;
    priceDelta: number;
  }>;
};

type ProductFormProps = {
  categories: Category[];
  product?: EditableProduct | null;
  compact?: boolean;
};

const EMPTY_VARIANT: ProductVariantInput = {
  name: "Talla",
  value: "",
  stock: 1,
  priceDelta: 0,
};

export function ProductForm({ categories, product, compact = false }: ProductFormProps) {
  const isEditing = Boolean(product);
  const [title, setTitle] = useState(product?.title ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [images, setImages] = useState<string[]>(product?.images.map((image) => image.url) ?? []);
  const [imageInput, setImageInput] = useState("");
  const [variants, setVariants] = useState<ProductVariantInput[]>(
    product?.variants.length
      ? product.variants.map((variant) => ({
          name: variant.name,
          value: variant.value,
          stock: variant.stock,
          priceDelta: variant.priceDelta,
        }))
      : [EMPTY_VARIANT],
  );

  const cleanedVariants = useMemo(
    () => variants.filter((variant) => variant.name.trim() && variant.value.trim()),
    [variants],
  );

  function handleTitleChange(value: string) {
    setTitle(value);

    const currentAutoSlug = safeSlug(title);
    if (!slug || slug === currentAutoSlug) {
      setSlug(safeSlug(value));
    }
  }

  return (
    <form
      action={isEditing ? updateProductAction : createProductAction}
      className="grid min-w-0 gap-4 border border-slate-200 bg-white p-4"
    >
      {compact ? null : (
        <div className="border-b border-slate-200 pb-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Editor</p>
          <h2 className="mt-2 font-serif text-2xl text-slate-950">
            {isEditing ? "Editar producto" : "Nuevo producto"}
          </h2>
        </div>
      )}

      {isEditing ? <input type="hidden" name="productId" value={product?.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span>Titulo</span>
          <input
            name="title"
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            className="min-w-0 w-full border border-slate-200 px-3 py-2 outline-none"
            required
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span>Slug</span>
          <input
            name="slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className="min-w-0 w-full border border-slate-200 px-3 py-2 outline-none"
            required
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm">
        <span>Descripcion</span>
        <textarea
          name="description"
          rows={4}
          defaultValue={product?.description ?? ""}
          className="min-w-0 w-full border border-slate-200 px-3 py-2 outline-none"
          required
        />
      </label>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="grid gap-2 text-sm">
          <span>Precio</span>
          <input
            name="price"
            type="number"
            defaultValue={product?.price ?? ""}
            className="min-w-0 w-full border border-slate-200 px-3 py-2 outline-none"
            required
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span>Precio compare</span>
          <input
            name="compareAtPrice"
            type="number"
            defaultValue={product?.compareAtPrice ?? ""}
            className="min-w-0 w-full border border-slate-200 px-3 py-2 outline-none"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span>Marca</span>
          <input
            name="brand"
            defaultValue={product?.brand ?? ""}
            className="min-w-0 w-full border border-slate-200 px-3 py-2 outline-none"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span>Color</span>
          <input
            name="color"
            defaultValue={product?.color ?? ""}
            className="min-w-0 w-full border border-slate-200 px-3 py-2 outline-none"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm">
        <span>Categoria</span>
        <select
          name="categoryId"
          defaultValue={product?.categoryId ?? ""}
          className="min-w-0 w-full border border-slate-200 px-3 py-2 outline-none"
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

      <div className="grid min-w-0 gap-3 border border-slate-200 p-4">
        <div className="grid min-w-0 gap-3 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0">
            <CloudinaryUploader onUploaded={(url) => setImages((current) => [...current, url])} />
          </div>
          <input
            value={imageInput}
            onChange={(event) => setImageInput(event.target.value)}
            placeholder="Pegar URL de imagen"
            className="min-w-0 w-full border border-slate-200 px-3 py-2 outline-none"
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
            className="bg-slate-900 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-white"
          >
            Agregar URL
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {images.map((image, index) => (
            <div key={`${image}-${index}`} className="border border-slate-200 p-2">
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                <Image
                  src={image}
                  alt={title || "Imagen del producto"}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="truncate text-xs text-slate-500">Imagen {index + 1}</p>
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

      <div className="grid gap-3 border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-900">Variantes</p>
          <button
            type="button"
            onClick={() => setVariants((current) => [...current, { ...EMPTY_VARIANT }])}
            className="border border-slate-300 px-4 py-2 text-[11px] uppercase tracking-[0.2em]"
          >
            Agregar
          </button>
        </div>
        {variants.map((variant, index) => (
          <div
            key={`${variant.name}-${variant.value}-${index}`}
            className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px_140px_auto]"
          >
            <input
              value={variant.name}
              onChange={(event) =>
                setVariants((current) =>
                  current.map((item, currentIndex) =>
                    currentIndex === index ? { ...item, name: event.target.value } : item,
                  ),
                )
              }
              className="min-w-0 w-full border border-slate-200 px-3 py-2 outline-none"
              placeholder="Nombre"
            />
            <input
              value={variant.value}
              onChange={(event) =>
                setVariants((current) =>
                  current.map((item, currentIndex) =>
                    currentIndex === index ? { ...item, value: event.target.value } : item,
                  ),
                )
              }
              className="min-w-0 w-full border border-slate-200 px-3 py-2 outline-none"
              placeholder="Valor"
            />
            <input
              type="number"
              value={variant.stock}
              onChange={(event) =>
                setVariants((current) =>
                  current.map((item, currentIndex) =>
                    currentIndex === index ? { ...item, stock: Number(event.target.value) } : item,
                  ),
                )
              }
              className="min-w-0 w-full border border-slate-200 px-3 py-2 outline-none"
              placeholder="Stock"
            />
            <input
              type="number"
              value={variant.priceDelta}
              onChange={(event) =>
                setVariants((current) =>
                  current.map((item, currentIndex) =>
                    currentIndex === index
                      ? { ...item, priceDelta: Number(event.target.value) }
                      : item,
                  ),
                )
              }
              className="min-w-0 w-full border border-slate-200 px-3 py-2 outline-none"
              placeholder="Ajuste precio"
            />
            <button
              type="button"
              onClick={() =>
                setVariants((current) =>
                  current.length === 1 ? [{ ...EMPTY_VARIANT }] : current.filter((_, currentIndex) => currentIndex !== index),
                )
              }
              className="border border-rose-200 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-rose-600 sm:col-span-2 xl:col-span-1"
            >
              Quitar
            </button>
          </div>
        ))}
        <input type="hidden" name="variants" value={JSON.stringify(cleanedVariants)} />
      </div>

      <button className="w-fit bg-slate-900 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white">
        {isEditing ? "Actualizar producto" : "Guardar producto"}
      </button>
    </form>
  );
}
