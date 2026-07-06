import { NextResponse } from "next/server";
import { put, list } from "@vercel/blob";
import type { ThemeOverrides } from "@/lib/themes";

function overridesKey(themeId: string) {
  return `theme-overrides-${themeId}.json`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const themeId = searchParams.get("theme") ?? "psv";

  try {
    const key = overridesKey(themeId);
    const { blobs } = await list({ prefix: key });
    if (blobs.length === 0) return NextResponse.json({});
    const res = await fetch(blobs[0].downloadUrl, {
      headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
      cache: "no-store",
    });
    return NextResponse.json(await res.json());
  } catch (err) {
    console.error("Failed to read theme overrides:", err);
    return NextResponse.json({});
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const themeId = searchParams.get("theme") ?? "psv";

  try {
    const body: unknown = await request.json();
    const overrides = body as ThemeOverrides;

    await put(overridesKey(themeId), JSON.stringify(overrides), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Failed to save theme overrides:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
