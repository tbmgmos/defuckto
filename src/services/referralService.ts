import { ReferralInfo } from '../models';
import { db, delay } from './localDatabase';

export const REFERRAL_BONUS = 30;

// Honest limitation: without a backend there's no way to know a friend
// actually installed the app from this code, so "redeem" here is a
// same-device demo action, not real cross-device tracking. Wiring this up
// for real means a backend that issues/validates codes at signup.
export const referralService = {
  async getMyReferral(userId: string): Promise<ReferralInfo> {
    const info = db.referrals.get(userId);
    if (!info) throw new Error('Реферальный код не найден');
    return delay({ ...info });
  },

  async simulateRedeem(userId: string): Promise<ReferralInfo> {
    const info = db.referrals.get(userId);
    if (!info) throw new Error('Реферальный код не найден');
    info.invitesRedeemed += 1;
    return delay({ ...info });
  },
};
