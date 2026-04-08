import { prisma } from "@/lib/prisma";

const DEFAULT_MENUS = [
  { name: "Inicio", href: "/", order: 0, enabled: true, submenus: [] },
  { name: "Tienda", href: "/products", order: 1, enabled: true, submenus: [] },
];

function dedupeMenus<T extends { name: string; href: string }>(menus: T[]) {
  const seen = new Set<string>();

  return menus.filter((menu) => {
    const key = `${menu.name}::${menu.href}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export async function ensureDefaultSiteMenus() {
  for (const menu of DEFAULT_MENUS) {
    const existing = await prisma.siteMenu.findFirst({
      where: {
        name: menu.name,
        href: menu.href,
      },
      select: { id: true },
    });

    if (existing) {
      continue;
    }

    await prisma.siteMenu.create({
      data: {
        name: menu.name,
        href: menu.href,
        order: menu.order,
        enabled: menu.enabled,
      },
    });
  }
}

export async function getGlobalMenus() {
  await ensureDefaultSiteMenus();

  const menus = await prisma.siteMenu.findMany({
    where: { enabled: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: {
      submenus: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  return dedupeMenus(menus);
}

export async function getAdminMenus() {
  await ensureDefaultSiteMenus();

  const menus = await prisma.siteMenu.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: {
      submenus: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  return dedupeMenus(menus);
}
