import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Sparkles,
  Target,
  BarChart3,
  Lightbulb,
  RefreshCw,
  ShieldCheck,
  Trophy,
  Award,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Flame,
  Star,
} from "lucide-react";
import { useAIPoweredUI } from "@/hooks/useAIPoweredUI";
import { useGamification } from "@/hooks/useGamification";
import { FinancialOverview } from "@/components/FinancialOverview";
import { BudgetAnalysis } from "@/components/BudgetAnalysis";
import { SavingsRecommendations } from "@/components/SavingsRecommendations";
import { InvestmentAdvice } from "@/components/InvestmentAdvice";
import { GoalTracker } from "@/components/GoalTracker";
import { CashflowChart } from "@/components/CashflowChart";
import { NotificationCenter } from "@/components/NotificationCenter";
import { PlanWiseCopilot } from "@/components/PlanWiseCopilot";
import { useGoals } from "@/hooks/useGoals";
import { useWallets } from "@/hooks/useWallets";
import { getAnalysisTransactions } from "@/lib/financialContext";

const componentMap = {
  financialOverview: FinancialOverview,
  budgetAnalysis: BudgetAnalysis,
  savingsRecommendations: SavingsRecommendations,
  investmentAdvice: InvestmentAdvice,
  goalTracker: GoalTracker,
  cashflowChart: CashflowChart,
};

export const AIPoweredDashboard = () => {
  const navigate = useNavigate();
  const { uiConfig, automationRun, isAnalyzing, refreshAnalysis } = useAIPoweredUI();
  const { stats, getProgressToNextLevel, getActiveStreaks, getActiveChallenges } = useGamification();
  const { transactions } = useWallets();
  const { getActiveGoals } = useGoals();
  const [expandedInsights, setExpandedInsights] = useState(false);
  const [completedActionIds, setCompletedActionIds] = useState<string[]>([]);
  const levelProgress = Math.min(100, Math.round(getProgressToNextLevel()));
  const activeChallenges = getActiveChallenges();
  const featuredReward = activeChallenges.find((challenge) => challenge.category === "saving") || activeChallenges[0];
  const analysisTransactions = getAnalysisTransactions(transactions);
  const foodSpend = analysisTransactions
    .filter((transaction) => transaction.type === "expense" && ["food", "dining", "groceries"].includes(transaction.category.toLowerCase()))
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  const highlightedGoal = getActiveGoals()
    .map((goal) => ({
      title: goal.title,
      progress: goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0,
    }))
    .sort((a, b) => b.progress - a.progress)[0];

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
    .filter(([key, config]) => config.visible && key !== 'gamificationPanel' && key !== 'notificationCenter')
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

  const scrollToElement = (id: string) => {
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const goToDashboardComponent = (componentKey: string) => {
    navigate("/");
    scrollToElement(`dashboard-component-${componentKey}`);
  };

  const toggleActionComplete = (actionId: string) => {
    setCompletedActionIds((current) =>
      current.includes(actionId)
        ? current.filter((id) => id !== actionId)
        : [...current, actionId]
    );
  };

  const nextBestActions = [
    {
      id: "budget-food",
      title: "Review food spending",
      detail: foodSpend > 0
        ? `$${foodSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })} spent in food categories needs a quick check.`
        : "Open the budget view and check dining or grocery trends.",
      cta: "Analyze Budget",
      icon: BarChart3,
      priority: "High",
      action: () => navigate("/?tab=budget"),
    },
    {
      id: "goal-push",
      title: highlightedGoal ? `Push ${highlightedGoal.title}` : "Create one clear goal",
      detail: highlightedGoal
        ? `${highlightedGoal.progress}% complete. One small contribution keeps progress moving.`
        : "Set a concrete savings target so the dashboard can guide your next step.",
      cta: highlightedGoal ? "View Goal" : "Create Goal",
      icon: Target,
      priority: "Medium",
      action: () => navigate("/?tab=goals"),
    },
    {
      id: "ask-ai",
      title: "Ask the AI for one decision",
      detail: "Use Copilot to turn the dashboard into a specific financial decision.",
      cta: "Ask Copilot",
      icon: Sparkles,
      priority: "AI",
      action: () => scrollToElement("planwise-copilot"),
    },
  ];

  const getInsightActions = (insight: string) => {
    const lower = insight.toLowerCase();

    if (lower.includes("invest") || lower.includes("diversif") || lower.includes("portfolio")) {
      return [
        { label: "View Investments", action: () => navigate("/?tab=investments") },
        { label: "Ask Copilot", action: () => scrollToElement("planwise-copilot") },
      ];
    }

    if (lower.includes("goal") || lower.includes("save") || lower.includes("emergency")) {
      return [
        { label: "Create Goal", action: () => navigate("/?tab=goals") },
        { label: "Learn More", action: () => scrollToElement("planwise-copilot") },
      ];
    }

    if (lower.includes("spending") || lower.includes("budget") || lower.includes("expense") || lower.includes("cash flow")) {
      return [
        { label: "Analyze Spending", action: () => goToDashboardComponent("budgetAnalysis") },
        { label: "View Budget", action: () => navigate("/?tab=budget") },
      ];
    }

    return [
      { label: "Ask Copilot", action: () => scrollToElement("planwise-copilot") },
      { label: "View Dashboard", action: () => goToDashboardComponent("financialOverview") },
    ];
  };

  return (
    <div className="space-y-8">
      {/* AI-Powered Hero Section */}
      <div className="rounded-lg border border-border/80 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 py-8 text-center shadow-sm dark:shadow-[0_18px_50px_-30px_hsl(var(--primary)/0.55)]">
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

        <p className="mb-6 text-lg text-foreground/80">
          Your dashboard has been personalized based on your financial profile
        </p>

        {/* Key Insights */}
        {uiConfig.dashboard.keyInsights.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-foreground">Key Insights</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {uiConfig.dashboard.keyInsights.slice(0, expandedInsights ? undefined : 3).map((insight, index) => {
                const actions = getInsightActions(insight);

                return (
                  <Card key={index} className="border-primary/30 bg-card shadow-card dark:border-primary/35">
                    <CardContent className="flex h-full flex-col gap-4 p-4">
                      <p className="text-sm leading-relaxed text-foreground/90">{insight}</p>
                      <div className="mt-auto flex flex-wrap gap-2">
                        {actions.map((action, actionIndex) => (
                          <Button
                            key={action.label}
                            type="button"
                            variant={actionIndex === 0 ? "default" : "outline"}
                            size="sm"
                            onClick={action.action}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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

        <div id="planwise-copilot" className="mx-auto max-w-4xl scroll-mt-28">
          <PlanWiseCopilot />
        </div>

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

      <Card className="border-primary/25 shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Next Best Actions
            </span>
            <Badge variant="secondary">
              {completedActionIds.length}/{nextBestActions.length} done
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 lg:grid-cols-3">
            {nextBestActions.map((item) => {
              const Icon = item.icon;
              const isComplete = completedActionIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`rounded-lg border p-4 transition-all ${
                    isComplete
                      ? "border-emerald-500/30 bg-emerald-500/10"
                      : "border-border/80 bg-muted/25 hover:border-primary/35 hover:bg-primary/5"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-md bg-primary/10 p-2">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                        <Badge variant="outline" className="mt-1 text-[10px]">
                          {item.priority}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => toggleActionComplete(item.id)}
                      aria-label={isComplete ? "Mark action incomplete" : "Mark action complete"}
                    >
                      <CheckCircle2 className={`h-4 w-4 ${isComplete ? "text-emerald-500" : "text-muted-foreground"}`} />
                    </Button>
                  </div>
                  <p className="min-h-10 text-sm leading-relaxed text-foreground/80">{item.detail}</p>
                  <Button type="button" size="sm" className="mt-4 w-full gap-2" onClick={item.action}>
                    {item.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

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

      <Alert className="border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/20">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <span>
              <strong>You exceeded food budget</strong>
              {foodSpend > 0 ? `: $${foodSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })} spent on food categories.` : ': review dining and grocery spending.'}
            </span>
            <span>
              <strong>{highlightedGoal ? `${highlightedGoal.title} ${highlightedGoal.progress}% complete` : 'Goal 60% complete'}</strong>
              {highlightedGoal ? ': keep momentum with one more contribution.' : ': add a goal to track progress.'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate("/?tab=budget")}>
              View Budget
            </Button>
            <Button size="sm" onClick={() => navigate("/?tab=goals")}>
              View Goals
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                Progress
              </span>
              <Badge variant="secondary">Level {stats.level.level}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">Progress to Level {stats.level.level + 1}: {levelProgress}%</span>
                <span className="text-muted-foreground">
                  {stats.level.currentXP} / {stats.level.xpToNext} XP
                </span>
              </div>
              <Progress value={levelProgress} className="h-2" />
              <p className="mt-2 text-xs text-muted-foreground">
                Level {stats.level.level}: {stats.level.title}
              </p>
            </div>
            {featuredReward && (
              <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Reward Challenge
                  </div>
                  <Badge variant="secondary">+{featuredReward.reward.xp} XP</Badge>
                </div>
                <p className="text-sm font-medium">{featuredReward.description}</p>
                <div className="mt-3 space-y-1">
                  <Progress value={(featuredReward.progress / featuredReward.maxProgress) * 100} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{featuredReward.progress} / {featuredReward.maxProgress}</span>
                    <span>{Math.ceil((featuredReward.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left</span>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-md border bg-muted/20 p-3">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Award className="h-3.5 w-3.5" />
                  Earned
                </div>
                <div className="mt-1 font-semibold">
                  {stats.achievements.filter((achievement) => achievement.unlocked).length}
                </div>
              </div>
              <div className="rounded-md border bg-muted/20 p-3">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Flame className="h-3.5 w-3.5" />
                  Streaks
                </div>
                  <div className="mt-1 font-semibold">{getActiveStreaks().length}</div>
              </div>
              <div className="rounded-md border bg-muted/20 p-3">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Target className="h-3.5 w-3.5" />
                  Challenges
                </div>
                  <div className="mt-1 font-semibold">{activeChallenges.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <NotificationCenter variant="summary" enableAgentRefresh={false} />
      </div>

      {/* AI-Prioritized Components */}
      <div className="space-y-8">
        {sortedComponents.map(([componentKey, config]) => {
          const Component = componentMap[componentKey as keyof typeof componentMap];

          if (!Component) return null;

          return (
            <div id={`dashboard-component-${componentKey}`} key={componentKey} className="relative scroll-mt-28">
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
