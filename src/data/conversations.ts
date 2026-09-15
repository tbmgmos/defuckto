import { Conversation } from '../models';
import { createId } from '../utils/id';
import { isoHoursAgo, isoMinutesAgo } from '../utils/date';
import { CURRENT_USER_ID } from './users';

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'c_masha',
    participantIds: [CURRENT_USER_ID, 'u_masha'],
    createdAt: isoHoursAgo(30),
    messages: [
      {
        id: createId('m'),
        conversationId: 'c_masha',
        senderId: CURRENT_USER_ID,
        text: 'Почему ты вообще оказалась в этом поезде?',
        createdAt: isoHoursAgo(29),
      },
      {
        id: createId('m'),
        conversationId: 'c_masha',
        senderId: 'u_masha',
        text: 'Села не в тот вагон и решила, что судьба важнее билета.',
        createdAt: isoHoursAgo(28),
      },
      {
        id: createId('m'),
        conversationId: 'c_masha',
        senderId: 'u_masha',
        text: 'Ладно, теперь я тоже хочу знать, почему ты спросил про поезд 😂',
        createdAt: isoMinutesAgo(40),
      },
    ],
  },
  {
    id: 'c_alex',
    participantIds: [CURRENT_USER_ID, 'u_alex'],
    createdAt: isoHoursAgo(10),
    messages: [
      {
        id: createId('m'),
        conversationId: 'c_alex',
        senderId: 'u_alex',
        text: 'Твой факт про концерт меня заинтересовал.',
        createdAt: isoHoursAgo(3),
      },
    ],
  },
  {
    id: 'c_sofia',
    participantIds: [CURRENT_USER_ID, 'u_sofia'],
    createdAt: isoHoursAgo(70),
    messages: [
      {
        id: createId('m'),
        conversationId: 'c_sofia',
        senderId: 'u_sofia',
        text: 'Ты правда дочитал бы главу вместо посадки на самолёт?',
        createdAt: isoHoursAgo(69),
      },
      {
        id: createId('m'),
        conversationId: 'c_sofia',
        senderId: CURRENT_USER_ID,
        text: 'Зависит от главы. И от самолёта, если честно.',
        createdAt: isoHoursAgo(68),
      },
    ],
  },
];

export function getConversationsForUser(userId: string): Conversation[] {
  return CONVERSATIONS.filter((c) => c.participantIds.includes(userId));
}

export function getOtherParticipant(conversation: Conversation, userId: string): string {
  return conversation.participantIds.find((id) => id !== userId)!;
}
