import Image from "next/image";
import Link from "next/link";
import logoImage from "../../../public/logo.png";

import { logoutAction } from "@/actions/auth";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/menus", label: "Menus" },
  { href: "/admin/pages", label: "Paginas" },
  { href: "/admin/social-links", label: "Redes" },
  { href: "/admin/categories", label: "Categorias" },
  { href: "/admin/products", label: "Productos" },
  { href: "/admin/messages", label: "Mensajes" },
  { href: "/admin/users", label: "Usuarios" },
  { href: "/admin/slider", label: "Slider" },
];

export function AdminSidebar({
  session,
}: {
  session: { name: string; email: string };
}) {
  return (
    <aside className="flex h-full flex-col bg-[#111827] px-4 py-5 text-stone-100 lg:px-5 lg:py-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Admin</p>
        <div className="mt-2 flex items-center gap-3">
          <Image
            src={logoImage}
            alt="ClosetSale"
            width={40}
            height={40}
            className="h-9 w-auto object-contain brightness-0 invert"
            priority
          />
          <div>
            <p className="font-serif text-2xl leading-none">ClosetSale</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Panel interno
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6 space-y-1">
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          className="block rounded-xl border border-white/10 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-slate-200 transition hover:bg-white/10 hover:text-white"
        >
          Ver web
        </Link>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-xl px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="mt-auto border-t border-white/10 pt-4">
        <p className="text-sm text-white">{session.name}</p>
        <p className="mt-1 break-all text-xs text-slate-400">{session.email}</p>
        <form action={logoutAction} className="mt-4">
          <button
            className="w-full rounded-xl border border-white/10 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            Cerrar sesion
          </button>
        </form>
      </div>
    </aside>
  );
}
