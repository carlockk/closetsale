import { NextRequest, NextResponse } from "next/server";

import { getOrderForViewer } from "@/lib/order-history";

export async function GET(request: NextRequest) {
  const orderNumber = request.nextUrl.searchParams.get("orderNumber")?.trim() || "";
  const email = request.nextUrl.searchParams.get("email")?.trim() || "";

  if (!orderNumber || !email) {
    return NextResponse.json({ message: "Faltan datos." }, { status: 400 });
  }

  const order = await getOrderForViewer(orderNumber, { email });

  if (!order) {
    return NextResponse.json({ message: "Compra no encontrada." }, { status: 404 });
  }

  return NextResponse.json({
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      notes: order.notes,
      subtotal: Number(order.subtotal),
      total: Number(order.total),
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
        productSlug: item.product.slug,
        imageUrl: item.product.images[0]?.url || null,
      })),
    },
  });
}
