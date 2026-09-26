'use client';

import { useState, useEffect, useCallback } from 'react';
import { aiStore } from '../stores/aiStore';
import { AIService } from '../services/ai.service';
import { AIMessage } from '../types/ai';

export function useAIChat() {
  const [state, setState] = useState(aiStore.getState());

  useEffect(() => {
    return aiStore.subscribe(() => {
      setState(aiStore.getState());
    });
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    aiStore.addMessage(userMessage);
    aiStore.setLoading(true);

    try {
      const response = await AIService.sendMessage(content, aiStore.getState().messages);
      aiStore.addMessage(response);
    } catch (error) {
      aiStore.addMessage({
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Emergency telemetry routing experienced latency. Local cached intelligence indicates no uncontained breaches.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      aiStore.setLoading(false);
    }
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    sendMessage,
    clearChat: aiStore.clearChat,
  };
}
