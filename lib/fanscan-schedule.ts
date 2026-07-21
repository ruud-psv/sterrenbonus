import type { DrawSchedule } from "@/lib/prize-logic";

// PSV FANdag — zaterdag 25 juli 2026, 12:00–18:00 Europe/Amsterdam (CEST = UTC+2).
// Vaste UTC-momenten zodat de servertijdzone niet uitmaakt.
export const EVENT_START_MS = Date.UTC(2026, 6, 25, 10, 0, 0); // 12:00 NL
export const EVENT_END_MS = Date.UTC(2026, 6, 25, 16, 0, 0); //   18:00 NL

// Premium prijzen worden gegarandeerd op geplande momenten uitgedeeld (niet via
// de klok-vrijgave van de reguliere pool). Minuten = vanaf 12:00. De marquee-
// prijzen (signeershirts, Feyenoord, Johan Cruijff Schaal) staan in de piek
// 14:00–16:00 (120–240 min) voor het meeste publiek. 23 drops totaal.
const PREMIUM_DROPS: { id: string; minute: number }[] = [
  { id: "24", minute: 20 }, // Meet & Greet met Phoxy
  { id: "23", minute: 45 }, // Wedstrijdexperience Lichtstadderby
  { id: "15", minute: 70 }, // Twee tickets PSV – Villarreal CF
  { id: "24", minute: 90 },
  { id: "23", minute: 110 },
  { id: "10", minute: 125 }, // Gesigneerd shirt Sven Mijnans
  { id: "25", minute: 135 }, // Twee tickets PSV - Feyenoord
  { id: "14", minute: 145 }, // Twee tickets Johan Cruijff Schaal
  { id: "16", minute: 155 }, // Twee tickets Lichtstadderby
  { id: "15", minute: 165 },
  { id: "20", minute: 175 }, // PSV Spelersbus naar je uitwedstrijd
  { id: "11", minute: 185 }, // Gesigneerd shirt Mauro Júnior
  { id: "12", minute: 195 }, // Gesigneerd shirt Ruben van Bommel
  { id: "16", minute: 205 },
  { id: "23", minute: 215 },
  { id: "24", minute: 225 },
  { id: "15", minute: 235 },
  { id: "16", minute: 250 },
  { id: "21", minute: 265 }, // Twee personen besloten training
  { id: "22", minute: 280 }, // Exclusieve rondleiding profzijde
  { id: "7", minute: 295 }, //  Thuisshirt
  { id: "8", minute: 315 }, //  Uitshirt
  { id: "9", minute: 340 }, //  Derde shirt
];

export const FANSCAN_SCHEDULE: DrawSchedule = {
  startMs: EVENT_START_MS,
  endMs: EVENT_END_MS,
  premiumIds: new Set(PREMIUM_DROPS.map((d) => d.id)),
  premiumDrops: [...PREMIUM_DROPS].sort((a, b) => a.minute - b.minute),
};

/** The FANdag draw is time-gated; other themes (Sterrenbonus) are not. */
export function getSchedule(themeId: string): DrawSchedule | null {
  return themeId === "fanscan" ? FANSCAN_SCHEDULE : null;
}
