import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canUseSocialLinks } from "@/lib/social-links";
import { getAdminSocialLinks } from "@/lib/social-links";
import { socialLinkSchema } from "@/lib/validations";

export async function GET() {
  await requireAdmin();
  const links = await getAdminSocialLinks();
  return Response.json({ links });
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    if (!(await canUseSocialLinks())) {
      return Response.json(
        { message: "La tabla de redes sociales aun no existe en la base de datos." },
        { status: 503 },
      );
    }

    const body = await request.json();
    const parsed = socialLinkSchema.safeParse({
      platform: body.platform,
      href: body.href,
      order: body.order,
      enabled: body.enabled,
    });

    if (!parsed.success) {
      return Response.json({ message: "No se pudo crear la red social" }, { status: 400 });
    }

    const link = await prisma.socialLink.create({
      data: parsed.data,
    });

    revalidatePath("/");

    return Response.json({ ok: true, link });
  } catch (error) {
    console.error("Failed to create social link", error);

    return Response.json(
      { message: "No se pudo crear la red social." },
      { status: 500 },
    );
  }
}
