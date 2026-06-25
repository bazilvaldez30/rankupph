/**
 * Canonical Dota 2 medal / star → MMR mapping and medal artwork.
 * Source: Liquipedia "Matchmaking/Seasonal Rankings".
 *
 * Star thresholds are NOT uniform: Herald–Ancient step 154 MMR per star,
 * Divine steps 200 MMR per star, and Immortal begins at 5620 (leaderboard).
 * Medal images live in /public as SeasonalRank{order}-{star}.png (Herald=1 …
 * Divine=7) and SeasonalRankTop0.png for Immortal.
 *
 * Plain data (client-safe) — used for display/labels. DB `Rank` rows hold the
 * medal price bands (admin-editable); keep their min/max in sync via the seed.
 */

export interface MedalDef {
  order: number;
  name: string;
  /** MMR floor of each star (length 5 for medals, 1 for Immortal). */
  starFloors: number[];
}

export const MEDALS: MedalDef[] = [
  { order: 1, name: "Herald", starFloors: [0, 154, 308, 462, 616] },
  { order: 2, name: "Guardian", starFloors: [770, 924, 1078, 1232, 1386] },
  { order: 3, name: "Crusader", starFloors: [1540, 1694, 1848, 2002, 2156] },
  { order: 4, name: "Archon", starFloors: [2310, 2464, 2618, 2772, 2926] },
  { order: 5, name: "Legend", starFloors: [3080, 3234, 3388, 3542, 3696] },
  { order: 6, name: "Ancient", starFloors: [3850, 4004, 4158, 4312, 4466] },
  { order: 7, name: "Divine", starFloors: [4620, 4820, 5020, 5220, 5420] },
  { order: 8, name: "Immortal", starFloors: [5620] },
];

/** Lowest MMR for each medal (its first star). */
export const MEDAL_MIN_MMR: Record<number, number> = Object.fromEntries(
  MEDALS.map((m) => [m.order, m.starFloors[0]!]),
);

/** Highest MMR shown on sliders (mid-Immortal). */
export const MMR_MIN = 0;
export const MMR_MAX = 9000;

export function medalForMmr(mmr: number): MedalDef {
  let current = MEDALS[0]!;
  for (const m of MEDALS) {
    if (mmr >= m.starFloors[0]!) current = m;
    else break;
  }
  return current;
}

/** Star (1-based) within the medal, or null for Immortal. */
export function starForMmr(mmr: number): number | null {
  const medal = medalForMmr(mmr);
  if (medal.name === "Immortal") return null;
  let star = 1;
  for (let i = 0; i < medal.starFloors.length; i++) {
    if (mmr >= medal.starFloors[i]!) star = i + 1;
  }
  return star;
}

/** Public path to the medal image for a given MMR. */
export function medalImageForMmr(mmr: number): string {
  const medal = medalForMmr(mmr);
  if (medal.name === "Immortal") return "/SeasonalRankTop0.png";
  return `/SeasonalRank${medal.order}-${starForMmr(mmr)}.png`;
}

/** Human label, e.g. "Ancient 3" or "Immortal". */
export function rankLabelForMmr(mmr: number): string {
  const medal = medalForMmr(mmr);
  const star = starForMmr(mmr);
  return star ? `${medal.name} ${star}` : medal.name;
}

export function medalNameForMmr(mmr: number): string {
  return medalForMmr(mmr).name;
}
