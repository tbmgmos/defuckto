// Simulates the "other side" of the economy loop: other people occasionally
// unlocking one of your facts, or getting curious about you, while you're
// using the app — so the wallet and the interest inbox don't feel static.
// Nothing here is random-per-frame — the store decides how often to call
// this.

import { db, delay, SELLER_SHARE } from './localDatabase';
import { walletService } from './walletService';
import { teaserService } from './teaserService';
import { computeCurrentPrice } from './economyService';
import { CURRENT_USER_ID } from '../data/users';

export interface SimulatedUnlock {
  kind: 'unlock';
  buyerName: string;
  amount: number;
  factText: string;
}

export interface SimulatedTeaser {
  kind: 'teaser';
  factText: string;
}

export type SimulatedActivity = SimulatedUnlock | SimulatedTeaser;

export const simulationService = {
  async maybeSimulateIncomingActivity(): Promise<SimulatedActivity | null> {
    const myPaidFacts = db.facts.filter((f) => f.authorId === CURRENT_USER_ID && f.price > 0);
    if (myPaidFacts.length === 0) return delay(null, 0);

    const otherUsers = db.users.filter((u) => u.id !== CURRENT_USER_ID);
    const buyer = otherUsers[Math.floor(Math.random() * otherUsers.length)];
    const fact = myPaidFacts[Math.floor(Math.random() * myPaidFacts.length)];

    // 30% of the time: someone gets curious but hasn't paid yet — a teaser
    // the recipient can later pay to reveal, instead of an instant credit.
    if (Math.random() < 0.3) {
      await teaserService.createTeaser(CURRENT_USER_ID, buyer.id, fact.id);
      return delay({ kind: 'teaser', factText: fact.text });
    }

    const price = computeCurrentPrice(fact.price, fact.unlockCount);
    const amount = Math.round(price * SELLER_SHARE);

    fact.unlockCount += 1;
    await walletService.earnCoins(CURRENT_USER_ID, amount, `${buyer.name} открыл(а) твой факт`, 'fact_sale');

    return delay({ kind: 'unlock', buyerName: buyer.name, amount, factText: fact.text });
  },
};
