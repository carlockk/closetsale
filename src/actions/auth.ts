"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { createSession, clearSession, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema, profileSchema, registerSchema } from "@/lib/validations";

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/login?message=Datos invalidos");
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (!user) {
    redirect("/login?message=Usuario no encontrado");
  }

  const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);

  if (!isValid) {
    redirect("/login?message=Credenciales invalidas");
  }

  await createSession({
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  });

  redirect(user.role === "ADMIN" ? "/admin" : "/");
}

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/register?message=Datos invalidos");
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existing) {
    redirect("/register?message=El correo ya existe");
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "USER",
    },
  });

  await createSession({
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  });

  redirect("/");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

export async function updateProfileAction(formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?message=Debes iniciar sesion");
  }

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/profile?message=Datos invalidos");
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      email: parsed.data.email,
      id: { not: currentUser.id },
    },
  });

  if (existingUser) {
    redirect("/profile?message=Ese correo ya esta en uso");
  }

  const passwordHash = parsed.data.password
    ? await bcrypt.hash(parsed.data.password, 10)
    : currentUser.passwordHash;

  const user = await prisma.user.update({
    where: { id: currentUser.id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
    },
  });

  await createSession({
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  });

  redirect("/profile?message=Perfil actualizado");
}
