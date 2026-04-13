import { Prisma } from "@/generated/prisma/client";
import { getMostViewedProductIds } from "@/lib/product-views";
import { prisma } from "@/lib/prisma";

const storeProductInclude = {
  images: { orderBy: { sortOrder: "asc" }, take: 1 },
  variants: true,
  category: true,
  seller: {
    select: {
      id: true,
      storeName: true,
      slug: true,
    },
  },
} satisfies Prisma.ProductInclude;

type StoreProductRecord = Prisma.ProductGetPayload<{
  include: typeof storeProductInclude;
}>;

type SerializedProduct<T extends {
  price: unknown;
  compareAtPrice?: unknown;
  variants: Array<{ priceDelta: unknown }>;
}> = Omit<T, "price" | "compareAtPrice" | "variants"> & {
  price: number;
  compareAtPrice: number | null;
  variants: Array<Omit<T["variants"][number], "priceDelta"> & { priceDelta: number }>;
};

function serializeProduct<T extends {
  price: unknown;
  compareAtPrice?: unknown;
  variants: Array<{ priceDelta: unknown }>;
}>(product: T): SerializedProduct<T> {
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
  } as SerializedProduct<T>;
}

function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

type StoreProduct = SerializedProduct<StoreProductRecord>;

const productDetailInclude = {
  images: { orderBy: { sortOrder: "asc" } },
  variants: { orderBy: { name: "asc" } },
  category: true,
  seller: {
    select: {
      id: true,
      storeName: true,
      slug: true,
      description: true,
      logoUrl: true,
    },
  },
} satisfies Prisma.ProductInclude;

type ProductDetailRecord = Prisma.ProductGetPayload<{
  include: typeof productDetailInclude;
}>;

type ProductDetail = SerializedProduct<ProductDetailRecord>;

function serializeStoreProduct(product: StoreProductRecord): StoreProduct {
  return serializeProduct(product);
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
  const [slides, featuredProducts, latestProducts, bestSelling, categories, mostViewedIds, topSellers] =
    await Promise.all([
      prisma.slide.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE", isFeatured: true },
        take: 8,
        orderBy: { createdAt: "desc" },
        include: storeProductInclude,
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        take: 8,
        orderBy: { createdAt: "desc" },
        include: storeProductInclude,
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        take: 6,
        orderBy: {
          orderItems: {
            _count: "desc",
          },
        },
        include: storeProductInclude,
      }),
      getCategoryTree(),
      getMostViewedProductIds(8),
      prisma.sellerProfile.findMany({
        where: { status: "ACTIVE" },
        take: 4,
        orderBy: [
          {
            sellerOrders: {
              _count: "desc",
            },
          },
          {
            products: {
              _count: "desc",
            },
          },
          { createdAt: "desc" },
        ],
        select: {
          id: true,
          storeName: true,
          slug: true,
          description: true,
          logoUrl: true,
          createdAt: true,
          products: {
            where: { status: "ACTIVE" },
            select: { id: true },
          },
          sellerOrders: {
            select: {
              id: true,
              netAmount: true,
            },
          },
        },
      }),
    ]);

  const mostViewedProducts: StoreProductRecord[] = mostViewedIds.length
    ? await prisma.product.findMany({
        where: {
          status: "ACTIVE",
          id: {
            in: mostViewedIds,
          },
        },
        include: storeProductInclude,
      })
    : [];

  const mostViewedById = new Map(
    mostViewedProducts.map((product) => [product.id, serializeStoreProduct(product)]),
  );

  return {
    slides,
    featuredProducts: featuredProducts.map(serializeStoreProduct),
    latestProducts: latestProducts.map(serializeStoreProduct),
    bestSelling: bestSelling.map(serializeStoreProduct),
    mostViewed: mostViewedIds
      .map((id) => mostViewedById.get(id))
      .filter(isPresent),
    topSellers: topSellers.map((seller) => ({
      id: seller.id,
      storeName: seller.storeName,
      slug: seller.slug,
      description: seller.description,
      logoUrl: seller.logoUrl,
      createdAt: seller.createdAt,
      metrics: {
        products: seller.products.length,
        orders: seller.sellerOrders.length,
        netAmount: seller.sellerOrders.reduce(
          (sum, order) => sum + Number(order.netAmount),
          0,
        ),
      },
    })),
    categories,
  };
}

export async function getProducts(filters?: {
  category?: string;
  search?: string;
  seller?: string;
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

  if (filters?.seller) {
    const seller = await prisma.sellerProfile.findUnique({
      where: { slug: filters.seller },
      select: { id: true, status: true },
    });

    where.sellerId = seller?.status === "ACTIVE" ? seller.id : "__no_match__";
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: storeProductInclude,
  });

  return products.map(serializeStoreProduct);
}

export async function getSellerBySlug(slug: string) {
  return prisma.sellerProfile.findUnique({
    where: { slug },
    select: {
      id: true,
      storeName: true,
      slug: true,
      status: true,
    },
  });
}

export async function getPublicSellerStore(slug: string) {
  const seller = await prisma.sellerProfile.findUnique({
    where: { slug },
    select: {
      id: true,
      storeName: true,
      slug: true,
      description: true,
      logoUrl: true,
      coverUrl: true,
      status: true,
      createdAt: true,
    },
  });

  if (!seller || seller.status !== "ACTIVE") {
    return null;
  }

  const [productCount, sellerOrderCount, products] = await Promise.all([
    prisma.product.count({
      where: {
        status: "ACTIVE",
        sellerId: seller.id,
      },
    }),
    prisma.sellerOrder.count({
      where: {
        sellerId: seller.id,
      },
    }),
    prisma.product.findMany({
      where: {
        status: "ACTIVE",
        sellerId: seller.id,
      },
      orderBy: { createdAt: "desc" },
      include: storeProductInclude,
    }),
  ]);

  return {
    seller: {
      ...seller,
      metrics: {
        products: productCount,
        sellerOrders: sellerOrderCount,
      },
    },
    products: products.map(serializeStoreProduct),
  };
}

export async function getProductBySlug(
  slug: string,
): Promise<{
  product: ProductDetail;
  moreFromSeller: StoreProduct[];
  relatedProducts: StoreProduct[];
  recommendedProducts: StoreProduct[];
} | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: productDetailInclude,
  });

  if (!product) {
    return null;
  }

  const [relatedProducts, moreFromSeller, mostViewedIds] = await Promise.all([
    prisma.product.findMany({
      where: {
        id: { not: product.id },
        categoryId: product.categoryId,
        status: "ACTIVE",
      },
      take: 4,
      include: storeProductInclude,
    }),
    product.sellerId
      ? prisma.product.findMany({
          where: {
            id: { not: product.id },
            sellerId: product.sellerId,
            status: "ACTIVE",
          },
          take: 4,
          orderBy: { createdAt: "desc" },
          include: storeProductInclude,
        })
      : Promise.resolve([]),
    getMostViewedProductIds(16),
  ]);

  const excludedIds = new Set([
    product.id,
    ...relatedProducts.map((item) => item.id),
    ...moreFromSeller.map((item) => item.id),
  ]);

  const recommendedMostViewedCandidates = mostViewedIds.filter((id) => !excludedIds.has(id)).slice(0, 8);
  const recommendedMostViewedProducts: StoreProductRecord[] = recommendedMostViewedCandidates.length
    ? await prisma.product.findMany({
        where: {
          status: "ACTIVE",
          id: {
            in: recommendedMostViewedCandidates,
          },
        },
        include: storeProductInclude,
      })
    : [];

  const recommendedById = new Map(
    recommendedMostViewedProducts.map((item) => [item.id, serializeStoreProduct(item)]),
  );

  return {
    product: serializeProduct(product),
    moreFromSeller: moreFromSeller.map(serializeStoreProduct),
    relatedProducts: relatedProducts.map(serializeStoreProduct),
    recommendedProducts: recommendedMostViewedCandidates
      .map((id) => recommendedById.get(id))
      .filter(isPresent),
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

  const paidOrders = orders.filter((order) => order.status === "PAID");
  const totalSales = paidOrders.reduce((sum, order) => sum + Number(order.total), 0);
  const totalOrders = orders.length;

  const salesByDay = Object.values(
    paidOrders.reduce<Record<string, { date: string; total: number; orders: number }>>(
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
