import { createUserAction } from "@/actions/admin";
import { prisma } from "@/lib/prisma";

type UsersPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="min-w-[720px] space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Accesos</p>
        <h1 className="mt-2 font-serif text-3xl text-slate-950">Usuarios</h1>
        {params.message ? <p className="mt-3 text-sm text-emerald-700">{params.message}</p> : null}
      </div>

      <form action={createUserAction} className="grid gap-4 border border-slate-200 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input name="name" placeholder="Nombre" className="border border-slate-200 px-3 py-2 text-sm" required />
            <input name="email" type="email" placeholder="Correo" className="border border-slate-200 px-3 py-2 text-sm" required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <input name="password" type="password" placeholder="Contrasena" className="border border-slate-200 px-3 py-2 text-sm" required />
            <select name="role" className="border border-slate-200 px-3 py-2 text-sm">
              <option value="USER">Usuario</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button className="w-fit bg-slate-900 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white">
            Crear usuario
          </button>
      </form>

      <div className="overflow-x-auto border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.18em] text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-slate-200 text-slate-700">
                <td className="px-4 py-3 font-medium text-slate-950">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
