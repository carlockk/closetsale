import { requireAdmin } from "@/lib/auth";
import { getAdminSitePages } from "@/lib/site-pages";

export async function GET() {
  await requireAdmin();
  const pages = await getAdminSitePages();
  return Response.json({ pages });
}
