import { prisma } from "@/lib/prisma";

let ensureProductViewsTablePromise: Promise<void> | null = null;

async function ensureProductViewsTable() {
  if (!ensureProductViewsTablePromise) {
    ensureProductViewsTablePromise = (async () => {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ProductViewStat" (
          "productId" TEXT PRIMARY KEY REFERENCES "Product"("id") ON DELETE CASCADE,
          "viewCount" INTEGER NOT NULL DEFAULT 0,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "ProductViewStat_viewCount_idx"
        ON "ProductViewStat" ("viewCount" DESC, "updatedAt" DESC)
      `);
    })().catch((error) => {
      ensureProductViewsTablePromise = null;
      throw error;
    });
  }

  return ensureProductViewsTablePromise;
}

export async function trackProductView(productId: string) {
  await ensureProductViewsTable();

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO "ProductViewStat" ("productId", "viewCount", "updatedAt")
      VALUES ($1, 1, CURRENT_TIMESTAMP)
      ON CONFLICT ("productId")
      DO UPDATE SET
        "viewCount" = "ProductViewStat"."viewCount" + 1,
        "updatedAt" = CURRENT_TIMESTAMP
    `,
    productId,
  );
}

export async function getMostViewedProductIds(limit = 8) {
  await ensureProductViewsTable();

  const rows = await prisma.$queryRawUnsafe<Array<{ productId: string }>>(
    `
      SELECT "productId"
      FROM "ProductViewStat"
      ORDER BY "viewCount" DESC, "updatedAt" DESC
      LIMIT $1
    `,
    limit,
  );

  return rows.map((row) => row.productId);
}
