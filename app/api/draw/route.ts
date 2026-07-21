import { NextResponse } from "next/server";
import { getTheme } from "@/lib/themes";
import { readPrizes, writePrizes } from "@/lib/prizes";
import { decideDraw, HELAAS_ID } from "@/lib/prize-logic";
import { getSchedule } from "@/lib/fanscan-schedule";

const HELAAS_WINNER = { id: HELAAS_ID, name: "Helaas!", active: true, stock: null, initialStock: null };

// The outcome is decided HERE, on the server, and the stock is decremented in
// the same request. Server-side means the browser can't influence the result
// and a refresh can't replay a win. For a time-gated theme (FANdag) the winner
// is chosen against the event schedule; otherwise it's a plain weighted draw.
// The read-modify-write is the single point where stock changes — consistent
// for one kiosk; two kiosks that draw within the same ~200ms can occasionally
// over-give one regular prize (premiums are protected by their schedule).
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const themeId = searchParams.get("theme") ?? "psv";
  const theme = getTheme(themeId);

  try {
    const prizes = await readPrizes(theme.prizesKey, theme.id);
    const schedule = getSchedule(theme.id);

    const decision = decideDraw(prizes, schedule, Date.now(), Math.random());

    if (decision.result === "helaas" || !decision.winnerId) {
      return NextResponse.json({ result: "helaas", winner: HELAAS_WINNER, prizes });
    }

    const winnerId = decision.winnerId;
    const updated = prizes.map((p) =>
      p.id === winnerId && p.stock !== null ? { ...p, stock: Math.max(0, p.stock - 1) } : p
    );

    await writePrizes(theme.prizesKey, updated);

    const winner = updated.find((p) => p.id === winnerId) ?? null;
    if (!winner) {
      return NextResponse.json({ result: "helaas", winner: HELAAS_WINNER, prizes: updated });
    }
    return NextResponse.json({ result: "prize", winner, prizes: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Failed to draw:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
