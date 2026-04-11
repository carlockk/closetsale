import { ClientCheckoutPage } from "@/components/store/client-checkout-page";

type CheckoutPageProps = {
  searchParams: Promise<{ message?: string; orderNumber?: string; email?: string }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  return (
    <ClientCheckoutPage
      message={params.message}
      orderNumber={params.orderNumber}
      email={params.email}
      isMercadoPagoReady={Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim())}
    />
  );
}
