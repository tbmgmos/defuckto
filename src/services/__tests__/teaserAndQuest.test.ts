import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../localDatabase';
import { REVEAL_INTEREST_PRICE } from '../economyService';
import { teaserService } from '../teaserService';
import { questService } from '../questService';
import { CURRENT_USER_ID } from '../../data/users';
import { BUYER, balanceOf, resetDb, seedWallet } from './helpers';

beforeEach(() => {
  resetDb();
});

describe('teaserService.reveal', () => {
  const seedTeaser = () =>
    teaserService.createTeaser(BUYER, 'u_curious', 'f_any');

  it('charges once to reveal and is free afterwards', async () => {
    seedWallet(BUYER, 100);
    const teaser = await seedTeaser();

    await teaserService.reveal(teaser.id, BUYER);
    await teaserService.reveal(teaser.id, BUYER);

    expect(teaser.revealed).toBe(true);
    expect(balanceOf(BUYER)).toBe(100 - REVEAL_INTEREST_PRICE);
  });

  it('only the recipient can reveal, and an unknown teaser is rejected', async () => {
    seedWallet(BUYER, 100);
    const teaser = await seedTeaser();

    await expect(teaserService.reveal(teaser.id, 'u_intruder')).rejects.toThrow('Это не твой тизер');
    await expect(teaserService.reveal('t_missing', BUYER)).rejects.toThrow('Не найдено');
    expect(balanceOf(BUYER)).toBe(100);
  });

  it('stays hidden when the user cannot afford it', async () => {
    seedWallet(BUYER, REVEAL_INTEREST_PRICE - 1);
    const teaser = await seedTeaser();

    await expect(teaserService.reveal(teaser.id, BUYER)).rejects.toThrow('Недостаточно монет');

    expect(teaser.revealed).toBe(false);
    expect(balanceOf(BUYER)).toBe(REVEAL_INTEREST_PRICE - 1);
  });

  // The docs say "revealing twice doesn't charge twice", but the flag is set
  // only after the payment is awaited — two concurrent taps both pay.
  it.fails('KNOWN BUG: a double tap on reveal charges twice', async () => {
    seedWallet(BUYER, 100);
    const teaser = await seedTeaser();

    await Promise.allSettled([teaserService.reveal(teaser.id, BUYER), teaserService.reveal(teaser.id, BUYER)]);

    expect(balanceOf(BUYER)).toBe(100 - REVEAL_INTEREST_PRICE);
  });
});

describe('questService.advance', () => {
  beforeEach(() => {
    seedWallet(CURRENT_USER_ID, 0);
  });

  it('pays the reward exactly once, when the quest completes', async () => {
    const first = await questService.advance('add_fact');
    const second = await questService.advance('add_fact');

    expect(first.justCompleted).toBe(true);
    expect(second.justCompleted).toBe(false);
    expect(balanceOf(CURRENT_USER_ID)).toBe(20);
    expect(db.transactions.filter((t) => t.type === 'quest_reward')).toHaveLength(1);
  });

  it('pays only after the last step of a multi-step quest', async () => {
    await questService.advance('explore_profiles');
    await questService.advance('explore_profiles');
    expect(balanceOf(CURRENT_USER_ID)).toBe(0);

    const last = await questService.advance('explore_profiles');

    expect(last.justCompleted).toBe(true);
    expect(balanceOf(CURRENT_USER_ID)).toBe(15);
  });

  it('caps progress at the target', async () => {
    const result = await questService.advance('explore_profiles', 99);
    expect(result.quest.progress).toBe(3);
    expect(balanceOf(CURRENT_USER_ID)).toBe(15);
  });
});
