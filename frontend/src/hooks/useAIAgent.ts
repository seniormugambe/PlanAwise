import { useState, useCallback } from 'react';
import {
  aiAgentService,
  FinancialContext,
  AgentResponse,
  AutomationRunResult,
  Receipt,
} from '@/services/aiAgentService';
import { WalletTransaction } from '@/types/wallet';

export type AgentPreference = 'auto' | 'budget' | 'savings' | 'investment' | 'advisor' | 'receipt';

export const useAIAgent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  const processQuery = useCallback(
    async (
      query: string,
      context?: FinancialContext,
      transactions?: WalletTransaction[],
      preferredAgent: AgentPreference = 'auto'
    ): Promise<AgentResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await aiAgentService.processQuery(
          query,
          context,
          transactions,
          preferredAgent
        );
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to process query';
        setError(message);
        console.error('Agent error:', message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getFinancialAdvice = useCallback(
    async (question: string, context?: FinancialContext): Promise<AgentResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await aiAgentService.getFinancialAdvice(question, context);
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to get financial advice';
        setError(message);
        console.error('Advice error:', message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getBudgetAdvice = useCallback(
    async (
      context?: FinancialContext,
      transactions?: WalletTransaction[],
      mode: 'analyze' | 'suggest' | 'alert' = 'analyze'
    ): Promise<AgentResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await aiAgentService.getBudgetAdvice(context, transactions, mode);
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to get budget advice';
        setError(message);
        console.error('Budget advice error:', message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getSavingsAdvice = useCallback(
    async (
      context?: FinancialContext,
      transactions?: WalletTransaction[],
      autoSave: boolean = false
    ): Promise<AgentResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await aiAgentService.getSavingsAdvice(context, transactions, autoSave);
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to get savings advice';
        setError(message);
        console.error('Savings advice error:', message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getInvestmentAdvice = useCallback(
    async (
      context?: FinancialContext,
      transactions?: WalletTransaction[],
      question?: string
    ): Promise<AgentResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await aiAgentService.getInvestmentAdvice(context, transactions, question);
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to get investment advice';
        setError(message);
        console.error('Investment advice error:', message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const processReceipt = useCallback(async (receiptText: string): Promise<Receipt | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const receipt = await aiAgentService.processReceipt(receiptText);
      return receipt;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process receipt';
      setError(message);
      console.error('Receipt processing error:', message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getReceipts = useCallback(async (): Promise<Receipt[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const receipts = await aiAgentService.getReceipts();
      return receipts;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch receipts';
      setError(message);
      console.error('Receipts fetch error:', message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkStatus = useCallback(async (): Promise<boolean> => {
    try {
      const status = await aiAgentService.checkStatus();
      setIsConnected(status);
      return status;
    } catch (err) {
      console.error('Status check error:', err);
      setIsConnected(false);
      return false;
    }
  }, []);

  const detectAndRunAutomation = useCallback(
    async (
      context?: FinancialContext,
      transactions?: WalletTransaction[]
    ): Promise<AutomationRunResult | null> => {
      try {
        return await aiAgentService.detectAndRunAutomation(context, transactions);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to run automation';
        setError(message);
        console.error('Automation error:', message);
        return null;
      }
    },
    []
  );

  const setApiKey = useCallback((key: string): void => {
    aiAgentService.setApiKey(key);
  }, []);

  return {
    isLoading,
    error,
    isConnected,
    processQuery,
    getFinancialAdvice,
    getBudgetAdvice,
    getSavingsAdvice,
    getInvestmentAdvice,
    processReceipt,
    getReceipts,
    checkStatus,
    detectAndRunAutomation,
    setApiKey,
  };
};
