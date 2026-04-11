import { CheckoutResultPage } from "@/app/checkout/result-page";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    collection_id?: string;
    payment_id?: string;
    external_reference?: string;
    status?: string;
  }>;
}) {
  return CheckoutResultPage({
    searchParams,
    fallbackMessage: "Pago recibido, estamos confirmando tu compra",
  });
}
