"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { formatCurrency } from "@/lib/utils";

type OrderSummary = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string | Date;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    imageUrl?: string | null;
  }>;
};

type OrderHistoryPageProps = {
  initialOrders: OrderSummary[];
  isAuthenticated: boolean;
};

type GuestOrderReference = {
  orderNumber: string;
  email: string;
};

const GUEST_ORDERS_KEY = "closetsale_guest_orders";
const ARCHIVED_ORDERS_KEY = "closetsale_archived_orders";
const ORDER_CARD_LAYOUT_THRESHOLD = 4;

export function saveGuestOrderReference(reference: GuestOrderReference) {
  if (typeof window === "undefined") {
    return;
  }

  const current = readGuestOrderReferences().filter(
    (item) => item.orderNumber !== reference.orderNumber,
  );

  localStorage.setItem(
    GUEST_ORDERS_KEY,
    JSON.stringify([reference, ...current].slice(0, 20)),
  );
}

function readGuestOrderReferences(): GuestOrderReference[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(localStorage.getItem(GUEST_ORDERS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readArchivedOrderNumbers(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(localStorage.getItem(ARCHIVED_ORDERS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeArchivedOrderNumbers(orderNumbers: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    ARCHIVED_ORDERS_KEY,
    JSON.stringify(Array.from(new Set(orderNumbers))),
  );
}

export function OrderHistoryPage({
  initialOrders,
  isAuthenticated,
}: OrderHistoryPageProps) {
  const [guestOrders, setGuestOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(!isAuthenticated);
  const [archivedOrders, setArchivedOrders] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    setArchivedOrders(readArchivedOrderNumbers());
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }

    const references = readGuestOrderReferences();

    if (references.length === 0) {
      setGuestOrders([]);
      setLoading(false);
      return;
    }

    let active = true;

    Promise.all(
      references.map(async (reference) => {
        const response = await fetch(
          `/api/orders/lookup?orderNumber=${encodeURIComponent(reference.orderNumber)}&email=${encodeURIComponent(reference.email)}`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          return null;
        }

        const data = await response.json();
        return data.order as OrderSummary | null;
      }),
    )
      .then((orders) => {
        if (!active) {
          return;
        }

        setGuestOrders(orders.filter(Boolean) as OrderSummary[]);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const orders = useMemo(
    () => (isAuthenticated ? initialOrders : guestOrders),
    [guestOrders, initialOrders, isAuthenticated],
  );
  const visibleOrders = useMemo(
    () =>
      orders.filter((order) =>
        showArchived ? true : !archivedOrders.includes(order.orderNumber),
      ),
    [archivedOrders, orders, showArchived],
  );
  const archivedVisibleCount = useMemo(
    () => orders.filter((order) => archivedOrders.includes(order.orderNumber)).length,
    [archivedOrders, orders],
  );
  const useCardLayout = visibleOrders.length >= ORDER_CARD_LAYOUT_THRESHOLD;

  function archiveOrder(orderNumber: string) {
    setArchivedOrders((current) => {
      const next = [...current, orderNumber];
      writeArchivedOrderNumbers(next);
      return Array.from(new Set(next));
    });
  }

  function restoreOrder(orderNumber: string) {
    setArchivedOrders((current) => {
      const next = current.filter((item) => item !== orderNumber);
      writeArchivedOrderNumbers(next);
      return next;
    });
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="border-b border-stone-200 pb-6">
          <p className="text-xs uppercase tracking-[0.32em] text-stone-400">Cuenta</p>
          <h1 className="mt-3 font-serif text-5xl text-stone-950">Mis compras</h1>
          <p className="mt-4 max-w-2xl text-stone-600">
            Aqui puedes revisar tus pedidos y entrar al detalle de cada compra, incluso si compraste como invitado.
          </p>
        </div>

        {archivedVisibleCount > 0 ? (
          <div className="mt-6 flex flex-wrap items-center gap-4 border border-stone-200 px-5 py-4 text-sm text-stone-600">
            <p>
              Tienes {archivedVisibleCount} pedido(s) archivado(s) ocultos de esta vista.
            </p>
            <button
              type="button"
              onClick={() => setShowArchived((current) => !current)}
              className="text-sm uppercase tracking-[0.18em] text-stone-950 underline-offset-4 hover:underline"
            >
              {showArchived ? "Ocultar archivados" : "Mostrar archivados"}
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className="mt-8 border border-stone-200 px-6 py-10 text-stone-600">
            Cargando compras...
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="mt-8 border border-stone-200 px-6 py-10 text-stone-600">
            {orders.length === 0
              ? "Aun no tienes compras registradas."
              : "No hay compras visibles con el filtro actual."}
          </div>
        ) : useCardLayout ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleOrders.map((order) => (
              <article key={order.id} className="border border-stone-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-400">
                      Pedido {order.orderNumber}
                    </p>
                    <p className="mt-2 text-base font-medium text-stone-950">
                      {order.customerName}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      {new Date(order.createdAt).toLocaleString("es-CL")}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-400">
                      Estado
                    </p>
                    <p className="mt-2 text-sm font-medium text-stone-900">{order.status}</p>
                    <p className="mt-3 text-xl font-semibold text-stone-950">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3 border-t border-stone-200 pt-4 text-sm text-stone-600">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="h-14 w-12 shrink-0 overflow-hidden bg-stone-100">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            width={160}
                            height={200}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <p className="min-w-0">
                        {item.title} x{item.quantity}
                      </p>
                    </div>
                  ))}
                  {order.items.length > 3 ? (
                    <p className="text-stone-400">y {order.items.length - 3} item(s) mas</p>
                  ) : null}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <Link
                    href={
                      isAuthenticated
                        ? `/orders/${order.orderNumber}`
                        : `/orders/${order.orderNumber}?email=${encodeURIComponent(order.customerEmail)}`
                    }
                    className="inline-flex border border-stone-900 px-5 py-2 text-sm uppercase tracking-[0.2em] text-stone-900 transition hover:bg-stone-900 hover:text-white"
                  >
                    Ver detalle
                  </Link>
                  {archivedOrders.includes(order.orderNumber) ? (
                    <button
                      type="button"
                      onClick={() => restoreOrder(order.orderNumber)}
                      className="text-sm uppercase tracking-[0.18em] text-stone-600 underline-offset-4 hover:text-stone-950 hover:underline"
                    >
                      Quitar archivo
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => archiveOrder(order.orderNumber)}
                      className="text-sm uppercase tracking-[0.18em] text-stone-600 underline-offset-4 hover:text-stone-950 hover:underline"
                    >
                      Archivar
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 divide-y divide-stone-200 border-y border-stone-200">
            {visibleOrders.map((order) => (
              <article key={order.id} className="py-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-400">
                      Pedido {order.orderNumber}
                    </p>
                    <p className="mt-2 text-lg font-medium text-stone-950">
                      {order.customerName}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      {new Date(order.createdAt).toLocaleString("es-CL")}
                    </p>
                  </div>
                  <div className="shrink-0 md:text-right">
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-400">
                      Estado
                    </p>
                    <p className="mt-2 text-sm font-medium text-stone-900">{order.status}</p>
                    <p className="mt-3 text-2xl font-semibold text-stone-950">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm text-stone-600">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="h-14 w-12 shrink-0 overflow-hidden bg-stone-100">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            width={160}
                            height={200}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <p>
                        {item.title} x{item.quantity}
                      </p>
                    </div>
                  ))}
                  {order.items.length > 3 ? (
                    <p className="text-stone-400">y {order.items.length - 3} item(s) mas</p>
                  ) : null}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <Link
                    href={
                      isAuthenticated
                        ? `/orders/${order.orderNumber}`
                        : `/orders/${order.orderNumber}?email=${encodeURIComponent(order.customerEmail)}`
                    }
                    className="inline-flex border border-stone-900 px-5 py-2 text-sm uppercase tracking-[0.2em] text-stone-900 transition hover:bg-stone-900 hover:text-white"
                  >
                    Ver detalle
                  </Link>
                  {archivedOrders.includes(order.orderNumber) ? (
                    <button
                      type="button"
                      onClick={() => restoreOrder(order.orderNumber)}
                      className="text-sm uppercase tracking-[0.18em] text-stone-600 underline-offset-4 hover:text-stone-950 hover:underline"
                    >
                      Quitar archivo
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => archiveOrder(order.orderNumber)}
                      className="text-sm uppercase tracking-[0.18em] text-stone-600 underline-offset-4 hover:text-stone-950 hover:underline"
                    >
                      Archivar
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
