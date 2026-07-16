import { NextResponse } from "next/server";
import { getTheme } from "@/lib/themes";
import { readPrizes, writePrizes, pickWeightedWinner } from "@/lib/prizes";

// The winner is chosen HERE, on the server, and the stock is decremented in
// the same request. Doing it server-side means the browser can't influence the
// outcome and a page refresh can't replay a win. The read-modify-write below
// is the single point where stock changes, which keeps counting consistent for
// a single kiosk. (For many kiosks drawing at the exact same moment, move the
// counter to a transactional store — see the note in the PR/summary.)
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const themeId = searchParams.get("theme") ?? "psv";
  const theme = getTheme(themeId);

  try {
    const prizes = await readPrizes(theme.prizesKey, theme.id);

    const winner = pickWeightedWinner(prizes, Math.random());
    if (!winner) {
      // Everything is inactive or sold out.
      return NextResponse.json({ winner: null, prizes }, { status: 200 });
    }

    // Decrement the won prize (unlimited prizes have stock === null → untouched).
    const updated = prizes.map((p) =>
      p.id === winner.id && p.stock !== null
        ? { ...p, stock: Math.max(0, p.stock - 1) }
        : p
    );

    await writePrizes(theme.prizesKey, updated);

    const winnerAfter = updated.find((p) => p.id === winner.id) ?? winner;
    return NextResponse.json({ winner: winnerAfter, prizes: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Failed to draw:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
