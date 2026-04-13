import Link from "next/link";

import {
  deactivateSellerApplicationAction,
  updateSellerApplicationAction,
} from "@/actions/auth";
import { SectionHeading } from "@/components/section-heading";
import { normalizeSellerSlug } from "@/lib/auth";

type SellerApplicationFormProps = {
  seller: {
    status: "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED";
    storeName: string;
    slug: string;
    description: string | null;
  } | null;
  userName: string;
  userEmail: string;
  message?: string;
};

export function SellerApplicationForm({
  seller,
  userName,
  userEmail,
  message,
}: SellerApplicationFormProps) {
  const storeName = seller?.storeName || userName;
  const slug = seller?.slug || normalizeSellerSlug(storeName);
  const description = seller?.description || "";
  const isActive = seller?.status === "ACTIVE";

  return (
    <section className="rounded-[2.5rem] bg-white p-6 shadow-sm ring-1 ring-stone-200 md:p-8">
      <SectionHeading
        eyebrow="Seller"
        title="Quiero vender"
        description="Activa tu perfil de vendedor, ajusta la informacion de tu tienda y entra al panel seller."
      />

      {message ? <p className="mb-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{message}</p> : null}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="grid gap-4">
            <form action={updateSellerApplicationAction} className="grid gap-4">
              <label className="grid gap-2 text-sm text-stone-700">
                <span className="uppercase tracking-[0.18em] text-stone-400">Quiero vender</span>
                <div className="flex items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3">
                  <input
                    type="checkbox"
                    name="wantsToSell"
                    value="true"
                    defaultChecked={Boolean(seller)}
                    className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                  />
                  <span className="text-stone-700">Activar mi tienda y panel seller</span>
                </div>
              </label>

              <label className="grid gap-2 text-sm text-stone-700">
                <span>Nombre de la tienda</span>
                <input
                  name="storeName"
                  defaultValue={storeName}
                  className="border border-stone-200 px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
                  placeholder="Mi tienda"
                />
              </label>

              <label className="grid gap-2 text-sm text-stone-700">
                <span>Slug</span>
                <input
                  name="slug"
                  defaultValue={slug}
                  className="border border-stone-200 px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
                  placeholder="mi-tienda"
                />
              </label>

              <label className="grid gap-2 text-sm text-stone-700">
                <span>Descripcion breve</span>
                <textarea
                  name="description"
                  defaultValue={description}
                  rows={4}
                  className="border border-stone-200 px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
                  placeholder="Cuentales a tus clientes que vendes"
                />
              </label>

              <label className="grid gap-2 text-sm text-stone-700">
                <span>Correo de contacto</span>
                <input
                  defaultValue={userEmail}
                  readOnly
                  className="cursor-not-allowed border border-stone-200 bg-stone-50 px-4 py-3 text-stone-600 outline-none"
                />
              </label>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button className="bg-stone-900 px-6 py-3 text-sm uppercase tracking-[0.2em] text-white transition hover:bg-stone-800">
                  Guardar solicitud
                </button>
              </div>
            </form>

          {isActive ? (
            <form action={deactivateSellerApplicationAction}>
              <button className="border border-stone-900 px-5 py-3 text-sm uppercase tracking-[0.18em] text-stone-900 transition hover:bg-stone-900 hover:text-white">
                Desactivar seller
              </button>
            </form>
          ) : null}
        </div>

        <aside className="h-fit rounded-[2rem] bg-stone-50 p-5 ring-1 ring-stone-200">
          <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Estado</p>
          <p className="mt-2 font-serif text-3xl text-stone-950">
            {isActive
              ? "Activo"
              : seller?.status === "REJECTED"
                ? "Rechazado"
                : seller?.status === "SUSPENDED"
                  ? "Suspendido"
                  : seller
                    ? "Pendiente"
                    : "Inactivo"}
          </p>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            {isActive
              ? "Tu panel seller ya esta disponible."
              : seller?.status === "REJECTED"
                ? "Tu solicitud fue rechazada. Puedes editarla y volver a enviarla."
                : seller
                  ? "Tu solicitud seller esta guardada y pendiente de revision."
                : "Marca la opcion para empezar a vender desde tu cuenta."}
          </p>

          <div className="mt-6 space-y-3 border-t border-stone-200 pt-4 text-sm text-stone-700">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Tienda</p>
              <p className="mt-1">{storeName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Slug</p>
              <p className="mt-1 font-mono text-xs text-stone-600">{slug}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/seller"
              className="inline-flex border border-stone-900 px-4 py-2 text-xs uppercase tracking-[0.18em] text-stone-900 transition hover:bg-stone-900 hover:text-white"
            >
              Ir al panel
            </Link>
            <Link
              href="/"
              className="inline-flex border border-stone-200 px-4 py-2 text-xs uppercase tracking-[0.18em] text-stone-600 transition hover:border-stone-900 hover:text-stone-950"
            >
              Volver a inicio
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
