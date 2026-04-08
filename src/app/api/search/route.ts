import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() || "";

  if (query.length < 2) {
    return NextResponse.json({
      products: [],
      pages: [],
      categories: [],
    });
  }

  const [products, pages, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { brand: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.sitePage.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { excerpt: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    }).catch(() => []),
    prisma.category.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 6,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
  ]);

  return NextResponse.json({ products, pages, categories });
}
