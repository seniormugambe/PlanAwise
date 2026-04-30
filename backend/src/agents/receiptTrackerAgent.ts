import { GeminiAI } from './geminiAgent.js';
import type { ReceiptRecord } from '../types.js';

export class ReceiptTrackerAgent {
  private receipts: ReceiptRecord[] = [];
  private gemini?: GeminiAI;

  constructor(gemini?: GeminiAI) {
    this.gemini = gemini;
  }

  async addReceipt(rawText: string, apiKey?: string): Promise<ReceiptRecord> {
    const parsed = this.gemini && await this.gemini.isConnected(apiKey)
      ? await this.parseReceiptWithAI(rawText, apiKey)
      : this.parseReceipt(rawText);

    this.receipts.push(parsed);
    return parsed;
  }

  getReceipts(): ReceiptRecord[] {
    return this.receipts.slice();
  }

  private parseReceipt(text: string): ReceiptRecord {
    const totalMatch = text.match(/\$?([0-9]+(?:\.[0-9]{2})?)\s*(?:total|amount|due)/i);
    const dateMatch = text.match(/(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}\/\d{2}\/\d{2})/);
    const vendorMatch = text.match(/^(.*)$/m);

    const total = totalMatch ? parseFloat(totalMatch[1]) : 0;
    const date = dateMatch ? dateMatch[1] : undefined;
    const vendor = vendorMatch ? vendorMatch[1].trim() : undefined;

    return {
      id: `receipt-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      vendor,
      date,
      total,
      items: [],
      rawText: text,
    };
  }

  private async parseReceiptWithAI(text: string, apiKey?: string): Promise<ReceiptRecord> {
    const prompt = `You are a receipt parser. Extract vendor name, date, total amount, and item list from this receipt text and reply with valid JSON including fields vendor, date, total, items (array of {description, amount}). Receipt:\n\n${text}`;
    try {
      const result = await this.gemini!.ask(prompt, apiKey);
      const jsonText = result.content.trim();
      const candidate = jsonText.includes('{') ? jsonText.substring(jsonText.indexOf('{')) : jsonText;
      const parsed = JSON.parse(candidate);
      return {
        id: `receipt-${Date.now()}-${Math.round(Math.random() * 1000)}`,
        vendor: parsed.vendor || undefined,
        date: parsed.date || undefined,
        total: Number(parsed.total) || 0,
        items: Array.isArray(parsed.items) ? parsed.items : [],
        rawText: text,
      };
    } catch (error) {
      console.error('Receipt AI parse failed:', error);
      return this.parseReceipt(text);
    }
  }
}
