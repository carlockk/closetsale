"use client";

import { useState } from "react";

import { createProductAction } from "@/actions/admin";
import { CloudinaryUploader } from "@/components/store/cloudinary-uploader";
import { safeSlug } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
};

type ProductFormProps = {
  categories: Category[];
};

export function ProductForm({ categories }: ProductFormProps) {
  const [title, setTitle] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  const [variants, setVariants] = useState([
    { name: "Talla", value: "", stock: 1, priceDelta: 0 },
  ]);

  return (
    <form action={createProductAction} className="grid gap-4 border border-slate-200 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span>Titulo</span>
          <input
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="border border-slate-200 px-3 py-2 outline-none"
            required
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span>Slug</span>
          <input
            name="slug"
            defaultValue={safeSlug(title)}
            className="border border-slate-200 px-3 py-2 outline-none"
            required
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm">
        <span>Descripcion</span>
        <textarea
          name="description"
          rows={4}
          className="border border-slate-200 px-3 py-2 outline-none"
          required
        />
      </label>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="grid gap-2 text-sm">
          <span>Precio</span>
          <input name="price" type="number" className="border border-slate-200 px-3 py-2 outline-none" required />
        </label>
        <label className="grid gap-2 text-sm">
          <span>Precio compare</span>
          <input name="compareAtPrice" type="number" className="border border-slate-200 px-3 py-2 outline-none" />
        </label>
        <label className="grid gap-2 text-sm">
          <span>Marca</span>
          <input name="brand" className="border border-slate-200 px-3 py-2 outline-none" />
        </label>
        <label className="grid gap-2 text-sm">
          <span>Color</span>
          <input name="color" className="border border-slate-200 px-3 py-2 outline-none" />
        </label>
      </div>

      <label className="grid gap-2 text-sm">
        <span>Categoria</span>
        <select name="categoryId" className="border border-slate-200 px-3 py-2 outline-none" required>
          <option value="">Selecciona una categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-3 border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <CloudinaryUploader onUploaded={(url) => setImages((current) => [...current, url])} />
          <input
            value={imageInput}
            onChange={(event) => setImageInput(event.target.value)}
            placeholder="Pegar URL de imagen"
            className="min-w-72 flex-1 border border-slate-200 px-3 py-2 outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (!imageInput) return;
              setImages((current) => [...current, imageInput]);
              setImageInput("");
            }}
            className="bg-slate-900 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-white"
          >
            Agregar URL
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {images.map((image) => (
            <div key={image} className="border border-slate-200 px-3 py-2 text-xs text-slate-600">
              {image.slice(0, 48)}...
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
            onClick={() =>
              setVariants((current) => [
                ...current,
                { name: "Talla", value: "", stock: 1, priceDelta: 0 },
              ])
            }
            className="border border-slate-300 px-4 py-2 text-[11px] uppercase tracking-[0.2em]"
          >
            Agregar
          </button>
        </div>
        {variants.map((variant, index) => (
          <div key={`${variant.name}-${index}`} className="grid gap-3 md:grid-cols-4">
            <input
              value={variant.name}
              onChange={(event) =>
                setVariants((current) =>
                  current.map((item, currentIndex) =>
                    currentIndex === index ? { ...item, name: event.target.value } : item,
                  ),
                )
              }
              className="border border-slate-200 px-3 py-2 outline-none"
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
              className="border border-slate-200 px-3 py-2 outline-none"
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
              className="border border-slate-200 px-3 py-2 outline-none"
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
              className="border border-slate-200 px-3 py-2 outline-none"
              placeholder="Ajuste precio"
            />
          </div>
        ))}
        <input type="hidden" name="variants" value={JSON.stringify(variants.filter((item) => item.value))} />
      </div>

      <button className="w-fit bg-slate-900 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white">
        Guardar producto
      </button>
    </form>
  );
}
