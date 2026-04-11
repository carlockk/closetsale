"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import {
  createMercadoPagoPreference,
  isMercadoPagoConfigured,
} from "@/lib/mercadopago";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validations";

function parseCheckoutItems(rawItems: FormDataEntryValue | null) {
  try {
    const parsed = JSON.parse(String(rawItems || "[]"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function checkoutAction(formData: FormData) {
  const parsed = checkoutSchema.safeParse({
    customerName: formData.get("customerName"),
    customerEmail: formData.get("customerEmail"),
    customerPhone: formData.get("customerPhone"),
    shippingAddress: formData.get("shippingAddress"),
    notes: formData.get("notes"),
    items: parseCheckoutItems(formData.get("items")),
  });

  if (!parsed.success || parsed.data.items.length === 0) {
    redirect("/checkout?message=Revisa tu pedido");
  }

  const currentUser = await getCurrentUser();
  const productIds = parsed.data.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: true },
  });

  const items = parsed.data.items.map((item) => {
    const product = products.find((current) => current.id === item.productId);

    if (!product) {
      throw new Error("Producto no encontrado");
    }

    const variant = item.variantId
      ? product.variants.find((current) => current.id === item.variantId)
      : undefined;
    const unitPrice = Number(product.price) + Number(variant?.priceDelta || 0);

    return {
      productId: product.id,
      variantId: variant?.id,
      title: `${product.title}${variant ? ` - ${variant.name}: ${variant.value}` : ""}`,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  const orderNumber = `CS-${Date.now()}`;
  const shouldUseMercadoPago = isMercadoPagoConfigured();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName: parsed.data.customerName,
      customerEmail: parsed.data.customerEmail,
      customerPhone: parsed.data.customerPhone || null,
      shippingAddress: parsed.data.shippingAddress,
      notes: parsed.data.notes || null,
      subtotal,
      total: subtotal,
      status: shouldUseMercadoPago ? "PENDING" : "PAID",
      paymentProvider: shouldUseMercadoPago ? "MERCADO_PAGO" : null,
      userId: currentUser?.id || null,
      items: {
        create: items,
      },
    },
  });

  if (shouldUseMercadoPago) {
    const preference = await createMercadoPagoPreference({
      orderNumber,
      customerName: parsed.data.customerName,
      customerEmail: parsed.data.customerEmail,
      items: items.map((item) => ({
        id: item.variantId || item.productId,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        currency_id: "CLP",
      })),
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentReference: preference.id,
        paymentUrl: preference.initPoint,
      },
    });

    redirect(preference.initPoint);
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect(
    `/checkout?message=Pedido confirmado&orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(parsed.data.customerEmail)}`,
  );
}
