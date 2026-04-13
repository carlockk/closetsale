"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { createPortal } from "react-dom";

import { loginAction, registerAction } from "@/actions/auth";

type AuthDrawerProps = {
  isAuthenticated: boolean;
  label?: string;
  triggerClassName?: string;
  initialMode?: "login" | "register";
  registerAsSeller?: boolean;
  registerTitle?: string;
  registerDescription?: string;
};

export function AuthDrawer({
  isAuthenticated,
  label = "Ingresar",
  triggerClassName = "text-stone-700",
  initialMode = "login",
  registerAsSeller = false,
  registerTitle,
  registerDescription,
}: AuthDrawerProps) {
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
  const drawerTitle =
    mode === "login"
      ? "Iniciar sesion"
      : registerTitle || (registerAsSeller ? "Crear cuenta seller" : "Crear cuenta");
  const drawerDescription =
    mode === "login"
      ? "Entra para guardar favoritos, seguir tus pedidos y revisar tu seleccion."
      : registerDescription ||
        (registerAsSeller
          ? "Crea tu cuenta, activa tu solicitud seller y completa tu tienda despues desde tu perfil."
          : "Crea tu cuenta para guardar favoritos, comprar y seguir tus pedidos.");

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
              <h2 className="mt-1 font-serif text-3xl text-stone-950">{drawerTitle}</h2>
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
            <p className="mb-6 text-sm text-stone-500">{drawerDescription}</p>

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
                <label className="flex items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-700">
                  <input
                    type="checkbox"
                    name="wantsToSell"
                    value="true"
                    defaultChecked={registerAsSeller}
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
        onClick={() => openDrawer(initialMode)}
        data-auth-trigger
        className={triggerClassName}
        aria-label={initialMode === "login" ? "Abrir login" : "Abrir registro"}
      >
        {label}
      </button>
      {canPortal && shouldRender ? createPortal(drawerMarkup, document.body) : null}
    </>
  );
}
