import AsyncStorage from '@react-native-async-storage/async-storage';
import { StreakState } from '../models';

const STORAGE_KEY = 'defuckto.streak';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // yyyy-mm-dd, local-enough for a demo
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay);
}

/** Escalating reward: bigger streaks pay more, capped so it never runs away. */
export function streakBonus(streak: number): number {
  return Math.min(10 + streak * 4, 50);
}

async function load(userId: string): Promise<StreakState> {
  try {
    const raw = await AsyncStorage.getItem(`${STORAGE_KEY}.${userId}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to a fresh streak
  }
  return { userId, currentStreak: 0, longestStreak: 0, lastActiveDate: '' };
}

async function save(state: StreakState): Promise<void> {
  try {
    await AsyncStorage.setItem(`${STORAGE_KEY}.${state.userId}`, JSON.stringify(state));
  } catch {
    // Non-fatal in a demo — worst case the streak resets next launch.
  }
}

export const streakService = {
  async getStreak(userId: string): Promise<StreakState> {
    return load(userId);
  },

  /**
   * Call once per meaningful daily action (opening a fact, publishing one…).
   * Returns the updated state plus whether this call actually advanced the
   * streak (so callers only pay out / celebrate once per day).
   */
  async recordActivity(userId: string): Promise<{ state: StreakState; advanced: boolean }> {
    const state = await load(userId);
    const today = todayKey();

    if (state.lastActiveDate === today) {
      return { state, advanced: false };
    }

    const gap = state.lastActiveDate ? daysBetween(state.lastActiveDate, today) : null;
    const nextStreak = gap === 1 ? state.currentStreak + 1 : 1; // a gap >1 day resets the streak

    const next: StreakState = {
      userId,
      currentStreak: nextStreak,
      longestStreak: Math.max(state.longestStreak, nextStreak),
      lastActiveDate: today,
    };
    await save(next);
    return { state: next, advanced: true };
  },
};
