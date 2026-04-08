"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { safeSlug } from "@/lib/utils";
import {
  categorySchema,
  productSchema,
  sitePageSchema,
  slideSchema,
  userSchema,
} from "@/lib/validations";

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

  await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug: safeSlug(parsed.data.slug),
      description: parsed.data.description || null,
      parentId: parsed.data.parentId || null,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/");
  redirect("/admin/categories?message=Categoria creada");
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
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
    },
  });

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

  await prisma.sitePage.create({
    data: {
      title: parsed.data.title,
      slug: safeSlug(parsed.data.slug),
      excerpt: parsed.data.excerpt || null,
      content: parsed.data.content,
      isPublished: parsed.data.isPublished,
    },
  });

  revalidatePath("/admin/pages");
  revalidatePath("/");
  redirect("/admin/pages?message=Pagina creada");
}

export async function createProductAction(formData: FormData) {
  await requireAdmin();

  const rawImages = String(formData.get("imageUrls") || "[]");
  const rawVariants = String(formData.get("variants") || "[]");

  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || safeSlug(String(formData.get("title") || "")),
    description: formData.get("description"),
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") || undefined,
    brand: formData.get("brand"),
    color: formData.get("color"),
    categoryId: formData.get("categoryId"),
    imageUrls: JSON.parse(rawImages),
    variants: JSON.parse(rawVariants),
  });

  if (!parsed.success) {
    redirect("/admin/products?message=No se pudo crear el producto");
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

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/admin/products?message=Producto creado");
}

export async function updateProductAction(formData: FormData) {
  await requireAdmin();

  const productId = String(formData.get("productId") || "");
  const rawImages = String(formData.get("imageUrls") || "[]");
  const rawVariants = String(formData.get("variants") || "[]");

  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || safeSlug(String(formData.get("title") || "")),
    description: formData.get("description"),
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") || undefined,
    brand: formData.get("brand"),
    color: formData.get("color"),
    categoryId: formData.get("categoryId"),
    imageUrls: JSON.parse(rawImages),
    variants: JSON.parse(rawVariants),
  });

  if (!productId || !parsed.success) {
    redirect(`/admin/products?edit=${productId}&message=No se pudo actualizar el producto`);
  }

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
