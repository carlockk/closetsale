const AUTH_SECRET_FALLBACK = "closetsale-dev-secret";

export function getAuthSecret() {
  if (process.env.AUTH_SECRET) {
    return process.env.AUTH_SECRET;
  }

  if (process.env.NODE_ENV !== "production") {
    return AUTH_SECRET_FALLBACK;
  }

  throw new Error("AUTH_SECRET is required in production.");
}
