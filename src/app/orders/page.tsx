import { OrderHistoryPage } from "@/components/store/order-history-page";
import { getSession } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/order-history";

export default async function OrdersPage() {
  const session = await getSession();
  const orders = session?.userId ? await getOrdersForUser(session.userId) : [];

  return (
    <OrderHistoryPage
      initialOrders={orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        total: Number(order.total),
        status: order.status,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
        })),
      }))}
      isAuthenticated={Boolean(session?.userId)}
    />
  );
}
