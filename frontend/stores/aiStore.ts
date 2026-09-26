import { AIMessage, SituationBrief } from '../types/ai';

interface AIState {
  messages: AIMessage[];
  situationBrief: SituationBrief | null;
  isLoading: boolean;
  selectedModel: string;
}

type Listener = () => void;

class AIStore {
  private state: AIState = {
    messages: [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: 'Autonomous Incident Commander Copilot active. Monitoring regional sensor meshes across NER India (Meghalaya, Assam, Sikkim). How can I assist current operations?',
        timestamp: new Date().toISOString(),
        confidenceScore: 0.98,
      },
    ],
    situationBrief: null,
    isLoading: false,
    selectedModel: 'gemini-1.5-pro-disaster',
  };

  private listeners: Set<Listener> = new Set();

  public getState = (): AIState => this.state;

  public subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public addMessage = (message: AIMessage) => {
    this.state = {
      ...this.state,
      messages: [...this.state.messages, message],
    };
    this.notify();
  };

  public setLoading = (isLoading: boolean) => {
    this.state = { ...this.state, isLoading };
    this.notify();
  };

  public setSituationBrief = (brief: SituationBrief) => {
    this.state = { ...this.state, situationBrief: brief };
    this.notify();
  };

  public clearChat = () => {
    this.state = {
      ...this.state,
      messages: [],
    };
    this.notify();
  };
}

export const aiStore = new AIStore();
