import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma/client";
import { safeSlug } from "../src/lib/utils";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as never);

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@closetsale.cl";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin12345!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Administrador",
      passwordHash,
      role: "ADMIN",
    },
    create: {
      name: "Administrador",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });

  const catalog = [
    { name: "Mujer", children: ["Vestidos", "Poleras", "Jeans"] },
    { name: "Hombre", children: ["Camisas", "Pantalones"] },
    { name: "Accesorios", children: ["Bolsos", "Zapatos"] },
  ];

  const categoryMap = new Map<string, string>();

  for (const item of catalog) {
    const parent = await prisma.category.upsert({
      where: { slug: safeSlug(item.name) },
      update: {},
      create: {
        name: item.name,
        slug: safeSlug(item.name),
      },
    });

    categoryMap.set(item.name, parent.id);

    for (const childName of item.children) {
      const child = await prisma.category.upsert({
        where: { slug: safeSlug(`${item.name}-${childName}`) },
        update: {},
        create: {
          name: childName,
          slug: safeSlug(`${item.name}-${childName}`),
          parentId: parent.id,
        },
      });

      categoryMap.set(childName, child.id);
    }
  }

  const products = [
    {
      title: "Blazer Arena Vintage",
      description:
        "Blazer estructurado con calce relajado, ideal para elevar un look diario con una silueta limpia.",
      price: 32990,
      brand: "Massimo Dutti",
      color: "Arena",
      categoryName: "Vestidos",
      imageUrls: [
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
      ],
      variants: [
        { name: "Talla", value: "S", stock: 2, priceDelta: 0 },
        { name: "Talla", value: "M", stock: 1, priceDelta: 0 },
      ],
      featured: true,
    },
    {
      title: "Polera Blanca Essential",
      description:
        "Polera de algodon suave con caida recta y variantes en talla y color.",
      price: 14990,
      brand: "COS",
      color: "Blanco",
      categoryName: "Poleras",
      imageUrls: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
      ],
      variants: [
        { name: "Talla", value: "S", stock: 4, priceDelta: 0 },
        { name: "Talla", value: "M", stock: 3, priceDelta: 0 },
        { name: "Color", value: "Negro", stock: 2, priceDelta: 1000 },
      ],
      featured: true,
    },
    {
      title: "Jeans Origami Azul",
      description: "Jeans de tiro medio con estructura relajada y tono azul lavado.",
      price: 26990,
      brand: "Levi's",
      color: "Azul",
      categoryName: "Jeans",
      imageUrls: [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=80",
      ],
      variants: [
        { name: "Talla", value: "36", stock: 2, priceDelta: 0 },
        { name: "Talla", value: "38", stock: 2, priceDelta: 0 },
      ],
      featured: false,
    },
    {
      title: "Bolso Cuero Mini",
      description:
        "Bolso pequeno de cuero con correa ajustable y acabado premium.",
      price: 45990,
      brand: "Coach",
      color: "Chocolate",
      categoryName: "Bolsos",
      imageUrls: [
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80",
      ],
      variants: [{ name: "Color", value: "Chocolate", stock: 2, priceDelta: 0 }],
      featured: true,
    },
  ];

  for (const item of products) {
    const slug = safeSlug(item.title);
    const product = await prisma.product.upsert({
      where: { slug },
      update: {
        title: item.title,
        description: item.description,
        price: item.price,
        brand: item.brand,
        color: item.color,
        isFeatured: item.featured,
        status: "ACTIVE",
        categoryId: categoryMap.get(item.categoryName)!,
      },
      create: {
        title: item.title,
        slug,
        description: item.description,
        price: item.price,
        brand: item.brand,
        color: item.color,
        isFeatured: item.featured,
        status: "ACTIVE",
        categoryId: categoryMap.get(item.categoryName)!,
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productVariant.deleteMany({ where: { productId: product.id } });

    await prisma.productImage.createMany({
      data: item.imageUrls.map((url, index) => ({
        productId: product.id,
        url,
        sortOrder: index,
        alt: item.title,
      })),
    });

    await prisma.productVariant.createMany({
      data: item.variants.map((variant) => ({
        productId: product.id,
        name: variant.name,
        value: variant.value,
        stock: variant.stock,
        priceDelta: variant.priceDelta,
      })),
    });
  }

  await prisma.slide.deleteMany();
  await prisma.slide.createMany({
    data: [
      {
        title: "Nueva coleccion curada",
        subtitle: "Prendas seleccionadas con una estetica limpia y editorial.",
        imageUrl:
          "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1600&q=80",
        href: "/products",
        sortOrder: 1,
      },
      {
        title: "Vintage premium",
        subtitle: "Descubre piezas unicas, marcas y colores en tendencia.",
        imageUrl:
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1600&q=80",
        href: "/products?category=mujer",
        sortOrder: 2,
      },
    ],
  });

  const seededProducts = await prisma.product.findMany({ include: { variants: true } });
  const firstProduct = seededProducts[0];
  const secondProduct = seededProducts[1];

  if (firstProduct && secondProduct) {
    await prisma.order.deleteMany();

    await prisma.order.create({
      data: {
        orderNumber: `CS-${Date.now()}`,
        customerName: "Cliente Demo",
        customerEmail: "cliente@demo.cl",
        shippingAddress: "Providencia 1234, Santiago",
        subtotal: 47980,
        total: 47980,
        status: "PAID",
        items: {
          create: [
            {
              title: firstProduct.title,
              quantity: 1,
              unitPrice: 32990,
              lineTotal: 32990,
              productId: firstProduct.id,
              variantId: firstProduct.variants[0]?.id,
            },
            {
              title: secondProduct.title,
              quantity: 1,
              unitPrice: 14990,
              lineTotal: 14990,
              productId: secondProduct.id,
              variantId: secondProduct.variants[0]?.id,
            },
          ],
        },
      },
    });
  }

  console.log("Seed completed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
