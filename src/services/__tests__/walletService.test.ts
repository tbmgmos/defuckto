import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../localDatabase';
import { walletService } from '../walletService';
import { BUYER, balanceOf, resetDb, seedWallet } from './helpers';

beforeEach(() => {
  resetDb();
});

describe('walletService', () => {
  it('creates an empty wallet on first access', async () => {
    expect(await walletService.getWallet(BUYER)).toEqual({ userId: BUYER, balance: 0 });
  });

  it('earns and spends coins and logs signed transactions', async () => {
    seedWallet(BUYER, 100);

    await walletService.earnCoins(BUYER, 30, 'бонус', 'streak_bonus');
    await walletService.spendCoins(BUYER, 50, 'покупка', 'fact_purchase');

    expect(balanceOf(BUYER)).toBe(80);
    expect((await walletService.getTransactions(BUYER)).map((t) => t.amount)).toEqual([-50, 30]);
  });

  it('refuses to go negative and leaves no trace of the attempt', async () => {
    seedWallet(BUYER, 10);

    await expect(walletService.spendCoins(BUYER, 11, 'x', 'fact_purchase')).rejects.toThrow('Недостаточно монет');

    expect(balanceOf(BUYER)).toBe(10);
    expect(db.transactions).toHaveLength(0);
  });

  it('allows spending the exact balance', async () => {
    seedWallet(BUYER, 10);
    await walletService.spendCoins(BUYER, 10, 'x', 'fact_purchase');
    expect(balanceOf(BUYER)).toBe(0);
  });

  // spendCoins does `balance -= amount` with no sign check, so a negative
  // amount silently ADDS coins. Callers pass computed prices today, but a
  // bad price (e.g. a negative fact price from user input) reaches here.
  it.fails('KNOWN BUG: spendCoins rejects a negative amount instead of crediting it', async () => {
    seedWallet(BUYER, 10);
    await expect(walletService.spendCoins(BUYER, -50, 'x', 'fact_purchase')).rejects.toThrow();
    expect(balanceOf(BUYER)).toBe(10);
  });

  // NaN passes `balance < amount` (false) and then poisons the balance.
  it.fails('KNOWN BUG: spendCoins rejects NaN instead of corrupting the balance', async () => {
    seedWallet(BUYER, 10);
    await expect(walletService.spendCoins(BUYER, Number.NaN, 'x', 'fact_purchase')).rejects.toThrow();
    expect(balanceOf(BUYER)).toBe(10);
  });
});
