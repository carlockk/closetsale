import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAdminMenus } from "@/lib/site-menus";
import { siteMenuSchema } from "@/lib/validations";

export async function GET() {
  await requireAdmin();
  const menus = await getAdminMenus();
  return Response.json({ menus });
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const parsed = siteMenuSchema.safeParse({
      name: body.name,
      href: body.href,
      order: body.order,
      enabled: body.enabled,
      submenus: Array.isArray(body.submenus) ? body.submenus : [],
    });

    if (!parsed.success) {
      return Response.json({ message: "No se pudo crear el menu" }, { status: 400 });
    }

    const menu = await prisma.siteMenu.create({
      data: {
        name: parsed.data.name,
        href: parsed.data.href,
        order: parsed.data.order,
        enabled: parsed.data.enabled,
        submenus: {
          create: parsed.data.submenus.map((submenu) => ({
            name: submenu.name,
            href: submenu.href,
            order: submenu.order,
          })),
        },
      },
      include: {
        submenus: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/products");

    return Response.json({ ok: true, menu });
  } catch (error) {
    console.error("Failed to create menu", error);
    return Response.json({ message: "No se pudo crear el menu" }, { status: 500 });
  }
}
