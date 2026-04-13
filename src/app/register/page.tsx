import { registerAction } from "@/actions/auth";

type RegisterPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <div className="rounded-[2.5rem] bg-white p-8 shadow-sm ring-1 ring-stone-200">
        <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Registro</p>
        <h1 className="mt-3 font-serif text-5xl text-stone-950">Crear cuenta</h1>
        {params.message ? <p className="mt-4 text-sm text-amber-700">{params.message}</p> : null}
        <form action={registerAction} className="mt-8 grid gap-4">
          <input name="name" placeholder="Nombre" className="rounded-2xl border border-stone-200 px-4 py-3" required />
          <input name="email" type="email" placeholder="Correo" className="rounded-2xl border border-stone-200 px-4 py-3" required />
          <input name="password" type="password" placeholder="Contrasena" className="rounded-2xl border border-stone-200 px-4 py-3" required />
          <label className="flex items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-700">
            <input
              type="checkbox"
              name="wantsToSell"
              value="true"
              className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <span>Quiero vender en ClosetSale</span>
          </label>
          <p className="text-sm leading-6 text-stone-500">
            Si marcas esta opcion, dejamos creada tu solicitud seller para que la completes desde tu perfil.
          </p>
          <button className="rounded-full bg-stone-900 px-6 py-3 text-sm uppercase tracking-[0.2em] text-white">
            Registrarme
          </button>
        </form>
      </div>
    </div>
  );
}
