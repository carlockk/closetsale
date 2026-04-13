import Link from "next/link";
import { BadgePercent, PackageCheck, Sparkles, Store, Users } from "lucide-react";

import { AuthDrawer } from "@/components/auth-drawer";
import { SectionHeading } from "@/components/section-heading";
import { getSession } from "@/lib/auth";

export const metadata = {
  title: "Vender en ClosetSale",
  description: "Abre tu tienda en ClosetSale, publica productos y vende desde tu propio panel.",
};

const steps = [
  {
    title: "Crea tu tienda",
    description: "Completa el onboarding con nombre, identidad visual y datos básicos de venta.",
  },
  {
    title: "Publica tus productos",
    description: "Sube inventario, define precios y deja listo tu catalogo para el comprador.",
  },
  {
    title: "Recibe ventas",
    description: "Gestiona pedidos, seguimiento y estados desde un panel pensado para sellers.",
  },
  {
    title: "Revisa tus pagos",
    description: "Consulta comisiones, liquidaciones y el historial financiero de tu tienda.",
  },
];

const benefits = [
  "Tu tienda con identidad propia dentro del marketplace.",
  "Panel dedicado para productos, pedidos y rendimiento.",
  "Venta guiada por una experiencia consistente con la marca.",
  "Visibilidad pública en listados y ficha de producto.",
];

const faq = [
  {
    q: "Necesito una tienda aparte para vender?",
    a: "No. Tu tienda vive dentro de ClosetSale y se activa como una superficie propia para administrar tu catalogo.",
  },
  {
    q: "Puedo seguir comprando como usuario normal?",
    a: "Si. Un usuario puede comprar y vender desde la misma cuenta, pero con vistas distintas para cada rol.",
  },
  {
    q: "Como se manejan las comisiones?",
    a: "La plataforma calcula la comision por venta y luego muestra el neto y la liquidacion asociada a tu actividad.",
  },
];

export default async function SellPage() {
  const session = await getSession();

  return (
    <div className="bg-white pb-8">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <section className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Marketplace</p>
            <h1 className="mt-4 font-serif text-5xl leading-[0.95] text-stone-950 md:text-7xl">
              Convierte ClosetSale en tu propia vitrina de ventas.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600">
              Crea tu tienda, publica productos y administra ventas desde un entorno claro,
              elegante y pensado para crecer sin perder el control de tu catalogo.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <AuthDrawer
                isAuthenticated={Boolean(session)}
                label="Quiero vender"
                initialMode="register"
                registerAsSeller
                registerTitle="Crear cuenta seller"
                registerDescription="Crea tu cuenta y deja iniciada tu solicitud seller desde este mismo panel."
                triggerClassName="inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm uppercase tracking-[0.2em] text-white transition hover:bg-stone-800"
              />
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-6 py-3 text-sm uppercase tracking-[0.2em] text-stone-700 transition hover:border-stone-300 hover:text-stone-950"
              >
                Ver catalogo
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Tiendas", value: "1 perfil" },
                { label: "Panel", value: "Seller dedicado" },
                { label: "Cobro", value: "Comision visible" },
              ].map((item) => (
                <div key={item.label} className="border-t border-stone-200 pt-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-stone-400">{item.label}</p>
                  <p className="mt-2 font-serif text-2xl text-stone-950">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 self-start bg-stone-950 p-5 text-white shadow-[0_30px_80px_rgba(28,25,23,0.18)]">
            <div className="border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center bg-white/10">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Superficie seller</p>
                  <p className="mt-1 font-serif text-2xl">Tu tienda, tu control</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-stone-300">
                Publica productos con identidad propia, revisa estados de pedidos y sigue el
                rendimiento desde un panel enfocado en vender.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="border border-white/10 bg-white/5 p-4">
                <BadgePercent className="h-5 w-5 text-stone-200" />
                <p className="mt-3 text-sm uppercase tracking-[0.24em] text-stone-400">Comision</p>
                <p className="mt-2 text-lg text-white">Regla clara por venta</p>
              </div>
              <div className="border border-white/10 bg-white/5 p-4">
                <PackageCheck className="h-5 w-5 text-stone-200" />
                <p className="mt-3 text-sm uppercase tracking-[0.24em] text-stone-400">Pedidos</p>
                <p className="mt-2 text-lg text-white">Estados y seguimiento</p>
              </div>
            </div>

            <div className="border border-white/10 bg-white p-5 text-stone-950">
              <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Experiencia</p>
              <p className="mt-2 font-serif text-3xl">Compra y vende sin friccion</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                El usuario final sigue viendo una tienda elegante; el seller ve su propio entorno
                para operar sin mezclarse con el panel admin.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <SectionHeading
            eyebrow="Como funciona"
            title="Una ruta simple para empezar a vender"
            description="La idea es que el seller se registre, complete su perfil y entre a un panel propio sin romper la experiencia del comprador."
          />
          <div className="grid gap-x-8 gap-y-10 border-t border-stone-200 pt-8 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => (
              <article key={step.title} className="border-b border-stone-200 pb-6">
                <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Paso {index + 1}</p>
                <h3 className="mt-4 font-serif text-2xl text-stone-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="border-t border-stone-200 pt-8">
            <SectionHeading
              eyebrow="Beneficios"
              title="La tienda publica tambien vende por ti"
              description="La landing, el header y las fichas de producto deben dejar claro que hay una capa marketplace sin perder la estetica del sistema."
            />
            <div className="grid gap-3">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3 border-t border-stone-200 pt-4 first:border-t-0 first:pt-0">
                  <Sparkles className="mt-1 h-4 w-4 shrink-0 text-stone-500" />
                  <p className="text-sm leading-6 text-stone-600">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-stone-200 bg-stone-950 p-8 text-white">
            <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Visibilidad</p>
            <h2 className="mt-4 font-serif text-4xl">El comprador ve quien vende.</h2>
            <p className="mt-4 max-w-xl text-stone-300">
              En listados y ficha de producto, el sello del seller puede aparecer cuando exista:
              eso da confianza, contexto y abre la puerta a tiendas propias dentro del marketplace.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="border border-white/10 bg-white/5 p-4">
                <Users className="h-5 w-5 text-stone-200" />
                <p className="mt-3 text-sm uppercase tracking-[0.24em] text-stone-400">Cliente</p>
                <p className="mt-2 text-lg">Compra con una sola experiencia</p>
              </div>
              <div className="border border-white/10 bg-white/5 p-4">
                <Store className="h-5 w-5 text-stone-200" />
                <p className="mt-3 text-sm uppercase tracking-[0.24em] text-stone-400">Seller</p>
                <p className="mt-2 text-lg">Administra su propia tienda</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-5 lg:grid-cols-3">
          {faq.map((item) => (
            <article key={item.q} className="border-t border-stone-200 pt-5">
              <p className="text-xs uppercase tracking-[0.28em] text-stone-400">FAQ</p>
              <h3 className="mt-4 font-serif text-2xl text-stone-950">{item.q}</h3>
              <p className="mt-3 text-sm leading-6 text-stone-600">{item.a}</p>
            </article>
          ))}
        </section>

        <section className="mt-20 border-t border-stone-200 py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Siguiente paso</p>
              <h2 className="mt-4 font-serif text-4xl text-stone-950 md:text-5xl">
                Si quieres vender, la base visual ya esta lista.
              </h2>
              <p className="mt-4 text-stone-600">
                El siguiente movimiento es conectar onboarding seller, panel propio y la capa de
                comisiones sobre el marketplace.
              </p>
            </div>
            <AuthDrawer
              isAuthenticated={Boolean(session)}
              label="Crear cuenta seller"
              initialMode="register"
              registerAsSeller
              registerTitle="Crear cuenta seller"
              registerDescription="Crea tu cuenta y deja iniciada tu solicitud seller desde este mismo panel."
              triggerClassName="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm uppercase tracking-[0.2em] text-white transition hover:bg-stone-800"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
