import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db, SELLER_SHARE } from '../localDatabase';
import {
  FREE_QUESTIONS_PER_DAY,
  QUESTION_PRICE,
  computeCurrentPrice,
  economyService,
} from '../economyService';
import { localDayKey } from '../../utils/date';
import { BUYER, SELLER, balanceOf, resetDb, seedFact, seedPhoto, seedWallet } from './helpers';

const buy = (factId: string, buyerId = BUYER) => economyService.purchaseFact(buyerId, factId, 'Покупатель', 'Автор');

beforeEach(() => {
  resetDb();
  seedWallet(BUYER, 1000);
  seedWallet(SELLER, 0);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('computeCurrentPrice', () => {
  it('grows 5% per unlock, capped at +20%', () => {
    const prices = [0, 1, 2, 3, 4, 5, 9, 50].map((n) => computeCurrentPrice(100, n));
    expect(prices).toEqual([100, 105, 110, 115, 120, 120, 120, 120]);
  });

  it('is free when the base price is zero or negative', () => {
    expect(computeCurrentPrice(0, 3)).toBe(0);
    expect(computeCurrentPrice(-10, 3)).toBe(0);
  });

  it('never exceeds +20% and never decreases as unlocks grow', () => {
    for (let base = 1; base <= 300; base++) {
      let previous = 0;
      for (let unlocks = 0; unlocks <= 12; unlocks++) {
        const price = computeCurrentPrice(base, unlocks);
        expect(price).toBeLessThanOrEqual(Math.round(base * 1.2));
        expect(price).toBeGreaterThanOrEqual(previous);
        previous = price;
      }
    }
  });
});

describe('purchaseFact', () => {
  it('moves coins buyer -> seller with the seller share and records everything', async () => {
    const fact = seedFact({ price: 100 });

    const result = await buy(fact.id);

    expect(result.pricePaid).toBe(100);
    expect(result.sellerEarnings).toBe(70);
    expect(balanceOf(BUYER)).toBe(900);
    expect(balanceOf(SELLER)).toBe(70);
    expect(fact.unlockCount).toBe(1);
    expect(db.purchases).toHaveLength(1);
    expect(db.transactions.map((t) => [t.userId, t.type, t.amount]).sort()).toEqual(
      [
        [BUYER, 'fact_purchase', -100],
        [SELLER, 'fact_sale', 70],
      ].sort(),
    );
  });

  it('charges the next buyer the grown price', async () => {
    const fact = seedFact({ price: 100 });
    seedWallet('u_second_buyer', 1000);

    await buy(fact.id);
    const second = await buy(fact.id, 'u_second_buyer');

    expect(second.pricePaid).toBe(105);
    expect(balanceOf('u_second_buyer')).toBe(895);
  });

  it('never pays the seller more than the buyer paid', async () => {
    for (const price of [1, 2, 3, 7, 15, 33, 99, 250]) {
      resetDb();
      seedWallet(BUYER, 10_000);
      seedWallet(SELLER, 0);
      const fact = seedFact({ price });
      const { pricePaid, sellerEarnings } = await buy(fact.id);
      expect(sellerEarnings).toBeGreaterThanOrEqual(0);
      expect(sellerEarnings).toBeLessThanOrEqual(pricePaid);
    }
  });

  it('rejects an unknown fact, a free fact, your own fact and a repeat purchase', async () => {
    const paid = seedFact({ price: 100 });
    const free = seedFact({ price: 0 });
    const own = seedFact({ price: 100, authorId: BUYER });

    await expect(buy('f_missing')).rejects.toThrow('Факт не найден');
    await expect(buy(free.id)).rejects.toThrow('уже открыт');
    await expect(buy(own.id)).rejects.toThrow('собственный');

    await buy(paid.id);
    await expect(buy(paid.id)).rejects.toThrow('Факт уже открыт');
    expect(balanceOf(BUYER)).toBe(900);
  });

  it('changes nothing when the buyer cannot afford it', async () => {
    const fact = seedFact({ price: 100 });
    seedWallet(BUYER, 40);

    await expect(buy(fact.id)).rejects.toThrow('Недостаточно монет');

    expect(balanceOf(BUYER)).toBe(40);
    expect(balanceOf(SELLER)).toBe(0);
    expect(fact.unlockCount).toBe(0);
    expect(db.purchases).toHaveLength(0);
    expect(db.transactions).toHaveLength(0);
  });

  // The service checks "already unlocked", then awaits, then records the
  // purchase — a double tap slips through the gap and charges twice.
  it.fails('KNOWN BUG: a double tap buys the same fact twice', async () => {
    const fact = seedFact({ price: 100 });

    await Promise.allSettled([buy(fact.id), buy(fact.id)]);

    expect(balanceOf(BUYER)).toBe(900);
    expect(db.purchases).toHaveLength(1);
  });
});

describe('purchasePhoto', () => {
  const buyPhoto = (photoId: string) => economyService.purchasePhoto(BUYER, photoId, 'Покупатель', 'Автор');

  it('moves coins with the same seller share and unlocks the photo', async () => {
    const photo = seedPhoto({ price: 100 });

    const result = await buyPhoto(photo.id);

    expect(result.pricePaid).toBe(100);
    expect(balanceOf(BUYER)).toBe(900);
    expect(balanceOf(SELLER)).toBe(70);
    expect(photo.unlockCount).toBe(1);
    await expect(buyPhoto(photo.id)).rejects.toThrow('Фото уже открыто');
  });

  it('rejects the free cover photo and your own photo', async () => {
    const cover = seedPhoto({ price: 0 });
    const own = seedPhoto({ price: 100, ownerId: BUYER });

    await expect(buyPhoto(cover.id)).rejects.toThrow('уже открыто');
    await expect(buyPhoto(own.id)).rejects.toThrow('собственное');
    expect(balanceOf(BUYER)).toBe(1000);
  });
});

describe('askQuestion', () => {
  let authorSeq = 0;
  /** A fact by a brand-new author, so the first-contact cap never interferes. */
  const factByNewAuthor = () => seedFact({ authorId: `u_author_${++authorSeq}` });
  const ask = (factId: string, text = 'Вопрос') => economyService.askQuestion(BUYER, factId, 'Покупатель', text);

  it(`gives ${FREE_QUESTIONS_PER_DAY} free questions a day without touching the balance`, async () => {
    for (let i = 0; i < FREE_QUESTIONS_PER_DAY; i++) {
      const result = await ask(factByNewAuthor().id);
      expect(result.wasFree).toBe(true);
      expect(result.pricePaid).toBe(0);
      expect(result.freeQuestionsRemaining).toBe(FREE_QUESTIONS_PER_DAY - i - 1);
    }
    expect(balanceOf(BUYER)).toBe(1000);
  });

  it('turns into a paid extra question after the free quota, not a hard wall', async () => {
    for (let i = 0; i < FREE_QUESTIONS_PER_DAY; i++) await ask(factByNewAuthor().id);
    const fact = factByNewAuthor();

    const result = await ask(fact.id);

    expect(result.wasFree).toBe(false);
    expect(result.pricePaid).toBe(QUESTION_PRICE);
    expect(balanceOf(BUYER)).toBe(1000 - QUESTION_PRICE);
    expect(balanceOf(fact.authorId)).toBe(Math.round(QUESTION_PRICE * SELLER_SHARE));
  });

  it('never charges for a free question even with an empty wallet', async () => {
    seedWallet(BUYER, 0);
    await expect(ask(factByNewAuthor().id)).resolves.toMatchObject({ wasFree: true });
  });

  it('refuses a paid extra question when the wallet is empty', async () => {
    db.dailyQuestionUsage.set(BUYER, { date: localDayKey(), count: FREE_QUESTIONS_PER_DAY });
    seedWallet(BUYER, QUESTION_PRICE - 1);

    await expect(ask(factByNewAuthor().id)).rejects.toThrow('Недостаточно монет');
    expect(balanceOf(BUYER)).toBe(QUESTION_PRICE - 1);
  });

  it('resets the free quota on a new day', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-03-01T12:00:00Z'));
    for (let i = 0; i < FREE_QUESTIONS_PER_DAY; i++) await ask(factByNewAuthor().id);
    expect(await economyService.freeQuestionsRemaining(BUYER)).toBe(0);

    vi.setSystemTime(new Date('2026-03-02T12:00:00Z'));

    expect(await economyService.freeQuestionsRemaining(BUYER)).toBe(FREE_QUESTIONS_PER_DAY);
  });

  it('rejects an unknown fact and a question to yourself', async () => {
    await expect(ask('f_missing')).rejects.toThrow('Факт не найден');
    await expect(ask(seedFact({ authorId: BUYER }).id)).rejects.toThrow('самому себе');
  });

  // Coins move BEFORE the message is sent. Asking a second question to the
  // same author before they reply trips the "wait for a reply" cap AFTER the
  // buyer was already charged (and the seller already credited).
  it.fails('KNOWN BUG: a rejected message still charges the paid extra question', async () => {
    db.dailyQuestionUsage.set(BUYER, { date: localDayKey(), count: FREE_QUESTIONS_PER_DAY });
    const first = seedFact({ authorId: SELLER });
    const second = seedFact({ authorId: SELLER });
    await ask(first.id);
    const balanceBefore = balanceOf(BUYER);

    await expect(ask(second.id)).rejects.toThrow('Дождись ответа');

    expect(balanceOf(BUYER)).toBe(balanceBefore);
  });

  // Same ordering problem on the free path: the quota is consumed before
  // the message is accepted.
  it.fails('KNOWN BUG: a rejected message still burns a free question', async () => {
    await ask(seedFact({ authorId: SELLER }).id);
    await expect(ask(seedFact({ authorId: SELLER }).id)).rejects.toThrow('Дождись ответа');

    expect(await economyService.freeQuestionsRemaining(BUYER)).toBe(FREE_QUESTIONS_PER_DAY - 1);
  });
});

describe('grantFullAccess', () => {
  it("gifts the author's paid content without moving coins or demand", async () => {
    const paidFact = seedFact({ price: 100, unlockCount: 2 });
    const freeFact = seedFact({ price: 0 });
    const paidPhoto = seedPhoto({ price: 50 });
    const otherAuthorFact = seedFact({ price: 100, authorId: 'u_someone_else' });

    const result = await economyService.grantFullAccess(BUYER, SELLER);

    expect(result.unlockedFactIds).toEqual([paidFact.id]);
    expect(result.unlockedPhotoIds).toEqual([paidPhoto.id]);
    expect(result.unlockedFactIds).not.toContain(freeFact.id);
    expect(result.unlockedFactIds).not.toContain(otherAuthorFact.id);
    expect(balanceOf(BUYER)).toBe(1000);
    expect(balanceOf(SELLER)).toBe(0);
    expect(paidFact.unlockCount).toBe(2);
    expect(paidPhoto.unlockCount).toBe(0);
    expect(db.transactions).toHaveLength(0);
  });

  it('is idempotent', async () => {
    seedFact({ price: 100 });
    seedPhoto({ price: 50 });

    await economyService.grantFullAccess(BUYER, SELLER);
    const again = await economyService.grantFullAccess(BUYER, SELLER);

    expect(again).toEqual({ unlockedFactIds: [], unlockedPhotoIds: [] });
    expect(db.purchases).toHaveLength(1);
    expect(db.photoPurchases).toHaveLength(1);
  });
});
