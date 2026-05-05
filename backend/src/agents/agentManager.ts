import { GeminiAI } from './geminiAgent.js';
import { BudgetAgent } from './budgetAgent.js';
import { SavingsAgent } from './savingsAgent.js';
import { InvestmentAgent } from './investmentAgent.js';
import { FinancialAdvisorAgent } from './financialAdvisorAgent.js';
import { ReceiptTrackerAgent } from './receiptTrackerAgent.js';
import { globalCache } from '../cache/responseCache.js';
import type { AgentResponse, FinancialContext, Transaction } from '../types.js';

export type AgentType = 'budget' | 'savings' | 'investment' | 'advisor' | 'receipt' | 'auto';

export interface AgentManagerRequest {
  query: string;
  context?: FinancialContext;
  transactions?: Transaction[];
  apiKey?: string;
  preferredAgent?: AgentType;
  receiptText?: string;
}

export interface AgentManagerResponse {
  answer: string;
  agentUsed: AgentType | AgentType[];
  confidence: number;
  meta?: Record<string, unknown>;
  reasoning?: string;
  requiresUserAction?: boolean;
}

interface AgenticPlanStep {
  id: string;
  agent: Exclude<AgentType, 'auto' | 'receipt'>;
  goal: string;
  status: 'pending' | 'completed' | 'skipped';
}

interface AgenticObservation {
  agent: Exclude<AgentType, 'auto' | 'receipt'>;
  category: AgentResponse['category'];
  confidence: number;
  content: string;
  meta?: Record<string, unknown>;
}

export class AgentManager {
  private gemini: GeminiAI;
  private budgetAgent: BudgetAgent;
  private savingsAgent: SavingsAgent;
  private investmentAgent: InvestmentAgent;
  private advisorAgent: FinancialAdvisorAgent;
  private receiptAgent: ReceiptTrackerAgent;

  constructor(gemini: GeminiAI) {
    this.gemini = gemini;
    this.budgetAgent = new BudgetAgent(gemini);
    this.savingsAgent = new SavingsAgent(gemini);
    this.investmentAgent = new InvestmentAgent(gemini);
    this.advisorAgent = new FinancialAdvisorAgent(gemini);
    this.receiptAgent = new ReceiptTrackerAgent(gemini);
  }

  async process(req: AgentManagerRequest): Promise<AgentManagerResponse> {
    try {
      const primaryAgent = this.detectAgent(req.query);
      const agent = req.preferredAgent && req.preferredAgent !== 'auto'
        ? req.preferredAgent
        : primaryAgent;
      const useAgenticWorkflow = (req.preferredAgent || 'auto') === 'auto' && this.shouldUseAgenticWorkflow(req.query);
      const cacheKey = JSON.stringify({
        query: req.query,
        agent: useAgenticWorkflow ? 'agentic' : agent,
        context: req.context || {},
        transactions: req.transactions || [],
        receiptText: req.receiptText || '',
      });
      const cached = req.receiptText ? null : globalCache.get<AgentManagerResponse>('agent-manager', cacheKey);
      if (cached) {
        return {
          ...cached,
          meta: {
            ...(cached.meta || {}),
            cached: true,
          },
        };
      }

      let response: AgentResponse;
      let usedAgent: AgentType | AgentType[];

      if (agent === 'receipt' && req.receiptText) {
        const receipt = await this.receiptAgent.addReceipt(req.receiptText, req.apiKey);
        const result: AgentManagerResponse = {
          answer: `Receipt parsed and tracked. Vendor: ${receipt.vendor || 'Unknown'}, Total: $${receipt.total.toFixed(2)}, Items: ${receipt.items?.length || 0}`,
          agentUsed: 'receipt',
          confidence: 0.88,
          meta: { receipt },
        };
        return result;
      }

      if (useAgenticWorkflow) {
        const responses = await this.orchestrate(req);
        globalCache.set('agent-manager', cacheKey, responses);
        return responses;
      }

      if (agent === 'budget') {
        const mode = this.extractMode(req.query, ['analyze', 'suggest', 'alert']);
        if (mode === 'suggest') {
          response = await this.budgetAgent.suggestLimits(req.context || {}, req.apiKey);
        } else if (mode === 'alert') {
          response = await this.budgetAgent.alertOverspending(req.context || {}, req.transactions, req.apiKey);
        } else {
          response = await this.budgetAgent.analyzeSpending(req.context || {}, req.transactions, req.apiKey);
        }
        usedAgent = 'budget';
      } else if (agent === 'savings') {
        if (req.query.toLowerCase().includes('extra') || req.query.toLowerCase().includes('surplus')) {
          response = await this.savingsAgent.detectExtraMoney(req.context || {}, req.transactions, req.apiKey);
        } else {
          response = await this.savingsAgent.suggestOrAutoSave(req.context || {}, req.transactions, false, req.apiKey);
        }
        usedAgent = 'savings';
      } else if (agent === 'investment') {
        response = await this.investmentAgent.getInvestmentAdvice(req.context || {}, req.transactions, req.query, req.apiKey);
        usedAgent = 'investment';
      } else {
        response = await this.advisorAgent.getAdvice(req.query, req.context, req.apiKey);
        usedAgent = 'advisor';
      }

      const result: AgentManagerResponse = {
        answer: response.content,
        agentUsed: usedAgent,
        confidence: response.confidence,
        meta: response.meta,
        reasoning: response.reasoning,
        requiresUserAction: response.requiresUserAction || this.responseNeedsPermission(response),
      };
      globalCache.set('agent-manager', cacheKey, result);
      return result;
    } catch (error) {
      console.error("Agent manager error:", error);
      // Provide fallback responses when AI service is unavailable
      return this.getFallbackResponse(req);
    }
  }

  private async orchestrate(req: AgentManagerRequest): Promise<AgentManagerResponse> {
    const plan = this.createAgenticPlan(req);
    const observations: AgenticObservation[] = [];
    const completedPlan: AgenticPlanStep[] = [];
    
    for (const step of plan) {
      let response: AgentResponse;

      if (step.agent === 'budget') {
        response = await this.budgetAgent.analyzeSpending(req.context || {}, req.transactions, req.apiKey);
      } else if (step.agent === 'savings') {
        response = await this.savingsAgent.detectExtraMoney(req.context || {}, req.transactions, req.apiKey);
      } else if (step.agent === 'investment') {
        response = await this.investmentAgent.getInvestmentAdvice(req.context || {}, req.transactions, undefined, req.apiKey);
      } else {
        response = await this.advisorAgent.getAdvice(req.query, req.context, req.apiKey);
      }

      observations.push({
        agent: step.agent,
        category: response.category,
        confidence: response.confidence,
        content: response.content,
        meta: response.meta,
      });
      completedPlan.push({ ...step, status: 'completed' });
    }

    const combinedAnswer = this.synthesizeAgenticAnswer(req.query, observations);
    const avgConfidence = observations.reduce((sum, r) => sum + r.confidence, 0) / observations.length;

    return {
      answer: combinedAnswer,
      agentUsed: observations.map(observation => observation.agent),
      confidence: avgConfidence,
      reasoning: `Agentic workflow: planned ${completedPlan.length} specialist check${completedPlan.length === 1 ? '' : 's'}, gathered observations, then synthesized a combined recommendation.`,
      requiresUserAction: observations.some(observation => Boolean(observation.meta?.autoSavePayload || (observation.meta as any)?.recommendation?.autoSavePayload)),
      meta: {
        agentic: true,
        plan: completedPlan,
        observations: observations.map(observation => ({
          agent: observation.agent,
          category: observation.category,
          confidence: observation.confidence,
          meta: observation.meta,
        })),
      },
    };
  }

  private shouldUseAgenticWorkflow(query: string): boolean {
    const lower = query.toLowerCase();
    const mentionedAgents = this.detectMultipleAgents(query);
    const broadIntent = [
      'plan',
      'strategy',
      'prioritize',
      'what should i do',
      'how can i',
      'overall',
      'financial health',
      'next steps',
      'tradeoff',
      'trade-off',
      'compare',
    ].some(phrase => lower.includes(phrase));

    return mentionedAgents.length > 1 || broadIntent;
  }

  private createAgenticPlan(req: AgentManagerRequest): AgenticPlanStep[] {
    const detectedAgents = this.detectMultipleAgents(req.query)
      .filter(agent => agent !== 'advisor') as Array<Exclude<AgentType, 'auto' | 'receipt'>>;
    const lower = req.query.toLowerCase();
    const agents = new Set<Exclude<AgentType, 'auto' | 'receipt'>>(detectedAgents);

    if (agents.size === 0) {
      agents.add('budget');
      agents.add('savings');
      if ((req.context?.totalBalance || 0) > 1000 || lower.includes('invest') || lower.includes('strategy')) {
        agents.add('investment');
      }
    }

    if (lower.includes('debt') || lower.includes('overall') || lower.includes('financial health')) {
      agents.add('advisor');
    }

    const goalByAgent: Record<Exclude<AgentType, 'auto' | 'receipt'>, string> = {
      budget: 'Check cash flow, spending pressure, and budget risk.',
      savings: 'Find safe savings capacity and goal acceleration options.',
      investment: 'Review investable surplus, risk posture, and next investment move.',
      advisor: 'Frame the decision, tradeoffs, and safest next steps.',
    };

    return Array.from(agents).slice(0, 4).map((agent, index) => ({
      id: `step-${index + 1}`,
      agent,
      goal: goalByAgent[agent],
      status: 'pending',
    }));
  }

  private synthesizeAgenticAnswer(query: string, observations: AgenticObservation[]): string {
    const lines = [
      `I treated this as an agentic financial request and checked it from ${observations.length} angle${observations.length === 1 ? '' : 's'}.`,
      '',
    ];

    observations.forEach((observation) => {
      lines.push(`${this.formatAgentName(observation.agent)}: ${observation.content}`);
    });

    lines.push('');
    lines.push(`Recommended next move: ${this.pickNextMove(query, observations)}`);

    return lines.join('\n');
  }

  private formatAgentName(agent: AgentType): string {
    const labels: Record<string, string> = {
      budget: 'Budget agent',
      savings: 'Savings agent',
      investment: 'Investment agent',
      advisor: 'Advisor agent',
    };
    return labels[agent] || `${agent} agent`;
  }

  private pickNextMove(query: string, observations: AgenticObservation[]): string {
    const lower = query.toLowerCase();
    const budgetObservation = observations.find(observation => observation.agent === 'budget');
    const savingsObservation = observations.find(observation => observation.agent === 'savings');
    const investmentObservation = observations.find(observation => observation.agent === 'investment');

    if (lower.includes('invest') && investmentObservation) {
      return 'confirm your emergency buffer and cash-flow surplus, then invest gradually with a diversified low-cost approach.';
    }

    if (lower.includes('save') && savingsObservation) {
      return 'set a realistic automatic savings amount first, then review whether any leftover surplus should go toward investing.';
    }

    if (budgetObservation) {
      return 'stabilize spending and cash flow first; once the budget is healthy, move surplus toward savings and investments.';
    }

    return 'start with the lowest-risk action that improves cash flow this month, then review progress before taking money-moving actions.';
  }

  private detectAgent(query: string): AgentType {
    const lower = query.toLowerCase();

    if (lower.includes('receipt') || lower.includes('expense') || lower.includes('purchase')) {
      return 'receipt';
    }

    if (
      lower.includes('budget') ||
      lower.includes('spending') ||
      lower.includes('limit') ||
      lower.includes('overspend') ||
      lower.includes('spending too much')
    ) {
      return 'budget';
    }

    if (
      lower.includes('save') ||
      lower.includes('saving') ||
      lower.includes('extra money') ||
      lower.includes('surplus') ||
      lower.includes('auto-save') ||
      lower.includes('deposit')
    ) {
      return 'savings';
    }

    if (
      lower.includes('invest') ||
      lower.includes('investment') ||
      lower.includes('stock') ||
      lower.includes('portfolio') ||
      lower.includes('retirement') ||
      lower.includes('401k')
    ) {
      return 'investment';
    }

    // Default to advisor for general questions
    return 'advisor';
  }

  private detectMultipleAgents(query: string): AgentType[] {
    const lower = query.toLowerCase();
    const agents = new Set<AgentType>();

    if (lower.includes('budget') || lower.includes('spending') || lower.includes('cash flow')) agents.add('budget');
    if (lower.includes('save') || lower.includes('saving') || lower.includes('extra') || lower.includes('goal')) agents.add('savings');
    if (lower.includes('invest') || lower.includes('portfolio') || lower.includes('retirement')) agents.add('investment');
    if (lower.includes('debt') || lower.includes('tradeoff') || lower.includes('trade-off')) agents.add('advisor');

    // If no specific agent detected, return general advisor
    if (agents.size === 0) {
      agents.add('advisor');
    }

    return Array.from(agents);
  }

  private extractMode(query: string, modes: string[]): string {
    const lower = query.toLowerCase();
    for (const mode of modes) {
      if (lower.includes(mode)) {
        return mode;
      }
    }
    return modes[0];
  }

  private responseNeedsPermission(response: AgentResponse): boolean {
    return Boolean(response.meta?.autoSavePayload || (response.meta as any)?.recommendation?.autoSavePayload);
  }

  async isConnected(apiKey?: string): Promise<boolean> {
    return this.gemini.isConnected(apiKey);
  }

  getStatus(): Record<string, unknown> {
    return {
      agents: {
        budget: 'active',
        savings: 'active',
        investment: 'active',
        advisor: 'active',
        receipt: 'active',
      },
      ai: this.gemini.getStatus(),
    };
  }

  private getFallbackResponse(req: AgentManagerRequest): AgentManagerResponse {
    const query = req.query.toLowerCase();
    const context = req.context || {};
    const transactions = req.transactions || [];
    const expenses = transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const income = transactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const monthlyIncome = context.monthlyIncome ?? income;
    const monthlyExpenses = context.monthlyExpenses ?? expenses;
    const totalBalance = context.totalBalance ?? 0;
    const currentSavings = context.currentSavings ?? 0;
    const goals = context.goals || [];
    const surplus = monthlyIncome - monthlyExpenses;

    // Provide contextual fallback responses based on the query type
    if (query.includes('budget') || query.includes('spending')) {
      return {
        answer: `I couldn't connect to the AI service right now, but using your dashboard data I see about $${monthlyExpenses.toFixed(2)} in expenses against $${monthlyIncome.toFixed(2)} income for the analysis period. ${surplus >= 0 ? `That leaves roughly $${surplus.toFixed(2)} before goals or transfers.` : `That is a shortfall of about $${Math.abs(surplus).toFixed(2)}.`} Review the largest expense categories first.`,
        agentUsed: 'budget',
        confidence: 0.7,
        reasoning: "Fallback used live transaction and context totals because the AI provider was unavailable.",
        meta: { fallback: true, reason: 'AI service unavailable' }
      };
    }

    if (query.includes('save') || query.includes('saving')) {
      return {
        answer: `I couldn't connect to the AI service right now, but your current dashboard snapshot shows $${currentSavings.toFixed(2)} in assets and an estimated $${surplus.toFixed(2)} cash-flow ${surplus >= 0 ? 'surplus' : 'gap'}. ${surplus > 0 ? `A conservative next step is saving part of that surplus toward your top goal.` : `Focus on restoring positive cash flow before increasing savings.`}`,
        agentUsed: 'savings',
        confidence: 0.7,
        reasoning: "Fallback used live savings, cash-flow, and goal context because the AI provider was unavailable.",
        meta: { fallback: true, reason: 'AI service unavailable' }
      };
    }

    if (query.includes('invest') || query.includes('investment')) {
      return {
        answer: `I couldn't connect to the AI service right now, but your total balance is $${totalBalance.toFixed(2)} and estimated cash-flow surplus is $${surplus.toFixed(2)}. ${surplus > 0 ? `Before investing more, confirm your emergency buffer and near-term goals are funded.` : `Avoid adding investment risk until income is above expenses again.`}`,
        agentUsed: 'investment',
        confidence: 0.7,
        reasoning: "Fallback used live balance and cash-flow context because the AI provider was unavailable.",
        meta: { fallback: true, reason: 'AI service unavailable' }
      };
    }

    // Default fallback response
    return {
      answer: `I couldn't connect to the AI service right now. From your dashboard data: total balance is $${totalBalance.toFixed(2)}, analysis-period income is $${monthlyIncome.toFixed(2)}, expenses are $${monthlyExpenses.toFixed(2)}, and ${goals.length} active goal${goals.length === 1 ? ' is' : 's are'} being tracked.`,
      agentUsed: 'advisor',
      confidence: 0.6,
      reasoning: "Limited to live dashboard data without AI provider connectivity.",
      meta: { fallback: true, reason: 'AI service unavailable' }
    };
  }
}
