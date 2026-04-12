import { prisma } from "@/lib/prisma";

type MercadoPagoPreferenceItem = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: "CLP";
};

type MercadoPagoPreferenceResponse = {
  id?: string;
  init_point?: string;
  sandbox_init_point?: string;
};

type MercadoPagoPaymentResponse = {
  id?: number | string;
  status?: string | null;
  status_detail?: string | null;
  external_reference?: string | null;
};

const MERCADO_PAGO_API_BASE = "https://api.mercadopago.com";

function getAppUrl() {
  const explicitUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL;

  if (explicitUrl) {
    return explicitUrl.replace(/\/+$/, "");
  }

  const vercelUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;

  if (vercelUrl) {
    return `https://${vercelUrl}`.replace(/\/+$/, "");
  }

  return "http://localhost:3000";
}

export function isMercadoPagoConfigured() {
  return Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim());
}

function getMercadoPagoAccessToken() {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!token) {
    throw new Error("Mercado Pago access token is not configured.");
  }

  return token;
}

async function mercadoPagoFetch<T>(
  path: string,
  init?: RequestInit & { searchParams?: URLSearchParams },
) {
  const url = new URL(`${MERCADO_PAGO_API_BASE}${path}`);

  if (init?.searchParams) {
    url.search = init.searchParams.toString();
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${getMercadoPagoAccessToken()}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Mercado Pago request failed: ${response.status} ${details}`);
  }

  return (await response.json()) as T;
}

export async function createMercadoPagoPreference(input: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: MercadoPagoPreferenceItem[];
}) {
  const appUrl = getAppUrl();
  const notificationUrl = `${appUrl}/api/payments/mercadopago/webhook`;

  const payload = {
    external_reference: input.orderNumber,
    payer: {
      name: input.customerName,
      email: input.customerEmail,
    },
    items: input.items,
    back_urls: {
      success: `${appUrl}/checkout/success`,
      failure: `${appUrl}/checkout/failure`,
      pending: `${appUrl}/checkout/pending`,
    },
    auto_return: "approved",
    notification_url: notificationUrl,
  };

  const preference = await mercadoPagoFetch<MercadoPagoPreferenceResponse>(
    "/checkout/preferences",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  if (!preference.id || !(preference.init_point || preference.sandbox_init_point)) {
    throw new Error("Mercado Pago preference response is incomplete.");
  }

  return {
    id: preference.id,
    initPoint: preference.init_point || preference.sandbox_init_point!,
  };
}

export function mapMercadoPagoPaymentStatus(status?: string | null) {
  switch (status) {
    case "approved":
      return "PAID" as const;
    case "pending":
    case "in_process":
    case "in_mediation":
      return "PENDING" as const;
    case "cancelled":
    case "charged_back":
    case "rejected":
    case "refunded":
      return "CANCELLED" as const;
    default:
      return "PENDING" as const;
  }
}

export async function syncMercadoPagoPaymentById(paymentId: string) {
  const payment = await mercadoPagoFetch<MercadoPagoPaymentResponse>(
    `/v1/payments/${encodeURIComponent(paymentId)}`,
  );

  if (!payment.external_reference) {
    return null;
  }

  const nextStatus = mapMercadoPagoPaymentStatus(payment.status);

  return prisma.order.update({
    where: { orderNumber: payment.external_reference },
    data: {
      paymentProvider: "MERCADO_PAGO",
      paymentId: String(payment.id || paymentId),
      status: nextStatus,
      paymentStatusDetail: payment.status_detail || payment.status || null,
      paidAt: nextStatus === "PAID" ? new Date() : null,
    },
  });
}

export function extractMercadoPagoPaymentId(input: {
  searchParams?: URLSearchParams;
  body?: Record<string, unknown> | null;
}) {
  const searchPaymentId =
    input.searchParams?.get("data.id") ||
    input.searchParams?.get("payment_id") ||
    input.searchParams?.get("id");

  if (searchPaymentId) {
    return searchPaymentId;
  }

  const bodyData = input.body?.data;

  if (bodyData && typeof bodyData === "object" && "id" in bodyData) {
    const value = (bodyData as { id?: unknown }).id;
    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }
  }

  const bodyId = input.body?.id;
  if (typeof bodyId === "string" || typeof bodyId === "number") {
    return String(bodyId);
  }

  return null;
}
