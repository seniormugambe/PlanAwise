import { VertexAI } from "@google-cloud/vertexai";
import { globalCache } from '../cache/responseCache.js';

type Category = "budgeting" | "saving" | "investing" | "debt" | "general";
type AIProvider = "gemini" | "vertex" | "openai";
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
  openaiApiKey?: string;
  openaiModel?: string;
  openaiApiEndpoint?: string;
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

interface OpenAIResponse {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
      type?: string;
    }>;
  }>;
}

interface ProviderRequestErrorDetails {
  provider: AIProvider;
  status?: number;
  code?: string;
  message: string;
  retryable: boolean;
}

export class ProviderRequestError extends Error {
  provider: AIProvider;
  status?: number;
  code?: string;
  retryable: boolean;

  constructor(details: ProviderRequestErrorDetails) {
    super(details.message);
    this.name = "ProviderRequestError";
    this.provider = details.provider;
    this.status = details.status;
    this.code = details.code;
    this.retryable = details.retryable;
  }
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
  private openaiApiKey?: string;
  private openaiModel: string;
  private openaiApiEndpoint: string;
  private currentVertexModel: VertexGenerationModel | null = null;
  private providerCooldownUntil = 0;
  private providerCooldownReason?: string;

  constructor(options: GeminiAIOptions = {}) {
    this.defaultApiKey = options.geminiApiKey;
    this.geminiModel = options.geminiModel || "gemini-2.5-flash-lite";
    this.vertexApiKey = options.vertexApiKey;
    this.vertexApiEndpoint = (options.vertexApiEndpoint || "https://aiplatform.googleapis.com").replace(/\/$/, "");
    this.vertexProject = options.vertexProject;
    this.vertexLocation = options.vertexLocation || "us-central1";
    this.vertexModel = options.vertexModel || "gemini-2.5-flash-lite";
    this.openaiApiKey = options.openaiApiKey;
    this.openaiModel = options.openaiModel || "gpt-5-nano";
    this.openaiApiEndpoint = (options.openaiApiEndpoint || "https://api.openai.com").replace(/\/$/, "");
    this.providerMode = options.provider || "auto";
    this.provider = this.resolveProvider(this.providerMode);
  }

  async ask(prompt: string, apiKey?: string, includeReasoning = true): Promise<AdviceResponse> {
    if (this.providerCooldownUntil > Date.now()) {
      throw new ProviderRequestError({
        provider: this.provider,
        message: this.providerCooldownReason || `${this.provider} is temporarily unavailable`,
        retryable: false,
      });
    }

    if (this.provider === "openai" && !(this.openaiApiKey || apiKey)) {
      throw new Error("Missing OpenAI API key");
    }
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
      let fullPrompt = this.provider === "openai" ? prompt : `${systemPrompt}\n\n${prompt}`;

      // Add reasoning request to prompt
      if (includeReasoning) {
        fullPrompt += '\n\nOptional: start with "REASONING:" in one short sentence, then answer.';
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
      if (error instanceof ProviderRequestError && !error.retryable) {
        this.providerCooldownUntil = Date.now() + 5 * 60 * 1000;
        this.providerCooldownReason = error.message;
      }
      throw error;
    }
  }

  async getAdvice(question: string, apiKey?: string): Promise<AdviceResponse> {
    return this.ask(`User Question: ${question}\n\nPlease provide helpful, specific financial advice in plain text.`, apiKey);
  }

  async isConnected(apiKey?: string): Promise<boolean> {
    try {
      if (this.provider === "openai") {
        return await this.validateOpenAIKey(apiKey);
      }

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
    const status: Record<string, unknown> = {
      mode: this.providerMode,
      provider: this.provider,
      model: this.provider === "openai"
        ? this.openaiModel
        : this.provider === "vertex"
          ? this.vertexModel
          : this.geminiModel,
    };

    if (this.provider === "openai" || this.providerMode === "auto") {
      status.openai = {
        apiKey: this.openaiApiKey ? "configured" : "missing",
        apiEndpoint: this.openaiApiEndpoint,
      };
    }

    if (this.provider === "vertex" || this.providerMode === "auto") {
      status.vertex = {
        project: this.vertexProject ? "configured" : "missing",
        location: this.vertexLocation,
        apiKey: this.vertexApiKey ? "configured" : "missing",
        apiEndpoint: this.vertexApiEndpoint,
      };
    }

    if (this.provider === "gemini" || this.canFallbackToGemini()) {
      status.geminiApiKey = this.defaultApiKey ? "configured" : "missing";
    }

    if (this.canFallbackToGemini()) {
      status.fallbackProvider = "gemini";
    }

    return status;
  }

  private async generateText(prompt: string, apiKey?: string): Promise<string> {
    if (this.provider === "openai") {
      return this.generateTextWithOpenAI(prompt, apiKey);
    }

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

  private async generateTextWithOpenAI(prompt: string, apiKey?: string): Promise<string> {
    const key = this.openaiApiKey || apiKey;
    if (!key) {
      throw new Error("Missing OpenAI API key");
    }

    const response = await fetch(`${this.openaiApiEndpoint}/v1/responses`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.openaiModel,
        instructions: this.createSystemPrompt(),
        input: prompt,
        max_output_tokens: 384,
        store: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const providerError = this.parseProviderError("openai", response.status, response.statusText, errorText);
      throw providerError;
    }

    return this.extractOpenAIText(await response.json() as OpenAIResponse);
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
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          topP: 0.8,
          maxOutputTokens: 384,
        },
      }),
    });

    if (!response.ok) {
      throw this.parseProviderError("gemini", response.status, response.statusText, await response.text());
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
          temperature: 0.4,
          topP: 0.8,
          maxOutputTokens: 384,
        },
      }),
    });

    if (!response.ok) {
      throw this.parseProviderError("vertex", response.status, response.statusText, await response.text());
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
          contents: [{ parts: [{ text: "connection check" }] }],
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

  private async validateOpenAIKey(apiKey?: string): Promise<boolean> {
    const key = this.openaiApiKey || apiKey;
    if (!key) {
      return false;
    }

    try {
      const response = await fetch(`${this.openaiApiEndpoint}/v1/models/${encodeURIComponent(this.openaiModel)}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${key}`,
        },
      });

      if (!response.ok) {
        console.warn(`OpenAI API key validation failed (${response.status} ${response.statusText})`);
      }

      return response.ok;
    } catch (error) {
      console.warn("OpenAI API key validation request failed:", error);
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
        temperature: 0.4,
        topP: 0.8,
        maxOutputTokens: 384,
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

  private extractOpenAIText(response: OpenAIResponse): string {
    const text = response.output_text ||
      response.output
        ?.flatMap((item) => item.content || [])
        .map((content) => content.text || "")
        .join("")
        .trim();

    if (!text) {
      throw new Error("OpenAI returned an empty response");
    }

    return text;
  }

  private resolveProvider(provider?: GeminiAIOptions["provider"]): AIProvider {
    if (provider === "vertex" || provider === "gemini" || provider === "openai") {
      return provider;
    }

    if (this.openaiApiKey) {
      return "openai";
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
    const usingHeaderOpenAIKey = this.provider === "openai" && !this.openaiApiKey && Boolean(apiKey);
    if (usingHeaderOpenAIKey) {
      return "openai-user-key";
    }
    return usingHeaderGeminiKey ? "gemini-user-key" : `ai-${this.provider}`;
  }

  private canFallbackToGemini(apiKey?: string): boolean {
    return this.providerMode === "auto" && this.provider === "vertex" && Boolean(apiKey || this.defaultApiKey);
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "unknown error";
  }

  private parseProviderError(provider: AIProvider, status: number, statusText: string, body: string): ProviderRequestError {
    let code: string | undefined;
    let providerMessage = body;

    try {
      const parsed = JSON.parse(body) as { error?: { message?: string; code?: string; type?: string } };
      providerMessage = parsed.error?.message || body;
      code = parsed.error?.code || parsed.error?.type;
    } catch {
      providerMessage = body || statusText;
    }

    const quotaExceeded = status === 429 && (code === "insufficient_quota" || providerMessage.toLowerCase().includes("quota"));
    const message = quotaExceeded
      ? `${this.formatProviderName(provider)} quota is exhausted. Falling back to local advice until billing/quota is restored.`
      : `${this.formatProviderName(provider)} API request failed (${status} ${statusText}): ${providerMessage}`;

    return new ProviderRequestError({
      provider,
      status,
      code,
      message,
      retryable: !quotaExceeded,
    });
  }

  private formatProviderName(provider: AIProvider): string {
    if (provider === "openai") return "OpenAI";
    if (provider === "vertex") return "Vertex AI";
    return "Gemini";
  }

  private createSystemPrompt(): string {
    return `Finley: concise financial assistant. Answer in plain text under 120 words with practical steps.`;
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
