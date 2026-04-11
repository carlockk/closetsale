import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canUseSocialLinks } from "@/lib/social-links";
import { socialLinkSchema } from "@/lib/validations";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin();

    if (!(await canUseSocialLinks())) {
      return Response.json(
        { message: "La tabla de redes sociales aun no existe en la base de datos." },
        { status: 503 },
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const parsed = socialLinkSchema.safeParse({
      platform: body.platform,
      href: body.href,
      order: body.order,
      enabled: body.enabled,
    });

    if (!parsed.success) {
      return Response.json({ message: "No se pudo actualizar la red social" }, { status: 400 });
    }

    await prisma.socialLink.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/");

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Failed to update social link", error);

    return Response.json(
      { message: "No se pudo actualizar la red social." },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    await requireAdmin();

    if (!(await canUseSocialLinks())) {
      return Response.json(
        { message: "La tabla de redes sociales aun no existe en la base de datos." },
        { status: 503 },
      );
    }

    const { id } = await context.params;

    await prisma.socialLink.delete({
      where: { id },
    });

    revalidatePath("/");

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete social link", error);

    return Response.json(
      { message: "No se pudo eliminar la red social." },
      { status: 500 },
    );
  }
}
