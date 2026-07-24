import { NextResponse } from "next/server";
import { getTheme } from "@/lib/themes";
import { readPrizes, writePrizes } from "@/lib/prizes";
import { decideDraw, HELAAS_ID } from "@/lib/prize-logic";
import { getSchedule } from "@/lib/fanscan-schedule";
import { kvEnabled, claimOne } from "@/lib/kv-store";

const HELAAS_WINNER = { id: HELAAS_ID, name: "Helaas!", active: true, stock: null, initialStock: null };

// The outcome is decided HERE, on the server, and one unit of stock is claimed
// in the same request. Server-side means the browser can't influence the result
// and a refresh can't replay a win. For a time-gated theme (FANdag) the winner
// is chosen against the event schedule; otherwise it's a plain weighted draw.
//
// Stock: when KV is enabled the winner is claimed with an atomic decrement, so
// a prize (including a 1-of-a-kind premium) is never handed out more than its
// stock even with two kiosks drawing at the same instant. Without KV it falls
// back to the Blob read-modify-write (eventually consistent — counts can drift).
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
    const winner = prizes.find((p) => p.id === winnerId);
    if (!winner) {
      return NextResponse.json({ result: "helaas", winner: HELAAS_WINNER, prizes });
    }

    // Unlimited prize (e.g. Sterrenbonus vouchers): nothing to decrement.
    if (winner.stock === null) {
      return NextResponse.json({ result: "prize", winner, prizes });
    }

    if (kvEnabled()) {
      const remaining = await claimOne(theme.id, winnerId);
      if (remaining === null) {
        // The last one was claimed by a concurrent draw between read and claim.
        return NextResponse.json({ result: "helaas", winner: HELAAS_WINNER, prizes });
      }
      const updated = prizes.map((p) => (p.id === winnerId ? { ...p, stock: remaining } : p));
      return NextResponse.json({ result: "prize", winner: { ...winner, stock: remaining }, prizes: updated });
    }

    // Blob fallback (no KV): read-modify-write, eventually consistent.
    const updated = prizes.map((p) =>
      p.id === winnerId && p.stock !== null ? { ...p, stock: Math.max(0, p.stock - 1) } : p
    );
    await writePrizes(theme.prizesKey, updated);
    const after = updated.find((p) => p.id === winnerId) ?? winner;
    return NextResponse.json({ result: "prize", winner: after, prizes: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Failed to draw:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
