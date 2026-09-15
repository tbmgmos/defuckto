import { db, delay } from './localDatabase';

// A real implementation would run a liveness-check + face-match against
// the profile photo on a server. This demo just simulates the wait so the
// UI flow (camera step → "проверяем" → badge) can be built and tested now,
// and swapped for the real call later without touching any screen.
export const verificationService = {
  async submitVerification(userId: string): Promise<{ verified: true }> {
    const user = db.users.find((u) => u.id === userId);
    if (!user) throw new Error('Пользователь не найден');
    const result = await delay({ verified: true as const }, 1800);
    user.verified = true;
    return result;
  },
};
