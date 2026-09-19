import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../localDatabase';
import { FREE_SPARKS_PER_DAY, interestService } from '../interestService';
import { CURRENT_USER_ID } from '../../data/users';
import { balanceOf, resetDb, seedFact, seedPhoto, seedWallet } from './helpers';

const OTHER = 'u_other';

beforeEach(() => {
  resetDb();
  seedWallet(CURRENT_USER_ID, 500);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('sendSpark', () => {
  it('is free: no coins move', async () => {
    await interestService.sendSpark(OTHER);

    expect(await interestService.getSparkedIds()).toEqual(new Set([OTHER]));
    expect(balanceOf(CURRENT_USER_ID)).toBe(500);
    expect(db.transactions).toHaveLength(0);
  });

  it('is idempotent and a repeat does not use up the daily quota', async () => {
    await interestService.sendSpark(OTHER);
    await interestService.sendSpark(OTHER);

    expect(await interestService.sparksRemainingToday()).toBe(FREE_SPARKS_PER_DAY - 1);
  });

  it(`stops at ${FREE_SPARKS_PER_DAY} new sparks a day`, async () => {
    for (let i = 0; i < FREE_SPARKS_PER_DAY; i++) await interestService.sendSpark(`u_${i}`);

    await expect(interestService.sendSpark('u_one_too_many')).rejects.toThrow('Дневной лимит искр');
    expect(await interestService.sparksRemainingToday()).toBe(0);
    // A spark that already exists still counts as done, not as an error.
    await expect(interestService.sendSpark('u_0')).resolves.toBeUndefined();
  });

  it('resets the quota on a new day', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-03-01T12:00:00Z'));
    for (let i = 0; i < FREE_SPARKS_PER_DAY; i++) await interestService.sendSpark(`u_${i}`);

    vi.setSystemTime(new Date('2026-03-02T12:00:00Z'));

    expect(await interestService.sparksRemainingToday()).toBe(FREE_SPARKS_PER_DAY);
    await expect(interestService.sendSpark('u_new_day')).resolves.toBeUndefined();
  });
});

describe('recordInteraction (mutual-interest signal)', () => {
  it('needs a second interaction, fires once, and then stays quiet', async () => {
    expect(await interestService.recordInteraction(OTHER)).toBeNull();

    const fired = await interestService.recordInteraction(OTHER);
    expect(fired?.event).toMatchObject({ userId: CURRENT_USER_ID, otherUserId: OTHER, seen: false });

    expect(await interestService.recordInteraction(OTHER)).toBeNull();
    expect(db.mutualInterests).toHaveLength(1);
  });

  it("rewards sustained interest with the person's paid content, for free", async () => {
    const fact = seedFact({ authorId: OTHER, price: 100, unlockCount: 3 });
    const photo = seedPhoto({ ownerId: OTHER, price: 50 });

    await interestService.recordInteraction(OTHER);
    const fired = await interestService.recordInteraction(OTHER);

    expect(fired?.unlockedFactIds).toEqual([fact.id]);
    expect(fired?.unlockedPhotoIds).toEqual([photo.id]);
    expect(balanceOf(CURRENT_USER_ID)).toBe(500);
    expect(fact.unlockCount).toBe(3);
  });

  it('tracks each person separately', async () => {
    await interestService.recordInteraction('u_a');
    expect(await interestService.recordInteraction('u_b')).toBeNull();
  });
});
