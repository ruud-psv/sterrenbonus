import { NextResponse } from "next/server";
import { put, list } from "@vercel/blob";
import type { Prize } from "@/app/types";
import { getTheme } from "@/lib/themes";

const PSV_DEFAULT_PRIZES: Prize[] = [
  { id: "1", name: "Jumbo Bon", active: true },
  { id: "2", name: "XXL Nutrition Bon", active: true },
  { id: "3", name: "Ikigai Bon", active: true },
  { id: "4", name: "NH Hotel Bon", active: true },
  { id: "5", name: "Sports Gift Card", active: true },
  { id: "6", name: "Ultimate Gift Card", active: true },
  { id: "7", name: "Vrije keuze", active: true },
];

const TWEEDE_DEFAULT_PRIZES: Prize[] = [
  { id: "1", name: "Prijs 1", active: true },
  { id: "2", name: "Prijs 2", active: true },
  { id: "3", name: "Prijs 3", active: true },
  { id: "4", name: "Prijs 4", active: true },
  { id: "5", name: "Prijs 5", active: true },
];

const DEFAULT_PRIZES: Record<string, Prize[]> = {
  psv: PSV_DEFAULT_PRIZES,
  fanscan: TWEEDE_DEFAULT_PRIZES,
};

async function readPrizes(prizesKey: string, themeId: string): Promise<Prize[]> {
  const { blobs } = await list({ prefix: prizesKey });
  if (blobs.length === 0) return DEFAULT_PRIZES[themeId] ?? PSV_DEFAULT_PRIZES;
  const res = await fetch(blobs[0].downloadUrl, {
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
    cache: "no-store",
  });
  return res.json() as Promise<Prize[]>;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const themeId = searchParams.get("theme") ?? "psv";
  const theme = getTheme(themeId);

  try {
    const prizes = await readPrizes(theme.prizesKey, theme.id);
    return NextResponse.json(prizes);
  } catch (err) {
    console.error("Failed to read prizes:", err);
    return NextResponse.json({ error: "Failed to read prizes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const themeId = searchParams.get("theme") ?? "psv";
  const theme = getTheme(themeId);

  try {
    const body: unknown = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Body must be an array of prizes" }, { status: 400 });
    }

    const prizes = body as Prize[];

    for (const prize of prizes) {
      if (
        typeof prize.id !== "string" ||
        typeof prize.name !== "string" ||
        typeof prize.active !== "boolean"
      ) {
        return NextResponse.json({ error: "Invalid prize shape" }, { status: 400 });
      }
    }

    await put(theme.prizesKey, JSON.stringify(prizes), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Failed to save prizes:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
