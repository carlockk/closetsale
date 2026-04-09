"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { Prisma } from "@/generated/prisma/client";
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
