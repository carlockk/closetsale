import { redirect } from "next/navigation";

import {
  isMercadoPagoConfigured,
  syncMercadoPagoPaymentById,
} from "@/lib/mercadopago";
import { prisma } from "@/lib/prisma";

type CheckoutResultPageProps = {
  searchParams: Promise<{
    collection_id?: string;
    payment_id?: string;
    external_reference?: string;
    status?: string;
  }>;
  fallbackMessage: string;
};

export async function CheckoutResultPage({
  searchParams,
  fallbackMessage,
}: CheckoutResultPageProps) {
  const params = await searchParams;
  const paymentId = params.payment_id || params.collection_id;
  let orderNumber = params.external_reference;
  let customerEmail: string | undefined;
  let message = fallbackMessage;
  let paymentState = "pending";
  let redirectToOrderDetail = false;

  if (paymentId && isMercadoPagoConfigured()) {
    try {
      const order = await syncMercadoPagoPaymentById(paymentId);

      if (order) {
        orderNumber = order.orderNumber;
        customerEmail = order.customerEmail;
      }

      if (order?.status === "PAID") {
        message = "Pedido confirmado";
        paymentState = "approved";
        redirectToOrderDetail = true;
      } else if (order?.status === "CANCELLED") {
        message = "No se pudo completar el pago";
        paymentState = "cancelled";
      } else if (order?.status === "PENDING") {
        message = "Tu pago esta pendiente de confirmacion";
        paymentState = "pending";
        redirectToOrderDetail = true;
      }
    } catch {
      // The webhook remains the source of truth if sync fails here.
    }
  }

  if (!customerEmail && orderNumber) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: { customerEmail: true, status: true },
    });

    customerEmail = order?.customerEmail;

    if (order?.status === "PAID") {
      paymentState = "approved";
      message = "Pedido confirmado";
      redirectToOrderDetail = true;
    } else if (order?.status === "CANCELLED") {
      paymentState = "cancelled";
      message = "No se pudo completar el pago";
    } else if (order?.status === "PENDING") {
      paymentState = "pending";
      message = "Tu pago esta pendiente de confirmacion";
      redirectToOrderDetail = true;
    }
  }

  if (orderNumber && redirectToOrderDetail) {
    const query = new URLSearchParams();

    query.set("payment", paymentState);
    query.set("message", message);

    if (customerEmail) {
      query.set("email", customerEmail);
    }

    redirect(`/orders/${encodeURIComponent(orderNumber)}?${query.toString()}`);
  }

  const query = new URLSearchParams();
  query.set("message", message);
  if (orderNumber) {
    query.set("orderNumber", orderNumber);
  }
  if (customerEmail) {
    query.set("email", customerEmail);
  }
  redirect(`/checkout?${query.toString()}`);
}
