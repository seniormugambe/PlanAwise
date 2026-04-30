import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { BudgetAgent } from "./agents/budgetAgent.js";
import { SavingsAgent } from "./agents/savingsAgent.js";
import { InvestmentAgent } from "./agents/investmentAgent.js";
import { FinancialAdvisorAgent } from "./agents/financialAdvisorAgent.js";
import { ReceiptTrackerAgent } from "./agents/receiptTrackerAgent.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const budgetAgent = new BudgetAgent();
const savingsAgent = new SavingsAgent();
const investmentAgent = new InvestmentAgent();
const advisorAgent = new FinancialAdvisorAgent(process.env.GEMINI_API_KEY);
const receiptAgent = new ReceiptTrackerAgent();

app.post("/api/ai/advice", async (req, res) => {
  const question = req.body?.question;
  const context = req.body?.context;
  const apiKey = typeof req.headers["x-api-key"] === "string" ? req.headers["x-api-key"] : undefined;

  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "question is required" });
  }

  try {
    const advice = await advisorAgent.getAdvice(question, context, apiKey);
    return res.json(advice);
  } catch (error: any) {
    console.error("AI backend error:", error);
    return res.status(500).json({ error: error?.message ?? "AI request failed" });
  }
});

app.post("/api/ai/financial-advice", async (req, res) => {
  const question = req.body?.question;
  const context = req.body?.context;
  const apiKey = typeof req.headers["x-api-key"] === "string" ? req.headers["x-api-key"] : undefined;

  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "question is required" });
  }

  try {
    const advice = await advisorAgent.getAdvice(question, context, apiKey);
    return res.json(advice);
  } catch (error: any) {
    console.error("AI backend error:", error);
    return res.status(500).json({ error: error?.message ?? "AI request failed" });
  }
});

app.post("/api/ai/budget", (req, res) => {
  const context = req.body?.context ?? {};
  const transactions = Array.isArray(req.body?.transactions) ? req.body.transactions : [];
  const mode = req.body?.mode || 'analyze';

  let result;
  if (mode === 'suggest') {
    result = budgetAgent.suggestLimits(context);
  } else if (mode === 'alert') {
    result = budgetAgent.alertOverspending(context, transactions);
  } else {
    result = budgetAgent.analyzeSpending(context, transactions);
  }

  return res.json(result);
});

app.post("/api/ai/savings", (req, res) => {
  const context = req.body?.context ?? {};
  const transactions = Array.isArray(req.body?.transactions) ? req.body.transactions : [];
  const autoSave = Boolean(req.body?.autoSave);

  const result = savingsAgent.suggestOrAutoSave(context, transactions, autoSave);
  return res.json(result);
});

app.post("/api/ai/savings/deposit", (req, res) => {
  const amount = Number(req.body?.amount || 0);
  const contractAddress = req.body?.contractAddress || '0x0000000000000000000000000000000000000000';
  const chainId = Number(req.body?.chainId || 137);

  if (amount <= 0) {
    return res.status(400).json({ error: 'amount must be greater than zero' });
  }

  const result = savingsAgent.prepareSmartContractDeposit(amount, contractAddress, chainId);
  return res.json(result);
});

app.post("/api/ai/investment", (req, res) => {
  const context = req.body?.context ?? {};
  const transactions = Array.isArray(req.body?.transactions) ? req.body.transactions : [];
  const question = typeof req.body?.question === 'string' ? req.body.question : undefined;

  const result = investmentAgent.getInvestmentAdvice(context, transactions, question);
  return res.json(result);
});

app.post("/api/ai/receipts", (req, res) => {
  const receiptText = req.body?.receiptText;
  if (!receiptText || typeof receiptText !== 'string') {
    return res.status(400).json({ error: 'receiptText is required' });
  }

  const receipt = receiptAgent.addReceipt(receiptText);
  return res.json({ receipt, count: receiptAgent.getReceipts().length });
});

app.get("/api/ai/receipts", (req, res) => {
  return res.json({ receipts: receiptAgent.getReceipts() });
});

app.get("/api/ai/status", async (req, res) => {
  const apiKey = typeof req.headers["x-api-key"] === "string" ? req.headers["x-api-key"] : undefined;
  const connected = await advisorAgent.isConnected(apiKey);
  return res.json({ connected });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`AI backend running on http://localhost:${port}`);
});
