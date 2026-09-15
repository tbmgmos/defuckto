import { Quest } from '../models';

// Fresh state for "today". A real backend would reset this at local midnight.
export const INITIAL_QUESTS: Quest[] = [
  { key: 'add_fact', title: 'Добавь факт', reward: 20, target: 1, progress: 0, completed: false, claimed: false },
  { key: 'explore_profiles', title: 'Исследуй 3 профиля', reward: 15, target: 3, progress: 0, completed: false, claimed: false },
  { key: 'unlock_fact', title: 'Открой факт', reward: 10, target: 1, progress: 0, completed: false, claimed: false },
  { key: 'ask_question', title: 'Задай кому-нибудь вопрос', reward: 10, target: 1, progress: 0, completed: false, claimed: false },
];
