import { useState, useEffect, useCallback } from 'react';
import { useWallets } from '@/hooks/useWallets';
import { useGoals } from '@/hooks/useGoals';
import { useAIAgent } from '@/hooks/useAIAgent';
import type { AutomationRunResult } from '@/services/aiAgentService';

export interface UIDecision {
  priority: 'high' | 'medium' | 'low';
  visible: boolean;
  position: number;
  customizations?: {
    title?: string;
    description?: string;
    actions?: string[];
  };
}

export interface AIPoweredUI {
  dashboard: {
    layout: 'overview' | 'budget-focus' | 'savings-focus' | 'investment-focus' | 'goal-focus';
    heroMessage: string;
    keyInsights: string[];
    recommendedActions: Array<{
      title: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
      action: () => void;
    }>;
  };
  components: {
    financialOverview: UIDecision;
    budgetAnalysis: UIDecision;
    savingsRecommendations: UIDecision;
    investmentAdvice: UIDecision;
    goalTracker: UIDecision;
    cashflowChart: UIDecision;
    gamificationPanel: UIDecision;
    notificationCenter: UIDecision;
  };
  navigation: {
    primaryTabs: Array<{
      id: string;
      label: string;
      priority: number;
      visible: boolean;
    }>;
    quickActions: Array<{
      label: string;
      icon: string;
      action: () => void;
      visible: boolean;
    }>;
  };
}

export const useAIPoweredUI = () => {
  const { transactions, getWalletSummary } = useWallets();
  const { getGoalSummary } = useGoals();
  const { processQuery, detectAndRunAutomation, isLoading } = useAIAgent();

  const [uiConfig, setUIConfig] = useState<AIPoweredUI | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [automationRun, setAutomationRun] = useState<AutomationRunResult | null>(null);

  const analyzeUserProfile = useCallback(async () => {
    setIsAnalyzing(true);

    try {
      const summary = getWalletSummary();
      const goalSummary = getGoalSummary();

      // Calculate key metrics
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyTransactions = transactions.filter(t =>
        t.date.getMonth() === currentMonth && t.date.getFullYear() === currentYear
      );

      const monthlyIncome = monthlyTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

      const monthlyExpenses = Math.abs(monthlyTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0));

      const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
      const context = {
        monthlyIncome,
        monthlyExpenses,
        currentSavings: summary.totalAssets,
        totalBalance: summary.totalBalance,
        goals: goalSummary.goals?.map(g => ({
          title: g.title,
          current: g.currentAmount,
          target: g.targetAmount
        }))
      };

      const automation = await detectAndRunAutomation(context, monthlyTransactions);
      setAutomationRun(automation);

      // AI-powered UI analysis
      const uiAnalysisQuery = `
        Based on this financial profile, determine the optimal UI layout and component priorities:
        - Total Balance: $${summary.totalBalance}
        - Monthly Income: $${monthlyIncome}
        - Monthly Expenses: $${monthlyExpenses}
        - Savings Rate: ${savingsRate.toFixed(1)}%
        - Goals Progress: ${goalSummary.overallProgress.toFixed(1)}%
        - Active Goals: ${goalSummary.totalGoals}
        - Recent Transactions: ${monthlyTransactions.length}

        Return a JSON object with UI recommendations including:
        1. Primary dashboard focus (overview/budget-focus/savings-focus/investment-focus/goal-focus)
        2. Component visibility and priority rankings
        3. Personalized hero message
        4. Key insights to highlight
        5. Recommended actions for the user
      `;

      const analysis = await processQuery(uiAnalysisQuery, context);

      // Parse AI response and create UI configuration
      const uiConfig = parseUIAnalysis(analysis?.answer || '', {
        summary,
        goalSummary,
        monthlyIncome,
        monthlyExpenses,
        savingsRate,
        transactionCount: monthlyTransactions.length
      });

      setUIConfig(uiConfig);
    } catch (error) {
      console.error('UI analysis error:', error);
      // Fallback to default UI
      setUIConfig(getDefaultUIConfig());
    } finally {
      setIsAnalyzing(false);
    }
  }, [transactions, getWalletSummary, getGoalSummary, processQuery, detectAndRunAutomation]);

  const parseUIAnalysis = (analysis: string, data: any): AIPoweredUI => {
    try {
      // Extract insights from AI response
      const insights = extractInsightsFromText(analysis);

      // Determine primary focus based on data
      let primaryFocus: AIPoweredUI['dashboard']['layout'] = 'overview';

      if (data.savingsRate < 10) {
        primaryFocus = 'savings-focus';
      } else if (data.monthlyExpenses / data.monthlyIncome > 0.8) {
        primaryFocus = 'budget-focus';
      } else if (data.goalSummary.overallProgress < 50) {
        primaryFocus = 'goal-focus';
      } else if (data.summary.totalBalance > 10000) {
        primaryFocus = 'investment-focus';
      }

      // Create personalized hero message
      const heroMessage = generateHeroMessage(primaryFocus, data);

      // Determine component priorities
      const components = {
        financialOverview: { priority: 'high' as const, visible: true, position: 1 },
        budgetAnalysis: {
          priority: primaryFocus === 'budget-focus' ? 'high' as const : 'medium' as const,
          visible: data.monthlyIncome > 0,
          position: 2
        },
        savingsRecommendations: {
          priority: primaryFocus === 'savings-focus' ? 'high' as const : 'medium' as const,
          visible: data.savingsRate < 20,
          position: 3
        },
        investmentAdvice: {
          priority: primaryFocus === 'investment-focus' ? 'high' as const : 'low' as const,
          visible: data.summary.totalBalance > 1000,
          position: 4
        },
        goalTracker: {
          priority: primaryFocus === 'goal-focus' ? 'high' as const : 'medium' as const,
          visible: data.goalSummary.totalGoals > 0,
          position: 5
        },
        cashflowChart: { priority: 'medium' as const, visible: data.transactionCount > 5, position: 6 },
        gamificationPanel: { priority: 'low' as const, visible: true, position: 7 },
        notificationCenter: { priority: 'medium' as const, visible: true, position: 8 }
      };

      // Generate recommended actions
      const recommendedActions = generateRecommendedActions(primaryFocus, data);

      return {
        dashboard: {
          layout: primaryFocus,
          heroMessage,
          keyInsights: insights,
          recommendedActions
        },
        components,
        navigation: {
          primaryTabs: [
            { id: 'dashboard', label: 'Dashboard', priority: 1, visible: true },
            { id: 'ai-insights', label: 'AI Insights', priority: 2, visible: true },
            { id: 'investments', label: 'Investments', priority: 3, visible: data.summary.totalBalance > 5000 },
            { id: 'wallets', label: 'Wallets', priority: 4, visible: true },
            { id: 'goals', label: 'Goals', priority: 5, visible: data.goalSummary.totalGoals > 0 },
            { id: 'notifications', label: 'Activity', priority: 6, visible: true }
          ].sort((a, b) => a.priority - b.priority),
          quickActions: [
            { label: 'Add Goal', icon: 'target', action: () => {}, visible: data.goalSummary.totalGoals < 3 },
            { label: 'Connect Wallet', icon: 'wallet', action: () => {}, visible: data.summary.totalWallets === 0 },
            { label: 'View Budget', icon: 'pie-chart', action: () => {}, visible: data.monthlyIncome > 0 }
          ].filter(action => action.visible)
        }
      };
    } catch (error) {
      console.error('Error parsing UI analysis:', error);
      return getDefaultUIConfig();
    }
  };

  const extractInsightsFromText = (text: string): string[] => {
    // Extract key insights from AI response
    const insights = [];
    const lines = text.split('\n').filter(line => line.trim().length > 0);

    for (const line of lines) {
      if (line.includes('•') || line.includes('-') || line.match(/^\d+\./)) {
        const cleanLine = line.replace(/^[•\-*\d+\.\s]*/, '').trim();
        if (cleanLine.length > 10 && cleanLine.length < 100) {
          insights.push(cleanLine);
        }
      }
    }

    return insights.slice(0, 3); // Return top 3 insights
  };

  const generateHeroMessage = (focus: AIPoweredUI['dashboard']['layout'], data: any): string => {
    switch (focus) {
      case 'budget-focus':
        return `Your spending is ${((data.monthlyExpenses / data.monthlyIncome) * 100).toFixed(0)}% of income. Let's optimize your budget!`;
      case 'savings-focus':
        return `You're saving ${data.savingsRate.toFixed(0)}% monthly. Let's boost that to reach your goals faster!`;
      case 'investment-focus':
        return `With $${data.summary.totalBalance.toLocaleString()} available, you're ready to grow your wealth through smart investments.`;
      case 'goal-focus':
        return `You're ${data.goalSummary.overallProgress.toFixed(0)}% towards your goals. Let's accelerate your progress!`;
      default:
        return `Welcome back! Your financial dashboard is ready with personalized insights.`;
    }
  };

  const generateRecommendedActions = (focus: AIPoweredUI['dashboard']['layout'], data: any) => {
    const actions = [];

    switch (focus) {
      case 'budget-focus':
        actions.push({
          title: 'Review Budget',
          description: 'Analyze your spending patterns and create a better budget',
          priority: 'high' as const,
          action: () => {}
        });
        break;
      case 'savings-focus':
        actions.push({
          title: 'Set Up Auto-Save',
          description: 'Automatically save a portion of your income',
          priority: 'high' as const,
          action: () => {}
        });
        break;
      case 'investment-focus':
        actions.push({
          title: 'Explore Investments',
          description: 'Get personalized investment recommendations',
          priority: 'high' as const,
          action: () => {}
        });
        break;
      case 'goal-focus':
        actions.push({
          title: 'Update Goals',
          description: 'Review and adjust your financial goals',
          priority: 'high' as const,
          action: () => {}
        });
        break;
    }

    // Add general actions
    if (data.goalSummary.totalGoals === 0) {
      actions.push({
        title: 'Create Your First Goal',
        description: 'Set a financial goal to start your journey',
        priority: 'medium' as const,
        action: () => {}
      });
    }

    return actions;
  };

  const getDefaultUIConfig = (): AIPoweredUI => ({
    dashboard: {
      layout: 'overview',
      heroMessage: 'Welcome to your AI-powered financial dashboard!',
      keyInsights: [
        'Track your spending and savings',
        'Set and achieve financial goals',
        'Get personalized AI recommendations'
      ],
      recommendedActions: []
    },
    components: {
      financialOverview: { priority: 'high', visible: true, position: 1 },
      budgetAnalysis: { priority: 'medium', visible: true, position: 2 },
      savingsRecommendations: { priority: 'medium', visible: true, position: 3 },
      investmentAdvice: { priority: 'low', visible: true, position: 4 },
      goalTracker: { priority: 'medium', visible: true, position: 5 },
      cashflowChart: { priority: 'medium', visible: true, position: 6 },
      gamificationPanel: { priority: 'low', visible: true, position: 7 },
      notificationCenter: { priority: 'medium', visible: true, position: 8 }
    },
    navigation: {
      primaryTabs: [
        { id: 'dashboard', label: 'Dashboard', priority: 1, visible: true },
        { id: 'ai-insights', label: 'AI Insights', priority: 2, visible: true },
        { id: 'investments', label: 'Investments', priority: 3, visible: true },
        { id: 'wallets', label: 'Wallets', priority: 4, visible: true },
        { id: 'goals', label: 'Goals', priority: 5, visible: true },
        { id: 'notifications', label: 'Activity', priority: 6, visible: true }
      ],
      quickActions: []
    }
  });

  useEffect(() => {
    analyzeUserProfile();
  }, [analyzeUserProfile]);

  return {
    uiConfig,
    automationRun,
    isAnalyzing: isAnalyzing || isLoading,
    refreshAnalysis: analyzeUserProfile
  };
};
