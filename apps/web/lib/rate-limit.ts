type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number };

type Bucket = {
  timestamps: number[];
};

const buckets = new Map<string, Bucket>();

/**
 * Simple in-memory sliding-window rate limiter (per process).
 * Suitable for local/dev and single-instance deploys.
 */
export function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;
  const bucket = buckets.get(key) ?? { timestamps: [] };

  bucket.timestamps = bucket.timestamps.filter((ts) => ts > cutoff);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    buckets.set(key, bucket);
    return { ok: false, retryAfterSec };
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  return { ok: true };
}
