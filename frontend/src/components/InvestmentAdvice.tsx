import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Lightbulb, TrendingUp, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';
import { useWallets } from '@/hooks/useWallets';
import { useAIAgent } from '@/hooks/useAIAgent';
import { AgentStatusBadge } from '@/components/AgentStatusBadge';
import { buildFinancialContext, getMonthlyCashflow } from '@/lib/financialContext';

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
  const [questionDraft, setQuestionDraft] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [isQuestionSubmitting, setIsQuestionSubmitting] = useState(false);

  const summary = getWalletSummary();
  const { monthlyIncome, monthlyExpenses } = getMonthlyCashflow(transactions);
  const localAdvice = useMemo(() => {
    const surplus = monthlyIncome - monthlyExpenses;
    const riskLevel = surplus > 1000 ? "medium" : "low";
    const adviceText = surplus > 0
      ? `Your dashboard shows an estimated monthly surplus of $${surplus.toLocaleString()}. Before investing more, keep an emergency buffer, protect near-term goals, then use diversified low-cost funds for gradual growth.`
      : `Your dashboard does not show a positive monthly surplus right now. Focus on stabilizing cash flow and keeping cash reserves before increasing investment risk.`;

    return {
      advice: adviceText,
      recommendations: [
        "Confirm your emergency fund before adding investment risk",
        "Use diversified, low-cost funds for core long-term exposure",
        "Invest gradually only from true surplus after bills and goals",
      ],
      riskLevel,
      confidence: 0.78,
    };
  }, [monthlyIncome, monthlyExpenses]);

  useEffect(() => {
    const openInvestmentAI = () => {
      setShowInput(true);
      setQuestionDraft((current) => current || "What investment move should I make next based on my portfolio risk?");
    };

    window.addEventListener("planwise:open-investment-ai", openInvestmentAI);
    return () => window.removeEventListener("planwise:open-investment-ai", openInvestmentAI);
  }, []);

  const fetchAdvice = async (question: string) => {
    try {
      const response = await getInvestmentAdvice(
        buildFinancialContext(summary, [], transactions),
        transactions,
        question
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

  const handleAskQuestion = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const nextQuestion = questionDraft.trim();
    if (!nextQuestion || isQuestionSubmitting) return;

    try {
      setIsQuestionSubmitting(true);
      setCustomQuestion(nextQuestion);
      await fetchAdvice(nextQuestion);
    } finally {
      setIsQuestionSubmitting(false);
    }
  };

  const handleRefreshAIAdvice = async () => {
    await fetchAdvice(customQuestion || 'general investment strategy');
  };

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
    <div id="investment-advice-panel" className="scroll-mt-28 space-y-6">
      <Card className="border-l-4 border-l-blue-500 shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Investment Advice
              </CardTitle>
              <CardDescription className="text-foreground/75">AI-powered investment strategies personalized for your financial situation</CardDescription>
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
          {(advice || localAdvice) && (
            <div className="space-y-4">
              <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 shadow-sm dark:border-primary/40">
                <div className="flex gap-3">
                  <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-foreground">Investment Agent Strategy</h4>
                      <Badge className={getRiskColor((advice || localAdvice).riskLevel)}>{(advice || localAdvice).riskLevel} risk</Badge>
                      <div className={`text-xs font-semibold ${getConfidenceColor((advice || localAdvice).confidence)}`}>
                        {((advice || localAdvice).confidence * 100).toFixed(0)}% confidence
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/85">
                      {(advice || localAdvice).advice.substring(0, 500)}
                      {(advice || localAdvice).advice.length > 500 ? '...' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Guardrails */}
              {(advice || localAdvice).recommendations && (advice || localAdvice).recommendations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 font-semibold text-foreground">
                    <ShieldCheck className="w-4 h-4" />
                    Investment Guardrails
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(advice || localAdvice).recommendations.slice(0, 3).map((rec, idx) => (
                      <Button
                        key={idx}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowInput(true);
                          setQuestionDraft(`Explain this investment guardrail for my finances: ${rec}`);
                        }}
                        className="h-auto justify-start whitespace-normal border-border/80 text-left text-foreground/90 shadow-sm"
                      >
                        {rec.substring(0, 120)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={handleRefreshAIAdvice}
                disabled={isLoading}
              >
                {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Refresh with AI Agent
              </Button>

              {/* Custom Question */}
              {showInput ? (
                <div className="space-y-3 rounded-lg border border-border/80 bg-muted/35 p-4 shadow-sm">
                  <label className="block text-sm font-semibold">Ask a specific investment question:</label>
                  <form className="flex gap-2" onSubmit={handleAskQuestion}>
                    <Input
                      type="text"
                      placeholder="e.g., Should I invest in crypto?"
                      value={questionDraft}
                      onChange={(e) => setQuestionDraft(e.target.value)}
                      className="relative z-10 flex-1"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isQuestionSubmitting || !questionDraft.trim()}
                      className="relative z-10"
                    >
                      {isQuestionSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Ask'}
                    </Button>
                  </form>
                  {customQuestion && (
                    <p className="text-xs text-muted-foreground">
                      Current question: {customQuestion}
                    </p>
                  )}
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

          <div className="rounded-md border border-amber-200/40 bg-amber-50/40 px-3 py-2 text-[11px] text-muted-foreground dark:border-amber-900/30 dark:bg-amber-950/10">
            <p>⚠ AI insights are informational only</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
