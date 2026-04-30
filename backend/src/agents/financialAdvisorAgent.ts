import { GeminiAI } from './geminiAgent.js';
import type { AgentResponse, FinancialContext } from '../types.js';

export class FinancialAdvisorAgent {
  private ai: GeminiAI;

  constructor(gemini: GeminiAI) {
    this.ai = gemini;
  }

  async getAdvice(question: string, context?: FinancialContext, apiKey?: string): Promise<AgentResponse> {
    if (!question) {
      return {
        content: 'Please provide a financial question so I can give you advice.',
        category: 'general',
        confidence: 0.5,
      };
    }

    const fullQuestion = context
      ? `${question}\n\nUser context: ${JSON.stringify(context)}`
      : question;

    try {
      const response = await this.ai.getAdvice(fullQuestion, apiKey);
      return {
        content: response.content,
        category: response.category,
        confidence: response.confidence,
      };
    } catch (error: any) {
      return {
        content: 'I could not connect to the AI service right now. Please try again later or use a local financial question.',
        category: 'general',
        confidence: 0.55,
      };
    }
  }

  async isConnected(apiKey?: string): Promise<boolean> {
    return this.ai.isConnected(apiKey);
  }
}
