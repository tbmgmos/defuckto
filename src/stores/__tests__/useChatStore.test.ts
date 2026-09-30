import { beforeEach, describe, expect, it, vi } from 'vitest';
import { chatService } from '../../services/chatService';
import { CURRENT_USER_ID } from '../../data/users';
import { resetDb } from '../../services/__tests__/helpers';
import { useChatStore } from '../useChatStore';

// The store imports the services barrel, which pulls in expo-notifications
// and AsyncStorage. Only chatService is needed here.
vi.mock('../../services', async () => ({
  chatService: (await import('../../services/chatService')).chatService,
}));

beforeEach(() => {
  resetDb();
  useChatStore.setState({ conversations: [] });
});

describe('useChatStore.sendMessage', () => {
  // chatService.sendMessage already pushes the message into the shared
  // conversation.messages array; the store then appends it to a copy of that
  // same array again. Found by /qa-flow (B1): the chat shows every sent
  // message twice and React warns about duplicate keys.
  it.fails('KNOWN BUG: a sent message is stored once, not twice', async () => {
    const conversation = await chatService.openConversation(CURRENT_USER_ID, 'u_someone');
    useChatStore.getState().upsertConversation(conversation);

    await useChatStore.getState().sendMessage(conversation.id, 'Привет');

    const stored = useChatStore.getState().conversations.find((c) => c.id === conversation.id);
    expect(stored?.messages.map((m) => m.text)).toEqual(['Привет']);
  });
});
