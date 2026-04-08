import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, UserRound } from "lucide-react";

import { AuthDrawer } from "@/components/auth-drawer";
import { MobileNavDrawer } from "@/components/mobile-nav-drawer";
import { SiteSearch } from "@/components/site-search";
import { SiteHeaderShell } from "@/components/site-header-shell";
import { StoreHeaderShortcuts } from "@/components/store/store-shortcuts";
import { getSession } from "@/lib/auth";
import { getGlobalMenus } from "@/lib/site-menus";

function HeaderIconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative hidden md:block">
      <Link href={href} className="text-stone-700">
        {children}
      </Link>
      <div className="pointer-events-none absolute left-1/2 top-full z-[70] mt-2 -translate-x-1/2 rounded-full bg-stone-900 px-3 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
        {label}
      </div>
    </div>
  );
}

export async function SiteHeader() {
  const [menus, session] = await Promise.all([getGlobalMenus(), getSession()]);

  return (
    <SiteHeaderShell>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="ClosetSale"
            width={44}
            height={44}
            className="h-10 w-auto object-contain"
            priority
          />
          <span className="flex flex-col">
            <span className="font-serif text-2xl tracking-[0.3em] text-stone-900">
              CLOSETSALE
            </span>
            <span className="text-xs uppercase tracking-[0.35em] text-stone-500">
              curated store
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {menus.map((menu) => (
            <div key={menu.id} className="group relative">
              <Link
                href={menu.href}
                className="text-sm uppercase tracking-[0.25em] text-stone-700 transition hover:text-stone-950"
              >
                {menu.name}
              </Link>
              {menu.submenus.length > 0 ? (
                <div className="invisible absolute left-0 top-full z-[70] mt-4 min-w-52 rounded-3xl border border-stone-200 bg-white p-4 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                  <div className="space-y-2">
                    {menu.submenus.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        className="block rounded-2xl px-3 py-2 text-sm text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <MobileNavDrawer
            menus={menus}
            isAdmin={session?.role === "ADMIN"}
            isAuthenticated={Boolean(session)}
          />
          <div className="flex items-center gap-2 text-stone-700 md:hidden">
            {session ? (
              <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-stone-700">
                <UserRound className="h-5 w-5" />
              </Link>
            ) : (
              <>
                <UserRound className="h-5 w-5" />
                <AuthDrawer isAuthenticated={Boolean(session)} />
              </>
            )}
          </div>
          <div className="hidden lg:block">
            <SiteSearch />
          </div>
          <StoreHeaderShortcuts />
          <div className="hidden items-center gap-2 text-stone-700 md:flex">
            {session ? (
              <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-stone-700">
                <UserRound className="h-5 w-5" />
                <span className="hidden xl:inline">Bienvenido: {session.name}</span>
              </Link>
            ) : (
              <div className="inline-flex items-center gap-2 text-sm text-stone-700">
                <UserRound className="h-5 w-5" />
                <span className="hidden xl:inline">Bienvenido: Invitado</span>
                <AuthDrawer isAuthenticated={Boolean(session)} />
              </div>
            )}
          </div>
          {session?.role === "ADMIN" ? (
            <>
              <HeaderIconLink href="/admin" label="Panel admin">
                <LayoutDashboard className="h-5 w-5" />
              </HeaderIconLink>
              <Link href="/admin" className="text-stone-700 md:hidden">
                <LayoutDashboard className="h-5 w-5" />
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </SiteHeaderShell>
  );
}
