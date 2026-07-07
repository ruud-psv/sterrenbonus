import { list } from "@vercel/blob";
import { unstable_noStore as noStore } from "next/cache";
import type { ThemeOverrides } from "@/lib/themes";

export async function readThemeOverrides(themeId: string): Promise<ThemeOverrides> {
  noStore();
  try {
    const key = `theme-overrides-${themeId}.json`;
    const { blobs } = await list({ prefix: key });
    if (blobs.length === 0) return {};
    const res = await fetch(blobs[0].downloadUrl, {
      headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
      cache: "no-store",
    });
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}
