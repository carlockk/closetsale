type RateLimitEntry = {
  count: number;
  expiresAt: number;
};

const rateLimitStore = globalThis as typeof globalThis & {
  __closetsaleRateLimitStore?: Map<string, RateLimitEntry>;
};

function getRateLimitStore() {
  if (!rateLimitStore.__closetsaleRateLimitStore) {
    rateLimitStore.__closetsaleRateLimitStore = new Map();
  }

  return rateLimitStore.__closetsaleRateLimitStore;
}

export function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const store = getRateLimitStore();
  const current = store.get(key);

  if (!current || current.expiresAt <= now) {
    store.set(key, {
      count: 1,
      expiresAt: now + windowMs,
    });

    return {
      allowed: true,
      remaining: limit - 1,
      retryAfterSeconds: 0,
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((current.expiresAt - now) / 1000)),
    };
  }

  current.count += 1;
  store.set(key, current);

  return {
    allowed: true,
    remaining: Math.max(0, limit - current.count),
    retryAfterSeconds: 0,
  };
}

export function resetRateLimit(key: string) {
  const store = getRateLimitStore();
  store.delete(key);
}
