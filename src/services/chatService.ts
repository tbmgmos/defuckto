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

  /**
   * True when `viewerId` has an unanswered first-contact message sitting in
   * this conversation — the other person reached out and the viewer hasn't
   * replied at all yet. Drives the "Запросы" section in the messages list;
   * replying even once is what turns a request into a normal conversation.
   */
  isPendingRequest(conversation: Conversation, viewerId: string): boolean {
    return conversation.messages.length > 0 && !conversation.messages.some((m) => m.senderId === viewerId);
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

    // Cap the initiator to one message until the other side replies at
    // least once — otherwise a request thread could be spammed before the
    // recipient ever opens it. Once they've replied even once, this is a
    // normal back-and-forth and the cap no longer applies.
    const otherId = conversation.participantIds.find((id) => id !== senderId);
    const senderAlreadySent = conversation.messages.some((m) => m.senderId === senderId);
    const otherHasReplied = otherId ? conversation.messages.some((m) => m.senderId === otherId) : true;
    if (senderAlreadySent && !otherHasReplied) {
      throw new Error('Дождись ответа, прежде чем писать снова');
    }

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
