import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { siteMenuSchema } from "@/lib/validations";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();

    const parsed = siteMenuSchema.safeParse({
      name: body.name,
      href: body.href,
      order: body.order,
      enabled: body.enabled,
      submenus: Array.isArray(body.submenus) ? body.submenus : [],
    });

    if (!parsed.success) {
      return Response.json({ message: "No se pudo actualizar el menu" }, { status: 400 });
    }

    await prisma.siteMenu.update({
      where: { id },
      data: {
        name: parsed.data.name,
        href: parsed.data.href,
        order: parsed.data.order,
        enabled: parsed.data.enabled,
        submenus: {
          deleteMany: {},
          create: parsed.data.submenus.map((submenu) => ({
            name: submenu.name,
            href: submenu.href,
            order: submenu.order,
          })),
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/products");

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Failed to update menu", error);
    return Response.json({ message: "No se pudo actualizar el menu" }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    await prisma.siteMenu.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/products");

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete menu", error);
    return Response.json({ message: "No se pudo eliminar el menu" }, { status: 500 });
  }
}
