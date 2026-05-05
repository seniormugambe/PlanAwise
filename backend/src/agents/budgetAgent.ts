import { GeminiAI } from './geminiAgent.js';
import { compactFinancialPrompt } from './promptUtils.js';
import type { AgentResponse, FinancialContext, Transaction } from '../types.js';

export class BudgetAgent {
  private gemini?: GeminiAI;

  constructor(gemini?: GeminiAI) {
    this.gemini = gemini;
  }

  async analyzeSpending(context: FinancialContext, transactions: Transaction[] = [], apiKey?: string): Promise<AgentResponse> {
    if (this.gemini) {
      try {
        const prompt = compactFinancialPrompt('Budget: summarize spending, monthly limit, overspending. Reply under 100 words.', context, transactions);
        return await this.gemini.ask(prompt, apiKey, false);
      } catch (error) {
        console.warn('Budget AI request failed; using local analysis:', error);
      }
    }

    const monthlyIncome = context.monthlyIncome || 0;
    const monthlyExpenses = context.monthlyExpenses || 0;
    const expenseTransactions = transactions.filter(tx => tx.type === 'expense');
    const totalSpent = expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    const categories = expenseTransactions.reduce<Record<string, number>>((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});

    const suggestedLimit = monthlyIncome ? Math.min(monthlyIncome * 0.5, monthlyExpenses * 1.05) : monthlyExpenses;
    const overspending = totalSpent > suggestedLimit;
    const progress = monthlyIncome ? totalSpent / monthlyIncome : 0;

    const alerts = [] as string[];
    if (overspending) {
      alerts.push(`Your spending of $${totalSpent.toFixed(2)} is above your recommended monthly limit of $${suggestedLimit.toFixed(2)}.`);
    }
    if (monthlyExpenses && totalSpent > monthlyExpenses) {
      alerts.push(`You have spent $${(totalSpent - monthlyExpenses).toFixed(2)} more than your typical monthly expenses. Consider reducing variable categories first.`);
    }

    let content = `I tracked your current spending and found $${totalSpent.toFixed(2)} in expenses this month.`;
    if (alerts.length) {
      content += ` ${alerts.join(' ')}`;
    } else {
      content += ` You're within the suggested budget limit of $${suggestedLimit.toFixed(2)}. Great work staying in control!`;
    }

    return {
      content,
      category: 'budgeting',
      confidence: overspending ? 0.88 : 0.96,
      meta: {
        totalSpent,
        suggestedLimit,
        categoryTotals: categories,
        alerts,
        progress,
      },
    };
  }

  async suggestLimits(context: FinancialContext, apiKey?: string): Promise<AgentResponse> {
    if (this.gemini) {
      try {
        const prompt = compactFinancialPrompt('Suggest one safe monthly spending limit and brief reason.', context);
        return await this.gemini.ask(prompt, apiKey, false);
      } catch (error) {
        console.warn('Budget limit AI request failed; using local analysis:', error);
      }
    }

    const monthlyIncome = context.monthlyIncome || 0;
    const monthlyExpenses = context.monthlyExpenses || 0;
    const baseline = monthlyIncome ? monthlyIncome * 0.5 : monthlyExpenses;
    const cushion = monthlyExpenses * 0.1;
    const suggestedLimit = Math.round((baseline + cushion) * 100) / 100;

    return {
      content: `Based on your income and expenses, I suggest a monthly spending limit of $${suggestedLimit.toFixed(2)}. Keep fixed costs stable and allocate the rest to savings or goals.`,
      category: 'budgeting',
      confidence: 0.92,
      meta: {
        suggestedLimit,
        baseline,
        monthlyExpenses,
      },
    };
  }

  async alertOverspending(context: FinancialContext, transactions: Transaction[] = [], apiKey?: string): Promise<AgentResponse> {
    if (this.gemini) {
      try {
        const prompt = compactFinancialPrompt('Overspending check. Reply with alert only if needed; otherwise brief all-clear.', context, transactions);
        return await this.gemini.ask(prompt, apiKey, false);
      } catch (error) {
        console.warn('Overspending AI request failed; using local analysis:', error);
      }
    }

    const monthlyExpenses = context.monthlyExpenses || 0;
    const totalSpent = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    const alertThreshold = monthlyExpenses * 1.05;
    const isOverspending = totalSpent > alertThreshold;

    const content = isOverspending
      ? `Alert: You are currently overspending. Your expenses are $${totalSpent.toFixed(2)}, which is more than the alert threshold of $${alertThreshold.toFixed(2)}. Review subscriptions, dining, and shopping categories first.`
      : `You're tracking well. Current spending of $${totalSpent.toFixed(2)} is within the expected range based on your monthly expenses of $${monthlyExpenses.toFixed(2)}.`;

    return {
      content,
      category: 'budgeting',
      confidence: isOverspending ? 0.90 : 0.94,
      meta: {
        totalSpent,
        alertThreshold,
        isOverspending,
      },
    };
  }
}
