/**
 * Unified AI Agent Service
 * Handles all interactions with backend AI agents including:
 * - Budget analysis and suggestions
 * - Savings optimization
 * - Investment advice
 * - Financial guidance
 * - Receipt tracking
 */

import { Wallet, WalletTransaction } from '@/types/wallet';
import { FinancialGoal } from '@/types/goal';
import { apiUrl } from '@/lib/api';

export interface FinancialContext {
  monthlyIncome?: number;
  monthlyExpenses?: number;
  currentSavings?: number;
  totalBalance?: number;
  goals?: Array<{
    title: string;
    current: number;
    target: number;
  }>;
  wallets?: Wallet[];
  recentTransactions?: WalletTransaction[];
}

export interface AgentResponse {
  answer: string;
  agentUsed: string;
  confidence: number;
  reasoning?: string;
  requiresUserAction?: boolean;
  meta?: Record<string, unknown>;
}

export interface AutomationTrigger {
  triggerId: string;
  trigger: {
    type: string;
    agent: string;
    query: string;
    requiresApproval: boolean;
  };
  response?: AgentResponse;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  timestamp: number;
}

export interface AutomationRunResult {
  triggers: AutomationTrigger[];
  triggerIds: string[];
  executed: AutomationTrigger[];
  pending: AutomationTrigger[];
  message: string;
}

export interface BudgetAdvice {
  content: string;
  recommendations: string[];
  alertLevel: 'safe' | 'warning' | 'critical';
  confidence: number;
}

export interface SavingsAdvice {
  content: string;
  suggestedAmount: number;
  automationOption: boolean;
  confidence: number;
}

export interface InvestmentAdvice {
  content: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface Receipt {
  id: string;
  vendor?: string;
  total: number;
  items?: Array<{ name: string; price: number }>;
  date: Date;
  rawText: string;
}

class AIAgentService {
  private static instance: AIAgentService;
  private apiKey: string | null = null;

  private constructor() {
    this.apiKey = localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY;
  }

  static getInstance(): AIAgentService {
    if (!AIAgentService.instance) {
      AIAgentService.instance = new AIAgentService();
    }
    return AIAgentService.instance;
  }

  /**
   * Set or update the API key for agent operations
   */
  setApiKey(key: string): void {
    this.apiKey = key;
    localStorage.setItem('gemini_api_key', key);
  }

  /**
   * Generic query processor - automatically selects the best agent
   */
  async processQuery(
    query: string,
    context?: FinancialContext,
    transactions?: WalletTransaction[],
    preferredAgent: 'auto' | 'budget' | 'savings' | 'investment' | 'advisor' | 'receipt' = 'auto'
  ): Promise<AgentResponse> {
    try {
      const response = await fetch(apiUrl('/api/ai/process'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'x-api-key': this.apiKey } : {}),
        },
        body: JSON.stringify({
          query,
          context: this.prepareContext(context),
          transactions: transactions || [],
          preferredAgent,
        }),
      });

      if (!response.ok) {
        throw new Error(`Agent request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in processQuery:', error);
      throw error;
    }
  }

  /**
   * Get financial advice on any topic
   */
  async getFinancialAdvice(
    question: string,
    context?: FinancialContext
  ): Promise<AgentResponse> {
    try {
      const response = await fetch(apiUrl('/api/ai/advice'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'x-api-key': this.apiKey } : {}),
        },
        body: JSON.stringify({
          question,
          context: this.prepareContext(context),
        }),
      });

      if (!response.ok) {
        throw new Error(`Financial advice request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in getFinancialAdvice:', error);
      throw error;
    }
  }

  /**
   * Get budget analysis and recommendations
   */
  async getBudgetAdvice(
    context?: FinancialContext,
    transactions?: WalletTransaction[],
    mode: 'analyze' | 'suggest' | 'alert' = 'analyze'
  ): Promise<AgentResponse> {
    try {
      const response = await fetch(apiUrl('/api/ai/budget'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'x-api-key': this.apiKey } : {}),
        },
        body: JSON.stringify({
          context: this.prepareContext(context),
          transactions: transactions || [],
          mode,
        }),
      });

      if (!response.ok) {
        throw new Error(`Budget advice request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in getBudgetAdvice:', error);
      throw error;
    }
  }

  /**
   * Get savings optimization recommendations
   */
  async getSavingsAdvice(
    context?: FinancialContext,
    transactions?: WalletTransaction[],
    autoSave: boolean = false
  ): Promise<AgentResponse> {
    try {
      const response = await fetch(apiUrl('/api/ai/savings'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'x-api-key': this.apiKey } : {}),
        },
        body: JSON.stringify({
          context: this.prepareContext(context),
          transactions: transactions || [],
          autoSave,
        }),
      });

      if (!response.ok) {
        throw new Error(`Savings advice request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in getSavingsAdvice:', error);
      throw error;
    }
  }

  /**
   * Prepare a smart contract deposit for savings
   */
  async prepareSavingsDeposit(
    amount: number,
    contractAddress: string = '0x0000000000000000000000000000000000000000',
    chainId: number = 137
  ): Promise<any> {
    try {
      const response = await fetch(apiUrl('/api/ai/savings/deposit'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'x-api-key': this.apiKey } : {}),
        },
        body: JSON.stringify({
          amount,
          contractAddress,
          chainId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Savings deposit preparation failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in prepareSavingsDeposit:', error);
      throw error;
    }
  }

  /**
   * Get investment advice and recommendations
   */
  async getInvestmentAdvice(
    context?: FinancialContext,
    transactions?: WalletTransaction[],
    question?: string
  ): Promise<AgentResponse> {
    try {
      const response = await fetch(apiUrl('/api/ai/investment'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'x-api-key': this.apiKey } : {}),
        },
        body: JSON.stringify({
          context: this.prepareContext(context),
          transactions: transactions || [],
          question,
        }),
      });

      if (!response.ok) {
        throw new Error(`Investment advice request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in getInvestmentAdvice:', error);
      throw error;
    }
  }

  /**
   * Process receipt and extract spending information
   */
  async processReceipt(receiptText: string): Promise<Receipt> {
    try {
      const response = await fetch(apiUrl('/api/ai/receipts'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'x-api-key': this.apiKey } : {}),
        },
        body: JSON.stringify({
          receiptText,
        }),
      });

      if (!response.ok) {
        throw new Error(`Receipt processing failed with status ${response.status}`);
      }

      const data = await response.json();
      return {
        ...data.receipt,
        date: new Date(data.receipt.date || new Date()),
      };
    } catch (error) {
      console.error('Error in processReceipt:', error);
      throw error;
    }
  }

  /**
   * Get all tracked receipts
   */
  async getReceipts(): Promise<Receipt[]> {
    try {
      const response = await fetch(apiUrl('/api/ai/receipts'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'x-api-key': this.apiKey } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch receipts with status ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data.receipts)
        ? data.receipts.map((receipt: any) => ({
            ...receipt,
            date: new Date(receipt.date || new Date()),
          }))
        : [];
    } catch (error) {
      console.error('Error in getReceipts:', error);
      return [];
    }
  }

  /**
   * Check AI backend connection status
   */
  async checkStatus(): Promise<boolean> {
    try {
      const response = await fetch(apiUrl('/api/ai/manager/status'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'x-api-key': this.apiKey } : {}),
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return Object.values(data.agents || {}).some((status) => status === 'active') || data.connected === true;
    } catch (error) {
      console.error('Error checking AI status:', error);
      return false;
    }
  }

  /**
   * Detect automation opportunities and run safe advice-only agents.
   * Anything requiring a payment, transfer, or deposit remains pending for approval.
   */
  async detectAndRunAutomation(
    context?: FinancialContext,
    transactions?: WalletTransaction[]
  ): Promise<AutomationRunResult> {
    const response = await fetch(apiUrl('/api/automation/detect'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey ? { 'x-api-key': this.apiKey } : {}),
      },
      body: JSON.stringify({
        context: this.prepareContext(context),
        transactions: transactions || [],
      }),
    });

    if (!response.ok) {
      throw new Error(`Automation detection failed with status ${response.status}`);
    }

    return response.json();
  }

  /**
   * Prepare financial context from wallet and goal data
   */
  prepareContext(context?: FinancialContext): FinancialContext {
    if (!context) {
      return {};
    }

    // Calculate derived values if not provided
    const enrichedContext = { ...context };

    if (context.wallets && context.wallets.length > 0) {
      const totalAssets = context.wallets
        .filter((w) => w.balance > 0)
        .reduce((sum, w) => sum + w.balance, 0);
      const totalBalance = context.wallets.reduce((sum, w) => sum + w.balance, 0);

      enrichedContext.totalBalance = enrichedContext.totalBalance || totalBalance;
      enrichedContext.currentSavings = enrichedContext.currentSavings || totalAssets;
    }

    return enrichedContext;
  }

  /**
   * Format financial context as a readable string for prompts
   */
  formatContextAsText(context: FinancialContext): string {
    const parts: string[] = [];

    if (context.monthlyIncome) {
      parts.push(`Monthly Income: $${context.monthlyIncome.toLocaleString()}`);
    }

    if (context.monthlyExpenses) {
      parts.push(`Monthly Expenses: $${context.monthlyExpenses.toLocaleString()}`);
    }

    if (context.currentSavings) {
      parts.push(`Current Savings: $${context.currentSavings.toLocaleString()}`);
    }

    if (context.totalBalance) {
      parts.push(`Total Balance: $${context.totalBalance.toLocaleString()}`);
    }

    if (context.goals && context.goals.length > 0) {
      parts.push('Financial Goals:');
      context.goals.forEach((goal) => {
        const progress = ((goal.current / goal.target) * 100).toFixed(1);
        parts.push(
          `  - ${goal.title}: $${goal.current.toLocaleString()} / $${goal.target.toLocaleString()} (${progress}%)`
        );
      });
    }

    return parts.join('\n');
  }
}

export const aiAgentService = AIAgentService.getInstance();
