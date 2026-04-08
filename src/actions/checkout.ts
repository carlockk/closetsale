"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validations";

export async function checkoutAction(formData: FormData) {
  const parsed = checkoutSchema.safeParse({
    customerName: formData.get("customerName"),
    customerEmail: formData.get("customerEmail"),
    customerPhone: formData.get("customerPhone"),
    shippingAddress: formData.get("shippingAddress"),
    notes: formData.get("notes"),
    items: JSON.parse(String(formData.get("items") || "[]")),
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

  await prisma.order.create({
    data: {
      orderNumber,
      customerName: parsed.data.customerName,
      customerEmail: parsed.data.customerEmail,
      customerPhone: parsed.data.customerPhone || null,
      shippingAddress: parsed.data.shippingAddress,
      notes: parsed.data.notes || null,
      subtotal,
      total: subtotal,
      status: "PAID",
      userId: currentUser?.id || null,
      items: {
        create: items,
      },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/");
  redirect(
    `/checkout?message=Pedido confirmado&orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(parsed.data.customerEmail)}`,
  );
}
