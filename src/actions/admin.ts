"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth";
import { getDefaultCommissionRate } from "@/lib/marketplace";
import { prisma } from "@/lib/prisma";
import {
  getActivePayoutStatuses,
  isActivePayoutStatus,
  isSellerOrderEligibleForPayout,
} from "@/lib/seller-finance";
import { safeSlug } from "@/lib/utils";
import {
  categorySchema,
  orderStatusSchema,
  productSchema,
  payoutStatusSchema,
  sellerStatusSchema,
  sellerOrderStatusSchema,
  sitePageSchema,
  slideSchema,
  userSchema,
} from "@/lib/validations";

function parseJsonArray(rawValue: FormDataEntryValue | null) {
  try {
    const parsed = JSON.parse(String(rawValue || "[]"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildAdminCategoriesHref(params: Record<string, string | null | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  return query.size ? `/admin/categories?${query.toString()}` : "/admin/categories";
}

function getCategoryErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return "Ya existe una categoria con ese slug";
  }

  return fallback;
}

async function validateCategoryParent(parentId: string) {
  const parent = await prisma.category.findUnique({
    where: { id: parentId },
    select: { id: true, parentId: true },
  });

  if (!parent) {
    return { valid: false, message: "La categoria padre no existe" as const };
  }

  if (parent.parentId) {
    return { valid: false, message: "Solo puedes asignar categorias padre de nivel raiz" as const };
  }

  return { valid: true, parent };
}

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") || "");
  const parsed = categorySchema.safeParse({
    name,
    slug: String(formData.get("slug") || safeSlug(name)),
    description: String(formData.get("description") || ""),
    parentId: String(formData.get("parentId") || ""),
  });

  if (!parsed.success) {
    redirect("/admin/categories?message=No se pudo crear la categoria");
  }

  if (parsed.data.parentId) {
    const parentValidation = await validateCategoryParent(parsed.data.parentId);

    if (!parentValidation.valid) {
      redirect(buildAdminCategoriesHref({ create: "1", message: parentValidation.message }));
    }
  }

  try {
    await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug: safeSlug(parsed.data.slug),
        description: parsed.data.description || null,
        parentId: parsed.data.parentId || null,
      },
    });
  } catch (error) {
    redirect(
      buildAdminCategoriesHref({
        create: "1",
        message: getCategoryErrorMessage(error, "No se pudo crear la categoria"),
      }),
    );
  }

  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/admin/categories?message=Categoria creada");
}

export async function updateCategoryAction(formData: FormData) {
  await requireAdmin();

  const categoryId = String(formData.get("categoryId") || "");
  const name = String(formData.get("name") || "");
  const parsed = categorySchema.safeParse({
    name,
    slug: String(formData.get("slug") || safeSlug(name)),
    description: String(formData.get("description") || ""),
    parentId: String(formData.get("parentId") || ""),
  });

  if (!categoryId || !parsed.success) {
    redirect(
      buildAdminCategoriesHref({
        edit: categoryId,
        message: "No se pudo actualizar la categoria",
      }),
    );
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: {
      id: true,
      slug: true,
      parentId: true,
      children: { select: { id: true } },
      _count: { select: { children: true } },
    },
  });

  if (!category) {
    redirect("/admin/categories?message=Categoria no encontrada");
  }

  const nextParentId = parsed.data.parentId || null;

  if (nextParentId === category.id) {
    redirect(
      buildAdminCategoriesHref({
        edit: categoryId,
        message: "Una categoria no puede ser su propia categoria padre",
      }),
    );
  }

  if (nextParentId) {
    const parentValidation = await validateCategoryParent(nextParentId);

    if (!parentValidation.valid) {
      redirect(buildAdminCategoriesHref({ edit: categoryId, message: parentValidation.message }));
    }

    if (category.children.some((child) => child.id === nextParentId)) {
      redirect(
        buildAdminCategoriesHref({
          edit: categoryId,
          message: "No puedes convertir una categoria hija en su propia categoria padre",
        }),
      );
    }
  }

  if (nextParentId && category._count.children > 0) {
    redirect(
      buildAdminCategoriesHref({
        edit: categoryId,
        message: "Primero mueve o elimina las subcategorias antes de volver esta categoria hija",
      }),
    );
  }

  try {
    await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: parsed.data.name,
        slug: safeSlug(parsed.data.slug),
        description: parsed.data.description || null,
        parentId: nextParentId,
      },
    });
  } catch (error) {
    redirect(
      buildAdminCategoriesHref({
        edit: categoryId,
        message: getCategoryErrorMessage(error, "No se pudo actualizar la categoria"),
      }),
    );
  }

  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath(`/products?category=${category.slug}`);
  revalidatePath(`/products?category=${safeSlug(parsed.data.slug)}`);
  redirect("/admin/categories?message=Categoria actualizada");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();

  const categoryId = String(formData.get("categoryId") || "");

  if (!categoryId) {
    redirect("/admin/categories?message=No se pudo eliminar la categoria");
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: {
      id: true,
      slug: true,
      _count: {
        select: {
          children: true,
          products: true,
        },
      },
    },
  });

  if (!category) {
    redirect("/admin/categories?message=Categoria no encontrada");
  }

  if (category._count.children > 0) {
    redirect("/admin/categories?message=No puedes eliminar una categoria que todavia tiene subcategorias");
  }

  if (category._count.products > 0) {
    redirect("/admin/categories?message=No puedes eliminar una categoria que todavia tiene productos");
  }

  await prisma.category.delete({
    where: { id: categoryId },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath(`/products?category=${category.slug}`);
  redirect("/admin/categories?message=Categoria eliminada");
}

export async function createUserAction(formData: FormData) {
  await requireAdmin();

  const parsed = userSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    redirect("/admin/users?message=No se pudo crear el usuario");
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  try {
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        role: parsed.data.role,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirect("/admin/users?message=El correo ya existe");
    }

    redirect("/admin/users?message=No se pudo crear el usuario");
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?message=Usuario creado");
}

export async function createSlideAction(formData: FormData) {
  await requireAdmin();

  const parsed = slideSchema.safeParse({
    title: formData.get("title"),
    subtitle: formData.get("subtitle"),
    imageUrl: formData.get("imageUrl"),
    href: formData.get("href"),
    sortOrder: formData.get("sortOrder"),
  });

  if (!parsed.success) {
    redirect("/admin/slider?message=No se pudo crear el slide");
  }

  await prisma.slide.create({
    data: {
      title: parsed.data.title,
      subtitle: parsed.data.subtitle || null,
      imageUrl: parsed.data.imageUrl,
      href: parsed.data.href || null,
      sortOrder: parsed.data.sortOrder,
      isActive: true,
    },
  });

  revalidatePath("/admin/slider");
  revalidatePath("/");
  redirect("/admin/slider?message=Slide creado");
}

export async function createSitePageAction(formData: FormData) {
  await requireAdmin();

  const parsed = sitePageSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: String(formData.get("excerpt") || ""),
    content: formData.get("content"),
    isPublished: formData.get("isPublished") === "on",
  });

  if (!parsed.success) {
    redirect("/admin/pages?message=No se pudo crear la pagina");
  }

  try {
    await prisma.sitePage.create({
      data: {
        title: parsed.data.title,
        slug: safeSlug(parsed.data.slug),
        excerpt: parsed.data.excerpt || null,
        content: parsed.data.content,
        isPublished: parsed.data.isPublished,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirect("/admin/pages?message=Ya existe una pagina con ese slug");
    }

    redirect("/admin/pages?message=No se pudo crear la pagina");
  }

  revalidatePath("/admin/pages");
  revalidatePath("/");
  redirect("/admin/pages?message=Pagina creada");
}

export async function updateSitePageAction(formData: FormData) {
  await requireAdmin();

  const pageId = String(formData.get("pageId") || "");
  const previousSlug = String(formData.get("previousSlug") || "");
  const parsed = sitePageSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: String(formData.get("excerpt") || ""),
    content: formData.get("content"),
    isPublished: formData.get("isPublished") === "on",
  });

  if (!pageId || !parsed.success) {
    redirect(`/admin/pages?edit=${pageId}&message=No se pudo actualizar la pagina`);
  }

  try {
    await prisma.sitePage.update({
      where: { id: pageId },
      data: {
        title: parsed.data.title,
        slug: safeSlug(parsed.data.slug),
        excerpt: parsed.data.excerpt || null,
        content: parsed.data.content,
        isPublished: parsed.data.isPublished,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirect(`/admin/pages?edit=${pageId}&message=Ya existe una pagina con ese slug`);
    }

    redirect(`/admin/pages?edit=${pageId}&message=No se pudo actualizar la pagina`);
  }

  revalidatePath("/admin/pages");
  revalidatePath("/");
  if (previousSlug) {
    revalidatePath(`/pages/${previousSlug}`);
  }
  revalidatePath(`/pages/${safeSlug(parsed.data.slug)}`);
  redirect("/admin/pages?message=Pagina actualizada");
}

export async function deleteSitePageAction(formData: FormData) {
  await requireAdmin();

  const pageId = String(formData.get("pageId") || "");

  if (!pageId) {
    redirect("/admin/pages?message=No se pudo eliminar la pagina");
  }

  const page = await prisma.sitePage.findUnique({
    where: { id: pageId },
    select: { slug: true },
  });

  if (!page) {
    redirect("/admin/pages?message=Pagina no encontrada");
  }

  await prisma.sitePage.delete({
    where: { id: pageId },
  });

  revalidatePath("/admin/pages");
  revalidatePath("/");
  revalidatePath(`/pages/${page.slug}`);
  redirect("/admin/pages?message=Pagina eliminada");
}

export async function createProductAction(formData: FormData) {
  await requireAdmin();

  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || safeSlug(String(formData.get("title") || "")),
    description: formData.get("description"),
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") || undefined,
    brand: formData.get("brand"),
    color: formData.get("color"),
    categoryId: formData.get("categoryId"),
    imageUrls: parseJsonArray(formData.get("imageUrls")),
    variants: parseJsonArray(formData.get("variants")),
  });

  if (!parsed.success) {
    redirect("/admin/products?message=No se pudo crear el producto");
  }

  try {
    await prisma.product.create({
      data: {
        title: parsed.data.title,
        slug: safeSlug(parsed.data.slug),
        description: parsed.data.description,
        price: parsed.data.price,
        compareAtPrice: parsed.data.compareAtPrice || null,
        brand: parsed.data.brand || null,
        color: parsed.data.color || null,
        categoryId: parsed.data.categoryId,
        status: "ACTIVE",
        images: {
          create: parsed.data.imageUrls.map((url, index) => ({
            url,
            alt: parsed.data.title,
            sortOrder: index,
          })),
        },
        variants: {
          create: parsed.data.variants,
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirect("/admin/products?message=Ya existe un producto con ese slug o SKU");
    }

    redirect("/admin/products?message=No se pudo crear el producto");
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/admin/products?message=Producto creado");
}

export async function updateProductAction(formData: FormData) {
  await requireAdmin();

  const productId = String(formData.get("productId") || "");

  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || safeSlug(String(formData.get("title") || "")),
    description: formData.get("description"),
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") || undefined,
    brand: formData.get("brand"),
    color: formData.get("color"),
    categoryId: formData.get("categoryId"),
    imageUrls: parseJsonArray(formData.get("imageUrls")),
    variants: parseJsonArray(formData.get("variants")),
  });

  if (!productId || !parsed.success) {
    redirect(`/admin/products?edit=${productId}&message=No se pudo actualizar el producto`);
  }

  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        title: parsed.data.title,
        slug: safeSlug(parsed.data.slug),
        description: parsed.data.description,
        price: parsed.data.price,
        compareAtPrice: parsed.data.compareAtPrice || null,
        brand: parsed.data.brand || null,
        color: parsed.data.color || null,
        categoryId: parsed.data.categoryId,
        images: {
          deleteMany: {},
          create: parsed.data.imageUrls.map((url, index) => ({
            url,
            alt: parsed.data.title,
            sortOrder: index,
          })),
        },
        variants: {
          deleteMany: {},
          create: parsed.data.variants,
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirect(`/admin/products?edit=${productId}&message=Ya existe un producto con ese slug o SKU`);
    }

    redirect(`/admin/products?edit=${productId}&message=No se pudo actualizar el producto`);
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${safeSlug(parsed.data.slug)}`);
  revalidatePath("/");
  redirect("/admin/products?message=Producto actualizado");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();

  const productId = String(formData.get("productId") || "");

  if (!productId) {
    redirect("/admin/products?message=No se pudo eliminar el producto");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });

  if (!product) {
    redirect("/admin/products?message=Producto no encontrado");
  }

  await prisma.product.delete({
    where: { id: productId },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/");
  redirect("/admin/products?message=Producto eliminado");
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();

  const orderId = String(formData.get("orderId") || "");
  const parsed = orderStatusSchema.safeParse(formData.get("status"));

  if (!orderId || !parsed.success) {
    redirect("/admin/orders?message=No se pudo actualizar el pedido");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, orderNumber: true },
  });

  if (!order) {
    redirect("/admin/orders?message=Pedido no encontrado");
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: parsed.data,
      paidAt: parsed.data === "PAID" ? new Date() : null,
      paymentStatusDetail: "Actualizado manualmente desde admin",
    },
  });

  await prisma.sellerOrder.updateMany({
    where: { orderId: order.id },
    data: {
      status:
        parsed.data === "PAID"
          ? "CONFIRMED"
          : parsed.data === "CANCELLED"
            ? "CANCELLED"
            : "PENDING",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/orders");
  revalidatePath(`/orders/${order.orderNumber}`);
  redirect("/admin/orders?message=Pedido actualizado");
}

export async function updateSellerStatusAction(formData: FormData) {
  const admin = await requireAdmin();

  const sellerId = String(formData.get("sellerId") || "");
  const parsed = sellerStatusSchema.safeParse(formData.get("status"));

  if (!sellerId || !parsed.success) {
    redirect("/admin/sellers?message=No se pudo actualizar el seller");
  }

  const seller = await prisma.sellerProfile.findUnique({
    where: { id: sellerId },
    select: { id: true, userId: true, slug: true },
  });

  if (!seller) {
    redirect("/admin/sellers?message=Seller no encontrado");
  }

  await prisma.sellerProfile.update({
    where: { id: seller.id },
    data: {
      status: parsed.data,
      approvedAt: parsed.data === "ACTIVE" ? new Date() : null,
      approvedByUserId: parsed.data === "ACTIVE" ? admin.userId : null,
      rejectedAt: parsed.data === "REJECTED" ? new Date() : null,
      rejectedReason:
        parsed.data === "REJECTED"
          ? "Revisado por administracion"
          : null,
    },
  });

  revalidatePath("/admin/sellers");
  revalidatePath("/profile");
  revalidatePath("/seller");
  redirect("/admin/sellers?message=Seller actualizado");
}

export async function updateSellerOrderStatusAction(formData: FormData) {
  await requireAdmin();

  const sellerOrderId = String(formData.get("sellerOrderId") || "");
  const parsed = sellerOrderStatusSchema.safeParse(formData.get("status"));

  if (!sellerOrderId || !parsed.success) {
    redirect("/admin/payouts?message=No se pudo actualizar el estado del pedido seller");
  }

  const sellerOrder = await prisma.sellerOrder.findUnique({
    where: { id: sellerOrderId },
    select: {
      id: true,
      sellerId: true,
      payoutItems: {
        select: {
          payout: {
            select: {
              status: true,
            },
          },
        },
      },
    },
  });

  if (!sellerOrder) {
    redirect("/admin/payouts?message=Pedido seller no encontrado");
  }

  const hasActivePayout = sellerOrder.payoutItems.some((item) =>
    isActivePayoutStatus(item.payout.status),
  );

  if (hasActivePayout) {
    redirect("/admin/payouts?message=No puedes cambiar el estado de un pedido ya incluido en liquidacion");
  }

  await prisma.sellerOrder.update({
    where: { id: sellerOrder.id },
    data: { status: parsed.data },
  });

  revalidatePath("/admin/payouts");
  revalidatePath("/seller");
  revalidatePath("/seller/finanzas");
  redirect("/admin/payouts?message=Estado del pedido seller actualizado");
}

export async function createSellerPayoutAction(formData: FormData) {
  await requireAdmin();

  const sellerId = String(formData.get("sellerId") || "");

  if (!sellerId) {
    redirect("/admin/payouts?message=No se pudo crear la liquidacion");
  }

  const seller = await prisma.sellerProfile.findUnique({
    where: { id: sellerId },
    select: {
      id: true,
      storeName: true,
      payoutAccounts: {
        where: { isDefault: true },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          provider: true,
          accountType: true,
          details: true,
          verifiedAt: true,
        },
      },
      sellerOrders: {
        where: {
          payoutItems: {
            none: {
              payout: {
                status: {
                  in: getActivePayoutStatuses(),
                },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          status: true,
          subtotal: true,
          commissionAmount: true,
          netAmount: true,
          payoutItems: {
            select: {
              payout: {
                select: {
                  status: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!seller) {
    redirect("/admin/payouts?message=Seller no encontrado");
  }

  const defaultAccount = seller.payoutAccounts[0];

  if (!defaultAccount) {
    redirect("/admin/payouts?message=El seller debe registrar una cuenta de cobro");
  }

  if (!defaultAccount.verifiedAt) {
    redirect("/admin/payouts?message=La cuenta de cobro del seller debe estar verificada");
  }

  const eligibleSellerOrders = seller.sellerOrders.filter((order) =>
    isSellerOrderEligibleForPayout(order),
  );

  if (eligibleSellerOrders.length === 0) {
    redirect("/admin/payouts?message=No hay ventas elegibles para liquidar");
  }

  const grossAmount = eligibleSellerOrders.reduce((sum, order) => sum + Number(order.subtotal), 0);
  const commissionAmount = eligibleSellerOrders.reduce(
    (sum, order) => sum + Number(order.commissionAmount),
    0,
  );
  const netAmount = eligibleSellerOrders.reduce((sum, order) => sum + Number(order.netAmount), 0);

  await prisma.$transaction(async (tx) => {
    const payout = await tx.payout.create({
      data: {
        sellerId: seller.id,
        periodStart: eligibleSellerOrders[0]!.createdAt,
        periodEnd: eligibleSellerOrders[eligibleSellerOrders.length - 1]!.createdAt,
        grossAmount,
        commissionAmount,
        netAmount,
        status: "DRAFT",
        provider: defaultAccount.provider,
      },
    });

    await tx.payoutItem.createMany({
      data: eligibleSellerOrders.map((order) => ({
        payoutId: payout.id,
        sellerOrderId: order.id,
        grossAmount: order.subtotal,
        commissionAmount: order.commissionAmount,
        netAmount: order.netAmount,
      })),
    });
  });

  revalidatePath("/admin/payouts");
  revalidatePath("/seller");
  revalidatePath("/seller/finanzas");
  redirect("/admin/payouts?message=Liquidacion creada");
}

export async function updatePayoutStatusAction(formData: FormData) {
  await requireAdmin();

  const payoutId = String(formData.get("payoutId") || "");
  const parsed = payoutStatusSchema.safeParse(formData.get("status"));
  const externalReference = String(formData.get("externalReference") || "").trim();

  if (!payoutId || !parsed.success) {
    redirect("/admin/payouts?message=No se pudo actualizar la liquidacion");
  }

  const payout = await prisma.payout.findUnique({
    where: { id: payoutId },
    select: { id: true, sellerId: true },
  });

  if (!payout) {
    redirect("/admin/payouts?message=Liquidacion no encontrada");
  }

  await prisma.payout.update({
    where: { id: payout.id },
    data: {
      status: parsed.data,
      paidAt: parsed.data === "PAID" ? new Date() : null,
      externalReference: externalReference || null,
    },
  });

  revalidatePath("/admin/payouts");
  revalidatePath("/seller");
  revalidatePath("/seller/finanzas");
  redirect("/admin/payouts?message=Liquidacion actualizada");
}

export async function updateSellerCommissionAction(formData: FormData) {
  await requireAdmin();

  const sellerId = String(formData.get("sellerId") || "");
  const rawRate = String(formData.get("commissionRate") || "").trim();
  const commissionRate = rawRate ? Number(rawRate) : getDefaultCommissionRate();

  if (!sellerId || Number.isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100) {
    redirect("/admin/sellers?message=Comision invalida");
  }

  const seller = await prisma.sellerProfile.findUnique({
    where: { id: sellerId },
    select: { id: true },
  });

  if (!seller) {
    redirect("/admin/sellers?message=Seller no encontrado");
  }

  await prisma.sellerProfile.update({
    where: { id: seller.id },
    data: {
      commissionRate,
    },
  });

  revalidatePath("/admin/sellers");
  revalidatePath("/admin/payouts");
  redirect("/admin/sellers?message=Comision seller actualizada");
}

export async function verifySellerPayoutAccountAction(formData: FormData) {
  await requireAdmin();

  const sellerId = String(formData.get("sellerId") || "");
  const accountId = String(formData.get("accountId") || "");

  if (!sellerId || !accountId) {
    redirect("/admin/sellers?message=No se pudo verificar la cuenta");
  }

  const account = await prisma.sellerPayoutAccount.findFirst({
    where: {
      id: accountId,
      sellerId,
    },
    select: {
      id: true,
    },
  });

  if (!account) {
    redirect("/admin/sellers?message=Cuenta de cobro no encontrada");
  }

  await prisma.sellerPayoutAccount.update({
    where: { id: account.id },
    data: {
      verifiedAt: new Date(),
    },
  });

  revalidatePath("/admin/sellers");
  revalidatePath("/admin/payouts");
  revalidatePath("/seller");
  revalidatePath("/seller/finanzas");
  redirect("/admin/sellers?message=Cuenta de cobro verificada");
}
