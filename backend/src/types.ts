export type Category = 'budgeting' | 'saving' | 'investing' | 'debt' | 'general';

export interface FinancialGoal {
  title: string;
  current: number;
  target: number;
}

export interface FinancialContext {
  monthlyIncome?: number;
  monthlyExpenses?: number;
  currentSavings?: number;
  totalBalance?: number;
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
  goals?: FinancialGoal[];
}

export interface Transaction {
  id: string;
  date: string;
  category: string;
  amount: number;
  description?: string;
  type: 'expense' | 'income';
}

export interface ReceiptItem {
  description: string;
  amount: number;
  quantity?: number;
  tax?: number;
}

export interface ReceiptRecord {
  id: string;
  vendor?: string;
  date?: string;
  total: number;
  items?: ReceiptItem[];
  rawText: string;
}

export interface AgentResponse {
  content: string;
  category: Category;
  confidence: number;
  meta?: Record<string, unknown>;
}

export interface SavingsRecommendation {
  suggestedAmount: number;
  reason: string;
  autoSavePayload?: {
    contractAddress: string;
    chainId: number;
    valueWei: string;
    data: string;
    description: string;
  };
}
