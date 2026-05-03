import { VertexAI } from "@google-cloud/vertexai";
import { globalCache } from '../cache/responseCache.js';

type Category = "budgeting" | "saving" | "investing" | "debt" | "general";
type AIProvider = "gemini" | "vertex";
type AIProviderMode = AIProvider | "auto";

interface GeminiAIOptions {
  geminiApiKey?: string;
  geminiModel?: string;
  provider?: AIProviderMode;
  vertexApiKey?: string;
  vertexApiEndpoint?: string;
  vertexProject?: string;
  vertexLocation?: string;
  vertexModel?: string;
}

interface VertexGenerationModel {
  generateContent(input: unknown): Promise<{
    response: VertexGenerateContentResponse;
  }>;
  countTokens(input: unknown): Promise<unknown>;
}

interface VertexGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

export interface AdviceResponse {
  content: string;
  category: Category;
  confidence: number;
  reasoning?: string;
}

export class GeminiAI {
  private defaultApiKey?: string;
  private provider: AIProvider;
  private providerMode: AIProviderMode;
  private vertexApiKey?: string;
  private vertexApiEndpoint: string;
  private geminiApiEndpoint = "https://generativelanguage.googleapis.com";
  private vertexProject?: string;
  private vertexLocation: string;
  private vertexModel: string;
  private geminiModel: string;
  private currentVertexModel: VertexGenerationModel | null = null;

  constructor(options: GeminiAIOptions = {}) {
    this.defaultApiKey = options.geminiApiKey;
    this.geminiModel = options.geminiModel || "gemini-flash-latest";
    this.vertexApiKey = options.vertexApiKey;
    this.vertexApiEndpoint = (options.vertexApiEndpoint || "https://aiplatform.googleapis.com").replace(/\/$/, "");
    this.vertexProject = options.vertexProject;
    this.vertexLocation = options.vertexLocation || "us-central1";
    this.vertexModel = options.vertexModel || "gemini-2.5-flash";
    this.providerMode = options.provider || "auto";
    this.provider = this.resolveProvider(this.providerMode);
  }

  async ask(prompt: string, apiKey?: string, includeReasoning = true): Promise<AdviceResponse> {
    if (this.provider === "gemini" && !(apiKey || this.defaultApiKey)) {
      throw new Error("Missing Gemini API key");
    }
    if (this.provider === "vertex" && !this.vertexApiKey && !this.vertexProject && !this.canFallbackToGemini(apiKey)) {
      throw new Error("Missing Vertex AI API key or Google Cloud project");
    }

    // Check cache first
    const cached = globalCache.get<AdviceResponse>(this.getCacheNamespace(apiKey), prompt);
    if (cached) {
      return {
        content: cached.content,
        category: cached.category as Category,
        confidence: cached.confidence,
        reasoning: cached.reasoning,
      };
    }

    try {
      const systemPrompt = this.createSystemPrompt();
      let fullPrompt = `${systemPrompt}\n\n${prompt}`;

      // Add reasoning request to prompt
      if (includeReasoning) {
        fullPrompt += '\n\nBefore providing your answer, briefly explain your reasoning in 1-2 sentences. Start with "REASONING:" and then provide your answer.';
      }

      const text = await this.generateText(fullPrompt, apiKey);

      // Extract reasoning if present
      let content = text;
      let reasoning: string | undefined;

      if (includeReasoning && text.includes('REASONING:')) {
        const parts = text.split('REASONING:');
        if (parts.length > 1) {
          const reasoningMatch = parts[1].match(/^(.*?)(?:\n\n|\n[A-Z]|$)/);
          if (reasoningMatch) {
            reasoning = reasoningMatch[1].trim();
            // Remove reasoning from main content
            content = text.replace(/REASONING:.*?\n\n/s, '').trim() || parts[0].trim();
          }
        }
      }

      const response_obj: AdviceResponse = {
        content,
        category: this.categorizeResponse(content),
        confidence: 0.92,
        reasoning,
      };

      // Cache the response
      globalCache.set(this.getCacheNamespace(apiKey), prompt, response_obj, 15 * 60 * 1000);

      return response_obj;
    } catch (error) {
      console.error("AI backend error:", error);
      throw error;
    }
  }

  async getAdvice(question: string, apiKey?: string): Promise<AdviceResponse> {
    return this.ask(`User Question: ${question}\n\nPlease provide helpful, specific financial advice in plain text.`, apiKey);
  }

  async isConnected(apiKey?: string): Promise<boolean> {
    try {
      if (this.provider === "vertex") {
        const vertexConnected = this.vertexApiKey
          ? await this.validateVertexApiKey()
          : this.vertexProject
            ? await this.validateVertexCredentials()
            : false;

        if (vertexConnected) {
          return true;
        }

        return this.canFallbackToGemini(apiKey)
          ? await this.validateGeminiApiKey(apiKey)
          : false;
      }

      return await this.validateGeminiApiKey(apiKey);
    } catch {
      return false;
    }
  }

  getStatus(): Record<string, unknown> {
    return {
      mode: this.providerMode,
      provider: this.provider,
      model: this.provider === "vertex" ? this.vertexModel : this.geminiModel,
      fallbackProvider: this.canFallbackToGemini() ? "gemini" : undefined,
      vertex: {
        project: this.vertexProject ? "configured" : "missing",
        location: this.vertexLocation,
        apiKey: this.vertexApiKey ? "configured" : "missing",
        apiEndpoint: this.vertexApiEndpoint,
      },
      geminiApiKey: this.defaultApiKey ? "configured" : "missing",
    };
  }

  private async generateText(prompt: string, apiKey?: string): Promise<string> {
    if (this.provider === "vertex") {
      try {
        if (this.vertexApiKey) {
          return this.generateTextWithVertexApiKey(prompt);
        }

        await this.initializeVertexModel();
        const vertexModel = this.currentVertexModel;
        if (!vertexModel) {
          throw new Error("Vertex AI model was not initialized");
        }

        const result = await vertexModel.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        return this.extractContentText(result.response);
      } catch (error) {
        if (this.canFallbackToGemini(apiKey)) {
          console.warn(`Vertex AI request failed; falling back to Gemini API: ${this.getErrorMessage(error)}`);
          return this.generateTextWithGemini(prompt, apiKey);
        }

        throw error;
      }
    }

    return this.generateTextWithGemini(prompt, apiKey);
  }

  private async generateTextWithGemini(prompt: string, apiKey?: string): Promise<string> {
    const key = apiKey || this.defaultApiKey;
    if (!key) {
      throw new Error("Missing Gemini API key");
    }

    const url = `${this.geminiApiEndpoint}/v1beta/models/${encodeURIComponent(this.geminiModel)}:generateContent`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": key,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API request failed (${response.status} ${response.statusText}): ${await response.text()}`);
    }

    return this.extractContentText(await response.json() as VertexGenerateContentResponse);
  }

  private async generateTextWithVertexApiKey(prompt: string): Promise<string> {
    if (!this.vertexApiKey) {
      throw new Error("Missing Vertex AI API key");
    }

    const url = `${this.vertexApiEndpoint}/v1/publishers/google/models/${encodeURIComponent(this.vertexModel)}:generateContent?key=${encodeURIComponent(this.vertexApiKey)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Vertex AI API key request failed (${response.status} ${response.statusText}): ${await response.text()}`);
    }

    return this.extractContentText(await response.json() as VertexGenerateContentResponse);
  }

  private async validateVertexApiKey(): Promise<boolean> {
    if (!this.vertexApiKey) {
      return false;
    }

    const url = `${this.vertexApiEndpoint}/v1/publishers/google/models/${encodeURIComponent(this.vertexModel)}:countTokens?key=${encodeURIComponent(this.vertexApiKey)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "connection check" }] }],
      }),
    });

    if (!response.ok) {
      console.warn(`Vertex AI API key validation failed (${response.status} ${response.statusText})`);
    }

    return response.ok;
  }

  private async validateVertexCredentials(): Promise<boolean> {
    try {
      await this.initializeVertexModel();

      const vertexModel = this.currentVertexModel;
      if (!vertexModel) {
        return false;
      }

      await vertexModel.countTokens({
        contents: [{ role: "user", parts: [{ text: "connection check" }] }],
      });
      return true;
    } catch (error) {
      console.warn("Vertex AI credential validation failed:", error);
      return false;
    }
  }

  private async validateGeminiApiKey(apiKey?: string): Promise<boolean> {
    const key = apiKey || this.defaultApiKey;
    if (!key) {
      return false;
    }

    try {
      const url = `${this.geminiApiEndpoint}/v1beta/models/${encodeURIComponent(this.geminiModel)}:countTokens`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": key,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "connection check" }] }],
        }),
      });

      if (!response.ok) {
        console.warn(`Gemini API key validation failed (${response.status} ${response.statusText})`);
      }

      return response.ok;
    } catch (error) {
      console.warn("Gemini API key validation request failed:", error);
      return false;
    }
  }

  private async initializeVertexModel() {
    if (this.currentVertexModel) {
      return;
    }

    if (!this.vertexProject) {
      throw new Error("Missing Google Cloud project for Vertex AI");
    }

    const vertexAI = new VertexAI({
      project: this.vertexProject,
      location: this.vertexLocation,
    });

    this.currentVertexModel = vertexAI.getGenerativeModel({
      model: this.vertexModel,
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });
  }

  private extractContentText(response: VertexGenerateContentResponse): string {
    const parts = response?.candidates?.[0]?.content?.parts || [];
    const text = parts
      .map((part) => part.text || "")
      .join("")
      .trim();

    if (!text) {
      throw new Error("AI provider returned an empty response");
    }

    return text;
  }

  private resolveProvider(provider?: GeminiAIOptions["provider"]): AIProvider {
    if (provider === "vertex" || provider === "gemini") {
      return provider;
    }

    if (this.vertexApiKey) {
      return "vertex";
    }

    if (this.defaultApiKey) {
      return "gemini";
    }

    return this.vertexProject ? "vertex" : "gemini";
  }

  private getCacheNamespace(apiKey?: string): string {
    const usingHeaderGeminiKey = this.provider === "gemini" && Boolean(apiKey);
    return usingHeaderGeminiKey ? "gemini-user-key" : `ai-${this.provider}`;
  }

  private canFallbackToGemini(apiKey?: string): boolean {
    return this.providerMode === "auto" && this.provider === "vertex" && Boolean(apiKey || this.defaultApiKey);
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "unknown error";
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
