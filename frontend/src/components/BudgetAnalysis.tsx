import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, TrendingDown, Lightbulb, RefreshCw, Target } from 'lucide-react';
import { useWallets } from '@/hooks/useWallets';
import { useAIAgent } from '@/hooks/useAIAgent';
import { useToast } from '@/hooks/use-toast';
import { AgentStatusBadge } from '@/components/AgentStatusBadge';

interface BudgetAnalysisData {
  spendingAnalysis: string;
  recommendations: string[];
  alertLevel: 'safe' | 'warning' | 'critical';
  monthlyBudgetStatus: {
    budgeted: number;
    spent: number;
    remaining: number;
    percentUsed: number;
  };
}

export const BudgetAnalysis = () => {
  const { wallets, transactions, getWalletSummary } = useWallets();
  const { getBudgetAdvice, isLoading, error } = useAIAgent();
  const { toast } = useToast();
  
  const [analysis, setAnalysis] = useState<BudgetAnalysisData | null>(null);
  const [mode, setMode] = useState<'analyze' | 'suggest' | 'alert'>('analyze');

  const summary = getWalletSummary();

  // Calculate current month's spending
  const currentDate = new Date();
  const currentMonthTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    return (
      tDate.getMonth() === currentDate.getMonth() &&
      tDate.getFullYear() === currentDate.getFullYear()
    );
  });

  const monthlyExpenses = Math.abs(
    currentMonthTransactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const monthlyIncome = currentMonthTransactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await getBudgetAdvice(
          {
            monthlyIncome,
            monthlyExpenses,
            totalBalance: summary.totalBalance,
            currentSavings: summary.totalAssets,
          },
          currentMonthTransactions,
          mode
        );

        if (response) {
          // Parse recommendations from response
          const recommendations = (response.answer || '')
            .split('\n')
            .filter((line: string) => line.trim())
            .slice(0, 3);

          setAnalysis({
            spendingAnalysis: response.answer || '',
            recommendations: recommendations,
            alertLevel: determineAlertLevel(monthlyExpenses, monthlyIncome),
            monthlyBudgetStatus: {
              budgeted: monthlyIncome,
              spent: monthlyExpenses,
              remaining: monthlyIncome - monthlyExpenses,
              percentUsed: monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0,
            },
          });
        }
      } catch (err) {
        console.error('Budget analysis error:', err);
        toast({
          title: 'Analysis Failed',
          description: error || 'Could not fetch budget analysis. Please try again.',
          variant: 'destructive',
        });
      }
    };

    if (monthlyIncome > 0) {
      fetchAnalysis();
    }
  }, [mode, monthlyIncome, monthlyExpenses, summary.totalBalance, summary.totalAssets]);

  const determineAlertLevel = (spent: number, income: number): 'safe' | 'warning' | 'critical' => {
    if (income === 0) return 'critical';
    const percentUsed = (spent / income) * 100;
    if (percentUsed > 90) return 'critical';
    if (percentUsed > 75) return 'warning';
    return 'safe';
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'text-red-700 bg-red-500/10 border-red-500/20 dark:text-red-300';
      case 'warning':
        return 'text-amber-700 bg-amber-500/10 border-amber-500/20 dark:text-amber-300';
      case 'safe':
        return 'text-green-700 bg-green-500/10 border-green-500/20 dark:text-green-300';
      default:
        return 'text-muted-foreground bg-muted/40 border-border/70';
    }
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'safe':
        return <TrendingDown className="w-5 h-5 text-green-600" />;
      default:
        return <TrendingDown className="w-5 h-5" />;
    }
  };

  if (wallets.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <TrendingDown className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading budget data...</p>
        </CardContent>
      </Card>
    );
  }

  const status = analysis?.monthlyBudgetStatus || {
    budgeted: monthlyIncome,
    spent: monthlyExpenses,
    remaining: monthlyIncome - monthlyExpenses,
    percentUsed: monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0,
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Budget Analysis
              </CardTitle>
              <CardDescription>AI-powered spending insights and recommendations</CardDescription>
              <div className="mt-2">
                <AgentStatusBadge agent="budget" />
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setMode((m) => (m === 'analyze' ? 'suggest' : 'analyze'))}
              disabled={isLoading}
              className="self-start sm:self-auto"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {mode === 'analyze' ? 'Get Suggestions' : 'Analyze'}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Monthly Budget Status */}
          <div className={`p-4 rounded-lg border ${getAlertColor(status.percentUsed > 90 ? 'critical' : status.percentUsed > 75 ? 'warning' : 'safe')}`}>
            <div className="flex items-start gap-3">
              {getAlertIcon(status.percentUsed > 90 ? 'critical' : status.percentUsed > 75 ? 'warning' : 'safe')}
              <div className="flex-1">
                <h4 className="font-semibold mb-3">Monthly Budget Status</h4>

                {/* Mobile: Stacked layout */}
                <div className="sm:hidden space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Income</span>
                    <span className="font-bold">${status.budgeted.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Spent</span>
                    <span className="font-bold">${status.spent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Remaining</span>
                    <span className={`font-bold ${status.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${status.remaining.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Desktop: Grid layout */}
                <div className="hidden sm:grid sm:grid-cols-3 gap-4 mb-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Income</p>
                    <p className="font-bold">${status.budgeted.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Spent</p>
                    <p className="font-bold">${status.spent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Remaining</p>
                    <p className={`font-bold ${status.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${status.remaining.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Progress value={Math.min(100, status.percentUsed)} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {status.percentUsed.toFixed(1)}% of monthly budget used
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          {analysis && (
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex gap-3">
                  <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Budget Agent Insight</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {analysis.spendingAnalysis.substring(0, 300)}...
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Recommendations
                  </h4>
                  <div className="space-y-2">
                    {analysis.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex gap-3 p-3 bg-muted rounded-lg">
                        <Badge variant="outline" className="flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </Badge>
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Budget Agent is analyzing your spending...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">Error: {error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
