import { create } from 'zustand';
import { Conversation, Message } from '../models';
import { chatService } from '../services';
import { CURRENT_USER_ID } from '../data/users';

interface ChatState {
  conversations: Conversation[];
  isLoading: boolean;
  load: () => Promise<void>;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  upsertConversation: (conversation: Conversation) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  isLoading: false,

  load: async () => {
    set({ isLoading: true });
    const conversations = await chatService.getConversationsForUser(CURRENT_USER_ID);
    set({ conversations, isLoading: false });
  },

  sendMessage: async (conversationId, text) => {
    const message: Message = await chatService.sendMessage(conversationId, CURRENT_USER_ID, text);
    set({
      conversations: get().conversations.map((c) =>
        c.id === conversationId ? { ...c, messages: [...c.messages, message] } : c,
      ),
    });
  },

  upsertConversation: (conversation) => {
    const exists = get().conversations.some((c) => c.id === conversation.id);
    set({
      conversations: exists
        ? get().conversations.map((c) => (c.id === conversation.id ? conversation : c))
        : [conversation, ...get().conversations],
    });
  },
}));
