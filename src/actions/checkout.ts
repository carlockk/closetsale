"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import {
  getDefaultCommissionRate,
  getSellerSnapshot,
} from "@/lib/marketplace";
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

function buildCheckoutMessage(message: string) {
  return `/checkout?message=${encodeURIComponent(message)}`;
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
    redirect(buildCheckoutMessage("Revisa tu pedido"));
  }

  const currentUser = await getCurrentUser();
  const productIds = parsed.data.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: {
      variants: true,
      seller: {
        select: {
          id: true,
          storeName: true,
          slug: true,
          commissionRate: true,
          status: true,
        },
      },
    },
  });

  const items = parsed.data.items.map((item) => {
    const product = products.find((current) => current.id === item.productId);

    if (!product) {
      throw new Error("Uno de los productos ya no existe.");
    }

    if (product.status !== "ACTIVE") {
      throw new Error(`"${product.title}" ya no esta disponible.`);
    }

    if (product.seller && product.seller.status !== "ACTIVE") {
      throw new Error(`La tienda de "${product.title}" no esta disponible para vender.`);
    }

    const variant = item.variantId
      ? product.variants.find((current) => current.id === item.variantId)
      : undefined;

    if (item.variantId && !variant) {
      throw new Error(`La variante seleccionada para "${product.title}" ya no existe.`);
    }

    if (variant && variant.stock < item.quantity) {
      throw new Error(`No hay stock suficiente para "${product.title}".`);
    }

    const unitPrice = Number(product.price) + Number(variant?.priceDelta || 0);

    return {
      productId: product.id,
      variantId: variant?.id,
      title: `${product.title}${variant ? ` - ${variant.name}: ${variant.value}` : ""}`,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
      seller: product.seller,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  const orderNumber = `CS-${Date.now()}`;
  const shouldUseMercadoPago = isMercadoPagoConfigured();

  let order: { id: string };

  try {
    order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
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
        },
      });

      const createdItems: Array<{ id: string }> = [];

      for (const item of items) {
        if (item.variantId) {
          const updatedVariant = await tx.productVariant.updateMany({
            where: {
              id: item.variantId,
              productId: item.productId,
              stock: {
                gte: item.quantity,
              },
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });

          if (updatedVariant.count === 0) {
            throw new Error(`No hay stock suficiente para "${item.title}".`);
          }
        }

        const createdItem = await tx.orderItem.create({
          data: {
            orderId: createdOrder.id,
            productId: item.productId,
            variantId: item.variantId,
            title: item.title,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
          },
        });

        createdItems.push(createdItem);
      }

      const sellerGroups = items.reduce<
        Map<
          string,
          {
            sellerId: string | null;
            sellerName: string;
            sellerSlug: string | null;
            commissionRate: number;
            subtotal: number;
            itemIds: string[];
          }
        >
      >((groups, item, index) => {
        const snapshot = getSellerSnapshot({
          id: item.seller?.id,
          storeName: item.seller?.storeName,
          slug: item.seller?.slug,
        });
        const groupKey = snapshot.sellerId || "__platform__";
        const commissionRate =
          item.seller?.commissionRate === null || item.seller?.commissionRate === undefined
            ? snapshot.sellerId
              ? getDefaultCommissionRate()
              : 0
            : Number(item.seller.commissionRate);

        const existing = groups.get(groupKey) || {
          sellerId: snapshot.sellerId,
          sellerName: snapshot.sellerName,
          sellerSlug: snapshot.sellerSlug,
          commissionRate,
          subtotal: 0,
          itemIds: [],
        };

        existing.subtotal += item.lineTotal;
        existing.itemIds.push(createdItems[index]!.id);
        groups.set(groupKey, existing);
        return groups;
      }, new Map());

      for (const group of sellerGroups.values()) {
        const commissionAmount = Number(
          ((group.subtotal * group.commissionRate) / 100).toFixed(2),
        );
        const netAmount = Number((group.subtotal - commissionAmount).toFixed(2));

        const sellerOrder = await tx.sellerOrder.create({
          data: {
            orderId: createdOrder.id,
            sellerId: group.sellerId,
            sellerName: group.sellerName,
            sellerSlug: group.sellerSlug,
            status: shouldUseMercadoPago ? "PENDING" : "CONFIRMED",
            subtotal: group.subtotal,
            commissionRate: group.commissionRate,
            commissionAmount,
            netAmount,
          },
        });

        await tx.orderItem.updateMany({
          where: { id: { in: group.itemIds } },
          data: { sellerOrderId: sellerOrder.id },
        });
      }

      return { id: createdOrder.id };
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "No se pudo procesar tu pedido. Revisa el carrito e intenta de nuevo.";
    redirect(buildCheckoutMessage(message));
  }

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
