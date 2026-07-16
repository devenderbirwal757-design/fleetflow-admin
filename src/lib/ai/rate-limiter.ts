const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

interface WindowEntry {
  count: number;
  resetAt: number;
}

const windows = new Map<string, WindowEntry>();

export function checkRateLimit(key: string = "default"): {
  allowed: boolean;
  remaining: number;
  resetIn: number;
} {
  const now = Date.now();
  const entry = windows.get(key);

  if (!entry || now >= entry.resetAt) {
    windows.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetIn: WINDOW_MS };
  }

  if (entry.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetAt - now,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: MAX_REQUESTS - entry.count,
    resetIn: entry.resetAt - now,
  };
}

export function getRateLimitStatus(key: string = "default") {
  const entry = windows.get(key);
  if (!entry) {
    return { remaining: MAX_REQUESTS, resetIn: 0 };
  }
  const now = Date.now();
  if (now >= entry.resetAt) {
    windows.delete(key);
    return { remaining: MAX_REQUESTS, resetIn: 0 };
  }
  return { remaining: MAX_REQUESTS - entry.count, resetIn: entry.resetAt - now };
}
