import { CheckoutResultPage } from "@/app/checkout/result-page";

export default async function CheckoutFailurePage({
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
    fallbackMessage: "No se pudo completar el pago",
  });
}
