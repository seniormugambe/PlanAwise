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

  async ask(prompt: string, apiKey?: string): Promise<AdviceResponse> {
    const key = apiKey || this.defaultApiKey;
    if (!key) {
      throw new Error("Missing Gemini API key");
    }

    if (!this.currentModel || key !== this.currentApiKey) {
      await this.initializeModel(key);
    }

    try {
      const systemPrompt = this.createSystemPrompt();
      const fullPrompt = `${systemPrompt}\n\n${prompt}`;
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
      throw error;
    }
  }

  async getAdvice(question: string, apiKey?: string): Promise<AdviceResponse> {
    return this.ask(`User Question: ${question}\n\nPlease provide helpful, specific financial advice in plain text.`, apiKey);
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
    return `You are Finley, a helpful financial AI assistant. You provide concise, practical, and category-aware answers for budgeting, saving, investing, debt, or general finance questions.`;
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
}
