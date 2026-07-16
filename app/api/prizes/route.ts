import { NextResponse } from "next/server";
import { getTheme } from "@/lib/themes";
import { readPrizes, writePrizes, normalizePrize } from "@/lib/prizes";

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

    // Normalize every entry; a null result means the entry was malformed.
    const prizes = body.map(normalizePrize);
    if (prizes.some((p) => p === null)) {
      return NextResponse.json({ error: "Invalid prize shape" }, { status: 400 });
    }

    await writePrizes(theme.prizesKey, prizes.filter((p) => p !== null));

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Failed to save prizes:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
