"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createSession, clearSession, getCurrentUser } from "@/lib/auth";
import { consumePersistentRateLimit, resetPersistentRateLimit } from "@/lib/persistent-rate-limit";
import { prisma } from "@/lib/prisma";
import { loginSchema, profileSchema, registerSchema } from "@/lib/validations";

const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_ATTEMPT_LIMIT = 5;

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value || "").trim().toLowerCase();
}

async function assertLoginRateLimit(email: string) {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for") || "";
  const ip = forwardedFor.split(",")[0]?.trim() || "unknown";

  const emailRateLimit = await consumePersistentRateLimit(
    `login:email:${email || "unknown"}`,
    LOGIN_ATTEMPT_LIMIT,
    LOGIN_WINDOW_MS,
  );
  const ipRateLimit = await consumePersistentRateLimit(
    `login:ip:${ip}`,
    LOGIN_ATTEMPT_LIMIT * 2,
    LOGIN_WINDOW_MS,
  );

  if (!emailRateLimit.allowed || !ipRateLimit.allowed) {
    redirect("/login?message=Demasiados intentos. Espera unos minutos.");
  }
}

export async function loginAction(formData: FormData) {
  await assertLoginRateLimit(normalizeEmail(formData.get("email")));

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/login?message=Credenciales invalidas");
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (!user) {
    redirect("/login?message=Credenciales invalidas");
  }

  const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);

  if (!isValid) {
    redirect("/login?message=Credenciales invalidas");
  }

  await Promise.all([
    resetPersistentRateLimit(`login:email:${parsed.data.email}`),
    resetPersistentRateLimit(
      `login:ip:${((await headers()).get("x-forwarded-for") || "").split(",")[0]?.trim() || "unknown"}`,
    ),
  ]);

  await createSession({
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    sessionVersion: user.sessionVersion,
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
      sessionVersion: 0,
      role: "USER",
    },
  });

  await createSession({
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    sessionVersion: user.sessionVersion,
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
      sessionVersion: parsed.data.password
        ? {
            increment: 1,
          }
        : undefined,
    },
  });

  await createSession({
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    sessionVersion: user.sessionVersion,
  });

  redirect("/profile?message=Perfil actualizado");
}
