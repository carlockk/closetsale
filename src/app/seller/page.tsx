import { getCurrentSellerProfile } from "@/lib/auth";
import { SellerDashboard } from "@/components/seller/seller-dashboard";

type SellerPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function SellerPage({ searchParams }: SellerPageProps) {
  const params = await searchParams;
  const seller = await getCurrentSellerProfile();

  if (!seller) {
    return null;
  }

  return <SellerDashboard seller={seller} message={params.message} />;
}
