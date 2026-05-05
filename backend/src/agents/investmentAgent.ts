import { GeminiAI } from './geminiAgent.js';
import { compactFinancialPrompt } from './promptUtils.js';
import type { AgentResponse, FinancialContext, Transaction } from '../types.js';

export class InvestmentAgent {
  private gemini?: GeminiAI;
  private lastFallbackWarningAt = 0;
  private lastFallbackWarning = "";

  constructor(gemini?: GeminiAI) {
    this.gemini = gemini;
  }

  async getInvestmentAdvice(context: FinancialContext, transactions: Transaction[] = [], question?: string, apiKey?: string): Promise<AgentResponse> {
    let aiError: string | undefined;

    if (this.gemini) {
      try {
        const prompt = compactFinancialPrompt('Investment advice based on risk, cash flow, and question. Reply under 120 words.', context, transactions, {
          question: question?.slice(0, 500) || 'General investment guidance.',
        });
        return await this.gemini.ask(prompt, apiKey, false);
      } catch (error) {
        aiError = error instanceof Error ? error.message : "AI investment advice request failed";
        this.warnFallback(aiError);
      }
    }

    const risk = context.riskTolerance || 'moderate';
    const savings = context.currentSavings || 0;
    const monthlyIncome = context.monthlyIncome || 0;
    const monthlyExpenses = context.monthlyExpenses || 0;
    const surplus = monthlyIncome - monthlyExpenses;

    const adviceParts = [`Based on your profile, a ${risk} investment approach is appropriate.`];
    if (surplus > 0) {
      adviceParts.push(`You have approximately $${surplus.toFixed(2)} of monthly surplus to allocate toward investing.`);
    }
    if (savings > 0) {
      adviceParts.push(`Your cash buffer of $${savings.toFixed(2)} is a good foundation before increasing risk exposure.`);
    }

    if (risk === 'conservative') {
      adviceParts.push('Focus on diversified income and bond-like exposure, such as low-fee ETFs, high-yield savings, and short-term government bonds.');
    } else if (risk === 'aggressive') {
      adviceParts.push('Consider broad-market equity ETFs, emerging market exposure, and dollar-cost averaging to smooth market swings. Keep a reserve for volatility.');
    } else {
      adviceParts.push('A balanced mix of index funds, value and growth exposure, plus a small allocation to higher-growth opportunities is a strong strategy.');
    }

    if (question) {
      adviceParts.push(`To answer your question: ${question}`);
    }

    return {
      content: adviceParts.join(' '),
      category: 'investing',
      confidence: 0.89,
      meta: {
        risk,
        riskLevel: risk === 'conservative' ? 'low' : risk === 'aggressive' ? 'high' : 'medium',
        surplus,
        fallback: true,
        aiError,
        recommendedNextSteps: [
          'Maintain an emergency fund before increasing equity exposure',
          'Use low-cost diversified funds',
          'Rebalance annually and monitor fees',
        ],
      },
    };
  }

  private warnFallback(message: string): void {
    const now = Date.now();
    if (message === this.lastFallbackWarning && now - this.lastFallbackWarningAt < 5 * 60 * 1000) {
      return;
    }

    this.lastFallbackWarning = message;
    this.lastFallbackWarningAt = now;
    console.warn("Investment AI unavailable; using local fallback advice:", message);
  }
}
