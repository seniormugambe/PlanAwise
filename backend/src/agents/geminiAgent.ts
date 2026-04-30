import { GoogleGenerativeAI } from "@google/generative-ai";

type Category = "budgeting" | "saving" | "investing" | "debt" | "general";

export interface AdviceResponse {
  content: string;
  category: Category;
  confidence: number;
}

export class GeminiAI {
  private defaultApiKey?: string;
  private currentModel: any | null = null;
  private currentApiKey?: string;

  constructor(defaultApiKey?: string) {
    this.defaultApiKey = defaultApiKey;
  }

  async getAdvice(question: string, apiKey?: string): Promise<AdviceResponse> {
    const key = apiKey || this.defaultApiKey;
    if (!key) {
      throw new Error("Missing Gemini API key");
    }

    if (!this.currentModel || key !== this.currentApiKey) {
      await this.initializeModel(key);
    }

    try {
      const systemPrompt = this.createSystemPrompt();
      const fullPrompt = `${systemPrompt}\n\nUser Question: ${question}\n\nPlease provide helpful, specific financial advice in plain text.`;
      const result = await this.currentModel.generateContent(fullPrompt);
      const response = await result.response;
      const content = response.text().trim();

      return {
        content,
        category: this.categorizeResponse(content),
        confidence: 0.92,
      };
    } catch (error) {
      console.error("Gemini backend error:", error);
      return this.getFallbackResponse(question);
    }
  }

  async isConnected(apiKey?: string): Promise<boolean> {
    const key = apiKey || this.defaultApiKey;
    if (!key) {
      return false;
    }

    if (!this.currentModel || key !== this.currentApiKey) {
      try {
        await this.initializeModel(key);
        return true;
      } catch {
        return false;
      }
    }

    return true;
  }

  private async initializeModel(apiKey: string) {
    this.currentApiKey = apiKey;
    const genAI = new GoogleGenerativeAI(apiKey);
    this.currentModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });
  }

  private createSystemPrompt(): string {
    return `You are Finley, a friendly and optimistic AI financial advisor. Help the user answer their personal finance questions with specific examples, actionable suggestions, and supportive tone. Avoid long-winded explanations and keep advice concise. Use categories: budgeting, saving, investing, debt, or general.`;
  }

  private categorizeResponse(content: string): Category {
    const lower = content.toLowerCase();
    if (lower.includes("budget") || lower.includes("expense") || lower.includes("spending")) {
      return "budgeting";
    }
    if (lower.includes("save") || lower.includes("saving") || lower.includes("emergency fund")) {
      return "saving";
    }
    if (lower.includes("invest") || lower.includes("stock") || lower.includes("retirement") || lower.includes("401k")) {
      return "investing";
    }
    if (lower.includes("debt") || lower.includes("loan") || lower.includes("credit card")) {
      return "debt";
    }
    return "general";
  }

  private getFallbackResponse(question: string): AdviceResponse {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes("emergency") || lowerQuestion.includes("fund")) {
      return {
        content: "Your emergency fund is a key financial safety net. Aim for 3-6 months of expenses and keep building it gradually with automatic transfers.",
        category: "saving",
        confidence: 0.75,
      };
    }

    if (lowerQuestion.includes("invest") || lowerQuestion.includes("investment") || lowerQuestion.includes("retirement")) {
      return {
        content: "Start with low-cost, diversified funds and prioritize any employer match first. Keep investing consistently and let compound growth work for you.",
        category: "investing",
        confidence: 0.75,
      };
    }

    if (lowerQuestion.includes("debt") || lowerQuestion.includes("loan") || lowerQuestion.includes("credit card")) {
      return {
        content: "Focus extra payments on your highest-interest debt while continuing to pay minimums on the rest. This helps you reduce overall interest faster.",
        category: "debt",
        confidence: 0.75,
      };
    }

    return {
      content: "You are making smart financial decisions by asking questions. Keep tracking your budget, saving regularly, and planning for long-term goals.",
      category: "general",
      confidence: 0.70,
    };
  }
}
