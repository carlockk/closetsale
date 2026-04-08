"use client";

import { Loader2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { AdminSideDrawer } from "@/components/admin/admin-side-drawer";

type SubmenuInput = {
  name: string;
  href: string;
  order: number;
};

type MenuItem = {
  id: string;
  name: string;
  href: string;
  order: number;
  enabled: boolean;
  submenus: Array<{
    id: string;
    name: string;
    href: string;
    order: number;
  }>;
};

type SitePageOption = {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
};

const CUSTOM_ROUTE_VALUE = "__custom__";

const INITIAL_FORM = {
  name: "",
  href: "",
  order: 0,
  enabled: true,
  submenus: [] as SubmenuInput[],
};

export function MenusManager({ pages }: { pages: SitePageOption[] }) {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const knownLinks = ["/", "/products", ...pages.filter((page) => page.isPublished).map((page) => `/pages/${page.slug}`)];

  function getSelectValue(href: string) {
    return knownLinks.includes(href) ? href : CUSTOM_ROUTE_VALUE;
  }

  async function loadMenus() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/admin/menus", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "No se pudieron cargar los menus.");
      }

      setMenus(Array.isArray(data.menus) ? data.menus : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener menus.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMenus();
  }, []);

  function openCreate() {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setDialogOpen(true);
  }

  function openEdit(menu: MenuItem) {
    setEditingId(menu.id);
    setFormData({
      name: menu.name,
      href: menu.href,
      order: menu.order,
      enabled: menu.enabled,
      submenus: menu.submenus.map((submenu) => ({
        name: submenu.name,
        href: submenu.href,
        order: submenu.order,
      })),
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setSaving(false);
  }

  function updateField(field: "name" | "href" | "order" | "enabled", value: string | number | boolean) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateSubmenu(index: number, field: "name" | "href" | "order", value: string | number) {
    setFormData((current) => ({
      ...current,
      submenus: current.submenus.map((submenu, currentIndex) =>
        currentIndex === index ? { ...submenu, [field]: value } : submenu,
      ),
    }));
  }

  function addSubmenu() {
    setFormData((current) => ({
      ...current,
      submenus: [...current.submenus, { name: "", href: "", order: current.submenus.length }],
    }));
  }

  function removeSubmenu(index: number) {
    setFormData((current) => ({
      ...current,
      submenus: current.submenus.filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: formData.name.trim(),
        href: formData.href.trim(),
        order: Number(formData.order) || 0,
        enabled: Boolean(formData.enabled),
        submenus: formData.submenus
          .map((submenu) => ({
            name: submenu.name.trim(),
            href: submenu.href.trim(),
            order: Number(submenu.order) || 0,
          }))
          .filter((submenu) => submenu.name && submenu.href),
      };

      const response = await fetch(
        editingId ? `/api/admin/menus/${editingId}` : "/api/admin/menus",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.message || "No se pudo guardar el menu.");
      }

      closeDialog();
      loadMenus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el menu.");
      setSaving(false);
    }
  }

  async function handleDelete(menu: MenuItem) {
    const confirmed = window.confirm(`Eliminar "${menu.name}"?`);
    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/admin/menus/${menu.id}`, { method: "DELETE" });
    const data = await response.json();

    if (!response.ok || !data?.ok) {
      setError(data?.message || "No se pudo eliminar el menu.");
      return;
    }

    loadMenus();
  }

  return (
    <div className="min-w-[920px] space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Navegacion</p>
            <h1 className="mt-2 font-serif text-3xl text-slate-950">Menus</h1>
            <p className="mt-2 text-sm text-slate-500">
              Gestiona los enlaces globales del sitio. Las categorias quedan dentro de la tienda.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadMenus}
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
              Crear menu
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
          Cargando menus...
        </div>
      ) : (
        <div className="space-y-4">
          {menus.map((menu) => (
            <article key={menu.id} className="border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{menu.name}</h2>
                  <p className="text-sm text-slate-500">
                    {menu.href}{" "}
                    <span className="ml-2 text-xs text-slate-400">Orden: {menu.order}</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {menu.enabled ? "Visible en header" : "Oculto"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(menu)}
                    className="inline-flex items-center gap-1 border border-slate-200 px-3 py-1.5 text-xs text-slate-700"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(menu)}
                    className="inline-flex items-center gap-1 border border-rose-200 px-3 py-1.5 text-xs text-rose-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                </div>
              </div>

              {menu.submenus.length > 0 ? (
                <div className="mt-4 overflow-x-auto border border-slate-100">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Submenu</th>
                        <th className="px-4 py-3 font-medium">Enlace</th>
                        <th className="px-4 py-3 font-medium">Orden</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menu.submenus.map((submenu) => (
                        <tr key={submenu.id} className="border-t border-slate-100 text-slate-700">
                          <td className="px-4 py-3">{submenu.name}</td>
                          <td className="px-4 py-3">{submenu.href}</td>
                          <td className="px-4 py-3">{submenu.order}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}

      {dialogOpen ? (
        <AdminSideDrawer
          open={dialogOpen}
          onClose={closeDialog}
          title={editingId ? "Editar menu" : "Crear menu"}
        >
          <form onSubmit={handleSubmit} className="grid gap-4 border border-slate-200 bg-white p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                <span>Nombre</span>
                <input
                  value={formData.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  className="min-w-0 border border-slate-200 px-3 py-2"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span>Orden</span>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(event) => updateField("order", Number(event.target.value))}
                  className="min-w-0 border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="grid gap-2 text-sm md:col-span-2">
                <span>Enlace</span>
                <select
                  value={getSelectValue(formData.href)}
                  onChange={(event) => updateField("href", event.target.value)}
                  className="min-w-0 border border-slate-200 px-3 py-2"
                  required
                >
                  <option value="">Selecciona un destino</option>
                  <option value="/">Inicio</option>
                  <option value="/products">Tienda</option>
                  {pages
                    .filter((page) => page.isPublished)
                    .map((page) => (
                      <option key={page.id} value={`/pages/${page.slug}`}>
                        Pagina: {page.title}
                      </option>
                    ))}
                  <option value={CUSTOM_ROUTE_VALUE}>Ruta manual</option>
                </select>
              </label>
              {getSelectValue(formData.href) === CUSTOM_ROUTE_VALUE ? (
                <label className="grid gap-2 text-sm md:col-span-2">
                  <span>Ruta manual</span>
                  <input
                    value={formData.href}
                    onChange={(event) => updateField("href", event.target.value)}
                    className="min-w-0 border border-slate-200 px-3 py-2"
                    placeholder="/orders"
                    required
                  />
                </label>
              ) : null}
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(event) => updateField("enabled", event.target.checked)}
              />
              Mostrar en la navegacion
            </label>

            <div className="space-y-3 border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-800">Submenus</h3>
                <button
                  type="button"
                  onClick={addSubmenu}
                  className="inline-flex items-center gap-1 border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Anadir
                </button>
              </div>
              {formData.submenus.length === 0 ? (
                <p className="text-xs text-slate-500">Opcional. Sirve para dropdowns globales.</p>
              ) : null}
              {formData.submenus.map((submenu, index) => (
                <div
                  key={`${index}-${submenu.name}`}
                  className="grid gap-3 border border-slate-200 bg-white p-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px_auto]"
                >
                  <input
                    value={submenu.name}
                    onChange={(event) => updateSubmenu(index, "name", event.target.value)}
                    className="min-w-0 border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Nombre"
                  />
                  <select
                    value={getSelectValue(submenu.href)}
                    onChange={(event) => updateSubmenu(index, "href", event.target.value)}
                    className="min-w-0 border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="">Selecciona un destino</option>
                    <option value="/">Inicio</option>
                    <option value="/products">Tienda</option>
                    {pages
                      .filter((page) => page.isPublished)
                      .map((page) => (
                        <option key={`submenu-${page.id}`} value={`/pages/${page.slug}`}>
                          Pagina: {page.title}
                        </option>
                      ))}
                    <option value={CUSTOM_ROUTE_VALUE}>Ruta manual</option>
                  </select>
                  {getSelectValue(submenu.href) === CUSTOM_ROUTE_VALUE ? (
                    <input
                      value={submenu.href}
                      onChange={(event) => updateSubmenu(index, "href", event.target.value)}
                      className="min-w-0 border border-slate-200 px-3 py-2 text-sm sm:col-span-2 xl:col-span-2"
                      placeholder="/orders"
                    />
                  ) : null}
                  <input
                    type="number"
                    value={submenu.order}
                    onChange={(event) => updateSubmenu(index, "order", Number(event.target.value))}
                    className="min-w-0 border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Orden"
                  />
                  <button
                    type="button"
                    onClick={() => removeSubmenu(index)}
                    className="border border-rose-200 px-3 py-2 text-xs text-rose-700"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={closeDialog} className="border border-slate-200 px-4 py-2 text-sm text-slate-700">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {editingId ? "Guardar cambios" : "Crear menu"}
              </button>
            </div>
          </form>
        </AdminSideDrawer>
      ) : null}
    </div>
  );
}
