import { useState, useCallback } from "react";
import { apiUrl, guardedFetch } from "@/lib/api";
import type { FinancialContext } from "@/services/aiAgentService";
import type { WalletTransaction } from "@/types/wallet";

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  category?: 'budgeting' | 'saving' | 'investing' | 'debt' | 'general';
  reasoning?: string;
  agentUsed?: string | string[];
  confidence?: number;
  cached?: boolean;
  requiresUserAction?: boolean;
  agenticPlan?: Array<{
    id: string;
    agent: string;
    goal: string;
    status: string;
  }>;
}

interface SendMessageOptions {
  context?: FinancialContext;
  transactions?: WalletTransaction[];
}

const fallbackReplies = [
  "I could not reach the AI service just now, but here is a useful next move: compare your monthly income against essentials, savings, debt payments, and flexible spending. The category growing fastest is usually the first place to adjust.",
  "The AI service is unavailable for a moment. A steady money check still helps: keep one month of expenses liquid, automate the next savings transfer, and avoid changing investments because of a single anxious day.",
  "I hit a connection issue, so I am switching to practical mode. Pick one goal, one number, and one date. For example: save $500 by the end of the month. Smaller targets make the next action obvious.",
];

const createWelcomeMessage = (): ChatMessage => ({
  id: "welcome",
  content: "Hi, I'm Finley. Ask me about your budget, savings goals, investments, or tradeoffs like debt versus investing. I can use your dashboard context when it is available, and I will flag anything that needs your approval before action.",
  isUser: false,
  timestamp: new Date(),
  category: 'general',
});

export const useFinancialChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    createWelcomeMessage()
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string, options: SendMessageOptions = {}) => {
    if (!content.trim() || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: content.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const conversationHistory = messages
        .filter(message => message.id !== "welcome")
        .slice(-6)
        .map(message => ({
          role: message.isUser ? 'user' as const : 'assistant' as const,
          content: message.content,
        }));
      const apiKey = localStorage.getItem('openai_api_key') || import.meta.env.VITE_OPENAI_API_KEY;
      const response = await guardedFetch(apiUrl('/api/ai/process'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ai-priority': 'user',
          ...(apiKey ? { 'x-api-key': apiKey } : {}),
        },
        body: JSON.stringify({
          query: content,
          context: {
            ...(options.context || {}),
            conversationHistory,
          },
          transactions: options.transactions || [],
          preferredAgent: 'auto',
        }),
      });

      if (!response.ok) {
        throw new Error(`AI backend request failed with status ${response.status}`);
      }

      const data = await response.json();
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        content: data.answer || 'Sorry, I could not get a response from the AI backend.',
        isUser: false,
        timestamp: new Date(),
        category: 'general',
        reasoning: data.reasoning,
        agentUsed: data.agentUsed,
        confidence: data.confidence,
        cached: Boolean(data.meta?.cached),
        requiresUserAction: Boolean(data.requiresUserAction),
        agenticPlan: Array.isArray(data.meta?.plan) ? data.meta.plan : undefined,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);

      const fallbackIndex = Math.floor(Math.random() * fallbackReplies.length);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: fallbackReplies[fallbackIndex],
        isUser: false,
        timestamp: new Date(),
        category: 'general',
        reasoning: error instanceof Error ? error.message : undefined,
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages]);

  const clearChat = useCallback(() => {
    setMessages([createWelcomeMessage()]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat
  };
};
