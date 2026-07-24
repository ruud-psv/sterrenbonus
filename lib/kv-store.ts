import { Redis } from "@upstash/redis";
import type { Prize } from "@/app/types";

// Atomic stock counters in Redis (Vercel KV / Upstash). This is the reliable
// live counter: Blob is only eventually-consistent, so it lost/duplicated
// decrements. When no Redis credentials are present the whole module no-ops and
// the app falls back to the Blob counter (see lib/prizes.ts).
//
// Find the Redis REST credentials. Handles the plain Vercel-KV / Upstash names
// as well as a custom prefix (e.g. STORAGE_KV_REST_API_URL) that the Vercel
// Marketplace flow adds. We only match the HTTPS *REST* URL vars (never the TCP
// REDIS_URL), so the @upstash/redis REST client always gets a usable endpoint.
function findRestCredentials(): { url: string; token: string } | null {
  const direct = (u?: string, t?: string) => (u && t ? { url: u, token: t } : null);
  const known =
    direct(process.env.KV_REST_API_URL, process.env.KV_REST_API_TOKEN) ??
    direct(process.env.UPSTASH_REDIS_REST_URL, process.env.UPSTASH_REDIS_REST_TOKEN);
  if (known) return known;

  // Prefixed variants: any *REST_API_URL / *REDIS_REST_URL with a sibling token.
  for (const [key, value] of Object.entries(process.env)) {
    if (!value) continue;
    if (!/(REST_API_URL|REDIS_REST_URL)$/.test(key)) continue;
    const token = process.env[key.replace(/URL$/, "TOKEN")];
    if (token) return { url: value, token };
  }
  return null;
}

function getRedis(): Redis | null {
  const creds = findRestCredentials();
  return creds ? new Redis(creds) : null;
}

const redis = getRedis();

export function kvEnabled(): boolean {
  return redis !== null;
}

function stockKey(themeId: string, prizeId: string): string {
  return `stock:${themeId}:${prizeId}`;
}

/**
 * Overlay the live per-prize stock from Redis onto Blob-read prize definitions.
 * Only finite-stock prizes get a counter; unlimited (stock === null) prizes are
 * left untouched. Missing counters are lazily seeded from the definition's
 * stock, so enabling KV auto-initialises from the current data.
 */
export async function overlayStock(themeId: string, prizes: Prize[]): Promise<Prize[]> {
  if (!redis) return prizes;
  const finite = prizes.filter((p) => p.stock !== null);
  if (finite.length === 0) return prizes;

  const keys = finite.map((p) => stockKey(themeId, p.id));
  const values = await redis.mget<(number | null)[]>(...keys);

  const seed: Record<string, number> = {};
  const byId = new Map(prizes.map((p) => [p.id, { ...p }]));
  finite.forEach((p, i) => {
    const v = values[i];
    const target = byId.get(p.id)!;
    if (v === null || v === undefined) {
      const initial = p.stock as number;
      seed[stockKey(themeId, p.id)] = initial;
      target.stock = initial;
    } else {
      target.stock = Number(v);
    }
  });
  if (Object.keys(seed).length > 0) await redis.mset(seed);

  return prizes.map((p) => byId.get(p.id)!);
}

/** Set the counters to match these prizes (admin save / seed / reset). */
export async function syncStock(themeId: string, prizes: Prize[]): Promise<void> {
  if (!redis) return;
  const finite = prizes.filter((p) => p.stock !== null);
  if (finite.length === 0) return;
  const obj: Record<string, number> = {};
  for (const p of finite) obj[stockKey(themeId, p.id)] = p.stock as number;
  await redis.mset(obj);
}

/**
 * Atomically claim one unit of a prize. Returns the new remaining count, or
 * null if it was already sold out (the decrement is rolled back). This is what
 * guarantees a prize — including a 1-of-a-kind premium — is never given out
 * more than its stock, even with two kiosks drawing at the same instant.
 */
export async function claimOne(themeId: string, prizeId: string): Promise<number | null> {
  if (!redis) return null;
  const key = stockKey(themeId, prizeId);
  const remaining = await redis.decr(key);
  if (remaining < 0) {
    await redis.incr(key);
    return null;
  }
  return remaining;
}
