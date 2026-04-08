import { SocialLinksManager } from "@/components/admin/social-links-manager";
import { requireAdmin } from "@/lib/auth";

export default async function SocialLinksAdminPage() {
  await requireAdmin();

  return <SocialLinksManager />;
}
