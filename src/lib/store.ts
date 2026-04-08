import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

function serializeProduct<T extends {
  price: unknown;
  compareAtPrice?: unknown;
  variants: Array<{ priceDelta: unknown }>;
}>(product: T) {
  return {
    ...product,
    price: Number(product.price),
    compareAtPrice:
      product.compareAtPrice === null || product.compareAtPrice === undefined
        ? null
        : Number(product.compareAtPrice),
    variants: product.variants.map((variant) => ({
      ...variant,
      priceDelta: Number(variant.priceDelta),
    })),
  };
}

export async function getCategoryTree() {
  const categories = await prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
    include: {
      children: {
        orderBy: { name: "asc" },
      },
    },
  });

  return categories.filter((category) => !category.parentId);
}

export async function getHomeData() {
  const [slides, featuredProducts, latestProducts, bestSelling, categories] =
    await Promise.all([
      prisma.slide.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE", isFeatured: true },
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          variants: true,
          category: true,
        },
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          variants: true,
          category: true,
        },
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        take: 6,
        orderBy: {
          orderItems: {
            _count: "desc",
          },
        },
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          variants: true,
          category: true,
        },
      }),
      getCategoryTree(),
    ]);

  return {
    slides,
    featuredProducts: featuredProducts.map(serializeProduct),
    latestProducts: latestProducts.map(serializeProduct),
    bestSelling: bestSelling.map(serializeProduct),
    categories,
  };
}

export async function getProducts(filters?: {
  category?: string;
  search?: string;
}) {
  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
  };

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { brand: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters?.category) {
    const category = await prisma.category.findUnique({
      where: { slug: filters.category },
      include: { children: true },
    });

    if (category) {
      where.categoryId = {
        in: [category.id, ...category.children.map((child) => child.id)],
      };
    }
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: true,
      category: true,
    },
  });

  return products.map(serializeProduct);
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { name: "asc" } },
      category: true,
    },
  });

  if (!product) {
    return null;
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      categoryId: product.categoryId,
      status: "ACTIVE",
    },
    take: 4,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: true,
      category: true,
    },
  });

  return {
    product: serializeProduct(product),
    relatedProducts: relatedProducts.map(serializeProduct),
  };
}

export async function getAdminDashboardData(from?: string, to?: string) {
  const startDate = from ? new Date(`${from}T00:00:00`) : undefined;
  const endDate = to ? new Date(`${to}T23:59:59`) : undefined;

  const where =
    startDate || endDate
      ? {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }
      : undefined;

  const [orders, productCount, userCount, categoryCount] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count(),
    prisma.user.count(),
    prisma.category.count(),
  ]);

  const totalSales = orders.reduce((sum, order) => sum + Number(order.total), 0);
  const totalOrders = orders.length;

  const salesByDay = Object.values(
    orders.reduce<Record<string, { date: string; total: number; orders: number }>>(
      (acc, order) => {
        const key = order.createdAt.toISOString().slice(0, 10);
        if (!acc[key]) {
          acc[key] = { date: key, total: 0, orders: 0 };
        }
        acc[key].total += Number(order.total);
        acc[key].orders += 1;
        return acc;
      },
      {},
    ),
  ).sort((a, b) => a.date.localeCompare(b.date));

  return {
    orders,
    metrics: {
      totalSales,
      totalOrders,
      productCount,
      userCount,
      categoryCount,
    },
    salesByDay,
  };
}
