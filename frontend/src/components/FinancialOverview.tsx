import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Target, PiggyBank, CreditCard } from "lucide-react";
import { useWallets } from "@/hooks/useWallets";
import { useGoals } from "@/hooks/useGoals";

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const formatAmount = (value: number) => currencyFormatter.format(value);

export const FinancialOverview = () => {
  const { transactions, getWalletSummary } = useWallets();
  const { getGoalSummary } = useGoals();

  const summary = getWalletSummary();
  const goalSummary = getGoalSummary();

  const cashflow = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonthDate = new Date(now);
    previousMonthDate.setMonth(now.getMonth() - 1);
    const previousMonth = previousMonthDate.getMonth();
    const previousYear = previousMonthDate.getFullYear();

    const currentTransactions = transactions.filter(tx => tx.date.getMonth() === currentMonth && tx.date.getFullYear() === currentYear);
    const previousTransactions = transactions.filter(tx => tx.date.getMonth() === previousMonth && tx.date.getFullYear() === previousYear);

    const sumValues = (items: typeof transactions) => ({
      income: items.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0),
      expenses: Math.abs(items.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0)),
    });

    const current = sumValues(currentTransactions);
    const previous = sumValues(previousTransactions);
    const monthlySavings = current.income - current.expenses;
    const previousSavings = previous.income - previous.expenses;

    return {
      monthlySavings,
      monthlyExpenses: current.expenses,
      monthlySavingsChange: previousSavings ? ((monthlySavings - previousSavings) / Math.max(Math.abs(previousSavings), 1)) * 100 : 0,
      monthlyExpensesChange: previous.expenses ? ((current.expenses - previous.expenses) / Math.max(previous.expenses, 1)) * 100 : 0,
      monthlySavingsTrend: monthlySavings >= previousSavings ? 'up' : 'down',
      monthlyExpensesTrend: current.expenses <= previous.expenses ? 'up' : 'down',
    };
  }, [transactions]);

  const financialData = [
    {
      title: 'Total Balance',
      amount: formatAmount(summary.totalBalance),
      change: summary.monthlyChange,
      changeType: 'currency',
      trend: summary.monthlyChange >= 0 ? 'up' : 'down',
      icon: DollarSign,
      color: 'text-primary',
      description: 'Current balance across all accounts'
    },
    {
      title: 'Monthly Savings',
      amount: formatAmount(cashflow.monthlySavings),
      change: cashflow.monthlySavingsChange,
      changeType: 'percentage',
      trend: cashflow.monthlySavingsTrend,
      icon: PiggyBank,
      color: 'text-green-600',
      description: 'Income minus expenses this month'
    },
    {
      title: 'Monthly Expenses',
      amount: formatAmount(cashflow.monthlyExpenses),
      change: cashflow.monthlyExpensesChange,
      changeType: 'percentage',
      trend: cashflow.monthlyExpensesTrend,
      icon: CreditCard,
      color: 'text-red-600',
      description: 'Total spending this month'
    },
    {
      title: 'Goals Progress',
      amount: `${Math.round(goalSummary.overallProgress)}%`,
      change: goalSummary.totalGoals > 0 ? `${goalSummary.completedGoals}/${goalSummary.totalGoals} completed` : 'No goals set',
      changeType: 'text',
      trend: 'up',
      icon: Target,
      color: 'text-accent',
      description: 'Overall progress on financial goals'
    }
  ];

  const formatChange = (change: number | string, type: string) => {
    if (type === 'currency') {
      return formatAmount(change as number);
    } else if (type === 'percentage') {
      const percent = change as number;
      return `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`;
    } else {
      return change as string;
    }
  };

  return (
    <div className="space-y-6">
      {/* Mobile: Single column with larger cards */}
      <div className="md:hidden space-y-4">
        {financialData.map((item, index) => {
          const Icon = item.icon;
          const TrendIcon = item.trend === 'up' ? TrendingUp : TrendingDown;

          return (
            <Card key={index} className="bg-gradient-to-br from-card to-card/50 border shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-primary/10`}>
                      <Icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  {item.changeType !== 'text' && (
                    <Badge variant={item.trend === 'up' ? 'default' : 'destructive'} className="text-xs">
                      <TrendIcon className="h-3 w-3 mr-1" />
                      {formatChange(item.change, item.changeType)}
                    </Badge>
                  )}
                </div>

                <div className="text-2xl font-bold mb-1">{item.amount}</div>

                {item.changeType === 'text' && (
                  <div className="text-xs text-muted-foreground">
                    {item.change}
                  </div>
                )}

                {item.changeType !== 'text' && (
                  <div className="text-xs text-muted-foreground">
                    vs last month
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {financialData.map((item, index) => {
          const Icon = item.icon;
          const TrendIcon = item.trend === 'up' ? TrendingUp : TrendingDown;

          return (
            <Card key={index} className="bg-gradient-card shadow-card hover:shadow-finance transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${item.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.amount}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <TrendIcon className={`h-3 w-3 mr-1 ${item.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={item.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {formatChange(item.change, item.changeType)}
                  </span>
                  <span className="ml-1">
                    {item.changeType === 'text' ? '' : 'from last month'}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
