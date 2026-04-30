import type { ReceiptRecord } from '../types.js';

export class ReceiptTrackerAgent {
  private receipts: ReceiptRecord[] = [];

  addReceipt(rawText: string): ReceiptRecord {
    const parsed = this.parseReceipt(rawText);
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
}
