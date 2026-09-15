import { Interest, InterestKey } from '../models';

export const INTERESTS: Record<InterestKey, Interest> = {
  music: { key: 'music', label: 'Музыка', icon: 'musical-notes-outline' },
  travel: { key: 'travel', label: 'Путешествия', icon: 'airplane-outline' },
  games: { key: 'games', label: 'Игры', icon: 'game-controller-outline' },
  sport: { key: 'sport', label: 'Спорт', icon: 'fitness-outline' },
  food: { key: 'food', label: 'Еда', icon: 'restaurant-outline' },
  life: { key: 'life', label: 'Жизнь', icon: 'leaf-outline' },
  weird: { key: 'weird', label: 'Странное', icon: 'planet-outline' },
};

export function interestLabel(key: InterestKey): string {
  return INTERESTS[key].label;
}

export function interestIcon(key: InterestKey): string {
  return INTERESTS[key].icon;
}
