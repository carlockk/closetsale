import { getGlobalMenus } from "@/lib/site-menus";

export async function GET() {
  const menus = await getGlobalMenus();
  return Response.json({ menus });
}
