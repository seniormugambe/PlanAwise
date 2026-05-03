import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp } from "lucide-react";
import { useWallets } from "@/hooks/useWallets";

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const CashflowChart = () => {
  const { transactions } = useWallets();

  const chartData = useMemo(() => {
    const now = new Date();
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

  const barData = chartData.slice(-6);

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
          <CardTitle>Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
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
              <Bar dataKey="income" fill="hsl(var(--primary))" name="Income" />
              <Bar dataKey="expenses" fill="hsl(var(--expense-red))" name="Expenses" />
              <Bar dataKey="savings" fill="hsl(var(--success))" name="Savings" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
