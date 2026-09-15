import { User } from '../models';

export const CURRENT_USER_ID = 'u_vlad';

export const USERS: User[] = [
  {
    id: CURRENT_USER_ID,
    name: 'Влад',
    age: 24,
    city: 'Берлин',
    bio: 'Здесь можно написать что-нибудь о себе.',
    interests: ['music', 'games', 'sport'],
    photoSeed: CURRENT_USER_ID,
    isCurrentUser: true,
  },
  {
    id: 'u_masha',
    name: 'Маша',
    age: 24,
    city: 'Берлин',
    bio: 'Коллекционирую странные истории и плохо играю на гитаре.',
    interests: ['music', 'games', 'travel'],
    photoSeed: 'u_masha',
  },
  {
    id: 'u_alex',
    name: 'Алекс',
    age: 27,
    city: 'Мюнхен',
    bio: 'Прохожу игры до конца титров. Даже плохие.',
    interests: ['games', 'music', 'food'],
    photoSeed: 'u_alex',
  },
  {
    id: 'u_sofia',
    name: 'София',
    age: 23,
    city: 'Барселона',
    bio: 'Путешествую так, будто у меня нет плана. Потому что у меня нет плана.',
    interests: ['travel', 'life', 'food'],
    photoSeed: 'u_sofia',
  },
  {
    id: 'u_lena',
    name: 'Лена',
    age: 26,
    city: 'Амстердам',
    bio: 'Дизайнер. Слишком много мнений про шрифты.',
    interests: ['life', 'music', 'weird'],
    photoSeed: 'u_lena',
  },
  {
    id: 'u_timur',
    name: 'Тимур',
    age: 29,
    city: 'Стамбул',
    bio: 'Бегаю по утрам, чтобы оправдать себе завтрак.',
    interests: ['sport', 'food', 'travel'],
    photoSeed: 'u_timur',
  },
  {
    id: 'u_ira',
    name: 'Ирина',
    age: 25,
    city: 'Прага',
    bio: 'У меня плейлист на 9 часов и ни одного объяснения.',
    interests: ['music', 'weird', 'life'],
    photoSeed: 'u_ira',
  },
  {
    id: 'u_danil',
    name: 'Данил',
    age: 28,
    city: 'Тбилиси',
    bio: 'Готовлю лучше, чем говорю комплименты.',
    interests: ['food', 'games', 'life'],
    photoSeed: 'u_danil',
  },
  {
    id: 'u_olya',
    name: 'Оля',
    age: 22,
    city: 'Варшава',
    bio: 'Знаю несколько бесполезных фактов на любой случай жизни.',
    interests: ['weird', 'travel', 'sport'],
    photoSeed: 'u_olya',
  },
];

export function getUserById(id: string): User | undefined {
  return USERS.find((u) => u.id === id);
}

export function getOtherUsers(): User[] {
  return USERS.filter((u) => !u.isCurrentUser);
}
