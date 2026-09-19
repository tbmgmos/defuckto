import { beforeEach, describe, expect, it } from 'vitest';
import { chatService } from '../chatService';
import { BUYER, SELLER, resetDb } from './helpers';

beforeEach(() => {
  resetDb();
});

describe('first-contact cap', () => {
  it('lets the initiator send one message, then blocks until the other side replies', async () => {
    const conversation = await chatService.openConversation(BUYER, SELLER);

    await chatService.sendMessage(conversation.id, BUYER, 'Привет');
    await expect(chatService.sendMessage(conversation.id, BUYER, 'Ты тут?')).rejects.toThrow('Дождись ответа');
    expect(conversation.messages).toHaveLength(1);
  });

  it('turns into a normal conversation after the first reply', async () => {
    const conversation = await chatService.openConversation(BUYER, SELLER);
    await chatService.sendMessage(conversation.id, BUYER, 'Привет');

    await chatService.sendMessage(conversation.id, SELLER, 'Привет!');
    await chatService.sendMessage(conversation.id, BUYER, 'Как дела?');
    await chatService.sendMessage(conversation.id, BUYER, 'И ещё вопрос');

    expect(conversation.messages).toHaveLength(4);
  });

  it('reuses one conversation per pair and trims message text', async () => {
    const first = await chatService.sendMessageTo(SELLER, BUYER, '  Привет  ');
    const again = await chatService.openConversation(SELLER, BUYER);

    expect(again.id).toBe(first.id);
    expect(first.messages[0].text).toBe('Привет');
  });

  it('marks unanswered first contact as a pending request for the recipient only', async () => {
    const conversation = await chatService.sendMessageTo(SELLER, BUYER, 'Привет');

    expect(chatService.isPendingRequest(conversation, SELLER)).toBe(true);
    expect(chatService.isPendingRequest(conversation, BUYER)).toBe(false);

    await chatService.sendMessage(conversation.id, SELLER, 'Привет!');
    expect(chatService.isPendingRequest(conversation, SELLER)).toBe(false);
  });

  it('rejects an unknown conversation', async () => {
    await expect(chatService.sendMessage('c_missing', BUYER, 'x')).rejects.toThrow('Диалог не найден');
  });
});
