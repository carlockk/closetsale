"use client";

import { Loader2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { SOCIAL_PLATFORM_OPTIONS } from "@/lib/social-platforms";

type SocialLinkItem = {
  id: string;
  platform: string;
  href: string;
  order: number;
  enabled: boolean;
};

const INITIAL_FORM = {
  platform: "Instagram",
  href: "",
  order: 0,
  enabled: true,
};

export function SocialLinksManager() {
  const [links, setLinks] = useState<SocialLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  async function loadLinks() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/admin/social-links", { cache: "no-store" });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "No se pudieron cargar las redes sociales.");
      }

      setLinks(Array.isArray(data.links) ? data.links : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar redes sociales.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLinks();
  }, []);

  function openCreate() {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setDialogOpen(true);
  }

  function openEdit(link: SocialLinkItem) {
    setEditingId(link.id);
    setFormData({
      platform: link.platform,
      href: link.href,
      order: link.order,
      enabled: link.enabled,
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setSaving(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        editingId ? `/api/admin/social-links/${editingId}` : "/api/admin/social-links",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        throw new Error(data?.message || "No se pudo guardar la red social.");
      }

      closeDialog();
      loadLinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la red social.");
      setSaving(false);
    }
  }

  async function handleDelete(link: SocialLinkItem) {
    if (!window.confirm(`Eliminar ${link.platform}?`)) {
      return;
    }

    const response = await fetch(`/api/admin/social-links/${link.id}`, { method: "DELETE" });
    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.ok) {
      setError(data?.message || "No se pudo eliminar la red social.");
      return;
    }

    loadLinks();
  }

  return (
    <div className="min-w-[920px] space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Footer</p>
            <h1 className="mt-2 font-serif text-3xl text-slate-950">Redes sociales</h1>
            <p className="mt-2 text-sm text-slate-500">
              Configura los enlaces de redes para mostrarlos en el pie del sitio.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadLinks}
              className="inline-flex items-center gap-2 border border-slate-200 px-4 py-2 text-sm text-slate-700"
            >
              <RefreshCw className="h-4 w-4" />
              Recargar
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-slate-900 px-4 py-2 text-sm text-white"
            >
              <Plus className="h-4 w-4" />
              Crear red
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center gap-2 border border-slate-200 bg-white px-4 py-12 text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando redes...
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Plataforma</th>
                <th className="px-4 py-3 font-medium">Enlace</th>
                <th className="px-4 py-3 font-medium">Orden</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="border-t border-slate-200 text-slate-700">
                  <td className="px-4 py-3 font-medium text-slate-950">{link.platform}</td>
                  <td className="px-4 py-3">{link.href}</td>
                  <td className="px-4 py-3">{link.order}</td>
                  <td className="px-4 py-3">{link.enabled ? "Visible" : "Oculta"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(link)}
                        className="inline-flex h-9 w-9 items-center justify-center border border-slate-300 text-slate-700 transition hover:bg-slate-900 hover:text-white"
                        aria-label={`Editar ${link.platform}`}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(link)}
                        className="inline-flex h-9 w-9 items-center justify-center border border-rose-200 text-rose-600 transition hover:bg-rose-600 hover:text-white"
                        aria-label={`Eliminar ${link.platform}`}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {dialogOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 px-4">
          <div className="w-full max-w-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId ? "Editar red social" : "Crear red social"}
              </h2>
              <button type="button" onClick={closeDialog} className="border border-slate-200 px-3 py-1 text-sm text-slate-600">
                Cerrar
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <label className="grid gap-2 text-sm">
                <span>Plataforma</span>
                <select
                  value={formData.platform}
                  onChange={(event) => setFormData((current) => ({ ...current, platform: event.target.value }))}
                  className="border border-slate-200 px-3 py-2"
                >
                  {SOCIAL_PLATFORM_OPTIONS.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm">
                <span>Enlace</span>
                <input
                  value={formData.href}
                  onChange={(event) => setFormData((current) => ({ ...current, href: event.target.value }))}
                  className="border border-slate-200 px-3 py-2"
                  placeholder="https://instagram.com/tu-cuenta"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span>Orden</span>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(event) => setFormData((current) => ({ ...current, order: Number(event.target.value) }))}
                  className="border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(event) => setFormData((current) => ({ ...current, enabled: event.target.checked }))}
                />
                Mostrar en footer
              </label>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeDialog} className="border border-slate-200 px-4 py-2 text-sm text-slate-700">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {editingId ? "Guardar cambios" : "Crear red"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
