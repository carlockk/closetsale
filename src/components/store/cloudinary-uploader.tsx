"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type CloudinaryUploaderProps = {
  onUploaded: (url: string) => void;
};

export function CloudinaryUploader({ onUploaded }: CloudinaryUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !cloudName || !uploadPreset) {
      toast.error("Configura Cloudinary en el .env para subir imagenes");
      return;
    }

    setUploading(true);

    const body = new FormData();
    body.append("file", file);
    body.append("upload_preset", uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body,
      },
    );

    setUploading(false);

    if (!response.ok) {
      toast.error("No se pudo subir la imagen");
      return;
    }

    const json = await response.json();
    onUploaded(json.secure_url);
    toast.success("Imagen subida");
  }

  return (
    <label className="inline-flex cursor-pointer rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-100">
      {uploading ? "Subiendo..." : "Subir con Cloudinary"}
      <input type="file" accept="image/*" className="hidden" onChange={handleChange} />
    </label>
  );
}
