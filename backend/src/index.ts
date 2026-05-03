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
import { automationEngine } from "./automation/automationEngine.js";
import { globalCache } from "./cache/responseCache.js";
import { wallets, transactions, goals, gamificationStats } from "./data/mockData.js";
import type { AutomationResult } from "./automation/automationEngine.js";
import type { AgentType } from "./agents/agentManager.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const geminiClient = new GeminiAI({
  geminiApiKey: process.env.GEMINI_API_KEY,
  provider: (process.env.AI_PROVIDER as "auto" | "gemini" | "vertex" | undefined) || "auto",
  vertexApiKey: process.env.VERTEX_API_KEY || process.env.GOOGLE_API_KEY,
  vertexApiEndpoint: process.env.VERTEX_API_ENDPOINT,
  vertexProject: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT,
  vertexLocation: process.env.GOOGLE_CLOUD_LOCATION,
  vertexModel: process.env.VERTEX_AI_MODEL,
});
const agentManager = new AgentManager(geminiClient);

const budgetAgent = new BudgetAgent(geminiClient);
const savingsAgent = new SavingsAgent(geminiClient);
const investmentAgent = new InvestmentAgent(geminiClient);
const advisorAgent = new FinancialAdvisorAgent(geminiClient);
const receiptAgent = new ReceiptTrackerAgent(geminiClient);

const runAutomationTriggers = async (): Promise<AutomationResult[]> => {
  const runnable = automationEngine.getRunnableTriggers();
  const executed: AutomationResult[] = [];

  for (const item of runnable) {
    const result = await agentManager.process({
      query: item.trigger.query,
      context: item.trigger.context,
      transactions: item.trigger.transactions,
      preferredAgent: item.trigger.agent as AgentType,
    });

    automationEngine.executeTrigger(item.triggerId, {
      ...result,
      requiresUserAction: result.requiresUserAction || item.trigger.requiresApproval,
      meta: {
        ...(result.meta || {}),
        automation: true,
        triggerType: item.trigger.type,
      },
    });

    const updated = automationEngine.getAllTriggers().find(trigger => trigger.triggerId === item.triggerId);
    if (updated) {
      executed.push(updated);
    }
  }

  return executed;
};

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

app.get("/api/data/wallets", (req, res) => {
  return res.json({ wallets, transactions });
});

app.get("/api/data/goals", (req, res) => {
  return res.json({ goals });
});

app.get("/api/data/gamification", (req, res) => {
  return res.json({ stats: gamificationStats });
});

app.get("/api/ai/status", async (req, res) => {
  const apiKey = typeof req.headers["x-api-key"] === "string" ? req.headers["x-api-key"] : undefined;
  const connected = await advisorAgent.isConnected(apiKey);
  return res.json({ connected, ai: geminiClient.getStatus() });
});

// ============ AUTOMATION ENDPOINTS ============

// Get pending automation triggers
app.get("/api/automation/pending", (req, res) => {
  const pending = automationEngine.getPendingTriggers();
  return res.json({ triggers: pending });
});

// Get approved automation triggers
app.get("/api/automation/approved", (req, res) => {
  const approved = automationEngine.getApprovedTriggers();
  return res.json({ triggers: approved });
});

// Get all automation triggers
app.get("/api/automation/all", (req, res) => {
  const all = automationEngine.getAllTriggers();
  return res.json({ triggers: all });
});

// Get automation trigger history
app.get("/api/automation/history", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const history = automationEngine.getTriggerHistory(limit);
  return res.json({ triggers: history });
});

// Get automation statistics
app.get("/api/automation/stats", (req, res) => {
  const stats = automationEngine.getStats();
  const cacheStats = globalCache.getStats();
  return res.json({ automationStats: stats, cacheStats });
});

// Get automation configuration
app.get("/api/automation/config", (req, res) => {
  const config = automationEngine.getConfig();
  return res.json(config);
});

// Update automation configuration
app.put("/api/automation/config", (req, res) => {
  const config = req.body;
  automationEngine.updateConfig(config);
  return res.json({ success: true, config: automationEngine.getConfig() });
});

// Approve a trigger
app.post("/api/automation/approve/:triggerId", (req, res) => {
  const { triggerId } = req.params;
  const success = automationEngine.approveTrigger(triggerId);
  return res.json({ success, triggerId });
});

// Execute approved automation. This still only asks agents for advice or payloads;
// no wallet, bank, or smart-contract transaction is submitted here.
app.post("/api/automation/run-approved", async (req, res) => {
  try {
    const executed = await runAutomationTriggers();
    return res.json({ executed });
  } catch (error: any) {
    console.error("Automation run error:", error);
    return res.status(500).json({ error: error?.message ?? "Automation run failed" });
  }
});

// Reject a trigger
app.post("/api/automation/reject/:triggerId", (req, res) => {
  const { triggerId } = req.params;
  const success = automationEngine.rejectTrigger(triggerId);
  return res.json({ success, triggerId });
});

// Detect automation opportunities for current financial state
app.post("/api/automation/detect", async (req, res) => {
  const context = req.body?.context || {};
  const txns = Array.isArray(req.body?.transactions) ? req.body.transactions : [];
  
  const triggers = automationEngine.detectTriggers(context, txns);
  const triggerIds = automationEngine.registerTriggers(triggers);

  try {
    const executed = await runAutomationTriggers();
    const pending = automationEngine.getPendingTriggers();
  
    return res.json({
      triggers: automationEngine.getAllTriggers().filter(trigger => triggerIds.includes(trigger.triggerId)),
      triggerIds,
      executed,
      pending,
      message: `Detected ${triggers.length} automation opportunities and ran ${executed.length} safe agent checks`
    });
  } catch (error: any) {
    console.error("Automation detect error:", error);
    return res.status(500).json({ error: error?.message ?? "Automation detection failed" });
  }
});

// Clean up old automation triggers (older than 24 hours)
app.post("/api/automation/cleanup", (req, res) => {
  const removed = automationEngine.cleanupOldTriggers();
  return res.json({ success: true, removed });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`AI backend running on http://localhost:${port}`);
});
