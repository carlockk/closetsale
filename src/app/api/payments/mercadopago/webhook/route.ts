import { NextRequest, NextResponse } from "next/server";

import {
  extractMercadoPagoPaymentId,
  isMercadoPagoConfigured,
  syncMercadoPagoPaymentById,
} from "@/lib/mercadopago";

export async function POST(request: NextRequest) {
  if (!isMercadoPagoConfigured()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  let body: Record<string, unknown> | null = null;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = null;
  }

  const paymentId = extractMercadoPagoPaymentId({
    searchParams: request.nextUrl.searchParams,
    body,
  });

  if (!paymentId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  await syncMercadoPagoPaymentById(paymentId);

  return NextResponse.json({ ok: true });
}

export async function GET(request: NextRequest) {
  if (!isMercadoPagoConfigured()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const paymentId = extractMercadoPagoPaymentId({
    searchParams: request.nextUrl.searchParams,
  });

  if (!paymentId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  await syncMercadoPagoPaymentById(paymentId);

  return NextResponse.json({ ok: true });
}
