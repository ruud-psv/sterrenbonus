import { decideDraw, defaultPrizes } from './lib/prize-logic.js';
import { FANSCAN_SCHEDULE } from './lib/fanscan-schedule.js';

const START = FANSCAN_SCHEDULE.startMs;
const MIN = 60_000;
const N = Number(process.argv[2] ?? 2500); // aantal draaien over de dag

const prizes = defaultPrizes('fanscan').map((p) => ({ ...p }));
const nameOf = new Map(prizes.map((p) => [p.id, p.name]));
const premiumIds = FANSCAN_SCHEDULE.premiumIds;
const massaIds = new Set(['1', '2', '3', '4']);
const middenIds = new Set(['5', '6', '13', '17', '18', '19']);

const hhmm = (t: number) => {
  const m = Math.round((t - START) / MIN);
  const h = 12 + Math.floor(m / 60);
  return `${String(h).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

// Draaien over de dag, piek in de middag.
const hourWeights = [0.7, 1.0, 1.6, 1.6, 1.1, 0.7];
const wsum = hourWeights.reduce((a, b) => a + b, 0);
const times: number[] = [];
hourWeights.forEach((w, h) => {
  const count = Math.round((w / wsum) * N);
  for (let i = 0; i < count; i++) times.push(START + (h * 60 + Math.random() * 60) * MIN);
});
times.sort((a, b) => a - b);

const perHour = Array.from({ length: 6 }, () => ({ spins: 0, massa: 0, midden: 0, premie: 0, helaas: 0 }));
const premiumDrops: { t: number; id: string }[] = [];
const given: Record<string, number> = {};

for (const t of times) {
  const h = Math.min(5, Math.floor((t - START) / MIN / 60));
  perHour[h].spins++;
  const d = decideDraw(prizes, FANSCAN_SCHEDULE, t, Math.random());
  if (d.result === 'helaas' || !d.winnerId) { perHour[h].helaas++; continue; }
  const p = prizes.find((x) => x.id === d.winnerId)!;
  if (p.stock !== null) p.stock -= 1; // mimic atomic claim
  given[d.winnerId] = (given[d.winnerId] ?? 0) + 1;
  if (premiumIds.has(d.winnerId)) { perHour[h].premie++; premiumDrops.push({ t, id: d.winnerId }); }
  else if (massaIds.has(d.winnerId)) perHour[h].massa++;
  else perHour[h].midden++;
}

console.log(`\n=== DAG-SIMULATIE — ${N} draaien, piek in de middag ===\n`);
console.log('Tijdvak      Draaien  Massa  Midden  Premies  HELAAS');
perHour.forEach((r, h) => {
  const label = `${String(12 + h).padStart(2, '0')}:00-${String(13 + h).padStart(2, '0')}:00`;
  console.log(
    `${label}   ${String(r.spins).padStart(6)} ${String(r.massa).padStart(6)} ${String(r.midden).padStart(7)} ${String(r.premie).padStart(8)} ${String(r.helaas).padStart(7)}`
  );
});
const tot = perHour.reduce((a, r) => ({ spins: a.spins + r.spins, massa: a.massa + r.massa, midden: a.midden + r.midden, premie: a.premie + r.premie, helaas: a.helaas + r.helaas }), { spins: 0, massa: 0, midden: 0, premie: 0, helaas: 0 });
console.log(`TOTAAL       ${String(tot.spins).padStart(6)} ${String(tot.massa).padStart(6)} ${String(tot.midden).padStart(7)} ${String(tot.premie).padStart(8)} ${String(tot.helaas).padStart(7)}`);

console.log('\n=== PREMIE-DROPS (wanneer gevallen in deze simulatie) ===');
for (const d of premiumDrops) console.log(`  ${hhmm(d.t)}  ${nameOf.get(d.id)}`);

console.log('\n=== EINDSTAND per prijs (uitgedeeld / totaal) ===');
for (const p of prizes) {
  const g = given[p.id] ?? 0;
  console.log(`  ${(nameOf.get(p.id) ?? '').padEnd(42)} ${String(g).padStart(4)} / ${p.initialStock}`);
}
const totalGiven = Object.values(given).reduce((a, b) => a + b, 0);
console.log(`\n  Uitgedeeld: ${totalGiven} van 3653  |  Over: ${3653 - totalGiven}  |  HELAAS: ${tot.helaas}`);
