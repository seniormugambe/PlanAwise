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

export class LovableAIAdvisor {
  private static instance: LovableAIAdvisor;
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

  static getInstance(): LovableAIAdvisor {
    if (!LovableAIAdvisor.instance) {
      LovableAIAdvisor.instance = new LovableAIAdvisor();
    }
    return LovableAIAdvisor.instance;
  }

  async getAdvice(question: string): Promise<AdviceResponse> {
    const lowerQuestion = question.toLowerCase();
    
    // Friendly greetings and check-ins
    if (this.matchesKeywords(lowerQuestion, ['how am i doing', 'quick check', 'financial health', 'check up', 'doing financially'])) {
      const savingsRate = ((this.financialContext.currentSavings || 0) / (this.financialContext.monthlyIncome || 1)) * 100;
      const netWorth = (this.financialContext.totalBalance || 0);
      
      return {
        content: `Hey there! 🌟 Let me give you the good news first - you're doing better than you think! Your net worth of $${netWorth.toLocaleString()} shows real progress, and your ${savingsRate.toFixed(1)}% savings rate is ${savingsRate > 20 ? 'absolutely crushing it! 🚀' : savingsRate > 15 ? 'really solid! 💪' : 'a great foundation to build on! 🌱'} You're clearly someone who cares about their financial future, and that mindset alone puts you ahead of most people. Keep up the amazing work! ✨`,
        category: 'general',
        confidence: 0.98
      };
    }

    // Money tips
    if (this.matchesKeywords(lowerQuestion, ['money tip', 'tip', 'give me a tip', 'help me save'])) {
      const tips = [
        "💡 Try the 24-hour rule: Wait a day before any non-essential purchase over $50. You'll be amazed how many things you realize you don't actually need!",
        "🎯 Automate your savings first, then spend what's left. Pay yourself first - you deserve it!",
        "📱 Use the envelope method digitally: Create separate savings accounts for different goals. It's like having multiple piggy banks! 🐷",
        "☕ Make coffee at home 4 days a week instead of 5. That $20/week saved becomes $1,040/year - enough for a nice vacation! ✈️",
        "🛒 Shop with a list and stick to it. Grocery stores are designed to make you spend more - but you're smarter than that! 🧠",
        "💳 Use the credit card rewards game: Pay everything with a rewards card, then pay it off immediately. Free money! 💰",
        "🏦 Set up automatic transfers to savings right after payday. If you don't see it, you won't miss it! 👻"
      ];
      
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      
      return {
        content: `Here's a money tip that I absolutely love sharing: ${randomTip} Small changes create big results over time. You've got this! 💪`,
        category: 'general',
        confidence: 0.92
      };
    }

    // Emergency Fund Advice
    if (this.matchesKeywords(lowerQuestion, ['emergency', 'fund', 'emergency fund', 'boost'])) {
      const emergencyGoal = this.financialContext.goals?.find(g => g.title.includes('Emergency'));
      const monthsOfExpenses = emergencyGoal ? (emergencyGoal.current / (this.financialContext.monthlyExpenses || 1)) : 0;
      
      return {
        content: `Your emergency fund is looking good! 💪 With $${emergencyGoal?.current.toLocaleString()} saved, you've got ${monthsOfExpenses.toFixed(1)} months of expenses covered. That's ${monthsOfExpenses >= 3 ? 'fantastic progress! 🎉' : 'a solid start! 🌟'} 

The sweet spot is 3-6 months of expenses ($${((this.financialContext.monthlyExpenses || 0) * 3).toLocaleString()}-$${((this.financialContext.monthlyExpenses || 0) * 6).toLocaleString()}). You're ${emergencyGoal ? Math.round((emergencyGoal.current / emergencyGoal.target) * 100) : 0}% there! 

💡 Pro tip: Try saving just $${Math.ceil(((this.financialContext.monthlyExpenses || 0) * 3 - (emergencyGoal?.current || 0)) / 6)} monthly and you'll hit your goal in 6 months. You're closer than you think! ✨`,
        category: 'saving',
        confidence: 0.95
      };
    }

    // Budgeting Advice
    if (this.matchesKeywords(lowerQuestion, ['budget', 'budgeting', 'spending', 'expenses', 'best budgeting'])) {
      const savingsRate = ((this.financialContext.currentSavings || 0) / (this.financialContext.monthlyIncome || 1)) * 100;
      
      return {
        content: `Your current savings rate of ${savingsRate.toFixed(1)}% is ${savingsRate > 20 ? 'absolutely incredible! 🏆' : savingsRate > 15 ? 'really impressive! 👏' : 'a great starting point! 🌱'} 

Here's my favorite budgeting approach - the 50/30/20 rule with a twist! 🎯
• 50% for needs ($${((this.financialContext.monthlyIncome || 0) * 0.5).toLocaleString()}) - rent, groceries, utilities
• 30% for wants ($${((this.financialContext.monthlyIncome || 0) * 0.3).toLocaleString()}) - fun stuff you enjoy!
• 20% for savings ($${((this.financialContext.monthlyIncome || 0) * 0.2).toLocaleString()}) - future you will thank you! 

Your current expenses of $${this.financialContext.monthlyExpenses?.toLocaleString()} leave you with great flexibility. ${savingsRate < 20 ? 'There\'s room to optimize and save even more! 📈' : 'You\'re already ahead of the game! 🎮'}`,
        category: 'budgeting',
        confidence: 0.9
      };
    }

    // Investment Advice
    if (this.matchesKeywords(lowerQuestion, ['invest', 'investment', 'stocks', 'retirement', '401k', 'ira'])) {
      return {
        content: `I'm so excited you're thinking about investing! 🚀 With your strong savings rate of $${this.financialContext.currentSavings?.toLocaleString()}/month, you're absolutely ready to make your money work harder for you!

Here's my step-by-step game plan: 
1️⃣ Max out any employer 401(k) match first - it's literally FREE MONEY! 💰
2️⃣ Make sure your emergency fund is solid (you're doing great here! ✅)
3️⃣ Consider low-cost index funds - they're like buying a tiny piece of the entire economy! 📈
4️⃣ Your retirement goal shows you're thinking long-term - compound interest is going to be your best friend! ⏰

Aim to invest 10-15% of your $${this.financialContext.monthlyIncome?.toLocaleString()} income. Time is your superpower in investing! 💪`,
        category: 'investing',
        confidence: 0.85
      };
    }

    // Debt Management
    if (this.matchesKeywords(lowerQuestion, ['debt', 'credit card', 'loan', 'pay off'])) {
      return {
        content: `Great question about debt strategy! 🎯 Here's the game plan that actually works:

The "Debt Avalanche" method is mathematically optimal:
1️⃣ Pay minimums on all debts (never miss these!)
2️⃣ Throw every extra dollar at the highest interest rate debt first
3️⃣ Once that's gone, attack the next highest rate

💡 Quick rule: If you have credit card debt (usually 18-25% APR), prioritize that over investing. But for lower-interest debt like mortgages (3-7%), you can often invest while making minimum payments.

Your strong cash flow of $${((this.financialContext.monthlyIncome || 0) - (this.financialContext.monthlyExpenses || 0)).toLocaleString()}/month gives you amazing flexibility! You're in control here! 💪`,
        category: 'debt',
        confidence: 0.88
      };
    }

    // Savings Rate
    if (this.matchesKeywords(lowerQuestion, ['savings rate', 'save', 'how much', 'on track'])) {
      const currentRate = ((this.financialContext.currentSavings || 0) / (this.financialContext.monthlyIncome || 1)) * 100;
      
      return {
        content: `Your savings rate of ${currentRate.toFixed(1)}% is ${currentRate > 20 ? 'absolutely phenomenal - you\'re in the top 10% of savers! 🏆' : currentRate > 15 ? 'really solid - you\'re doing better than most people! 👏' : 'a fantastic foundation to build on! 🌱'}

Here's the savings rate breakdown:
• 0-10%: Getting started 🌱
• 10-15%: Good progress 👍  
• 15-20%: Excellent work 🌟
• 20%+: Financial rockstar! 🚀

At your income level of $${this.financialContext.monthlyIncome?.toLocaleString()}/month, even small increases compound significantly over time. You're building real wealth here! 💎`,
        category: 'saving',
        confidence: 0.92
      };
    }

    // Goal-specific advice
    if (this.matchesKeywords(lowerQuestion, ['goal', 'goals', 'vacation', 'retirement', 'prioritize'])) {
      const totalGoalAmount = this.financialContext.goals?.reduce((sum, goal) => sum + (goal.target - goal.current), 0) || 0;
      const vacationGoal = this.financialContext.goals?.[1];
      
      return {
        content: `I love that you have ${this.financialContext.goals?.length || 0} clear goals! 🎯 That's the secret sauce of successful people!

Your vacation goal is ${Math.round(((vacationGoal?.current || 0) / (vacationGoal?.target || 1)) * 100)}% complete - you're so close to that European adventure! ✈️ 

Here's my priority framework:
1️⃣ Emergency fund (safety first!) ✅
2️⃣ High-interest debt (if any)
3️⃣ Retirement savings (future you!) 
4️⃣ Fun goals like vacations (you deserve it!)

💡 Pro tip: Set up separate savings accounts for each goal and automate transfers. Watching those balances grow is so satisfying! Your retirement planning shows incredible long-term thinking! 🧠`,
        category: 'saving',
        confidence: 0.87
      };
    }

    // General encouragement and advice
    return {
      content: `You know what? I'm genuinely impressed by your financial awareness! 🌟 Just by asking questions, you're already ahead of most people.

Here's what I see: Your monthly surplus of $${((this.financialContext.monthlyIncome || 0) - (this.financialContext.monthlyExpenses || 0)).toLocaleString()} shows real financial discipline. That's not luck - that's smart choices! 🧠

Your next level-up moves:
1️⃣ Keep that emergency fund growing ✅
2️⃣ Maximize any retirement contributions 📈
3️⃣ Consider tax-advantaged accounts (HSA, IRA) 💰
4️⃣ Review and rebalance investments annually 🔄

Feel free to ask me about anything - budgeting, investing, goal planning, or just a quick financial pep talk! I'm here to help you win with money! 💪✨`,
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

export const lovableAiAdvisor = LovableAIAdvisor.getInstance();