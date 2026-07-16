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

// PSV FANdag / FANscan prijzen. "stock" = het weg-te-geven aantal.
// De gesigneerde items starten inactief tot ze binnen/bevestigd zijn.
const FANSCAN_DEFAULT_PRIZES: Prize[] = [
  { id: "1", name: "Phoxy Stressbal", active: true, stock: 1550, initialStock: 1550 },
  { id: "2", name: "PSV Strandbal", active: true, stock: 300, initialStock: 300 },
  { id: "3", name: "PSV Plaktattoo", active: true, stock: 1000, initialStock: 1000 },
  { id: "4", name: "Phoxy Gloeilampje", active: true, stock: 700, initialStock: 700 },
  { id: "5", name: "Puma Gymtas", active: true, stock: 100, initialStock: 100 },
  { id: "6", name: "PSV FANstore cadeaubon t.w.v. €5,-", active: true, stock: 50, initialStock: 50 },
  { id: "7", name: "Home kit", active: true, stock: 1, initialStock: 1 },
  { id: "8", name: "Away kit", active: true, stock: 1, initialStock: 1 },
  { id: "9", name: "Third kit", active: true, stock: 1, initialStock: 1 },
  { id: "10", name: "Gesigneerd shirt van Bommel", active: false, stock: 1, initialStock: 1 },
  { id: "11", name: "Gesigneerd shirt van Mijnans", active: false, stock: 1, initialStock: 1 },
  { id: "12", name: "Gesigneerd shirt van Bajraktarevic", active: false, stock: 1, initialStock: 1 },
  { id: "13", name: "Gesigneerde handschoenen", active: false, stock: 1, initialStock: 1 },
  { id: "14", name: "Gesigneerde voetbalschoenen", active: false, stock: 1, initialStock: 1 },
  { id: "15", name: "Jaar lang gratis Membership (FANclub of MijnPSV+)", active: true, stock: 10, initialStock: 10 },
  { id: "16", name: "2 tickets Johan Cruijff Schaal", active: true, stock: 1, initialStock: 1 },
  { id: "17", name: "2 tickets PSV – Villarreal CF", active: true, stock: 3, initialStock: 3 },
  { id: "18", name: "2 tickets Lichtstadderby", active: true, stock: 3, initialStock: 3 },
  { id: "19", name: "PSV Museum (2 personen)", active: true, stock: 100, initialStock: 100 },
  { id: "20", name: "PSV Stadiontour (2 personen)", active: true, stock: 10, initialStock: 10 },
];

const DEFAULT_PRIZES: Record<string, Prize[]> = {
  psv: PSV_DEFAULT_PRIZES,
  fanscan: FANSCAN_DEFAULT_PRIZES,
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
