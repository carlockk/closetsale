import { prisma } from "@/lib/prisma";

export async function getPublishedSitePages() {
  try {
    return await prisma.sitePage.findMany({
      where: { isPublished: true },
      orderBy: [{ createdAt: "asc" }],
    });
  } catch {
    return [];
  }
}

export async function getAdminSitePages() {
  try {
    return await prisma.sitePage.findMany({
      orderBy: [{ createdAt: "asc" }],
    });
  } catch {
    return [];
  }
}

export async function getSitePageBySlug(slug: string) {
  try {
    return await prisma.sitePage.findUnique({
      where: { slug },
    });
  } catch {
    return null;
  }
}
