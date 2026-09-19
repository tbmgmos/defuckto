import { DiscoveryFilters, User } from '../models';
import { DISCOVERY_META } from '../data/discoveryMeta';
import { compatibilityScore } from '../utils/compatibility';

export type DiscoveryTab = 'foryou' | 'new' | 'near';

// "Из совместимых": at least this many shared interests. Compatibility is only
// ever shared interests (utils/compatibility) — no hidden score, so the filter
// says exactly what it does.
export const MIN_COMPATIBLE_SHARED = 2;

export const DEFAULT_FILTERS: DiscoveryFilters = {
  minAge: 18,
  maxAge: 45,
  gender: null,
  city: null,
  interests: [],
  onlyTop: false,
  onlyCompatible: false,
  onlyVerified: false,
  onlyHot: false,
  onlyFriendship: false,
};

export interface DiscoveryContext {
  viewer: User | null;
  blockedIds: ReadonlySet<string>;
  topIds: ReadonlySet<string>;
  hotAuthorIds: ReadonlySet<string>;
}

/** How many filters differ from the defaults — the number on the filter button. */
export function activeFilterCount(filters: DiscoveryFilters): number {
  return (
    (filters.minAge !== DEFAULT_FILTERS.minAge || filters.maxAge !== DEFAULT_FILTERS.maxAge ? 1 : 0) +
    (filters.gender ? 1 : 0) +
    (filters.city ? 1 : 0) +
    filters.interests.length +
    (filters.onlyTop ? 1 : 0) +
    (filters.onlyCompatible ? 1 : 0) +
    (filters.onlyVerified ? 1 : 0) +
    (filters.onlyHot ? 1 : 0) +
    (filters.onlyFriendship ? 1 : 0)
  );
}

export function applyFilters(users: User[], filters: DiscoveryFilters, ctx: DiscoveryContext): User[] {
  return users.filter((u) => {
    if (u.isCurrentUser) return false;
    if (ctx.blockedIds.has(u.id)) return false;
    if (u.age < filters.minAge || u.age > filters.maxAge) return false;
    if (filters.gender && u.gender !== filters.gender) return false;
    if (filters.city && u.city !== filters.city) return false;
    if (filters.interests.length > 0 && !filters.interests.some((i) => u.interests.includes(i))) return false;
    if (filters.onlyTop && !ctx.topIds.has(u.id)) return false;
    if (filters.onlyCompatible && (!ctx.viewer || compatibilityScore(ctx.viewer, u) < MIN_COMPATIBLE_SHARED)) return false;
    if (filters.onlyVerified && !u.verified) return false;
    if (filters.onlyHot && !ctx.hotAuthorIds.has(u.id)) return false;
    if (filters.onlyFriendship && u.lookingFor !== 'friendship') return false;
    return true;
  });
}

export function orderUsers(users: User[], tab: DiscoveryTab, viewer: User | null): User[] {
  const list = [...users];
  if (tab === 'new') {
    list.sort((a, b) => (DISCOVERY_META[a.id]?.joinedDaysAgo ?? 99) - (DISCOVERY_META[b.id]?.joinedDaysAgo ?? 99));
  } else if (tab === 'near') {
    list.sort((a, b) => (DISCOVERY_META[a.id]?.distanceKm ?? 9999) - (DISCOVERY_META[b.id]?.distanceKm ?? 9999));
  } else if (viewer) {
    list.sort((a, b) => compatibilityScore(viewer, b) - compatibilityScore(viewer, a));
  }
  return list;
}
