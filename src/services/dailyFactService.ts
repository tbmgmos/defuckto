import { Fact } from '../models';
import { db, delay } from './localDatabase';
import { CURRENT_USER_ID } from '../data/users';

function dayIndex(): number {
  const start = Date.UTC(2026, 0, 1);
  const now = Date.now();
  return Math.floor((now - start) / (24 * 60 * 60 * 1000));
}

export const dailyFactService = {
  /**
   * The same fact for everyone, all day, free to read regardless of its
   * normal price — a shared daily ritual (à la Wordle) rather than a
   * personal unlock. Doesn't touch unlockCount or purchases.
   */
  async getFactOfTheDay(): Promise<Fact | undefined> {
    const pool = db.facts.filter((f) => f.authorId !== CURRENT_USER_ID && f.price > 0);
    if (pool.length === 0) return delay(undefined, 0);
    const index = ((dayIndex() % pool.length) + pool.length) % pool.length;
    return delay(pool[index]);
  },
};
