import type { FinancialContext } from "@/services/aiAgentService";
import type { FinancialGoal } from "@/types/goal";
import type { WalletSummary, WalletTransaction } from "@/types/wallet";

const sameMonth = (date: Date, reference: Date) =>
  date.getMonth() === reference.getMonth() && date.getFullYear() === reference.getFullYear();

export const getAnalysisTransactions = (transactions: WalletTransaction[]): WalletTransaction[] => {
  if (transactions.length === 0) {
    return [];
  }

  const latestTransactionDate = transactions.reduce((latest, transaction) =>
    transaction.date > latest ? transaction.date : latest,
  transactions[0].date);

  return transactions.filter((transaction) => sameMonth(transaction.date, latestTransactionDate));
};

export const getMonthlyCashflow = (transactions: WalletTransaction[]) => {
  const analysisTransactions = getAnalysisTransactions(transactions);
  const monthlyIncome = analysisTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  const monthlyExpenses = analysisTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

  return {
    analysisTransactions,
    monthlyIncome,
    monthlyExpenses,
    savingsRate: monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0,
  };
};

export const buildFinancialContext = (
  walletSummary: WalletSummary,
  goals: FinancialGoal[],
  transactions: WalletTransaction[]
): FinancialContext => {
  const { monthlyIncome, monthlyExpenses } = getMonthlyCashflow(transactions);

  return {
    monthlyIncome,
    monthlyExpenses,
    totalBalance: walletSummary.totalBalance,
    currentSavings: walletSummary.totalAssets,
    goals: goals.slice(0, 5).map((goal) => ({
      title: goal.title,
      current: goal.currentAmount,
      target: goal.targetAmount,
    })),
  };
};
