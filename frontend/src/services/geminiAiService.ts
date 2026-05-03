import { GoogleGenerativeAI } from '@google/generative-ai';

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

interface GeminiResponse {
  content: string;
  category: 'budgeting' | 'saving' | 'investing' | 'debt' | 'general';
  confidence: number;
}

export class GeminiFinancialAdvisor {
  private static instance: GeminiFinancialAdvisor;
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private financialContext: FinancialContext;
  private conversationHistory: Array<{ role: string; parts: string }> = [];

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

    this.initializeGemini();
  }

  private async initializeGemini() {
    try {
      // Try to get API key from localStorage first, then environment variables
      const apiKey = localStorage.getItem('gemini_api_key') || 
                     import.meta.env.VITE_GEMINI_API_KEY;
      
      console.log('Checking API key availability:', {
        hasLocalStorage: !!localStorage.getItem('gemini_api_key'),
        hasEnvVar: !!import.meta.env.VITE_GEMINI_API_KEY,
        apiKeyLength: apiKey ? apiKey.length : 0
      });
      
      if (!apiKey) {
        console.warn('Gemini API key not found. Using fallback responses.');
        return;
      }

      if (apiKey.length < 10) {
        console.error('Invalid API key length. Please check your Gemini API key.');
        return;
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
        },
      });

      console.log('Gemini AI initialized successfully with model: gemini-1.5-flash');
      
      // Test the connection
      try {
        const testResult = await this.model.generateContent("Test connection");
        console.log('Gemini API connection test successful');
      } catch (testError) {
        console.error('Gemini API connection test failed:', testError);
        this.model = null; // Reset model if connection fails
      }
      
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error);
      this.model = null;
    }
  }

  static getInstance(): GeminiFinancialAdvisor {
    if (!GeminiFinancialAdvisor.instance) {
      GeminiFinancialAdvisor.instance = new GeminiFinancialAdvisor();
    }
    return GeminiFinancialAdvisor.instance;
  }

  private createSystemPrompt(): string {
    const { monthlyIncome, monthlyExpenses, currentSavings, totalBalance, goals } = this.financialContext;
    const savingsRate = ((currentSavings || 0) / (monthlyIncome || 1)) * 100;
    
    return `You are Finley, a friendly and enthusiastic AI financial advisor. You're helping someone with their personal finances.

IMPORTANT PERSONALITY TRAITS:
- Be warm, encouraging, and use emojis appropriately (but not excessively)
- Celebrate their financial wins and progress
- Provide specific, actionable advice
- Keep responses conversational and under 200 words
- Use "you" and "your" to make it personal
- Be optimistic but realistic

CURRENT USER'S FINANCIAL SITUATION:
- Monthly Income: $${monthlyIncome?.toLocaleString()}
- Monthly Expenses: $${monthlyExpenses?.toLocaleString()}
- Monthly Savings: $${currentSavings?.toLocaleString()} (${savingsRate.toFixed(1)}% savings rate)
- Total Balance/Net Worth: $${totalBalance?.toLocaleString()}
- Financial Goals: ${goals?.map(g => `${g.title}: $${g.current.toLocaleString()}/$${g.target.toLocaleString()} (${Math.round((g.current/g.target)*100)}% complete)`).join(', ')}

RESPONSE GUIDELINES:
- Always acknowledge their current financial situation when relevant
- Provide specific numbers and calculations when helpful
- Suggest concrete next steps
- Categories your advice as: budgeting, saving, investing, debt, or general
- Be encouraging about their progress (they're doing better than most people!)
- Keep the tone conversational and supportive

Remember: You're not just giving advice, you're being a supportive financial friend who wants to see them succeed! 🌟`;
  }

  private categorizeResponse(content: string): 'budgeting' | 'saving' | 'investing' | 'debt' | 'general' {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('budget') || lowerContent.includes('expense') || lowerContent.includes('spending')) {
      return 'budgeting';
    }
    if (lowerContent.includes('save') || lowerContent.includes('saving') || lowerContent.includes('emergency fund')) {
      return 'saving';
    }
    if (lowerContent.includes('invest') || lowerContent.includes('stock') || lowerContent.includes('retirement') || lowerContent.includes('401k')) {
      return 'investing';
    }
    if (lowerContent.includes('debt') || lowerContent.includes('loan') || lowerContent.includes('credit card')) {
      return 'debt';
    }
    
    return 'general';
  }

  async getAdvice(question: string): Promise<GeminiResponse> {
    try {
      // If Gemini is not available, fall back to local responses
      if (!this.model) {
        return this.getFallbackResponse(question);
      }

      const systemPrompt = this.createSystemPrompt();
      const fullPrompt = `${systemPrompt}\n\nUser Question: ${question}\n\nPlease provide helpful financial advice:`;

      // Add to conversation history
      this.conversationHistory.push({ role: 'user', parts: question });

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const content = response.text();

      // Add AI response to history
      this.conversationHistory.push({ role: 'model', parts: content });

      // Keep conversation history manageable (last 10 exchanges)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      return {
        content: content.trim(),
        category: this.categorizeResponse(content),
        confidence: 0.95
      };

    } catch (error) {
      console.error('Gemini AI error:', error);
      return this.getFallbackResponse(question);
    }
  }

  private getFallbackResponse(question: string): GeminiResponse {
    const lowerQuestion = question.toLowerCase();
    
    // Emergency Fund Advice
    if (this.matchesKeywords(lowerQuestion, ['emergency', 'fund', 'emergency fund'])) {
      return {
        content: `Your emergency fund is looking solid! 💪 With $4,500 saved, you've got about 1.3 months of expenses covered. The sweet spot is 3-6 months ($10,260-$20,520). You're 75% there! 🎉\n\nTry saving just $300 monthly and you'll hit your goal in 6 months. You're closer than you think! ✨`,
        category: 'saving',
        confidence: 0.85
      };
    }

    // Savings Rate
    if (this.matchesKeywords(lowerQuestion, ['savings rate', 'save', 'how much', 'doing financially'])) {
      return {
        content: `Your 51.8% savings rate is absolutely incredible! 🚀 You're in the top 1% of savers - most people struggle to save even 10%!\n\nAt your income level of $5,500/month, you're building serious wealth. Keep this up and you could retire early! Your financial discipline is inspiring! 🌟`,
        category: 'saving',
        confidence: 0.92
      };
    }

    // Investment Advice
    if (this.matchesKeywords(lowerQuestion, ['invest', 'investment', 'stocks', 'retirement'])) {
      return {
        content: `With your amazing $2,850/month savings, you're absolutely ready to invest! 📈\n\n1️⃣ Max out any 401(k) match first (free money!)\n2️⃣ Your emergency fund is almost there ✅\n3️⃣ Consider low-cost index funds for long-term growth\n\nYour retirement goal shows great planning - time is your superpower in investing! 💪`,
        category: 'investing',
        confidence: 0.88
      };
    }

    // General encouragement
    return {
      content: `You're doing fantastic! 🌟 Your net worth of $12,450 and monthly surplus of $2,080 shows real financial wisdom.\n\nKey wins: ✅ Strong savings rate ✅ Multiple goals ✅ Great income\n\nNext level: Keep building that emergency fund, then focus on investing for long-term growth. You're already ahead of 90% of people your age! Keep it up! 💪`,
      category: 'general',
      confidence: 0.80
    };
  }

  private matchesKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  updateFinancialContext(context: Partial<FinancialContext>): void {
    this.financialContext = { ...this.financialContext, ...context };
  }

  clearConversationHistory(): void {
    this.conversationHistory = [];
  }

  async reinitialize(): Promise<void> {
    await this.initializeGemini();
  }

  isConnected(): boolean {
    return this.model !== null;
  }
}

export const geminiAdvisor = GeminiFinancialAdvisor.getInstance();