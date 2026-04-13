import Link from "next/link";

import { updateProfileAction } from "@/actions/auth";
import { getCurrentSellerProfile, getCurrentUser } from "@/lib/auth";
import { SellerApplicationForm } from "@/components/seller/seller-application-form";
import { SellerAccessCta } from "@/components/seller/seller-access-cta";

type ProfilePageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const seller = user ? await getCurrentSellerProfile() : null;

  if (!user) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <div className="border-b border-stone-200 pb-6">
            <p className="text-xs uppercase tracking-[0.32em] text-stone-400">Cuenta</p>
            <h1 className="mt-3 font-serif text-5xl text-stone-950">Mi perfil</h1>
            <p className="mt-4 max-w-2xl text-stone-600">
              Debes iniciar sesion para editar tus datos.
            </p>
          </div>

          <div className="pt-8">
            <Link
              href="/orders"
              className="inline-flex border border-stone-900 px-5 py-2 text-sm uppercase tracking-[0.2em] text-stone-900 transition hover:bg-stone-900 hover:text-white"
            >
              Ir a mis compras
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="border-b border-stone-200 pb-6">
          <p className="text-xs uppercase tracking-[0.32em] text-stone-400">Cuenta</p>
          <h1 className="mt-3 font-serif text-5xl text-stone-950">Mi perfil</h1>
          <p className="mt-4 max-w-2xl text-stone-600">
            Actualiza tu nombre, correo o contrasena y configura tu perfil seller si quieres vender.
          </p>
          {params.message ? <p className="mt-4 text-sm text-amber-700">{params.message}</p> : null}
        </div>

        <SellerAccessCta sellerStatus={seller?.status ?? null} variant="banner" className="mt-8" />

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-12">
            <form action={updateProfileAction} className="min-w-0">
              <div className="border-b border-stone-200 pb-4">
                <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Datos</p>
                <h2 className="mt-2 font-serif text-3xl text-stone-950">Informacion personal</h2>
              </div>

              <div className="mt-6 grid gap-4">
                <label className="grid gap-2 text-sm text-stone-700">
                  <span>Nombre</span>
                  <input
                    name="name"
                    defaultValue={user.name}
                    className="border border-stone-200 px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
                    required
                  />
                </label>
                <label className="grid gap-2 text-sm text-stone-700">
                  <span>Correo</span>
                  <input
                    name="email"
                    type="email"
                    defaultValue={user.email}
                    className="border border-stone-200 px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
                    required
                  />
                </label>
                <label className="grid gap-2 text-sm text-stone-700">
                  <span>Nueva contrasena</span>
                  <input
                    name="password"
                    type="password"
                    className="border border-stone-200 px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
                    placeholder="Solo si quieres cambiarla"
                  />
                </label>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-stone-200 pt-6">
                <button className="bg-stone-900 px-6 py-3 text-sm uppercase tracking-[0.2em] text-white transition hover:bg-stone-800">
                  Guardar cambios
                </button>
              <Link
                href="/orders"
                className="text-sm uppercase tracking-[0.18em] text-stone-600 underline-offset-4 hover:text-stone-950 hover:underline"
              >
                Ver mis compras
              </Link>
            </div>
          </form>

            <div id="seller">
              <SellerApplicationForm
                seller={seller}
                userName={user.name}
                userEmail={user.email}
                message={seller ? "Tu solicitud seller ya existe. Guardar activara el panel si sigue marcada la opcion." : undefined}
              />
            </div>
          </div>

          <aside className="h-fit border-l border-stone-200 pl-0 lg:pl-8">
            <div className="border-b border-stone-200 pb-4">
              <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Resumen</p>
              <h2 className="mt-2 font-serif text-3xl text-stone-950">Tu cuenta</h2>
            </div>

            <div className="grid gap-6 py-6 text-sm text-stone-700">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Nombre</p>
                <p className="mt-2 text-base text-stone-950">{user.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Correo</p>
                <p className="mt-2">{user.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Seller</p>
                <p className="mt-2">
                  {seller?.status === "ACTIVE"
                    ? "Activo"
                    : seller?.status === "REJECTED"
                      ? "Rechazado"
                      : seller?.status === "SUSPENDED"
                        ? "Suspendido"
                        : seller
                          ? "Pendiente"
                          : "Inactivo"}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
