"use client";

import { useRef, useState } from "react";
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Paintbrush,
  Pilcrow,
  Redo2,
  RemoveFormatting,
  Type,
  Underline,
  Undo2,
} from "lucide-react";

import { createSitePageAction, updateSitePageAction } from "@/actions/admin";
import { CloudinaryUploader } from "@/components/store/cloudinary-uploader";

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center justify-center border border-slate-200 bg-white px-3 text-slate-700 transition hover:bg-slate-50"
      title={label}
      aria-label={label}
    >
      {children}
    </button>
  );
}

type SitePageFormProps = {
  page?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    isPublished: boolean;
  } | null;
};

export function SitePageForm({ page = null }: SitePageFormProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [content, setContent] = useState(page?.content || "");

  function focusEditor() {
    editorRef.current?.focus();
  }

  function runCommand(command: string, value?: string) {
    focusEditor();
    document.execCommand(command, false, value);
    setContent(editorRef.current?.innerHTML || "");
  }

  function handleEditorInput() {
    setContent(editorRef.current?.innerHTML || "");
  }

  function insertLink() {
    const url = window.prompt("Ingresa la URL o ruta interna", "/pages/");
    if (!url) {
      return;
    }
    runCommand("createLink", url);
  }

  function insertHeading(tag: "H2" | "H3" | "P") {
    runCommand("formatBlock", tag);
  }

  function handleImageUploaded(url: string) {
    focusEditor();
    document.execCommand("insertImage", false, url);
    setContent(editorRef.current?.innerHTML || "");
  }

  const formAction = page ? updateSitePageAction : createSitePageAction;

  return (
    <form action={formAction} className="grid gap-4 border border-slate-200 bg-white p-4">
      {page ? <input type="hidden" name="pageId" value={page.id} /> : null}
      {page ? <input type="hidden" name="previousSlug" value={page.slug} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="title"
          placeholder="Titulo"
          className="border border-slate-200 px-3 py-2 text-sm"
          defaultValue={page?.title || ""}
          required
        />
        <input
          name="slug"
          placeholder="slug-pagina"
          className="border border-slate-200 px-3 py-2 text-sm"
          defaultValue={page?.slug || ""}
          required
        />
      </div>

      <textarea
        name="excerpt"
        placeholder="Resumen corto (opcional)"
        rows={2}
        className="border border-slate-200 px-3 py-2 text-sm"
        defaultValue={page?.excerpt || ""}
      />

      <div className="border border-slate-200">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 p-3">
          <ToolbarButton label="Parrafo" onClick={() => insertHeading("P")}>
            <Pilcrow className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Titulo grande" onClick={() => insertHeading("H2")}>
            <Type className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Subtitulo" onClick={() => insertHeading("H3")}>
            <span className="text-xs font-semibold">H3</span>
          </ToolbarButton>
          <ToolbarButton label="Negrita" onClick={() => runCommand("bold")}>
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Cursiva" onClick={() => runCommand("italic")}>
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Subrayado" onClick={() => runCommand("underline")}>
            <Underline className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Lista" onClick={() => runCommand("insertUnorderedList")}>
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Lista numerada" onClick={() => runCommand("insertOrderedList")}>
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Enlace" onClick={insertLink}>
            <Link2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Deshacer" onClick={() => runCommand("undo")}>
            <Undo2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Rehacer" onClick={() => runCommand("redo")}>
            <Redo2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Limpiar formato" onClick={() => runCommand("removeFormat")}>
            <RemoveFormatting className="h-4 w-4" />
          </ToolbarButton>

          <label className="inline-flex h-9 cursor-pointer items-center justify-center border border-slate-200 bg-white px-3 text-slate-700 transition hover:bg-slate-50">
            <Paintbrush className="h-4 w-4" />
            <input
              type="color"
              className="sr-only"
              onChange={(event) => runCommand("foreColor", event.target.value)}
              aria-label="Color de texto"
            />
          </label>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-slate-500">Imagen</span>
            <CloudinaryUploader onUploaded={handleImageUploaded} />
          </div>
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleEditorInput}
          className="min-h-[360px] px-4 py-4 text-sm text-slate-800 outline-none [&_a]:text-blue-700 [&_a]:underline [&_h2]:mt-6 [&_h2]:text-3xl [&_h2]:font-serif [&_h2]:text-slate-950 [&_h3]:mt-5 [&_h3]:text-xl [&_h3]:font-semibold [&_img]:my-5 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg [&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-3 [&_ul]:list-disc"
          data-placeholder="Escribe aqui el contenido de la pagina..."
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <input type="hidden" name="content" value={content} />

      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="isPublished" defaultChecked={page ? page.isPublished : true} />
        Publicar pagina
      </label>

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-slate-500">
          Puedes escribir texto, aplicar formato, agregar enlaces y subir imagenes directamente.
        </p>
        <button className="w-fit bg-slate-900 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white">
          {page ? "Guardar cambios" : "Crear pagina"}
        </button>
      </div>
    </form>
  );
}
