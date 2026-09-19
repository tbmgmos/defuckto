// The only place money moves. Screens and stores call purchaseFact() /
// purchasePhoto() / askQuestion() / revealTeaser() — never spendCoins()/
// earnCoins() directly — so the split between buyer and seller, and the
// price-growth curve, live in exactly one place.

import { db, delay, SELLER_SHARE, TOP_PLACEMENT_HOURS } from './localDatabase';
import { walletService } from './walletService';
import { factService } from './factService';
import { photoService } from './photoService';
import { chatService } from './chatService';
import { Fact, FactPurchase, PhotoPurchase, ProfilePhoto, TopPlacement, TransactionType, Wallet } from '../models';
import { createId } from '../utils/id';
import { isoNow, localDayKey } from '../utils/date';

export const QUESTION_PRICE = 15;
export const REVEAL_INTEREST_PRICE = 12;

// One flat price for a ТОП 100 spot, deliberately not an auction: a fixed cost
// keeps the ranking from turning into "whoever pays most always sits on top".
// Position is set by when you bought (see topService.rankTop), and the coins
// are a pure sink — nobody is paid out.
export const TOP_PLACEMENT_PRICE = 50;

// Everyone gets a few questions a day for free — paying to unlock content is
// one thing, paying just to be allowed to speak to someone is the pattern
// scam "знакомства" sites use to bleed users message by message, and we
// don't want to look like that. Past the quota it reverts to a paid "extra
// question", not a hard wall.
export const FREE_QUESTIONS_PER_DAY = 5;

function sellerCut(price: number): number {
  return Math.round(price * SELLER_SHARE);
}

/**
 * The price actually charged grows with demand, but only a little: each of
 * the first 4 unlocks adds 5%, capped at +20%. Previously this grew to +80%
 * over 10 unlocks, which paid authors more for staying vague and racking up
 * unlocks than for actually connecting with someone — the curve is kept
 * mild on purpose so "popular content costs a bit more" stays a flavor
 * signal, not the main incentive.
 */
export function computeCurrentPrice(basePrice: number, unlockCount: number): number {
  if (basePrice <= 0) return 0;
  const growth = 1 + Math.min(unlockCount, 4) * 0.05;
  return Math.round(basePrice * growth);
}

function questionUsageToday(userId: string): number {
  const usage = db.dailyQuestionUsage.get(userId);
  if (!usage || usage.date !== localDayKey()) return 0;
  return usage.count;
}

function consumeFreeQuestion(userId: string): void {
  const today = localDayKey();
  const usage = db.dailyQuestionUsage.get(userId);
  if (!usage || usage.date !== today) {
    db.dailyQuestionUsage.set(userId, { date: today, count: 1 });
  } else {
    usage.count += 1;
  }
}

async function rewardOwner(sellerId: string, amount: number, description: string, type: TransactionType): Promise<Wallet> {
  return walletService.earnCoins(sellerId, amount, description, type);
}

export interface PurchaseFactResult {
  buyerWallet: Wallet;
  sellerEarnings: number;
  pricePaid: number;
  purchase: FactPurchase;
  fact: Fact;
}

export interface PurchasePhotoResult {
  buyerWallet: Wallet;
  sellerEarnings: number;
  pricePaid: number;
  purchase: PhotoPurchase;
  photo: ProfilePhoto;
}

export const economyService = {
  async purchaseFact(buyerId: string, factId: string, buyerName: string, authorName: string): Promise<PurchaseFactResult> {
    const fact = db.facts.find((f) => f.id === factId);
    if (!fact) throw new Error('Факт не найден');
    if (fact.price === 0) throw new Error('Этот факт уже открыт');
    if (fact.authorId === buyerId) throw new Error('Это твой собственный факт');

    const alreadyUnlocked = await factService.isUnlockedForUser(factId, buyerId);
    if (alreadyUnlocked) throw new Error('Факт уже открыт');

    const pricePaid = computeCurrentPrice(fact.price, fact.unlockCount);

    const buyerWallet = await walletService.spendCoins(
      buyerId,
      pricePaid,
      `Ты открыл факт ${authorName}`,
      'fact_purchase',
    );

    const sellerEarnings = sellerCut(pricePaid);
    await rewardOwner(fact.authorId, sellerEarnings, `${buyerName} открыл(а) твой факт`, 'fact_sale');

    fact.unlockCount += 1;

    const purchase: FactPurchase = {
      id: createId('fp'),
      factId,
      buyerId,
      sellerId: fact.authorId,
      price: pricePaid,
      sellerEarnings,
      createdAt: isoNow(),
    };
    db.purchases.push(purchase);

    return delay({ buyerWallet, sellerEarnings, pricePaid, purchase, fact: { ...fact } });
  },

  async purchasePhoto(buyerId: string, photoId: string, buyerName: string, authorName: string): Promise<PurchasePhotoResult> {
    const photo = db.photos.find((p) => p.id === photoId);
    if (!photo) throw new Error('Фото не найдено');
    if (photo.price === 0) throw new Error('Это фото уже открыто');
    if (photo.ownerId === buyerId) throw new Error('Это твоё собственное фото');

    const alreadyUnlocked = await photoService.isUnlockedForUser(photoId, buyerId);
    if (alreadyUnlocked) throw new Error('Фото уже открыто');

    const pricePaid = computeCurrentPrice(photo.price, photo.unlockCount);

    const buyerWallet = await walletService.spendCoins(
      buyerId,
      pricePaid,
      `Ты открыл фото ${authorName}`,
      'photo_purchase',
    );

    const sellerEarnings = sellerCut(pricePaid);
    await rewardOwner(photo.ownerId, sellerEarnings, `${buyerName} открыл(а) твоё фото`, 'photo_sale');

    photo.unlockCount += 1;

    const purchase: PhotoPurchase = {
      id: createId('pp'),
      photoId,
      buyerId,
      sellerId: photo.ownerId,
      price: pricePaid,
      sellerEarnings,
      createdAt: isoNow(),
    };
    db.photoPurchases.push(purchase);

    return delay({ buyerWallet, sellerEarnings, pricePaid, purchase, photo: { ...photo } });
  },

  async freeQuestionsRemaining(userId: string): Promise<number> {
    return delay(Math.max(0, FREE_QUESTIONS_PER_DAY - questionUsageToday(userId)), 0);
  },

  async askQuestion(
    buyerId: string,
    factId: string,
    buyerName: string,
    questionText: string,
  ): Promise<{ wallet: Wallet; conversationId: string; wasFree: boolean; pricePaid: number; freeQuestionsRemaining: number }> {
    const fact = db.facts.find((f) => f.id === factId);
    if (!fact) throw new Error('Факт не найден');
    if (fact.authorId === buyerId) throw new Error('Нельзя задать вопрос самому себе');

    const usedToday = questionUsageToday(buyerId);
    const isFree = usedToday < FREE_QUESTIONS_PER_DAY;

    let wallet: Wallet;
    if (isFree) {
      consumeFreeQuestion(buyerId);
      wallet = await walletService.getWallet(buyerId);
    } else {
      wallet = await walletService.spendCoins(
        buyerId,
        QUESTION_PRICE,
        `Доп. вопрос сверх дневного лимита: ${fact.text.slice(0, 24)}${fact.text.length > 24 ? '…' : ''}`,
        'question_sent',
      );
      const reward = sellerCut(QUESTION_PRICE);
      await rewardOwner(fact.authorId, reward, `${buyerName} задал(а) тебе доп. вопрос`, 'question_reward');
    }

    const conversation = await chatService.sendMessageTo(fact.authorId, buyerId, questionText);

    return delay({
      wallet,
      conversationId: conversation.id,
      wasFree: isFree,
      pricePaid: isFree ? 0 : QUESTION_PRICE,
      freeQuestionsRemaining: Math.max(0, FREE_QUESTIONS_PER_DAY - questionUsageToday(buyerId)),
    });
  },

  /**
   * Rewards sustained genuine interest (see interestService's mutual-interest
   * threshold) with free access to the rest of that author's paid facts/
   * photos — once someone has shown real interest, the economy should stop
   * charging them to keep learning about the same person. These are gifts,
   * not sales: no coins move, and unlockCount (the demand signal behind
   * computeCurrentPrice) is deliberately left untouched.
   */
  async grantFullAccess(buyerId: string, authorId: string): Promise<{ unlockedFactIds: string[]; unlockedPhotoIds: string[] }> {
    const unlockedFactIds: string[] = [];
    for (const fact of db.facts) {
      if (fact.authorId !== authorId || fact.price === 0) continue;
      const alreadyUnlocked = await factService.isUnlockedForUser(fact.id, buyerId);
      if (alreadyUnlocked) continue;
      const purchase: FactPurchase = {
        id: createId('fp'),
        factId: fact.id,
        buyerId,
        sellerId: authorId,
        price: 0,
        sellerEarnings: 0,
        createdAt: isoNow(),
      };
      db.purchases.push(purchase);
      unlockedFactIds.push(fact.id);
    }

    const unlockedPhotoIds: string[] = [];
    for (const photo of db.photos) {
      if (photo.ownerId !== authorId || photo.price === 0) continue;
      const alreadyUnlocked = await photoService.isUnlockedForUser(photo.id, buyerId);
      if (alreadyUnlocked) continue;
      const purchase: PhotoPurchase = {
        id: createId('pp'),
        photoId: photo.id,
        buyerId,
        sellerId: authorId,
        price: 0,
        sellerEarnings: 0,
        createdAt: isoNow(),
      };
      db.photoPurchases.push(purchase);
      unlockedPhotoIds.push(photo.id);
    }

    return delay({ unlockedFactIds, unlockedPhotoIds }, 0);
  },

  /**
   * Buys (or renews) a ТОП 100 spot for TOP_PLACEMENT_HOURS. Buying while
   * already active restarts the clock and moves the person back to the top —
   * it never stacks extra days.
   */
  async buyTopPlacement(userId: string): Promise<{ wallet: Wallet; placement: TopPlacement }> {
    const wallet = await walletService.spendCoins(
      userId,
      TOP_PLACEMENT_PRICE,
      'Размещение в ТОП 100',
      'top_placement',
    );
    const startedAt = isoNow();
    const placement: TopPlacement = {
      userId,
      startedAt,
      expiresAt: new Date(Date.now() + TOP_PLACEMENT_HOURS * 3_600_000).toISOString(),
      pricePaid: TOP_PLACEMENT_PRICE,
    };
    db.topPlacements.set(userId, placement);
    return delay({ wallet, placement: { ...placement } });
  },

  /** Spend coins to learn who's behind an interest teaser (see teaserService). */
  async revealTeaserCost(): Promise<number> {
    return REVEAL_INTEREST_PRICE;
  },

  async spendOnReveal(userId: string, description: string): Promise<Wallet> {
    return walletService.spendCoins(userId, REVEAL_INTEREST_PRICE, description, 'reveal_interest');
  },
};
