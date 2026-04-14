"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireSeller } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { safeSlug } from "@/lib/utils";
import { productSchema, sellerPayoutAccountSchema } from "@/lib/validations";

function parseJsonArray(rawValue: FormDataEntryValue | null) {
  try {
    const parsed = JSON.parse(String(rawValue || "[]"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildSellerProductsHref(params: Record<string, string | null | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  return query.size ? `/seller/products?${query.toString()}` : "/seller/products";
}

function buildSellerOrdersHref(params: Record<string, string | null | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  return query.size ? `/seller/orders?${query.toString()}` : "/seller/orders";
}

export async function createSellerProductAction(formData: FormData) {
  const seller = await requireSeller();

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
    redirect("/seller/products?message=No se pudo crear el producto");
  }

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
      sellerId: seller.id,
      status: "PENDING_REVIEW",
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

  revalidatePath("/seller");
  revalidatePath("/seller/products");
  revalidatePath("/products");
  redirect("/seller/products?message=Producto enviado a revision");
}

export async function updateSellerProductAction(formData: FormData) {
  const seller = await requireSeller();
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
    redirect(buildSellerProductsHref({ edit: productId, message: "No se pudo actualizar el producto" }));
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, sellerId: seller.id },
    select: { id: true, slug: true },
  });

  if (!product) {
    redirect("/seller/products?message=Producto no encontrado");
  }

  await prisma.product.update({
    where: { id: product.id },
    data: {
      title: parsed.data.title,
      slug: safeSlug(parsed.data.slug),
      description: parsed.data.description,
      price: parsed.data.price,
      compareAtPrice: parsed.data.compareAtPrice || null,
      brand: parsed.data.brand || null,
      color: parsed.data.color || null,
      categoryId: parsed.data.categoryId,
      status: "PENDING_REVIEW",
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

  revalidatePath("/seller");
  revalidatePath("/seller/products");
  revalidatePath(`/products/${product.slug}`);
  revalidatePath(`/products/${safeSlug(parsed.data.slug)}`);
  redirect("/seller/products?message=Producto actualizado y reenviado a revision");
}

export async function archiveSellerProductAction(formData: FormData) {
  const seller = await requireSeller();
  const productId = String(formData.get("productId") || "");

  if (!productId) {
    redirect("/seller/products?message=No se pudo archivar el producto");
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, sellerId: seller.id },
    select: { id: true, slug: true, status: true },
  });

  if (!product) {
    redirect("/seller/products?message=Producto no encontrado");
  }

  await prisma.product.update({
    where: { id: product.id },
    data: {
      status: product.status === "ARCHIVED" ? "DRAFT" : "ARCHIVED",
    },
  });

  revalidatePath("/seller");
  revalidatePath("/seller/products");
  revalidatePath(`/products/${product.slug}`);
  redirect(
    `/seller/products?message=${encodeURIComponent(
      product.status === "ARCHIVED" ? "Producto restaurado" : "Producto archivado",
    )}`,
  );
}

export async function activateSellerProductAction(formData: FormData) {
  const seller = await requireSeller();
  const productId = String(formData.get("productId") || "");

  if (!productId) {
    redirect("/seller/products?message=No se pudo activar el producto");
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, sellerId: seller.id },
    select: { id: true, slug: true },
  });

  if (!product) {
    redirect("/seller/products?message=Producto no encontrado");
  }

  await prisma.product.update({
    where: { id: product.id },
    data: { status: "ACTIVE" },
  });

  revalidatePath("/seller");
  revalidatePath("/seller/products");
  revalidatePath("/products");
  revalidatePath(`/products/${product.slug}`);
  redirect("/seller/products?message=Producto activado");
}

export async function upsertSellerPayoutAccountAction(formData: FormData) {
  const seller = await requireSeller();

  const parsed = sellerPayoutAccountSchema.safeParse({
    provider: formData.get("provider"),
    accountType: formData.get("accountType"),
    holderName: formData.get("holderName"),
    accountNumber: formData.get("accountNumber"),
    bankName: formData.get("bankName"),
    email: formData.get("email"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    redirect("/seller/finanzas?message=No se pudo guardar la cuenta de cobro");
  }

  const existingAccount = await prisma.sellerPayoutAccount.findFirst({
    where: { sellerId: seller.id, isDefault: true },
    select: { id: true },
  });

  const data = {
    provider: parsed.data.provider,
    accountType: parsed.data.accountType,
    label: `${parsed.data.bankName} · ${parsed.data.accountNumber.slice(-4)}`,
    details: {
      holderName: parsed.data.holderName,
      accountNumber: parsed.data.accountNumber,
      bankName: parsed.data.bankName,
      email: parsed.data.email || null,
      notes: parsed.data.notes || null,
    },
    isDefault: true,
  };

  if (existingAccount) {
    await prisma.sellerPayoutAccount.update({
      where: { id: existingAccount.id },
      data: {
        ...data,
        verifiedAt: null,
      },
    });
  } else {
    await prisma.sellerPayoutAccount.create({
      data: {
        sellerId: seller.id,
        ...data,
      },
    });
  }

  revalidatePath("/seller");
  revalidatePath("/seller/finanzas");
  revalidatePath("/admin/sellers");
  revalidatePath("/admin/payouts");
  redirect("/seller/finanzas?message=Cuenta de cobro guardada");
}

export async function updateSellerOwnOrderStatusAction(formData: FormData) {
  const seller = await requireSeller();

  const sellerOrderId = String(formData.get("sellerOrderId") || "");
  const nextStatus = String(formData.get("status") || "");
  const currentStatus = String(formData.get("currentStatus") || "");
  const statusFilter = String(formData.get("statusFilter") || "");

  const allowedTransitions: Record<string, string[]> = {
    CONFIRMED: ["PREPARING"],
    PREPARING: ["SHIPPED"],
    SHIPPED: [],
  };

  if (!sellerOrderId || !nextStatus || !currentStatus) {
    redirect(buildSellerOrdersHref({ status: statusFilter, message: "No se pudo actualizar el pedido" }));
  }

  if (!allowedTransitions[currentStatus]?.includes(nextStatus)) {
    redirect(
      buildSellerOrdersHref({
        status: statusFilter,
        message: "Ese cambio de estado no esta permitido para el seller",
      }),
    );
  }

  const sellerOrder = await prisma.sellerOrder.findFirst({
    where: { id: sellerOrderId, sellerId: seller.id },
    select: { id: true, status: true },
  });

  if (!sellerOrder) {
    redirect(buildSellerOrdersHref({ status: statusFilter, message: "Pedido seller no encontrado" }));
  }

  if (sellerOrder.status !== currentStatus) {
    redirect(
      buildSellerOrdersHref({
        status: statusFilter,
        message: "El pedido cambio de estado. Recarga la vista antes de continuar",
      }),
    );
  }

  await prisma.sellerOrder.update({
    where: { id: sellerOrder.id },
    data: { status: nextStatus as "PREPARING" | "SHIPPED" },
  });

  revalidatePath("/seller");
  revalidatePath("/seller/orders");
  revalidatePath("/seller/finanzas");
  revalidatePath("/admin/payouts");
  redirect(buildSellerOrdersHref({ status: statusFilter, message: "Estado de pedido actualizado" }));
}
