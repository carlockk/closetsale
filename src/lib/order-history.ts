import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type Viewer = {
  userId?: string | null;
  email?: string | null;
};

export async function getOrdersForUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      sellerOrders: {
        orderBy: { createdAt: "asc" },
        include: {
          items: {
            orderBy: { id: "asc" },
            include: {
              product: {
                select: {
                  slug: true,
                  images: {
                    orderBy: { sortOrder: "asc" },
                    take: 1,
                    select: {
                      url: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      items: {
        orderBy: { id: "asc" },
        include: {
          product: {
            select: {
              slug: true,
              images: {
                orderBy: { sortOrder: "asc" },
                take: 1,
                select: {
                  url: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function getOrderForViewer(orderNumber: string, viewer: Viewer) {
  if (!viewer.userId && !viewer.email) {
    return null;
  }

  const viewerFilters: Prisma.OrderWhereInput[] = [];

  if (viewer.userId) {
    viewerFilters.push({ userId: viewer.userId });
  }

  if (viewer.email) {
    viewerFilters.push({ customerEmail: viewer.email });
  }

  return prisma.order.findFirst({
    where: {
      orderNumber,
      OR: viewerFilters,
    },
    include: {
      sellerOrders: {
        orderBy: { createdAt: "asc" },
        include: {
          items: {
            orderBy: { id: "asc" },
            include: {
              product: {
                select: {
                  slug: true,
                  images: {
                    orderBy: { sortOrder: "asc" },
                    take: 1,
                    select: {
                      url: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      items: {
        orderBy: { id: "asc" },
        include: {
          product: {
            select: {
              slug: true,
              images: {
                orderBy: { sortOrder: "asc" },
                take: 1,
                select: {
                  url: true,
                },
              },
            },
          },
        },
      },
    },
  });
}
