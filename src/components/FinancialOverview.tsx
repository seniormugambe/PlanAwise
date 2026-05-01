import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";
import { useWallets } from "@/hooks/useWallets";
import { useGoals } from "@/hooks/useGoals";

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
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
      monthlySavingsChange: previousSavings ? `${monthlySavings - previousSavings >= 0 ? '+' : ''}${Math.round(((monthlySavings - previousSavings) / Math.max(Math.abs(previousSavings), 1)) * 100)}%` : '+0%',
      monthlyExpensesChange: previous.expenses ? `${current.expenses - previous.expenses >= 0 ? '+' : ''}${Math.round(((current.expenses - previous.expenses) / Math.max(previous.expenses, 1)) * 100)}%` : '+0%',
      monthlySavingsTrend: monthlySavings >= previousSavings ? 'up' : 'down',
      monthlyExpensesTrend: current.expenses <= previous.expenses ? 'up' : 'down',
    };
  }, [transactions]);

  const financialData = [
    {
      title: 'Total Balance',
      amount: formatAmount(summary.totalBalance),
      change: formatAmount(summary.monthlyChange),
      trend: summary.monthlyChange >= 0 ? 'up' : 'down',
      icon: DollarSign,
      color: 'text-primary'
    },
    {
      title: 'Monthly Savings',
      amount: formatAmount(cashflow.monthlySavings),
      change: cashflow.monthlySavingsChange,
      trend: cashflow.monthlySavingsTrend,
      icon: TrendingUp,
      color: 'text-success'
    },
    {
      title: 'Monthly Expenses',
      amount: formatAmount(cashflow.monthlyExpenses),
      change: cashflow.monthlyExpensesChange,
      trend: cashflow.monthlyExpensesTrend,
      icon: TrendingDown,
      color: 'text-expense-red'
    },
    {
      title: 'Goals Progress',
      amount: `${Math.round(goalSummary.overallProgress)}%`,
      change: `${Math.round(goalSummary.overallProgress)}%`,
      trend: 'up',
      icon: Target,
      color: 'text-accent'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <TrendIcon className={`h-3 w-3 mr-1 ${item.trend === 'up' ? 'text-success' : 'text-expense-red'}`} />
                <span className={item.trend === 'up' ? 'text-success' : 'text-expense-red'}>
                  {item.change}
                </span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
