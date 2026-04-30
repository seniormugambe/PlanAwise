import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { BudgetAgent } from "./agents/budgetAgent.js";
import { SavingsAgent } from "./agents/savingsAgent.js";
import { InvestmentAgent } from "./agents/investmentAgent.js";
import { FinancialAdvisorAgent } from "./agents/financialAdvisorAgent.js";
import { ReceiptTrackerAgent } from "./agents/receiptTrackerAgent.js";
import { GeminiAI } from "./agents/geminiAgent.js";
import { AgentManager } from "./agents/agentManager.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const geminiClient = new GeminiAI(process.env.GEMINI_API_KEY);
const agentManager = new AgentManager(geminiClient);

const budgetAgent = new BudgetAgent(geminiClient);
const savingsAgent = new SavingsAgent(geminiClient);
const investmentAgent = new InvestmentAgent(geminiClient);
const advisorAgent = new FinancialAdvisorAgent(geminiClient);
const receiptAgent = new ReceiptTrackerAgent(geminiClient);

// Main unified endpoint - the brain of the system
app.post("/api/ai/process", async (req, res) => {
  const query = req.body?.query;
  const context = req.body?.context;
  const transactions = Array.isArray(req.body?.transactions) ? req.body.transactions : [];
  const receiptText = req.body?.receiptText;
  const preferredAgent = req.body?.preferredAgent || 'auto';
  const apiKey = typeof req.headers["x-api-key"] === "string" ? req.headers["x-api-key"] : undefined;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "query is required" });
  }

  try {
    const result = await agentManager.process({
      query,
      context,
      transactions,
      apiKey,
      preferredAgent,
      receiptText,
    });
    return res.json(result);
  } catch (error: any) {
    console.error("Agent manager error:", error);
    return res.status(500).json({ error: error?.message ?? "Request failed" });
  }
});

// System status endpoint
app.get("/api/ai/manager/status", (req, res) => {
  const status = agentManager.getStatus();
  return res.json(status);
});

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

app.post("/api/ai/budget", async (req, res) => {
  const context = req.body?.context ?? {};
  const transactions = Array.isArray(req.body?.transactions) ? req.body.transactions : [];
  const mode = req.body?.mode || 'analyze';
  const apiKey = typeof req.headers["x-api-key"] === "string" ? req.headers["x-api-key"] : undefined;

  let result;
  if (mode === 'suggest') {
    result = await budgetAgent.suggestLimits(context, apiKey);
  } else if (mode === 'alert') {
    result = await budgetAgent.alertOverspending(context, transactions, apiKey);
  } else {
    result = await budgetAgent.analyzeSpending(context, transactions, apiKey);
  }

  return res.json(result);
});

app.post("/api/ai/savings", async (req, res) => {
  const context = req.body?.context ?? {};
  const transactions = Array.isArray(req.body?.transactions) ? req.body.transactions : [];
  const autoSave = Boolean(req.body?.autoSave);
  const apiKey = typeof req.headers["x-api-key"] === "string" ? req.headers["x-api-key"] : undefined;

  const result = await savingsAgent.suggestOrAutoSave(context, transactions, autoSave, apiKey);
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

app.post("/api/ai/investment", async (req, res) => {
  const context = req.body?.context ?? {};
  const transactions = Array.isArray(req.body?.transactions) ? req.body.transactions : [];
  const question = typeof req.body?.question === 'string' ? req.body.question : undefined;
  const apiKey = typeof req.headers["x-api-key"] === "string" ? req.headers["x-api-key"] : undefined;

  const result = await investmentAgent.getInvestmentAdvice(context, transactions, question, apiKey);
  return res.json(result);
});

app.post("/api/ai/receipts", async (req, res) => {
  const receiptText = req.body?.receiptText;
  const apiKey = typeof req.headers["x-api-key"] === "string" ? req.headers["x-api-key"] : undefined;
  if (!receiptText || typeof receiptText !== 'string') {
    return res.status(400).json({ error: 'receiptText is required' });
  }

  const receipt = await receiptAgent.addReceipt(receiptText, apiKey);
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
