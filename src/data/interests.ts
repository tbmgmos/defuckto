import { Interest, InterestKey } from '../models';

export const INTERESTS: Record<InterestKey, Interest> = {
  music: { key: 'music', label: 'Музыка', emoji: '🎸' },
  travel: { key: 'travel', label: 'Путешествия', emoji: '✈️' },
  games: { key: 'games', label: 'Игры', emoji: '🎮' },
  sport: { key: 'sport', label: 'Спорт', emoji: '🏃' },
  food: { key: 'food', label: 'Еда', emoji: '🍜' },
  life: { key: 'life', label: 'Жизнь', emoji: '🌿' },
  weird: { key: 'weird', label: 'Странное', emoji: '🌀' },
};

export function interestLabel(key: InterestKey): string {
  return INTERESTS[key].label;
}

export function interestEmoji(key: InterestKey): string {
  return INTERESTS[key].emoji;
}
