import { TopPlacement } from '../models';
import { db, delay } from './localDatabase';

export const TOP_SIZE = 100;

function isActive(placement: TopPlacement, now: number): boolean {
  return new Date(placement.expiresAt).getTime() > now;
}

/**
 * Newest placement first, expired ones dropped, capped at TOP_SIZE. Ranking
 * by purchase time (not by how much was paid) is deliberate — see
 * economyService.TOP_PLACEMENT_PRICE.
 */
export function rankTop(placements: TopPlacement[], now: number = Date.now(), limit: number = TOP_SIZE): TopPlacement[] {
  return placements
    .filter((p) => isActive(p, now))
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, limit);
}

export const topService = {
  /** The current ТОП 100, best spot first. Read-only — buying a spot goes through economyService. */
  async getTop(): Promise<TopPlacement[]> {
    return delay(rankTop([...db.topPlacements.values()]));
  },
};
