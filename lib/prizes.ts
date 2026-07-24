import { put, list } from "@vercel/blob";
import type { Prize } from "@/app/types";
import { defaultPrizes, normalizeList } from "@/lib/prize-logic";

// Blob-backed storage for prizes. Pure helpers live in "@/lib/prize-logic".
export { defaultPrizes, normalizeList, normalizePrize, isAvailable, pickWeightedWinner } from "@/lib/prize-logic";

export async function readPrizes(prizesKey: string, themeId: string): Promise<Prize[]> {
  const { blobs } = await list({ prefix: prizesKey });
  if (blobs.length === 0) return defaultPrizes(themeId);
  const res = await fetch(blobs[0].downloadUrl, {
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
    cache: "no-store",
  });
  return normalizeList(await res.json());
}

export async function writePrizes(prizesKey: string, prizes: Prize[]): Promise<void> {
  await put(prizesKey, JSON.stringify(prizes), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    // Don't let the Blob CDN cache the prizes file — otherwise an overwrite
    // (a decrement) isn't visible on the next read and the stock appears not to
    // drop. With max-age 0 each read revalidates against the latest version.
    cacheControlMaxAge: 0,
  });
}
