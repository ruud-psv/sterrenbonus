import type { Prize } from "@/app/types";

// Pure prize helpers — no server/blob imports, safe to use in client components.

// ── Default prize lists ──────────────────────────────────────────────────────
// Used the first time a theme is opened, before anything is saved to the blob
// store. `stock: null` means unlimited (never decrements, always available).

const PSV_DEFAULT_PRIZES: Prize[] = [
  { id: "1", name: "Jumbo Bon", active: true, stock: null, initialStock: null },
  { id: "2", name: "XXL Nutrition Bon", active: true, stock: null, initialStock: null },
  { id: "3", name: "Ikigai Bon", active: true, stock: null, initialStock: null },
  { id: "4", name: "NH Hotel Bon", active: true, stock: null, initialStock: null },
  { id: "5", name: "Sports Gift Card", active: true, stock: null, initialStock: null },
  { id: "6", name: "Ultimate Gift Card", active: true, stock: null, initialStock: null },
  { id: "7", name: "Vrije keuze", active: true, stock: null, initialStock: null },
];

// PSV FANdag / FANscan prijzen (definitief, bron: "PSV FANdag - DEF prijzen").
// "stock" = het weg-te-geven aantal. Alles staat op het rad; premium prijzen
// (zie lib/fanscan-schedule) worden ingepland via drops.
const FANSCAN_DEFAULT_PRIZES: Prize[] = [
  { id: "1", name: "Phoxy Stressbal", active: true, stock: 1550, initialStock: 1550 },
  { id: "2", name: "PSV Strandbal", active: true, stock: 300, initialStock: 300 },
  { id: "3", name: "PSV Plaktattoo", active: true, stock: 1000, initialStock: 1000 },
  { id: "4", name: "Phoxy Gloeilampje", active: true, stock: 500, initialStock: 500 },
  { id: "5", name: "Puma Gymtas", active: true, stock: 100, initialStock: 100 },
  { id: "6", name: "PSV FANstore Giftcard t.w.v. €5,-", active: true, stock: 50, initialStock: 50 },
  { id: "7", name: "Thuisshirt", active: true, stock: 1, initialStock: 1 },
  { id: "8", name: "Uitshirt", active: true, stock: 1, initialStock: 1 },
  { id: "9", name: "Derde shirt", active: true, stock: 1, initialStock: 1 },
  { id: "10", name: "Gesigneerd shirt Sven Mijnans", active: true, stock: 1, initialStock: 1 },
  { id: "11", name: "Gesigneerd shirt Mauro Júnior", active: true, stock: 1, initialStock: 1 },
  { id: "12", name: "Gesigneerd shirt Ruben van Bommel", active: true, stock: 1, initialStock: 1 },
  { id: "13", name: "Jaar lang gratis Membership", active: true, stock: 10, initialStock: 10 },
  { id: "14", name: "Twee tickets Johan Cruijff Schaal", active: true, stock: 1, initialStock: 1 },
  { id: "15", name: "Twee tickets PSV – Villarreal CF", active: true, stock: 3, initialStock: 3 },
  { id: "16", name: "Twee tickets Lichtstadderby", active: true, stock: 3, initialStock: 3 },
  { id: "17", name: "Twee personen PSV Museum", active: true, stock: 100, initialStock: 100 },
  { id: "18", name: "Twee personen PSV Stadiontour", active: true, stock: 10, initialStock: 10 },
  { id: "19", name: "PSV Goodie", active: true, stock: 10, initialStock: 10 },
  { id: "20", name: "PSV Spelersbus naar je uitwedstrijd", active: true, stock: 1, initialStock: 1 },
  { id: "21", name: "Twee personen een besloten training bezoeken", active: true, stock: 1, initialStock: 1 },
  { id: "22", name: "Exclusieve rondleiding profzijde", active: true, stock: 1, initialStock: 1 },
  { id: "23", name: "Wedstrijdexperience Lichtstadderby", active: true, stock: 3, initialStock: 3 },
  { id: "24", name: "Meet & Greet met Phoxy", active: true, stock: 3, initialStock: 3 },
  { id: "25", name: "Twee tickets PSV - Feyenoord", active: true, stock: 1, initialStock: 1 },
];

// Testvoorraad — kleine aantallen zodat je snel wint, prijzen ziet uitverkopen
// en uiteindelijk HELAAS krijgt. Totaal ~60. Losse data (theme "fanscantest").
const FANSCANTEST_DEFAULT_PRIZES: Prize[] = [
  { id: "1", name: "Phoxy Stressbal", active: true, stock: 8, initialStock: 8 },
  { id: "2", name: "PSV Strandbal", active: true, stock: 5, initialStock: 5 },
  { id: "3", name: "PSV Plaktattoo", active: true, stock: 8, initialStock: 8 },
  { id: "4", name: "Phoxy Gloeilampje", active: true, stock: 5, initialStock: 5 },
  { id: "5", name: "Puma Gymtas", active: true, stock: 3, initialStock: 3 },
  { id: "6", name: "PSV FANstore Giftcard t.w.v. €5,-", active: true, stock: 3, initialStock: 3 },
  { id: "7", name: "Thuisshirt", active: true, stock: 1, initialStock: 1 },
  { id: "8", name: "Uitshirt", active: true, stock: 1, initialStock: 1 },
  { id: "9", name: "Derde shirt", active: true, stock: 1, initialStock: 1 },
  { id: "10", name: "Gesigneerd shirt Sven Mijnans", active: true, stock: 1, initialStock: 1 },
  { id: "11", name: "Gesigneerd shirt Mauro Júnior", active: true, stock: 1, initialStock: 1 },
  { id: "12", name: "Gesigneerd shirt Ruben van Bommel", active: true, stock: 1, initialStock: 1 },
  { id: "13", name: "Jaar lang gratis Membership", active: true, stock: 2, initialStock: 2 },
  { id: "14", name: "Twee tickets Johan Cruijff Schaal", active: true, stock: 1, initialStock: 1 },
  { id: "15", name: "Twee tickets PSV – Villarreal CF", active: true, stock: 2, initialStock: 2 },
  { id: "16", name: "Twee tickets Lichtstadderby", active: true, stock: 2, initialStock: 2 },
  { id: "17", name: "Twee personen PSV Museum", active: true, stock: 3, initialStock: 3 },
  { id: "18", name: "Twee personen PSV Stadiontour", active: true, stock: 2, initialStock: 2 },
  { id: "19", name: "PSV Goodie", active: true, stock: 2, initialStock: 2 },
  { id: "20", name: "PSV Spelersbus naar je uitwedstrijd", active: true, stock: 1, initialStock: 1 },
  { id: "21", name: "Twee personen een besloten training bezoeken", active: true, stock: 1, initialStock: 1 },
  { id: "22", name: "Exclusieve rondleiding profzijde", active: true, stock: 1, initialStock: 1 },
  { id: "23", name: "Wedstrijdexperience Lichtstadderby", active: true, stock: 2, initialStock: 2 },
  { id: "24", name: "Meet & Greet met Phoxy", active: true, stock: 2, initialStock: 2 },
  { id: "25", name: "Twee tickets PSV - Feyenoord", active: true, stock: 1, initialStock: 1 },
];

const DEFAULT_PRIZES: Record<string, Prize[]> = {
  psv: PSV_DEFAULT_PRIZES,
  fanscan: FANSCAN_DEFAULT_PRIZES,
  fanscantest: FANSCANTEST_DEFAULT_PRIZES,
};

export function defaultPrizes(themeId: string): Prize[] {
  return DEFAULT_PRIZES[themeId] ?? PSV_DEFAULT_PRIZES;
}

// ── Normalization ────────────────────────────────────────────────────────────
// Old blobs may predate the stock fields; coerce anything into a complete,
// valid Prize so the rest of the app never has to guard.

export function toStock(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}

export function normalizePrize(raw: unknown): Prize | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== "string" || typeof r.name !== "string") return null;
  const stock = toStock(r.stock);
  return {
    id: r.id,
    name: r.name,
    active: typeof r.active === "boolean" ? r.active : true,
    stock,
    initialStock: toStock(r.initialStock) ?? stock,
  };
}

export function normalizeList(raw: unknown): Prize[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizePrize).filter((p): p is Prize => p !== null);
}

// ── Availability & weighted picking ──────────────────────────────────────────

/** A prize can be won when it is active and not sold out. */
export function isAvailable(p: Prize): boolean {
  return p.active && (p.stock === null || p.stock > 0);
}

/**
 * Pick a winner among the available prizes, weighted by remaining stock so
 * common prizes come up often and rare ones rarely. If every available prize
 * is unlimited (stock === null) the weighting collapses to a uniform draw.
 * `rand` is a value in [0, 1).
 */
export function pickWeightedWinner(prizes: Prize[], rand: number): Prize | null {
  const pool = prizes.filter(isAvailable);
  if (pool.length === 0) return null;

  const allFinite = pool.every((p) => p.stock !== null);
  const weightOf = (p: Prize) => (allFinite ? (p.stock as number) : 1);

  const total = pool.reduce((sum, p) => sum + weightOf(p), 0);
  let threshold = rand * total;
  for (const p of pool) {
    threshold -= weightOf(p);
    if (threshold < 0) return p;
  }
  return pool[pool.length - 1]; // float-rounding fallback
}

// ── Time-gated draw (FANdag) ─────────────────────────────────────────────────

/** Synthetic id for a "no prize" (HELAAS) outcome. */
export const HELAAS_ID = "__helaas__";

export interface DrawSchedule {
  startMs: number;
  endMs: number;
  /** Prize ids handed out via scheduled drops (kept out of the regular pool). */
  premiumIds: Set<string>;
  /** Scheduled premium drops, sorted ascending by minute-from-start. */
  premiumDrops: { id: string; minute: number }[];
}

export interface DrawDecision {
  result: "prize" | "helaas";
  winnerId: string | null;
}

function givenCount(p: Prize): number {
  if (p.initialStock === null || p.stock === null) return 0;
  return Math.max(0, p.initialStock - p.stock);
}

/**
 * Decide a single draw.
 * - No schedule (e.g. Sterrenbonus): plain weighted draw over available prizes.
 * - With schedule (FANdag): first honour any due premium drop; otherwise release
 *   the regular pool evenly across the window and hand out a weighted regular
 *   prize while the released budget hasn't been used up; else HELAAS. This is
 *   what makes the prizes last until closing and turns spins into HELAAS only
 *   when the crowd outpaces the clock.
 */
export function decideDraw(
  prizes: Prize[],
  schedule: DrawSchedule | null,
  nowMs: number,
  rand: number
): DrawDecision {
  if (!schedule) {
    const w = pickWeightedWinner(prizes, rand);
    return { result: w ? "prize" : "helaas", winnerId: w?.id ?? null };
  }

  const elapsedMin = (nowMs - schedule.startMs) / 60000;

  // 1) Premium scheduled drops that are due but not yet handed out. Award the
  //    one whose (unfulfilled) drop is earliest, so premiums stay in order.
  let bestId: string | null = null;
  let bestMinute = Infinity;
  for (const id of schedule.premiumIds) {
    const prize = prizes.find((p) => p.id === id);
    if (!prize || !isAvailable(prize)) continue;
    const due = schedule.premiumDrops.filter((d) => d.id === id && d.minute <= elapsedMin);
    const given = givenCount(prize);
    if (due.length > given && due[given].minute < bestMinute) {
      bestMinute = due[given].minute;
      bestId = id;
    }
  }
  if (bestId) return { result: "prize", winnerId: bestId };

  // 2) Regular pool, released evenly across the window (rollover is implicit:
  //    unused budget from quiet periods stays available later).
  const regular = prizes.filter((p) => !schedule.premiumIds.has(p.id));
  const regularInitial = regular.reduce((s, p) => s + (p.initialStock ?? 0), 0);
  const regularStock = regular.reduce((s, p) => s + (p.stock ?? 0), 0);
  const regularGiven = regularInitial - regularStock;

  const span = schedule.endMs - schedule.startMs;
  const frac = span > 0 ? Math.min(1, Math.max(0, (nowMs - schedule.startMs) / span)) : 1;
  const releasedBudget = Math.floor(regularInitial * frac);

  const available = regular.filter(isAvailable);
  if (regularGiven < releasedBudget && available.length > 0) {
    const w = pickWeightedWinner(available, rand);
    if (w) return { result: "prize", winnerId: w.id };
  }
  return { result: "helaas", winnerId: null };
}
