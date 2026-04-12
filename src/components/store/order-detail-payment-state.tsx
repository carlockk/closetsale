"use client";

import { useEffect } from "react";

import { saveGuestOrderReference } from "@/components/store/order-history-page";
import { useCartStore } from "@/components/store/store";

type OrderDetailPaymentStateProps = {
  email?: string;
  orderNumber: string;
  payment?: string;
};

export function OrderDetailPaymentState({
  email,
  orderNumber,
  payment,
}: OrderDetailPaymentStateProps) {
  const clear = useCartStore((state) => state.clear);

  useEffect(() => {
    if (payment === "approved") {
      clear();
    }
  }, [clear, payment]);

  useEffect(() => {
    if (email && payment === "approved") {
      saveGuestOrderReference({ orderNumber, email });
    }
  }, [email, orderNumber, payment]);

  return null;
}
