import { Quest, QuestKey } from '../models';
import { db, delay } from './localDatabase';
import { walletService } from './walletService';
import { CURRENT_USER_ID } from '../data/users';

export interface QuestProgressResult {
  quest: Quest;
  justCompleted: boolean;
}

export const questService = {
  async getQuests(): Promise<Quest[]> {
    return delay([...db.quests]);
  },

  /**
   * Bumps a quest's progress and auto-awards the reward the moment it's
   * completed — the demo has no separate "claim" step, see spec §20.
   */
  async advance(key: QuestKey, amount = 1): Promise<QuestProgressResult> {
    const quest = db.quests.find((q) => q.key === key);
    if (!quest || quest.completed) {
      return delay({ quest: quest as Quest, justCompleted: false }, 0);
    }
    quest.progress = Math.min(quest.target, quest.progress + amount);
    const justCompleted = quest.progress >= quest.target;
    if (justCompleted) {
      quest.completed = true;
      quest.claimed = true;
      await walletService.earnCoins(CURRENT_USER_ID, quest.reward, `Задание: ${quest.title}`, 'quest_reward');
    }
    return delay({ quest: { ...quest }, justCompleted });
  },
};
