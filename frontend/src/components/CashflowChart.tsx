import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CreditCard, TrendingUp } from "lucide-react";
import { useWallets } from "@/hooks/useWallets";

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const CashflowChart = () => {
  const { transactions } = useWallets();

  const chartData = useMemo(() => {
    const now = transactions.length > 0
      ? transactions.reduce((latest, tx) => tx.date > latest ? tx.date : latest, transactions[0].date)
      : new Date();
    const rawMonths = Array.from({ length: 6 }).map((_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      return { monthIndex: date.getMonth(), year: date.getFullYear(), label: monthNames[date.getMonth()] };
    });

    return rawMonths.map(({ monthIndex, year, label }) => {
      const monthTransactions = transactions.filter(tx => tx.date.getMonth() === monthIndex && tx.date.getFullYear() === year);
      const income = monthTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
      const expenses = Math.abs(monthTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0));
      const savings = income - expenses;

      return {
        month: label,
        income: Math.round(income),
        expenses: Math.round(expenses),
        savings: Math.round(savings)
      };
    });
  }, [transactions]);

  const topCategories = useMemo(() => {
    if (transactions.length === 0) {
      return [];
    }

    const latestDate = transactions.reduce((latest, tx) => tx.date > latest ? tx.date : latest, transactions[0].date);
    const latestMonthExpenses = transactions.filter((tx) =>
      tx.type === "expense" &&
      tx.date.getMonth() === latestDate.getMonth() &&
      tx.date.getFullYear() === latestDate.getFullYear()
    );
    const sourceExpenses = latestMonthExpenses.length > 0
      ? latestMonthExpenses
      : transactions.filter((tx) => tx.type === "expense");

    const totals = sourceExpenses.reduce<Record<string, number>>((acc, tx) => {
      const category = tx.category || "Other";
      acc[category] = (acc[category] || 0) + Math.abs(tx.amount);
      return acc;
    }, {});

    return Object.entries(totals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions]);

  const topCategoryTotal = topCategories.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Cashflow Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line type="monotone" dataKey="income" stroke="hsl(var(--primary))" strokeWidth={2} name="Income" />
              <Line type="monotone" dataKey="expenses" stroke="hsl(var(--expense-red))" strokeWidth={2} name="Expenses" />
              <Line type="monotone" dataKey="savings" stroke="hsl(var(--success))" strokeWidth={2} name="Savings" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Top Spending Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topCategories.length > 0 ? (
            topCategories.map((item, index) => {
              const percent = topCategoryTotal > 0 ? (item.amount / topCategoryTotal) * 100 : 0;

              return (
                <div key={item.category} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                        {index + 1}
                      </span>
                      <span className="truncate font-medium">{item.category}</span>
                    </div>
                    <span className="font-semibold">${item.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.max(6, percent)}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex h-[250px] items-center justify-center rounded-md border border-dashed bg-muted/20 p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Add expense transactions to see your top spending categories.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
