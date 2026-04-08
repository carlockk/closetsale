"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";

import { logoutAction } from "@/actions/auth";

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
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
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
    }

    const timeout = window.setTimeout(() => {
      setShouldRender(false);
    }, 500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [open]);

  const canPortal = typeof document !== "undefined";

  const drawerMarkup = (
    <div
      className={`fixed inset-0 z-[115] bg-stone-950/45 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={() => setOpen(false)}
      aria-hidden={!open}
    >
      <aside
        onClick={(event) => event.stopPropagation()}
        className={`absolute right-0 top-0 h-screen w-[82vw] max-w-[20rem] bg-[#f6f0e7]/96 shadow-2xl backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "translate-x-[104%]"
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400">Navegacion</p>
            <p className="mt-1 font-serif text-2xl text-stone-950">ClosetSale</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center border border-stone-200 text-stone-700"
            aria-label="Cerrar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex h-[calc(100vh-88px)] flex-col overflow-y-auto px-4 py-5">
          <div className="space-y-2">
            {menus.map((menu) => (
              <div key={menu.id} className="border border-stone-200 bg-white">
                <Link
                  href={menu.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-sm uppercase tracking-[0.18em] text-stone-900"
                >
                  {menu.name}
                </Link>
                {menu.submenus.length > 0 ? (
                  <div className="border-t border-stone-100 px-4 py-3">
                    <div className="space-y-2">
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
            ))}
          </div>

          <div className="mt-6 space-y-2">
            {isAuthenticated ? (
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700"
              >
                <UserRound className="h-4 w-4" />
                Mi perfil
              </Link>
            ) : null}
            <Link
              href="/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700"
            >
              <ReceiptText className="h-4 w-4" />
              Mis compras
            </Link>
            <Link
              href="/favorites"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700"
            >
              <Heart className="h-4 w-4" />
              Favoritos
            </Link>
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700"
            >
              <ShoppingBag className="h-4 w-4" />
              Carrito
            </Link>
            {isAdmin ? (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700"
              >
                <LayoutDashboard className="h-4 w-4" />
                Panel admin
              </Link>
            ) : null}
          </div>

          {isAuthenticated ? (
            <form action={logoutAction} className="mt-auto pt-6">
              <button className="flex w-full items-center gap-3 border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
                <LogOut className="h-4 w-4" />
                Cerrar sesion
              </button>
            </form>
          ) : null}
        </div>
      </aside>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setShouldRender(true);
          setOpen(true);
        }}
        className="inline-flex items-center justify-center text-white"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      {canPortal && shouldRender ? createPortal(drawerMarkup, document.body) : null}
    </>
  );
}
