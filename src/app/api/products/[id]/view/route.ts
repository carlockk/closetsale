import { NextRequest, NextResponse } from "next/server";

import { trackProductView } from "@/lib/product-views";
import { prisma } from "@/lib/prisma";

type ProductViewRouteProps = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: NextRequest, { params }: ProductViewRouteProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!product || product.status !== "ACTIVE") {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  await trackProductView(id);

  return NextResponse.json({ ok: true });
}
