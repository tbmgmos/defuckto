import { FactCategory, FactCategoryMeta } from '../models';

export const FACT_CATEGORIES: Record<FactCategory, FactCategoryMeta> = {
  music: { key: 'music', label: 'Музыка', emoji: '🎸' },
  travel: { key: 'travel', label: 'Путешествия', emoji: '✈️' },
  games: { key: 'games', label: 'Игры', emoji: '🎮' },
  weird: { key: 'weird', label: 'Странное', emoji: '🌀' },
  life: { key: 'life', label: 'Жизнь', emoji: '🌿' },
  food: { key: 'food', label: 'Еда', emoji: '🍜' },
  other: { key: 'other', label: 'Другое', emoji: '✨' },
};

// Facts-feed filter chips (spec §16) — deliberately excludes "Другое".
export const FACT_CATEGORY_LIST: FactCategoryMeta[] = [
  FACT_CATEGORIES.music,
  FACT_CATEGORIES.travel,
  FACT_CATEGORIES.games,
  FACT_CATEGORIES.weird,
  FACT_CATEGORIES.life,
  FACT_CATEGORIES.food,
];

// "Add a fact" category picker (spec §17) — its own curated order.
export const ADD_FACT_CATEGORY_LIST: FactCategoryMeta[] = [
  FACT_CATEGORIES.music,
  FACT_CATEGORIES.travel,
  FACT_CATEGORIES.games,
  FACT_CATEGORIES.life,
  FACT_CATEGORIES.weird,
  FACT_CATEGORIES.other,
];
