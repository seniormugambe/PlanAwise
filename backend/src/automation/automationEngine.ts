import type { AgentManagerRequest, AgentManagerResponse } from '../agents/agentManager.js';
import type { FinancialContext, Transaction } from '../types.js';

export interface AutomationConfig {
  enabled: boolean;
  checkInterval: number; // milliseconds
  agents: {
    budget?: { enabled: boolean; threshold?: number };
    savings?: { enabled: boolean; threshold?: number };
    investment?: { enabled: boolean; threshold?: number };
  };
}

export interface AutomationTrigger {
  type: 'spending_spike' | 'savings_opportunity' | 'low_balance' | 'investment_opportunity' | 'schedule';
  agent: string;
  query: string;
  context?: FinancialContext;
  transactions?: Transaction[];
  requiresApproval: boolean; // Safety flag - require user approval before any action
}

export interface AutomationResult {
  triggerId: string;
  trigger: AutomationTrigger;
  response?: AgentManagerResponse;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  timestamp: number;
  approvedAt?: number;
  executedAt?: number;
}

export class AutomationEngine {
  private config: AutomationConfig;
  private triggers: Map<string, AutomationResult> = new Map();
  private lastCheck = 0;
  private triggerId = 0;

  constructor(config: Partial<AutomationConfig> = {}) {
    this.config = {
      enabled: true,
      checkInterval: 5 * 60 * 1000, // 5 minutes
      agents: {
        budget: { enabled: true, threshold: 0.8 }, // Alert if spending is 80% of budget
        savings: { enabled: true, threshold: 100 }, // Alert if savings opportunity > $100
        investment: { enabled: true, threshold: 1000 }, // Alert if investment opportunity > $1000
      },
      ...config,
    };
  }

  /**
   * Detect automation triggers based on financial data
   */
  detectTriggers(context: FinancialContext, transactions: Transaction[] = []): AutomationTrigger[] {
    const triggers: AutomationTrigger[] = [];

    // Budget monitoring - detect spending spikes
    if (this.config.agents.budget?.enabled) {
      const recentExpenses = transactions
        .filter(t => t.type === 'expense')
        .slice(-10);
      
      if (recentExpenses.length > 0) {
        const avgExpense = recentExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0) / recentExpenses.length;
        const latestExpense = Math.abs(recentExpenses[recentExpenses.length - 1].amount);
        
        // Detect spending spike (expense 50% higher than average)
        if (latestExpense > avgExpense * 1.5) {
          triggers.push({
            type: 'spending_spike',
            agent: 'budget',
            query: `I just spent $${latestExpense.toFixed(2)} on ${recentExpenses[recentExpenses.length - 1].category}. Is this affecting my budget?`,
            context,
            transactions: recentExpenses,
            requiresApproval: false, // Info-only, no action needed
          });
        }
      }

      // Low balance alert
      if (context.totalBalance && context.totalBalance < 500) {
        triggers.push({
          type: 'low_balance',
          agent: 'budget',
          query: `My total balance is $${context.totalBalance}. Should I be concerned?`,
          context,
          requiresApproval: false,
        });
      }
    }

    // Savings monitoring - detect savings opportunities
    if (this.config.agents.savings?.enabled) {
      const incomeTransactions = transactions.filter(t => t.type === 'income');
      const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      if (totalIncome > (this.config.agents.savings?.threshold || 100)) {
        triggers.push({
          type: 'savings_opportunity',
          agent: 'savings',
          query: `I have ${incomeTransactions.length} recent income transactions totaling $${totalIncome.toFixed(2)}. How should I allocate this?`,
          context,
          transactions: incomeTransactions,
          requiresApproval: false, // Recommendation only
        });
      }
    }

    // Investment monitoring
    if (this.config.agents.investment?.enabled && context.totalBalance && context.totalBalance > (this.config.agents.investment?.threshold || 1000)) {
      triggers.push({
        type: 'investment_opportunity',
        agent: 'investment',
        query: `With my current balance of $${context.totalBalance}, what investment opportunities would you recommend?`,
        context,
        requiresApproval: false, // Recommendation only
      });
    }

    return triggers;
  }

  /**
   * Register a trigger for tracking
   */
  registerTrigger(trigger: AutomationTrigger): string {
    const id = `trigger_${++this.triggerId}`;
    this.triggers.set(id, {
      triggerId: id,
      trigger,
      status: 'pending',
      timestamp: Date.now(),
    });
    return id;
  }

  /**
   * Register triggers while avoiding duplicates from repeated dashboard checks.
   */
  registerTriggers(triggers: AutomationTrigger[]): string[] {
    return triggers.map(trigger => {
      const existing = Array.from(this.triggers.values()).find(result =>
        result.trigger.type === trigger.type &&
        result.trigger.agent === trigger.agent &&
        result.trigger.query === trigger.query &&
        result.status !== 'rejected'
      );

      return existing?.triggerId || this.registerTrigger(trigger);
    });
  }

  /**
   * Approve a trigger (gives permission to execute)
   */
  approveTrigger(triggerId: string): boolean {
    const result = this.triggers.get(triggerId);
    if (result && result.status === 'pending') {
      result.status = 'approved';
      result.approvedAt = Date.now();
      return true;
    }
    return false;
  }

  /**
   * Reject a trigger
   */
  rejectTrigger(triggerId: string): boolean {
    const result = this.triggers.get(triggerId);
    if (result && result.status === 'pending') {
      result.status = 'rejected';
      return true;
    }
    return false;
  }

  /**
   * Mark a trigger as executed
   */
  executeTrigger(triggerId: string, response: AgentManagerResponse): boolean {
    const result = this.triggers.get(triggerId);
    if (result) {
      result.status = 'executed';
      result.response = response;
      result.executedAt = Date.now();
      return true;
    }
    return false;
  }

  /**
   * Get pending triggers that require approval
   */
  getPendingTriggers(): AutomationResult[] {
    return Array.from(this.triggers.values()).filter(t => t.status === 'pending' && t.trigger.requiresApproval);
  }

  /**
   * Get approved triggers ready to execute
   */
  getApprovedTriggers(): AutomationResult[] {
    return Array.from(this.triggers.values()).filter(t => t.status === 'approved' && !t.response);
  }

  /**
   * Get triggers that can safely run now.
   * Advice-only triggers run automatically; money-moving triggers require approval first.
   */
  getRunnableTriggers(): AutomationResult[] {
    return Array.from(this.triggers.values()).filter(t =>
      !t.response &&
      ((t.status === 'pending' && !t.trigger.requiresApproval) || t.status === 'approved')
    );
  }

  /**
   * Get all trigger results
   */
  getAllTriggers(): AutomationResult[] {
    return Array.from(this.triggers.values());
  }

  /**
   * Get trigger history
   */
  getTriggerHistory(limit = 50): AutomationResult[] {
    return Array.from(this.triggers.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Clear old triggers (older than 24 hours)
   */
  cleanupOldTriggers(): number {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000;
    let removed = 0;

    for (const [id, result] of this.triggers) {
      if (now - result.timestamp > maxAge) {
        this.triggers.delete(id);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Get engine configuration
   */
  getConfig(): AutomationConfig {
    return { ...this.config };
  }

  /**
   * Update engine configuration
   */
  updateConfig(config: Partial<AutomationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get engine statistics
   */
  getStats(): {
    totalTriggers: number;
    pending: number;
    approved: number;
    executed: number;
    rejected: number;
  } {
    const results = Array.from(this.triggers.values());
    return {
      totalTriggers: results.length,
      pending: results.filter(r => r.status === 'pending').length,
      approved: results.filter(r => r.status === 'approved').length,
      executed: results.filter(r => r.status === 'executed').length,
      rejected: results.filter(r => r.status === 'rejected').length,
    };
  }
}

export const automationEngine = new AutomationEngine();
