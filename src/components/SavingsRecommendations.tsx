import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lightbulb, PiggyBank, TrendingUp, RefreshCw, Zap, AlertCircle } from 'lucide-react';
import { useWallets } from '@/hooks/useWallets';
import { useAIAgent } from '@/hooks/useAIAgent';
import { useToast } from '@/hooks/use-toast';

interface SavingsRecommendation {
  advice: string;
  suggestedAmount: number;
  automationPossible: boolean;
  timeToGoal: number | null;
  potentialSavings: number;
}

export const SavingsRecommendations = () => {
  const { wallets, transactions, getWalletSummary } = useWallets();
  const { getSavingsAdvice, isLoading, error } = useAIAgent();
  const { toast } = useToast();

  const [recommendation, setRecommendation] = useState<SavingsRecommendation | null>(null);
  const [autoSave, setAutoSave] = useState(false);

  const summary = getWalletSummary();

  // Calculate current month's metrics
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

  const availableToSave = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (availableToSave / monthlyIncome) * 100 : 0;

  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        const response = await getSavingsAdvice(
          {
            monthlyIncome,
            monthlyExpenses,
            currentSavings: summary.totalAssets,
            totalBalance: summary.totalBalance,
          },
          currentMonthTransactions,
          autoSave
        );

        if (response) {
          // Extract suggested amount from response (simplified parsing)
          const amountMatch = response.answer?.match(/\$[\d,]+/);
          const suggestedAmount = amountMatch
            ? parseInt(amountMatch[0].replace(/[$,]/g, ''))
            : Math.ceil(availableToSave * 0.2); // Default to 20% of available

          setRecommendation({
            advice: response.answer || '',
            suggestedAmount,
            automationPossible: true,
            timeToGoal: null,
            potentialSavings: suggestedAmount * 12,
          });
        }
      } catch (err) {
        console.error('Savings recommendation error:', err);
        // Provide fallback recommendation
        const suggestedAmount = Math.ceil(availableToSave * 0.2);
        setRecommendation({
          advice: `Based on your available funds of $${availableToSave.toLocaleString()}, we recommend saving $${suggestedAmount} monthly.`,
          suggestedAmount,
          automationPossible: true,
          timeToGoal: null,
          potentialSavings: suggestedAmount * 12,
        });
      }
    };

    if (monthlyIncome > 0) {
      fetchRecommendation();
    }
  }, [autoSave, monthlyIncome, monthlyExpenses, summary.totalAssets, summary.totalBalance]);

  const handleAutoSave = () => {
    setAutoSave(!autoSave);
    if (!autoSave) {
      toast({
        title: 'Auto-Save Enabled',
        description: `$${recommendation?.suggestedAmount} will be automatically transferred monthly`,
      });
    }
  };

  if (wallets.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <PiggyBank className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading savings data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-green-600" />
                Savings Recommendations
              </CardTitle>
              <CardDescription>
                Maximize your financial growth with AI-powered savings strategies
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Savings Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Available</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${availableToSave.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Savings Rate</p>
                    <p className="text-2xl font-bold text-blue-600">{savingsRate.toFixed(1)}%</p>
                  </div>
                  <Zap className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Savings</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ${summary.totalAssets.toLocaleString()}
                    </p>
                  </div>
                  <PiggyBank className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendation */}
          {recommendation && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-900 mb-2">AI Recommendation</h4>
                    <p className="text-sm text-amber-800 leading-relaxed mb-4">
                      {recommendation.advice.substring(0, 400)}
                    </p>

                    {/* Savings Goal Card */}
                    <div className="bg-white p-3 rounded-lg border border-amber-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold">Suggested Monthly Savings</span>
                        <Badge variant="secondary">
                          ${recommendation.suggestedAmount.toLocaleString()}
                        </Badge>
                      </div>
                      <Progress
                        value={Math.min(100, (recommendation.suggestedAmount / availableToSave) * 100)}
                        className="h-2 mb-2"
                      />
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>
                          <p className="font-semibold text-foreground">
                            ${recommendation.potentialSavings.toLocaleString()}
                          </p>
                          <p>Potential annual savings</p>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {((recommendation.suggestedAmount / availableToSave) * 100).toFixed(0)}%
                          </p>
                          <p>Of available funds</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  className={autoSave ? 'bg-green-600 hover:bg-green-700' : ''}
                  onClick={handleAutoSave}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {autoSave ? 'Auto-Save Active' : 'Enable Auto-Save'}
                </Button>
                <Button variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Create Savings Goal
                </Button>
              </div>

              {/* Info Message */}
              {recommendation.automationPossible && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    Auto-save can automatically transfer your recommended amount every month to help you
                    reach your financial goals faster.
                  </p>
                </div>
              )}
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Generating savings recommendation...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
