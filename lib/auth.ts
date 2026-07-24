// Wachtwoord-slot voor de "echte" (niet-test) thema's. Alleen `fanscan` (de
// FANdag) is beveiligd; `psv` (Sterrenbonus) en `fanscantest` blijven open.
export const FANDAG_PASSWORD = process.env.FANDAG_PASSWORD ?? "1923";
export const AUTH_COOKIE = "fandag_ok";
// Ondoorzichtige unlock-waarde — voorkomt dat iemand simpelweg fandag_ok=1 zet.
export const AUTH_TOKEN = "psv-fandag-2026-unlocked";
export const PROTECTED_THEMES = new Set<string>(["fanscan"]);
