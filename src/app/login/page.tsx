import { loginAction } from "@/actions/auth";

type LoginPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <div className="rounded-[2.5rem] bg-white p-8 shadow-sm ring-1 ring-stone-200">
        <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Acceso</p>
        <h1 className="mt-3 font-serif text-5xl text-stone-950">Iniciar sesion</h1>
        {params.message ? <p className="mt-4 text-sm text-amber-700">{params.message}</p> : null}
        <form action={loginAction} className="mt-8 grid gap-4">
          <input name="email" type="email" placeholder="Correo" className="rounded-2xl border border-stone-200 px-4 py-3" required />
          <input name="password" type="password" placeholder="Contrasena" className="rounded-2xl border border-stone-200 px-4 py-3" required />
          <button className="rounded-full bg-stone-900 px-6 py-3 text-sm uppercase tracking-[0.2em] text-white">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
