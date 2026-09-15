// Presentation-only metadata for the Discovery feed's filter chips
// (Новые / Рядом / Популярные). Deliberately kept out of the User model —
// it's demo flavor, not a domain fact about a person.
export const DISCOVERY_META: Record<string, { distanceKm: number; joinedDaysAgo: number }> = {
  u_masha: { distanceKm: 2, joinedDaysAgo: 30 },
  u_alex: { distanceKm: 620, joinedDaysAgo: 26 },
  u_sofia: { distanceKm: 1480, joinedDaysAgo: 3 },
  u_lena: { distanceKm: 640, joinedDaysAgo: 21 },
  u_timur: { distanceKm: 2100, joinedDaysAgo: 1 },
  u_ira: { distanceKm: 320, joinedDaysAgo: 16 },
  u_danil: { distanceKm: 2600, joinedDaysAgo: 15 },
  u_olya: { distanceKm: 520, joinedDaysAgo: 2 },
};
