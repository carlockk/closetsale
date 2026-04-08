"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { createPortal } from "react-dom";

import { loginAction, registerAction } from "@/actions/auth";

type AuthDrawerProps = {
  isAuthenticated: boolean;
};

export function AuthDrawer({ isAuthenticated }: AuthDrawerProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  function openDrawer(nextMode: "login" | "register") {
    setMode(nextMode);
    setShouldRender(true);
    requestAnimationFrame(() => {
      setOpen(true);
    });
  }

  function closeDrawer() {
    setOpen(false);
    window.setTimeout(() => {
      setShouldRender(false);
    }, 500);
  }

  useEffect(() => {
    if (!shouldRender) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDrawer();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [shouldRender]);

  if (isAuthenticated) {
    return null;
  }

  const canPortal = typeof document !== "undefined";

  const drawerMarkup = (
    <div
      className={`fixed inset-0 z-[120] bg-stone-950/45 backdrop-blur-[2px] transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={closeDrawer}
      aria-hidden={!open}
    >
      <aside
        onClick={(event) => event.stopPropagation()}
        className={`absolute right-0 top-0 h-screen w-[92vw] max-w-md border-l border-stone-200 bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "translate-x-[104%]"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 md:px-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-stone-400">ClosetSale</p>
              <h2 className="mt-1 font-serif text-3xl text-stone-950">
                {mode === "login" ? "Iniciar sesion" : "Crear cuenta"}
              </h2>
            </div>
            <button
              type="button"
              onClick={closeDrawer}
              className="rounded-full border border-stone-200 p-2 text-stone-700"
              aria-label="Cerrar panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex gap-2 border-b border-stone-200 px-5 py-4 md:px-6">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-full px-4 py-2 text-sm ${
                mode === "login" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-700"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`rounded-full px-4 py-2 text-sm ${
                mode === "register" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-700"
              }`}
            >
              Registro
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6 md:px-6">
            <p className="mb-6 text-sm text-stone-500">
              Entra para guardar favoritos, seguir tus pedidos y revisar tu seleccion.
            </p>

            {mode === "login" ? (
              <form action={loginAction} className="grid gap-4">
                <input
                  name="email"
                  type="email"
                  placeholder="Correo"
                  className="rounded-2xl border border-stone-200 px-4 py-3"
                  required
                />
                <label className="relative block">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Contrasena"
                    className="w-full rounded-2xl border border-stone-200 px-4 py-3 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500"
                    aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </label>
                <button className="rounded-full bg-stone-900 px-6 py-3 text-sm uppercase tracking-[0.2em] text-white">
                  Entrar
                </button>
              </form>
            ) : (
              <form action={registerAction} className="grid gap-4">
                <input
                  name="name"
                  placeholder="Nombre"
                  className="rounded-2xl border border-stone-200 px-4 py-3"
                  required
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Correo"
                  className="rounded-2xl border border-stone-200 px-4 py-3"
                  required
                />
                <label className="relative block">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Contrasena"
                    className="w-full rounded-2xl border border-stone-200 px-4 py-3 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500"
                    aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </label>
                <button className="rounded-full bg-stone-900 px-6 py-3 text-sm uppercase tracking-[0.2em] text-white">
                  Registrarme
                </button>
              </form>
            )}
          </div>
        </div>
      </aside>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => openDrawer("login")}
        data-auth-trigger
        className="text-stone-700"
        aria-label="Abrir login"
      >
        Ingresar
      </button>
      {canPortal && shouldRender ? createPortal(drawerMarkup, document.body) : null}
    </>
  );
}
