import { create } from 'zustand';
import { ChatMessageItem } from '../types/ai';
import { AIApi } from '../services/api/ai.api';

interface AIStore {
  messages: ChatMessageItem[];
  isThinking: boolean;
  sendMessage: (text: string) => Promise<void>;
}

export const useAIStore = create<AIStore>((set, get) => ({
  messages: [
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: '🚨 I am the AI Disaster Management & Emergency Response Assistant. How can I assist your immediate safety or disaster guidance right now?',
      timestamp: new Date().toISOString(),
    }
  ],
  isThinking: false,
  sendMessage: async (text: string) => {
    const userMsg: ChatMessageItem = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    set({ messages: [...get().messages, userMsg], isThinking: true });
    const botReply = await AIApi.sendChatMessage(text);
    set({ messages: [...get().messages, botReply], isThinking: false });
  }
}));
