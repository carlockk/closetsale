"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Heart, LayoutDashboard, Menu, ReceiptText, ShoppingBag, UserRound, X } from "lucide-react";
import { createPortal } from "react-dom";

type MobileCategory = {
  id: string;
  name: string;
  href: string;
  submenus: {
    id: string;
    name: string;
    href: string;
  }[];
};

type MobileNavDrawerProps = {
  menus: MobileCategory[];
  isAdmin: boolean;
  isAuthenticated: boolean;
};

export function MobileNavDrawer({
  menus,
  isAdmin,
  isAuthenticated,
}: MobileNavDrawerProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const canPortal = typeof document !== "undefined";

  const drawerMarkup = (
    <div
      className={`fixed inset-0 z-[115] bg-stone-950/45 transition-opacity duration-300 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={() => setOpen(false)}
      aria-hidden={!open}
    >
      <aside
        onClick={(event) => event.stopPropagation()}
        className={`absolute left-0 top-0 h-screen w-full max-w-sm bg-[#f6f0e7]/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Navegacion</p>
            <p className="mt-1 font-serif text-3xl text-stone-950">ClosetSale</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-stone-200 p-2 text-stone-700"
            aria-label="Cerrar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="h-[calc(100vh-88px)] overflow-y-auto px-5 py-5">
          <div className="space-y-2">
            {menus.map((menu) => {
              const isOpen = expanded === menu.id;

              return (
                <div key={menu.id} className="rounded-2xl bg-white ring-1 ring-stone-200">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : menu.id)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm uppercase tracking-[0.18em] text-stone-900"
                  >
                    <span>{menu.name}</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen ? (
                    <div className="border-t border-stone-100 px-4 py-3">
                      <div className="space-y-2">
                        <Link
                          href={menu.href}
                          onClick={() => setOpen(false)}
                          className="block text-sm text-stone-700"
                        >
                          Ir a {menu.name}
                        </Link>
                        {menu.submenus.map((child) => (
                          <Link
                            key={child.id}
                            href={child.href}
                            onClick={() => setOpen(false)}
                            className="block text-sm text-stone-500"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mt-6 space-y-2">
            {isAuthenticated ? (
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-stone-700 ring-1 ring-stone-200"
              >
                <UserRound className="h-4 w-4" />
                Mi perfil
              </Link>
            ) : null}
            <Link
              href="/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-stone-700 ring-1 ring-stone-200"
            >
              <ReceiptText className="h-4 w-4" />
              Mis compras
            </Link>
            <Link
              href="/favorites"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-stone-700 ring-1 ring-stone-200"
            >
              <Heart className="h-4 w-4" />
              Favoritos
            </Link>
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-stone-700 ring-1 ring-stone-200"
            >
              <ShoppingBag className="h-4 w-4" />
              Carrito
            </Link>
            {isAdmin ? (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-stone-700 ring-1 ring-stone-200"
              >
                <LayoutDashboard className="h-4 w-4" />
                Panel admin
              </Link>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white/80 p-2 text-stone-700 backdrop-blur lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      {canPortal && open ? createPortal(drawerMarkup, document.body) : null}
    </>
  );
}
