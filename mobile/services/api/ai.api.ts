import { mlApiClient } from './client';
import { ChatMessageItem } from '../../types/ai';

export const AIApi = {
  async sendChatMessage(message: string, context?: string): Promise<ChatMessageItem> {
    try {
      const res = await mlApiClient.post('/chat', { message, context });
      const text = res.data?.response || res.data?.message || 'Emergency instructions received.';
      return {
        id: `ai-msg-${Date.now()}`,
        role: 'assistant',
        content: text,
        timestamp: new Date().toISOString(),
        isOfflineExpertResponse: false,
      };
    } catch {
      return {
        id: `ai-msg-${Date.now()}`,
        role: 'assistant',
        content: '🚨 Offline Emergency Assistant: For immediate life threat, call 112 (National Emergency) or 108 (Medical Ambulance). Climb to higher elevation if floodwaters rise, or shelter in reinforced interior rooms away from glass during storms.',
        timestamp: new Date().toISOString(),
        isOfflineExpertResponse: true,
      };
    }
  }
};
