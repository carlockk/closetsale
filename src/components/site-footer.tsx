import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { AuthDrawer } from "@/components/auth-drawer";
import { getCurrentSellerProfile, getSession } from "@/lib/auth";
import { getSocialLinks } from "@/lib/social-links";

function SocialIcon({ platform }: { platform: string }) {
  switch (platform) {
    case "Instagram":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.9">
          <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.3" cy="6.7" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      );
    case "Facebook":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M13.5 21v-8h2.6l.4-3h-3V8.1c0-.9.3-1.6 1.7-1.6H16.7V4a18 18 0 0 0-2.2-.1c-2.2 0-3.8 1.3-3.8 3.9V10H8v3h2.7v8h2.8Z" />
        </svg>
      );
    case "TikTok":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M14.4 3c.3 2.1 1.5 3.5 3.6 4V9.7c-1.3 0-2.5-.4-3.6-1.1v6.3c0 3.2-2.1 5.6-5.4 5.6a5.1 5.1 0 0 1-1.7-9.9v2.9c-.9.3-1.5 1.1-1.5 2.1 0 1.2.9 2.2 2.2 2.2s2.2-.9 2.2-2.2V3h3.2Z" />
        </svg>
      );
    case "WhatsApp":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M20 11.9A8 8 0 0 0 6.3 6.3a8 8 0 0 0-1.1 9.3L4 20l4.6-1.2a8 8 0 0 0 3.4.8h0a8 8 0 0 0 8-7.7Zm-8 6.3a6.7 6.7 0 0 1-3.2-.8l-.2-.1-2.7.7.7-2.6-.2-.2a6.7 6.7 0 1 1 5.6 3Zm3.7-5c-.2-.1-1.3-.6-1.5-.7s-.4-.1-.5.1-.6.7-.7.8-.3.2-.5.1a5.4 5.4 0 0 1-2.7-2.4c-.1-.2 0-.3.1-.5l.3-.3.2-.3c.1-.1.1-.3 0-.4l-.7-1.6c-.2-.4-.4-.4-.5-.4H8c-.2 0-.4.1-.6.3a2.5 2.5 0 0 0-.8 1.8c0 1.1.8 2.2.9 2.3a9.4 9.4 0 0 0 3.6 3.2c1.8.7 1.8.5 2.2.5.3 0 1.3-.5 1.5-1 .2-.5.2-.9.1-1Z" />
        </svg>
      );
    case "YouTube":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M21.6 7.2a2.8 2.8 0 0 0-2-2c-1.8-.5-7.6-.5-7.6-.5s-5.8 0-7.6.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .4 4.8 2.8 2.8 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.4-4.8ZM10 15.6V8.4l6.2 3.6z" />
        </svg>
      );
    case "X":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M18.9 3H21l-6.5 7.5L22 21h-5.9l-4.6-6-5.2 6H4.2l7-8-7.2-10h6l4.2 5.5L18.9 3Zm-1 16.3h1.2L9.4 4.6H8.1Z" />
        </svg>
      );
    case "LinkedIn":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M6.7 8.6H3.9V20h2.8V8.6Zm.2-3.5A1.6 1.6 0 1 0 3.7 5a1.6 1.6 0 0 0 3.2 0ZM20 13c0-3.1-1.7-4.6-4-4.6a3.5 3.5 0 0 0-3.1 1.7V8.6H10V20h2.8v-6.1c0-1.6.3-3.1 2.3-3.1 2 0 2 1.9 2 3.2V20H20V13Z" />
        </svg>
      );
    default:
      return <MessageCircle className="h-4 w-4" />;
  }
}

export async function SiteFooter() {
  const [socialLinks, session, seller] = await Promise.all([
    getSocialLinks(),
    getSession(),
    getCurrentSellerProfile(),
  ]);
  const sellerHref =
    seller?.status === "ACTIVE" ? "/seller" : seller ? "/profile#seller" : "/vender";

  return (
    <footer className="border-t border-white/10 bg-stone-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 pt-20 text-sm text-stone-400 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="font-serif text-xl text-white">ClosetSale</p>
          <p className="mt-3 max-w-sm">
            Ropa usada en excelente estado, seleccionada por estilo, calidad y
            segunda vida real para cada prenda.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Compra</p>
          <div className="mt-3 space-y-2">
            <p>Catalogo</p>
            <p>Favoritos</p>
            <p>Carrito</p>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Seller</p>
          <div className="mt-3 space-y-3">
            <p>Abre tu tienda y vende dentro de ClosetSale.</p>
            {session ? (
              <Link
                href={sellerHref}
                className="inline-flex items-center border-b border-white/40 pb-1 text-white transition hover:border-white hover:text-stone-200"
              >
                {seller?.status === "ACTIVE" ? "Ir a mi panel seller" : "Quiero ser seller"}
              </Link>
            ) : (
              <AuthDrawer
                isAuthenticated={false}
                label="Quiero ser seller"
                initialMode="register"
                registerAsSeller
                registerTitle="Crear cuenta seller"
                registerDescription="Crea tu cuenta y deja iniciada tu solicitud seller desde este mismo panel."
                triggerClassName="inline-flex items-center border-b border-white/40 pb-1 text-white transition hover:border-white hover:text-stone-200"
              />
            )}
          </div>
        </div>
        {socialLinks.length > 0 ? (
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Redes</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {socialLinks.map((link) => {
                return (
                  <Link
                    key={link.id}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/5 text-stone-300 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
                    aria-label={link.platform}
                  >
                    <SocialIcon platform={link.platform} />
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </footer>
  );
}
