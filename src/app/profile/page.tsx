import Link from "next/link";

import { updateProfileAction } from "@/actions/auth";
import { getCurrentUser } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 lg:px-8">
        <div className="rounded-[1.5rem] bg-white p-8 ring-1 ring-stone-200">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Cuenta</p>
          <h1 className="mt-3 font-serif text-5xl text-stone-950">Mi perfil</h1>
          <p className="mt-4 text-stone-600">
            Debes iniciar sesion para editar tus datos.
          </p>
          <Link
            href="/orders"
            className="mt-6 inline-flex rounded-full bg-stone-900 px-5 py-2 text-sm uppercase tracking-[0.2em] text-white"
          >
            Ir a mis compras
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
      <div className="border-b border-stone-200 pb-6">
        <p className="text-xs uppercase tracking-[0.32em] text-stone-400">Cuenta</p>
        <h1 className="mt-3 font-serif text-5xl text-stone-950">Mi perfil</h1>
        <p className="mt-4 max-w-2xl text-stone-600">
          Actualiza tu nombre, correo o contrasena para mantener tu cuenta al dia.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <form
          action={updateProfileAction}
          className="grid gap-4 rounded-[1.5rem] bg-white p-6 ring-1 ring-stone-200"
        >
          <label className="grid gap-2 text-sm text-stone-700">
            <span>Nombre</span>
            <input
              name="name"
              defaultValue={user.name}
              className="rounded-2xl border border-stone-200 px-4 py-3"
              required
            />
          </label>
          <label className="grid gap-2 text-sm text-stone-700">
            <span>Correo</span>
            <input
              name="email"
              type="email"
              defaultValue={user.email}
              className="rounded-2xl border border-stone-200 px-4 py-3"
              required
            />
          </label>
          <label className="grid gap-2 text-sm text-stone-700">
            <span>Nueva contrasena</span>
            <input
              name="password"
              type="password"
              className="rounded-2xl border border-stone-200 px-4 py-3"
              placeholder="Solo si quieres cambiarla"
            />
          </label>
          <button className="mt-2 rounded-full bg-stone-900 px-6 py-3 text-sm uppercase tracking-[0.2em] text-white">
            Guardar cambios
          </button>
        </form>

        <aside className="h-fit rounded-[1.5rem] bg-stone-900 p-6 text-white">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Resumen</p>
          <p className="mt-5 text-lg font-semibold">{user.name}</p>
          <p className="mt-1 text-sm text-stone-300">{user.email}</p>
          <div className="mt-6 space-y-3">
            <Link
              href="/orders"
              className="inline-flex text-sm uppercase tracking-[0.2em] text-stone-100 underline-offset-4 hover:underline"
            >
              Ver mis compras
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
