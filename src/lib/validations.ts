import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Correo invalido"),
  password: z.string().min(6, "Minimo 6 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Ingresa tu nombre"),
  email: z.email("Correo invalido"),
  password: z.string().min(6, "Minimo 6 caracteres"),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.email("Correo invalido"),
  password: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || ""),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  slug: z.string().min(2, "Slug requerido"),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

export const productSchema = z.object({
  title: z.string().min(2, "Titulo requerido"),
  slug: z.string().min(2, "Slug requerido"),
  description: z.string().min(8, "Descripcion requerida"),
  price: z.coerce.number().min(0, "Precio invalido"),
  compareAtPrice: z.coerce.number().optional(),
  brand: z.string().optional(),
  color: z.string().optional(),
  categoryId: z.string().min(1, "Selecciona una categoria"),
  imageUrls: z.array(z.string().url("URL de imagen invalida")).min(1, "Agrega al menos una imagen"),
  variants: z.array(
    z.object({
      name: z.string().min(1, "Nombre requerido"),
      value: z.string().min(1, "Valor requerido"),
      stock: z.coerce.number().min(0, "Stock invalido"),
      priceDelta: z.coerce.number(),
    }),
  ),
});

export const userSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.email("Correo invalido"),
  password: z.string().min(6, "Minimo 6 caracteres"),
  role: z.enum(["ADMIN", "USER"]),
});

export const slideSchema = z.object({
  title: z.string().min(2, "Titulo requerido"),
  subtitle: z.string().optional(),
  imageUrl: z.string().url("Imagen invalida"),
  href: z.string().optional(),
  sortOrder: z.coerce.number().min(0),
});

export const siteMenuSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  href: z.string().min(1, "Enlace requerido"),
  order: z.coerce.number().min(0),
  enabled: z.boolean(),
  submenus: z.array(
    z.object({
      name: z.string().min(1, "Nombre requerido"),
      href: z.string().min(1, "Enlace requerido"),
      order: z.coerce.number().min(0),
    }),
  ),
});

export const socialLinkSchema = z.object({
  platform: z.string().min(2, "Plataforma requerida"),
  href: z.url("Enlace invalido"),
  order: z.coerce.number().min(0),
  enabled: z.boolean(),
});

export const sitePageSchema = z.object({
  title: z.string().min(2, "Titulo requerido"),
  slug: z.string().min(2, "Slug requerido"),
  excerpt: z.string().optional(),
  content: z.string().min(10, "Contenido requerido"),
  isPublished: z.boolean(),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Nombre requerido"),
  customerEmail: z.email("Correo invalido"),
  customerPhone: z.string().optional(),
  shippingAddress: z.string().min(5, "Direccion requerida"),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      quantity: z.coerce.number().min(1),
    }),
  ),
});
