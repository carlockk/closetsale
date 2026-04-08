import { MenusManager } from "@/components/admin/menus-manager";
import { requireAdmin } from "@/lib/auth";
import { getAdminSitePages } from "@/lib/site-pages";

export default async function MenusAdminPage() {
  await requireAdmin();
  const pages = await getAdminSitePages();

  return <MenusManager pages={pages} />;
}
