import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';
import { useWallets } from '@/hooks/useWallets';
import { useAIAgent } from '@/hooks/useAIAgent';
import { AgentStatusBadge } from '@/components/AgentStatusBadge';

interface InvestmentAdviceData {
  advice: string;
  recommendations: string[];
  riskLevel: string;
  confidence: number;
}

export const InvestmentAdvice = () => {
  const { wallets, transactions, getWalletSummary } = useWallets();
  const { getInvestmentAdvice, isLoading, error } = useAIAgent();

  const [advice, setAdvice] = useState<InvestmentAdviceData | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [showInput, setShowInput] = useState(false);

  const summary = getWalletSummary();

  const monthlyIncome = 5500; // Mock value - should come from transactions
  const monthlyExpenses = 3420; // Mock value

  useEffect(() => {
    const fetchAdvice = async () => {
      try {
        const response = await getInvestmentAdvice(
          {
            monthlyIncome,
            monthlyExpenses,
            currentSavings: summary.totalAssets,
            totalBalance: summary.totalBalance,
          },
          transactions,
          customQuestion || 'general investment strategy'
        );

        if (response) {
          const recommendations = (response.answer || '')
            .split(/\d\.\s+/)
            .filter((line: string) => line.trim())
            .slice(0, 3);

          setAdvice({
            advice: response.answer || '',
            recommendations: recommendations,
            riskLevel: response.meta?.riskLevel || 'medium',
            confidence: response.confidence || 0.85,
          });
        }
      } catch (err) {
        console.error('Investment advice error:', err);
      }
    };

    fetchAdvice();
  }, [customQuestion]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300';
      case 'high':
        return 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300';
      case 'medium':
      default:
        return 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-300';
    if (confidence >= 0.6) return 'text-amber-600 dark:text-amber-300';
    return 'text-orange-600 dark:text-orange-300';
  };

  if (wallets.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading investment data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Investment Advice
              </CardTitle>
              <CardDescription>AI-powered investment strategies personalized for your financial situation</CardDescription>
              <div className="mt-2">
                <AgentStatusBadge agent="investment" />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/40 rounded-lg border border-border/70">
              <p className="text-xs text-muted-foreground font-semibold">NET WORTH</p>
              <p className="text-2xl font-bold mt-2">${summary.netWorth.toLocaleString()}</p>
            </div>

            <div className="p-4 bg-muted/40 rounded-lg border border-border/70">
              <p className="text-xs text-muted-foreground font-semibold">INVESTABLE ASSETS</p>
              <p className="text-2xl font-bold mt-2">${summary.totalAssets.toLocaleString()}</p>
            </div>

            <div className="p-4 bg-muted/40 rounded-lg border border-border/70">
              <p className="text-xs text-muted-foreground font-semibold">MONTHLY SURPLUS</p>
              <p className="text-2xl font-bold mt-2">
                ${Math.max(0, monthlyIncome - monthlyExpenses).toLocaleString()}
              </p>
            </div>
          </div>

          {/* AI Advice */}
          {advice && (
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex gap-3">
                  <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-foreground">Investment Agent Strategy</h4>
                      <Badge className={getRiskColor(advice.riskLevel)}>{advice.riskLevel} risk</Badge>
                      <div className={`text-xs font-semibold ${getConfidenceColor(advice.confidence)}`}>
                        {(advice.confidence * 100).toFixed(0)}% confidence
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {advice.advice.substring(0, 500)}
                      {advice.advice.length > 500 ? '...' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Recommendations */}
              {advice.recommendations && advice.recommendations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Key Recommendations
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {advice.recommendations.slice(0, 3).map((rec, idx) => (
                      <div key={idx} className="flex gap-3 p-3 bg-muted/40 rounded-lg border border-border/70">
                        <Badge variant="outline" className="flex-shrink-0">
                          {idx + 1}
                        </Badge>
                        <p className="text-sm">{rec.substring(0, 200)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Question */}
              {showInput ? (
                <div className="p-4 bg-muted/40 rounded-lg border border-border/70 space-y-3">
                  <label className="block text-sm font-semibold">Ask a specific investment question:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., Should I invest in crypto?"
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      className="flex-1 px-3 py-2 border border-input rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <Button
                      size="sm"
                      onClick={() => setShowInput(false)}
                      disabled={isLoading}
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Ask'}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowInput(true)}
                >
                  Ask a Specific Question
                </Button>
              )}
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Investment Agent is analyzing opportunities...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg text-xs text-amber-700 dark:text-amber-300">
            <p>
              ⚠️ This is AI-generated advice and not financial counsel. Please consult with a certified financial
              advisor before making investment decisions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
