import { InterestKey, User } from '../models';

/** Shared interests between two users — the cheapest honest "compatibility" signal we can compute without any ML. */
export function sharedInterests(a: User, b: User): InterestKey[] {
  const bSet = new Set(b.interests);
  return a.interests.filter((i) => bSet.has(i));
}

export function compatibilityScore(a: User, b: User): number {
  return sharedInterests(a, b).length;
}
