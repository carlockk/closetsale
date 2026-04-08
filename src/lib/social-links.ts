import { prisma } from "@/lib/prisma";

async function socialLinksTableExists() {
  try {
    const result = await prisma.$queryRaw<Array<{ table_name: string | null }>>`
      SELECT to_regclass('public."SocialLink"')::text AS table_name
    `;

    return Boolean(result[0]?.table_name);
  } catch {
    return false;
  }
}

export async function canUseSocialLinks() {
  return socialLinksTableExists();
}

export async function getSocialLinks() {
  if (!(await socialLinksTableExists())) {
    return [];
  }

  try {
    return await prisma.socialLink.findMany({
      where: { enabled: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
  } catch {
    return [];
  }
}

export async function getAdminSocialLinks() {
  if (!(await socialLinksTableExists())) {
    return [];
  }

  try {
    return await prisma.socialLink.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
  } catch {
    return [];
  }
}
