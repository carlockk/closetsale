import Link from "next/link";
import {
  ArrowRight,
  CircleAlert,
  Clock3,
  LayoutDashboard,
  Store,
} from "lucide-react";

type SellerStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED" | null | undefined;

type SellerAccessCtaProps = {
  sellerStatus?: SellerStatus;
  variant: "button" | "banner";
  className?: string;
  onClick?: () => void;
};

type SellerAccessContext = {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  icon: typeof LayoutDashboard;
  tone: "active" | "pending" | "warning" | "default";
};

function getSellerAccessContext(sellerStatus: SellerStatus): SellerAccessContext {
  switch (sellerStatus) {
    case "ACTIVE":
      return {
        href: "/seller",
        eyebrow: "Seller activo",
        title: "Panel seller",
        description: "Gestiona tus productos, ventas y pagos desde un solo lugar.",
        actionLabel: "Ir al panel",
        icon: LayoutDashboard,
        tone: "active",
      };
    case "PENDING":
      return {
        href: "/profile#seller",
        eyebrow: "Seller pendiente",
        title: "Solicitud en revisión",
        description: "Tu perfil seller está guardado y puedes seguir ajustándolo.",
        actionLabel: "Editar solicitud",
        icon: Clock3,
        tone: "pending",
      };
    case "REJECTED":
      return {
        href: "/profile#seller",
        eyebrow: "Seller rechazado",
        title: "Revisar solicitud",
        description: "Corrige los datos de tu tienda y vuelve a enviarla cuando quieras.",
        actionLabel: "Corregir ahora",
        icon: CircleAlert,
        tone: "warning",
      };
    case "SUSPENDED":
      return {
        href: "/profile#seller",
        eyebrow: "Seller suspendido",
        title: "Perfil suspendido",
        description: "Revisa tu estado antes de volver a vender.",
        actionLabel: "Ver estado",
        icon: CircleAlert,
        tone: "warning",
      };
    default:
      return {
        href: "/vender",
        eyebrow: "Quiero vender",
        title: "Empieza a vender",
        description: "Activa tu tienda y publica productos en ClosetSale.",
        actionLabel: "Quiero vender",
        icon: Store,
        tone: "default",
      };
  }
}

export function SellerAccessCta({
  sellerStatus,
  variant,
  className,
  onClick,
}: SellerAccessCtaProps) {
  const access = getSellerAccessContext(sellerStatus);
  const Icon = access.icon;

  if (variant === "button") {
    const buttonClassName =
      access.tone === "active"
        ? "inline-flex items-center gap-2 rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white transition hover:bg-stone-800"
        : access.tone === "pending"
          ? "inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-amber-900 transition hover:border-amber-400 hover:bg-amber-100"
          : access.tone === "warning"
            ? "inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-xs uppercase tracking-[0.24em] text-stone-900 transition hover:border-stone-900 hover:bg-stone-50"
            : "inline-flex items-center gap-2 rounded-full border border-stone-900 bg-white px-4 py-2 text-xs uppercase tracking-[0.24em] text-stone-900 transition hover:bg-stone-900 hover:text-white";

    return (
      <Link href={access.href} onClick={onClick} className={[buttonClassName, className].filter(Boolean).join(" ")}>
        <Icon className="h-4 w-4" />
        <span>{access.actionLabel}</span>
      </Link>
    );
  }

  const bannerClassName =
    access.tone === "active"
      ? "bg-stone-950 text-white ring-stone-950/10"
      : access.tone === "pending"
        ? "bg-amber-50 text-amber-950 ring-amber-200"
        : access.tone === "warning"
          ? "bg-stone-50 text-stone-950 ring-stone-200"
          : "bg-white text-stone-950 ring-stone-200";

  const buttonClassName =
    access.tone === "active"
      ? "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white px-4 py-2 text-xs uppercase tracking-[0.22em] text-stone-950 transition hover:bg-stone-100"
      : access.tone === "pending"
        ? "inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-950 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white transition hover:bg-amber-900"
        : access.tone === "warning"
          ? "inline-flex items-center gap-2 rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white transition hover:bg-stone-800"
          : "inline-flex items-center gap-2 rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white transition hover:bg-stone-800";

  return (
    <section
      className={[
        "rounded-[2rem] p-5 ring-1 shadow-sm",
        bannerClassName,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p
            className={`text-[11px] uppercase tracking-[0.28em] ${
              access.tone === "active"
                ? "text-white/65"
                : access.tone === "pending"
                  ? "text-amber-700"
                  : "text-stone-400"
            }`}
          >
            {access.eyebrow}
          </p>
          <h2 className="mt-2 font-serif text-3xl">{access.title}</h2>
          <p
            className={`mt-3 max-w-2xl text-sm leading-6 ${
              access.tone === "active"
                ? "text-white/80"
                : access.tone === "pending"
                  ? "text-amber-900/80"
                  : "text-stone-600"
            }`}
          >
            {access.description}
          </p>
        </div>

        <Link href={access.href} onClick={onClick} className={buttonClassName}>
          <Icon className="h-4 w-4" />
          <span>{access.actionLabel}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
