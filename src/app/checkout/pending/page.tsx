import { CheckoutResultPage } from "@/app/checkout/result-page";

export default async function CheckoutPendingPage({
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
    fallbackMessage: "Tu pago esta pendiente de confirmacion",
  });
}
