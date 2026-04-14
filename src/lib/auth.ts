import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

import { getAuthSecret } from "@/lib/auth-secret";
import { SESSION_COOKIE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

const secret = new TextEncoder().encode(getAuthSecret());

type SessionPayload = {
  userId: string;
  role: "ADMIN" | "USER";
  email: string;
  name: string;
  sessionVersion: number;
};

export function normalizeSellerSlug(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "mi-tienda"
  );
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const session = payload as unknown as SessionPayload;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        sessionVersion: true,
      },
    });

    if (!user || user.sessionVersion !== session.sessionVersion) {
      store.delete(SESSION_COOKIE);
      return null;
    }

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      sessionVersion: user.sessionVersion,
    } satisfies SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();

  if (!session?.userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.userId },
  });
}

export async function getCurrentSellerProfile() {
  const session = await getSession();

  if (!session?.userId) {
    return null;
  }

  return prisma.sellerProfile.findUnique({
    where: { userId: session.userId },
    include: {
      products: {
        select: { id: true, status: true },
      },
      sellerOrders: {
        select: {
          id: true,
          status: true,
          createdAt: true,
          commissionAmount: true,
          netAmount: true,
          subtotal: true,
          payoutItems: {
            select: {
              payout: {
                select: {
                  status: true,
                },
              },
            },
          },
        },
      },
      payoutAccounts: {
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          provider: true,
          accountType: true,
          label: true,
          details: true,
          isDefault: true,
          verifiedAt: true,
        },
      },
      payouts: {
        select: {
          id: true,
          status: true,
          provider: true,
          externalReference: true,
          createdAt: true,
          paidAt: true,
          netAmount: true,
        },
      },
    },
  });
}

export async function requireAdmin() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return session;
}

export async function requireSeller() {
  const session = await getSession();

  if (!session?.userId) {
    redirect("/login?message=Debes iniciar sesion");
  }

  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: session.userId },
    include: {
      products: {
        select: { id: true, status: true },
      },
      sellerOrders: {
        select: {
          id: true,
          status: true,
          createdAt: true,
          commissionAmount: true,
          netAmount: true,
          subtotal: true,
          payoutItems: {
            select: {
              payout: {
                select: {
                  status: true,
                },
              },
            },
          },
        },
      },
      payoutAccounts: {
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          provider: true,
          accountType: true,
          label: true,
          details: true,
          isDefault: true,
          verifiedAt: true,
        },
      },
      payouts: {
        select: {
          id: true,
          status: true,
          provider: true,
          externalReference: true,
          createdAt: true,
          paidAt: true,
          netAmount: true,
        },
      },
    },
  });

  if (!seller || seller.status !== "ACTIVE") {
    redirect("/profile?message=Tu perfil seller debe estar activo para entrar al panel");
  }

  return seller;
}
