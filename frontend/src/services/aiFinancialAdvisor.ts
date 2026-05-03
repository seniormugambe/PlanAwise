interface FinancialContext {
  monthlyIncome?: number;
  monthlyExpenses?: number;
  currentSavings?: number;
  totalBalance?: number;
  goals?: Array<{
    title: string;
    current: number;
    target: number;
  }>;
}

interface AdviceResponse {
  content: string;
  category: 'budgeting' | 'saving' | 'investing' | 'debt' | 'general';
  confidence: number;
}

export class AIFinancialAdvisor {
  private static instance: AIFinancialAdvisor;
  private financialContext: FinancialContext;

  constructor() {
    // Initialize with current dashboard data
    this.financialContext = {
      monthlyIncome: 5500,
      monthlyExpenses: 3420,
      currentSavings: 2850,
      totalBalance: 12450,
      goals: [
        { title: "Emergency Fund", current: 4500, target: 6000 },
        { title: "Vacation to Europe", current: 2800, target: 5000 },
        { title: "Retirement Savings", current: 15000, target: 20000 }
      ]
    };
  }

  static getInstance(): AIFinancialAdvisor {
    if (!AIFinancialAdvisor.instance) {
      AIFinancialAdvisor.instance = new AIFinancialAdvisor();
    }
    return AIFinancialAdvisor.instance;
  }

  async getAdvice(question: string): Promise<AdviceResponse> {
    const lowerQuestion = question.toLowerCase();
    
    // Emergency Fund Advice
    if (this.matchesKeywords(lowerQuestion, ['emergency', 'fund', 'emergency fund'])) {
      const emergencyGoal = this.financialContext.goals?.find(g => g.title.includes('Emergency'));
      const monthsOfExpenses = emergencyGoal ? (emergencyGoal.current / (this.financialContext.monthlyExpenses || 1)) : 0;
      
      return {
        content: `Based on your current expenses of $${this.financialContext.monthlyExpenses?.toLocaleString()}/month, you have ${monthsOfExpenses.toFixed(1)} months covered. I recommend building 3-6 months of expenses ($${((this.financialContext.monthlyExpenses || 0) * 3).toLocaleString()}-$${((this.financialContext.monthlyExpenses || 0) * 6).toLocaleString()}). You're ${emergencyGoal ? Math.round((emergencyGoal.current / emergencyGoal.target) * 100) : 0}% there! Consider automating $${Math.ceil(((this.financialContext.monthlyExpenses || 0) * 3 - (emergencyGoal?.current || 0)) / 6)} monthly to reach your goal in 6 months.`,
        category: 'saving',
        confidence: 0.95
      };
    }

    // Budgeting Advice
    if (this.matchesKeywords(lowerQuestion, ['budget', 'budgeting', 'spending', 'expenses'])) {
      const savingsRate = ((this.financialContext.currentSavings || 0) / (this.financialContext.monthlyIncome || 1)) * 100;
      
      return {
        content: `Your current savings rate is ${savingsRate.toFixed(1)}% - that's ${savingsRate > 20 ? 'excellent' : savingsRate > 15 ? 'good' : 'needs improvement'}! The 50/30/20 rule suggests: 50% needs ($${((this.financialContext.monthlyIncome || 0) * 0.5).toLocaleString()}), 30% wants ($${((this.financialContext.monthlyIncome || 0) * 0.3).toLocaleString()}), 20% savings ($${((this.financialContext.monthlyIncome || 0) * 0.2).toLocaleString()}). Your expenses are $${this.financialContext.monthlyExpenses?.toLocaleString()}, leaving room for ${savingsRate < 20 ? 'improvement' : 'optimization'}.`,
        category: 'budgeting',
        confidence: 0.9
      };
    }

    // Investment Advice
    if (this.matchesKeywords(lowerQuestion, ['invest', 'investment', 'stocks', 'retirement', '401k', 'ira'])) {
      return {
        content: `With your strong savings rate of $${this.financialContext.currentSavings?.toLocaleString()}/month, you're ready to invest! Start with: 1) Max out employer 401(k) match (free money!), 2) Build emergency fund first, 3) Consider low-cost index funds for long-term growth. Your retirement goal shows great planning - compound interest will work in your favor. Aim to invest 10-15% of your $${this.financialContext.monthlyIncome?.toLocaleString()} income for retirement.`,
        category: 'investing',
        confidence: 0.85
      };
    }

    // Debt Management
    if (this.matchesKeywords(lowerQuestion, ['debt', 'credit card', 'loan', 'pay off'])) {
      return {
        content: `Great question! The strategy depends on interest rates: Pay minimums on all debts, then focus extra payments on highest interest debt first (avalanche method). If you have credit card debt (typically 18-25% APR), prioritize that over investing. For lower-interest debt like mortgages (3-7%), you can often invest while making minimum payments. Your strong cash flow of $${((this.financialContext.monthlyIncome || 0) - (this.financialContext.monthlyExpenses || 0)).toLocaleString()}/month gives you flexibility.`,
        category: 'debt',
        confidence: 0.88
      };
    }

    // Savings Rate
    if (this.matchesKeywords(lowerQuestion, ['savings rate', 'save', 'how much'])) {
      const currentRate = ((this.financialContext.currentSavings || 0) / (this.financialContext.monthlyIncome || 1)) * 100;
      
      return {
        content: `Your current savings rate of ${currentRate.toFixed(1)}% is ${currentRate > 20 ? 'excellent - you\'re ahead of most people!' : currentRate > 15 ? 'good, but there\'s room to optimize' : 'a great starting point with room for improvement'}. General guidelines: 20% minimum, 30%+ for early retirement. At your income level of $${this.financialContext.monthlyIncome?.toLocaleString()}/month, even small increases compound significantly over time.`,
        category: 'saving',
        confidence: 0.92
      };
    }

    // Goal-specific advice
    if (this.matchesKeywords(lowerQuestion, ['goal', 'goals', 'vacation', 'retirement'])) {
      const totalGoalAmount = this.financialContext.goals?.reduce((sum, goal) => sum + (goal.target - goal.current), 0) || 0;
      
      return {
        content: `You have ${this.financialContext.goals?.length || 0} active goals totaling $${totalGoalAmount.toLocaleString()} remaining. Your vacation goal is ${Math.round(((this.financialContext.goals?.[1]?.current || 0) / (this.financialContext.goals?.[1]?.target || 1)) * 100)}% complete - great progress! Consider setting up separate savings accounts for each goal and automating transfers. Your retirement savings show excellent long-term thinking.`,
        category: 'saving',
        confidence: 0.87
      };
    }

    // General financial advice
    return {
      content: `Based on your financial profile, you're doing well! Your monthly surplus of $${((this.financialContext.monthlyIncome || 0) - (this.financialContext.monthlyExpenses || 0)).toLocaleString()} shows good financial discipline. Key next steps: 1) Ensure emergency fund is complete, 2) Maximize retirement contributions, 3) Consider tax-advantaged accounts, 4) Review and rebalance investments annually. Feel free to ask about specific areas like budgeting, investing, or goal planning!`,
      category: 'general',
      confidence: 0.75
    };
  }

  private matchesKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  updateFinancialContext(context: Partial<FinancialContext>): void {
    this.financialContext = { ...this.financialContext, ...context };
  }
}

export const aiAdvisor = AIFinancialAdvisor.getInstance();