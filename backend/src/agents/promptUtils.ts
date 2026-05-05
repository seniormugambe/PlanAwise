import type { FinancialContext, Transaction } from '../types.js';

export const clipText = (value: string, maxLength = 1200): string => {
  const trimmed = value.trim();
  return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength)}...` : trimmed;
};

export const summarizeContext = (context: FinancialContext = {}): Record<string, unknown> => ({
  monthlyIncome: context.monthlyIncome,
  monthlyExpenses: context.monthlyExpenses,
  currentSavings: context.currentSavings,
  totalBalance: context.totalBalance,
  riskTolerance: context.riskTolerance,
  goals: context.goals?.slice(0, 5).map(goal => ({
    title: goal.title,
    current: goal.current,
    target: goal.target,
  })),
});

export const summarizeTransactions = (transactions: Transaction[] = [], maxItems = 12): Array<Record<string, unknown>> =>
  transactions
    .slice(-maxItems)
    .map(transaction => ({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      date: transaction.date,
    }));

export const compactFinancialPrompt = (
  task: string,
  context: FinancialContext = {},
  transactions: Transaction[] = [],
  extra?: Record<string, unknown>
): string => JSON.stringify({
  task,
  context: summarizeContext(context),
  transactions: summarizeTransactions(transactions),
  ...extra,
});
