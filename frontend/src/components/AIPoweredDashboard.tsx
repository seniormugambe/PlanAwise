import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sparkles,
  TrendingUp,
  Target,
  PiggyBank,
  BarChart3,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useAIPoweredUI } from "@/hooks/useAIPoweredUI";
import { FinancialOverview } from "@/components/FinancialOverview";
import { BudgetAnalysis } from "@/components/BudgetAnalysis";
import { SavingsRecommendations } from "@/components/SavingsRecommendations";
import { InvestmentAdvice } from "@/components/InvestmentAdvice";
import { GoalTracker } from "@/components/GoalTracker";
import { CashflowChart } from "@/components/CashflowChart";
import { GamificationPanel } from "@/components/GamificationPanel";
import { NotificationCenter } from "@/components/NotificationCenter";

const componentMap = {
  financialOverview: FinancialOverview,
  budgetAnalysis: BudgetAnalysis,
  savingsRecommendations: SavingsRecommendations,
  investmentAdvice: InvestmentAdvice,
  goalTracker: GoalTracker,
  cashflowChart: CashflowChart,
  gamificationPanel: GamificationPanel,
  notificationCenter: NotificationCenter,
};

export const AIPoweredDashboard = () => {
  const { uiConfig, automationRun, isAnalyzing, refreshAnalysis } = useAIPoweredUI();
  const [expandedInsights, setExpandedInsights] = useState(false);

  if (isAnalyzing || !uiConfig) {
    return (
      <div className="space-y-8">
        {/* Loading Hero */}
        <div className="text-center py-8">
          <Skeleton className="h-8 w-96 mx-auto mb-4" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>

        {/* Loading Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Sort components by priority and position
  const sortedComponents = Object.entries(uiConfig.components)
    .filter(([_, config]) => config.visible)
    .sort(([, a], [, b]) => {
      if (a.priority !== b.priority) {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.position - b.position;
    });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-300';
      case 'medium': return 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300';
      case 'low': return 'bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-300';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-8">
      {/* AI-Powered Hero Section */}
      <div className="text-center py-8 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-lg border">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <Badge variant="secondary" className="text-xs">
            AI Analysis Complete
          </Badge>
        </div>

        <h2 className="text-3xl font-bold text-gradient-primary mb-2">
          {uiConfig.dashboard.heroMessage}
        </h2>

        <p className="text-muted-foreground text-lg mb-6">
          Your dashboard has been personalized based on your financial profile
        </p>

        {/* Key Insights */}
        {uiConfig.dashboard.keyInsights.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">Key Insights</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {uiConfig.dashboard.keyInsights.slice(0, expandedInsights ? undefined : 3).map((insight, index) => (
                <Card key={index} className="bg-card/70 border-primary/20">
                  <CardContent className="p-4">
                    <p className="text-sm text-center">{insight}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {uiConfig.dashboard.keyInsights.length > 3 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpandedInsights(!expandedInsights)}
                className="mb-4"
              >
                {expandedInsights ? 'Show Less' : `Show ${uiConfig.dashboard.keyInsights.length - 3} More Insights`}
              </Button>
            )}
          </div>
        )}

        {/* Recommended Actions */}
        {uiConfig.dashboard.recommendedActions.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
              <Target className="w-5 h-5" />
              Recommended Next Steps
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uiConfig.dashboard.recommendedActions.map((action, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={getPriorityColor(action.priority)}>
                        {action.priority.toUpperCase()}
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>

                    <h4 className="font-semibold mb-2">{action.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{action.description}</p>

                    <Button size="sm" className="w-full" onClick={action.action}>
                      Take Action
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Refresh Analysis Button */}
        <div className="mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAnalysis}
            disabled={isAnalyzing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            Refresh AI Analysis
          </Button>
        </div>
      </div>

      {automationRun && (automationRun.executed.length > 0 || automationRun.pending.length > 0) && (
        <Alert className="border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <ShieldCheck className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Agents ran {automationRun.executed.length} safe check{automationRun.executed.length === 1 ? '' : 's'} automatically.
              {automationRun.pending.length > 0
                ? ` ${automationRun.pending.length} action needs your approval before money can move.`
                : ' No money-moving action was taken.'}
            </span>
            <Badge variant="secondary">
              Safe automation
            </Badge>
          </AlertDescription>
        </Alert>
      )}

      {/* AI-Prioritized Components */}
      <div className="space-y-8">
        {sortedComponents.map(([componentKey, config]) => {
          const Component = componentMap[componentKey as keyof typeof componentMap];

          if (!Component) return null;

          return (
            <div key={componentKey} className="relative">
              {/* Priority Indicator */}
              <div className="absolute -top-3 left-4 z-10">
                <Badge
                  variant="outline"
                  className={`${getPriorityColor(config.priority)} text-xs font-medium`}
                >
                  {config.priority.toUpperCase()} PRIORITY
                </Badge>
              </div>

              {/* Component */}
              <div className="pt-2">
                <Component />
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Status Footer */}
      <Alert className="bg-primary/10 border-primary/20">
        <BarChart3 className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            This dashboard is powered by AI analysis of your financial data.
            Components are prioritized and arranged based on your current financial situation.
          </span>
          <Badge variant="secondary" className="ml-4">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Active
          </Badge>
        </AlertDescription>
      </Alert>
    </div>
  );
};
