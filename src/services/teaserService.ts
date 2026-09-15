import { InterestTeaser } from '../models';
import { db, delay } from './localDatabase';
import { economyService } from './economyService';
import { createId } from '../utils/id';
import { isoNow } from '../utils/date';

export const teaserService = {
  async getTeasersForUser(recipientId: string): Promise<InterestTeaser[]> {
    return delay(
      db.teasers
        .filter((t) => t.recipientId === recipientId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    );
  },

  async createTeaser(recipientId: string, curiousUserId: string, factId: string): Promise<InterestTeaser> {
    const teaser: InterestTeaser = {
      id: createId('teaser'),
      recipientId,
      curiousUserId,
      factId,
      createdAt: isoNow(),
      revealed: false,
    };
    db.teasers.unshift(teaser);
    return delay(teaser);
  },

  /** Spends coins to learn who's behind a teaser. Idempotent — revealing twice doesn't charge twice. */
  async reveal(teaserId: string, userId: string): Promise<InterestTeaser> {
    const teaser = db.teasers.find((t) => t.id === teaserId);
    if (!teaser) throw new Error('Не найдено');
    if (teaser.recipientId !== userId) throw new Error('Это не твой тизер');
    if (teaser.revealed) return delay(teaser, 0);

    await economyService.spendOnReveal(userId, 'Узнать, кто заинтересовался');
    teaser.revealed = true;
    return delay(teaser);
  },
};
