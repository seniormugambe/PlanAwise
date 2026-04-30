import { GeminiAI } from './geminiAgent.js';
import { BudgetAgent } from './budgetAgent.js';
import { SavingsAgent } from './savingsAgent.js';
import { InvestmentAgent } from './investmentAgent.js';
import { FinancialAdvisorAgent } from './financialAdvisorAgent.js';
import { ReceiptTrackerAgent } from './receiptTrackerAgent.js';
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
    const agent = req.preferredAgent !== 'auto' 
      ? req.preferredAgent 
      : this.detectAgent(req.query);

    let response: AgentResponse;
    let usedAgent: AgentType | AgentType[];

    if (agent === 'receipt' && req.receiptText) {
      const receipt = await this.receiptAgent.addReceipt(req.receiptText, req.apiKey);
      return {
        answer: `Receipt parsed and tracked. Vendor: ${receipt.vendor || 'Unknown'}, Total: $${receipt.total.toFixed(2)}, Items: ${receipt.items?.length || 0}`,
        agentUsed: 'receipt',
        confidence: 0.88,
        meta: { receipt },
      };
    }

    if (agent === 'auto') {
      // Multi-agent orchestration for complex requests
      const responses = await this.orchestrate(req);
      return responses;
    }

    if (agent === 'budget') {
      const mode = this.extractMode(req.query, ['analyze', 'suggest', 'alert']);
      response = await this.budgetAgent.analyzeSpending(req.context || {}, req.transactions, req.apiKey);
      if (mode === 'suggest') {
        response = await this.budgetAgent.suggestLimits(req.context || {}, req.apiKey);
      } else if (mode === 'alert') {
        response = await this.budgetAgent.alertOverspending(req.context || {}, req.transactions, req.apiKey);
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

    return {
      answer: response.content,
      agentUsed: usedAgent,
      confidence: response.confidence,
      meta: response.meta,
    };
  }

  private async orchestrate(req: AgentManagerRequest): Promise<AgentManagerResponse> {
    // Detect multiple agents needed
    const agents = this.detectMultipleAgents(req.query);
    const responses: AgentResponse[] = [];
    
    for (const agent of agents) {
      let response: AgentResponse;
      if (agent === 'budget') {
        response = await this.budgetAgent.analyzeSpending(req.context || {}, req.transactions, req.apiKey);
      } else if (agent === 'savings') {
        response = await this.savingsAgent.detectExtraMoney(req.context || {}, req.transactions, req.apiKey);
      } else if (agent === 'investment') {
        response = await this.investmentAgent.getInvestmentAdvice(req.context || {}, req.transactions, undefined, req.apiKey);
      } else {
        response = await this.advisorAgent.getAdvice(req.query, req.context, req.apiKey);
      }
      responses.push(response);
    }

    const combinedAnswer = responses.map(r => r.content).join('\n\n');
    const avgConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length;

    return {
      answer: combinedAnswer,
      agentUsed: agents as AgentType[],
      confidence: avgConfidence,
      meta: {
        agentCount: agents.length,
        agentResponses: responses.map(r => ({ category: r.category, meta: r.meta })),
      },
    };
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

  private detectMultipleAgents(query: string): string[] {
    const lower = query.toLowerCase();
    const agents = new Set<string>();

    if (lower.includes('budget') || lower.includes('spending')) agents.add('budget');
    if (lower.includes('save') || lower.includes('extra')) agents.add('savings');
    if (lower.includes('invest')) agents.add('investment');

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
      gemini: 'initialized',
    };
  }
}
