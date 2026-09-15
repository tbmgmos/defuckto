import { Conversation, Message } from '../models';
import { db, delay } from './localDatabase';
import { createId } from '../utils/id';
import { isoNow } from '../utils/date';

function findConversation(userA: string, userB: string): Conversation | undefined {
  return db.conversations.find(
    (c) => c.participantIds.includes(userA) && c.participantIds.includes(userB),
  );
}

function createConversation(userA: string, userB: string): Conversation {
  const conversation: Conversation = {
    id: createId('c'),
    participantIds: [userA, userB],
    messages: [],
    createdAt: isoNow(),
  };
  db.conversations.push(conversation);
  return conversation;
}

export const chatService = {
  /** Finds (or opens) the conversation between two users without sending anything — for flows that just need a place to write, not a fabricated first message. */
  async openConversation(userA: string, userB: string): Promise<Conversation> {
    const conversation = findConversation(userA, userB) ?? createConversation(userA, userB);
    return delay(conversation, 0);
  },


  async getConversationsForUser(userId: string): Promise<Conversation[]> {
    const list = db.conversations
      .filter((c) => c.participantIds.includes(userId))
      .slice()
      .sort((a, b) => {
        const aLast = a.messages[a.messages.length - 1]?.createdAt ?? a.createdAt;
        const bLast = b.messages[b.messages.length - 1]?.createdAt ?? b.createdAt;
        return new Date(bLast).getTime() - new Date(aLast).getTime();
      });
    return delay(list);
  },

  async getConversation(conversationId: string): Promise<Conversation | undefined> {
    return delay(db.conversations.find((c) => c.id === conversationId));
  },

  async sendMessage(conversationId: string, senderId: string, text: string): Promise<Message> {
    const conversation = db.conversations.find((c) => c.id === conversationId);
    if (!conversation) throw new Error('Диалог не найден');
    const message: Message = {
      id: createId('m'),
      conversationId,
      senderId,
      text: text.trim(),
      createdAt: isoNow(),
    };
    conversation.messages.push(message);
    return delay(message, 120);
  },

  /** Finds (or opens) the conversation between two users and drops the first message into it. */
  async sendMessageTo(otherUserId: string, senderId: string, text: string): Promise<Conversation> {
    const conversation = findConversation(senderId, otherUserId) ?? createConversation(senderId, otherUserId);
    await this.sendMessage(conversation.id, senderId, text);
    return delay(conversation, 120);
  },
};
