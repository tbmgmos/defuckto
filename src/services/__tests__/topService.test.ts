import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db, TOP_PLACEMENT_HOURS } from '../localDatabase';
import { TOP_PLACEMENT_PRICE, economyService } from '../economyService';
import { TOP_SIZE, rankTop, topService } from '../topService';
import { TopPlacement } from '../../models';
import { BUYER, SELLER, balanceOf, resetDb, seedWallet } from './helpers';

const HOUR = 3_600_000;
const NOW = new Date('2026-01-01T12:00:00Z').getTime();

function placement(userId: string, startedHoursAgo: number, durationHours = TOP_PLACEMENT_HOURS): TopPlacement {
  const startedAt = new Date(NOW - startedHoursAgo * HOUR);
  return {
    userId,
    startedAt: startedAt.toISOString(),
    expiresAt: new Date(startedAt.getTime() + durationHours * HOUR).toISOString(),
    pricePaid: TOP_PLACEMENT_PRICE,
  };
}

beforeEach(() => {
  resetDb();
  seedWallet(BUYER, 500);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('rankTop', () => {
  it('puts the most recent placement first, regardless of what was paid', () => {
    const older = { ...placement('a', 10), pricePaid: 999 };
    const newer = placement('b', 1);
    expect(rankTop([older, newer], NOW).map((p) => p.userId)).toEqual(['b', 'a']);
  });

  it('drops expired placements', () => {
    const expired = placement('old', 30);
    const live = placement('live', 2);
    expect(rankTop([expired, live], NOW).map((p) => p.userId)).toEqual(['live']);
  });

  it('caps the list at TOP_SIZE', () => {
    const many = Array.from({ length: TOP_SIZE + 25 }, (_, i) => placement(`u${i}`, i * 0.01));
    expect(rankTop(many, NOW)).toHaveLength(TOP_SIZE);
  });
});

describe('buyTopPlacement', () => {
  it('charges the flat price as a sink: nobody is paid', async () => {
    seedWallet(SELLER, 0);
    const before = balanceOf(BUYER) + balanceOf(SELLER);

    const { placement: p } = await economyService.buyTopPlacement(BUYER);

    expect(balanceOf(BUYER)).toBe(500 - TOP_PLACEMENT_PRICE);
    expect(balanceOf(BUYER) + balanceOf(SELLER)).toBe(before - TOP_PLACEMENT_PRICE);
    expect(p.pricePaid).toBe(TOP_PLACEMENT_PRICE);
    expect(db.transactions[0]).toMatchObject({ type: 'top_placement', amount: -TOP_PLACEMENT_PRICE });
  });

  it('lasts TOP_PLACEMENT_HOURS and shows up in the ranking', async () => {
    const { placement: p } = await economyService.buyTopPlacement(BUYER);
    const hours = (new Date(p.expiresAt).getTime() - new Date(p.startedAt).getTime()) / HOUR;

    expect(hours).toBeCloseTo(TOP_PLACEMENT_HOURS, 1);
    expect((await topService.getTop()).map((x) => x.userId)).toContain(BUYER);
  });

  it('buying again restarts the clock and moves to the top instead of stacking days', async () => {
    db.topPlacements.set('other', placement('other', 0.5));
    db.topPlacements.set(BUYER, placement(BUYER, 20));

    await economyService.buyTopPlacement(BUYER);

    const top = await topService.getTop();
    expect(top[0].userId).toBe(BUYER);
    expect(db.topPlacements.size).toBe(2);
    const p = db.topPlacements.get(BUYER)!;
    expect((new Date(p.expiresAt).getTime() - Date.now()) / HOUR).toBeLessThanOrEqual(TOP_PLACEMENT_HOURS);
  });

  it('refuses without enough coins and leaves no placement behind', async () => {
    seedWallet(BUYER, TOP_PLACEMENT_PRICE - 1);

    await expect(economyService.buyTopPlacement(BUYER)).rejects.toThrow('Недостаточно монет');

    expect(db.topPlacements.has(BUYER)).toBe(false);
    expect(balanceOf(BUYER)).toBe(TOP_PLACEMENT_PRICE - 1);
  });
});
