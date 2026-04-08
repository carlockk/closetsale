import { loginAction } from "@/actions/auth";

type AdminLoginPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <div className="rounded-[2.5rem] bg-stone-900 p-8 text-white shadow-sm">
        <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Admin</p>
        <h1 className="mt-3 font-serif text-5xl">Panel de acceso</h1>
        {params.message ? <p className="mt-4 text-sm text-amber-300">{params.message}</p> : null}
        <form action={loginAction} className="mt-8 grid gap-4">
          <input name="email" type="email" placeholder="Correo admin" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3" required />
          <input name="password" type="password" placeholder="Contrasena" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3" required />
          <button className="rounded-full bg-[#d5b26f] px-6 py-3 text-sm uppercase tracking-[0.2em] text-stone-950">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
