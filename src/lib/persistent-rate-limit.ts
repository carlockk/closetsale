import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, resetRateLimit } from "@/lib/rate-limit";

function getExpiryDate(windowMs: number) {
  return new Date(Date.now() + windowMs);
}

function isMissingModelError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2021" || error.code === "P2022")
  );
}

export async function consumePersistentRateLimit(
  key: string,
  limit: number,
  windowMs: number,
) {
  try {
    const now = new Date();
    const existing = await prisma.authRateLimit.findUnique({
      where: { key },
    });

    if (!existing || existing.expiresAt <= now) {
      await prisma.authRateLimit.upsert({
        where: { key },
        create: {
          key,
          count: 1,
          expiresAt: getExpiryDate(windowMs),
        },
        update: {
          count: 1,
          expiresAt: getExpiryDate(windowMs),
        },
      });

      return {
        allowed: true,
        remaining: limit - 1,
        retryAfterSeconds: 0,
      };
    }

    if (existing.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((existing.expiresAt.getTime() - now.getTime()) / 1000),
        ),
      };
    }

    const updated = await prisma.authRateLimit.update({
      where: { key },
      data: {
        count: {
          increment: 1,
        },
      },
      select: {
        count: true,
      },
    });

    return {
      allowed: true,
      remaining: Math.max(0, limit - updated.count),
      retryAfterSeconds: 0,
    };
  } catch (error) {
    if (isMissingModelError(error)) {
      return consumeRateLimit(key, limit, windowMs);
    }

    throw error;
  }
}

export async function resetPersistentRateLimit(key: string) {
  try {
    await prisma.authRateLimit.delete({
      where: { key },
    });
  } catch (error) {
    if (!isMissingModelError(error)) {
      const notFoundError =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";

      if (!notFoundError) {
        throw error;
      }
    }
  }

  resetRateLimit(key);
}
