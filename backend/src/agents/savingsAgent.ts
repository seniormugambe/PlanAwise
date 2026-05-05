import { GeminiAI } from './geminiAgent.js';
import { compactFinancialPrompt } from './promptUtils.js';
import type { AgentResponse, FinancialContext, Transaction, SavingsRecommendation } from '../types.js';

export class SavingsAgent {
  private gemini?: GeminiAI;

  constructor(gemini?: GeminiAI) {
    this.gemini = gemini;
  }

  async detectExtraMoney(context: FinancialContext, transactions: Transaction[] = [], apiKey?: string): Promise<AgentResponse> {
    if (this.gemini) {
      try {
        const prompt = compactFinancialPrompt('Find safe extra savings amount this month. Reply under 100 words.', context, transactions);
        return await this.gemini.ask(prompt, apiKey, false);
      } catch (error) {
        console.warn('Savings AI request failed; using local analysis:', error);
      }
    }

    const monthlyIncome = context.monthlyIncome || 0;
    const totalExpenses = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    const totalIncome = transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0) || monthlyIncome;
    const currentSavings = context.currentSavings || 0;

    const availableExtra = Math.max(totalIncome - totalExpenses - (currentSavings * 0.1), 0);
    const extraMessage = availableExtra > 0
      ? `I detected approximately $${availableExtra.toFixed(2)} of extra money that can be redirected into savings or investments.`
      : `There is not a clear extra surplus this month. Focus on keeping spending steady and look for small cost reductions in variable categories.`;

    return {
      content: `${extraMessage}`,
      category: 'saving',
      confidence: availableExtra > 0 ? 0.9 : 0.78,
      meta: {
        totalIncome,
        totalExpenses,
        currentSavings,
        availableExtra,
      },
    };
  }

  async suggestOrAutoSave(context: FinancialContext, transactions: Transaction[] = [], enableAutoSave = false, apiKey?: string): Promise<AgentResponse> {
    if (this.gemini) {
      try {
        const prompt = compactFinancialPrompt('Suggest savings amount. If autoSave true, mention user approval is required. Reply under 100 words.', context, transactions, { autoSave: enableAutoSave });
        return await this.gemini.ask(prompt, apiKey, false);
      } catch (error) {
        console.warn('Savings recommendation AI request failed; using local analysis:', error);
      }
    }

    const income = context.monthlyIncome || 0;
    const expenses = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    const buffer = Math.max(300, (income - expenses) * 0.25);
    const targetSave = Math.max(100, (income - expenses - buffer));

    const recommendation: SavingsRecommendation = {
      suggestedAmount: Math.round(targetSave * 100) / 100,
      reason: `You still have a cushion of $${buffer.toFixed(2)} after spending, so I recommend setting aside $${targetSave.toFixed(2)} this month.`,
    };

    if (enableAutoSave && recommendation.suggestedAmount > 0) {
      recommendation.autoSavePayload = {
        contractAddress: '0x0000000000000000000000000000000000000000',
        chainId: 137,
        valueWei: `0x${BigInt(Math.round(recommendation.suggestedAmount * 1e18)).toString(16)}`,
        data: '0x',
        description: 'Use this payload to submit a DeFi savings deposit transaction from your wallet.',
      };
    }

    return {
      content: `I recommend saving $${recommendation.suggestedAmount.toFixed(2)} this month. ${recommendation.reason}${recommendation.autoSavePayload ? ' I prepared a deposit payload, but you must approve and submit it yourself before any money moves.' : ''}`,
      category: 'saving',
      confidence: 0.9,
      meta: {
        recommendation,
      },
      requiresUserAction: Boolean(recommendation.autoSavePayload),
    };
  }

  async prepareSmartContractDeposit(amount: number, contractAddress = '0x0000000000000000000000000000000000000000', chainId = 137): Promise<AgentResponse> {
    const weiValue = `0x${BigInt(Math.round(amount * 1e18)).toString(16)}`;
    return {
      content: `Prepared a smart contract deposit payload for $${amount.toFixed(2)} to contract ${contractAddress} on chain ${chainId}. Nothing has been submitted or moved; approve it in your wallet only when you are ready.`,
      category: 'saving',
      confidence: 0.88,
      meta: {
        autoSavePayload: {
          contractAddress,
          chainId,
          valueWei: weiValue,
          data: '0x',
          description: 'Smart contract deposit payload for wallet execution.',
        },
      },
      requiresUserAction: true,
    };
  }
}
