import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  BarChart3,
  PieChart as PieChartIcon
} from "lucide-react";
import { useWallets } from '@/hooks/useWallets';

export const WalletAnalytics = () => {
  const { wallets } = useWallets();

  const totalBalance = wallets.reduce((sum, wallet) => sum + Math.abs(wallet.balance), 0);

  const walletDistribution = wallets.map(wallet => ({
    name: wallet.name,
    value: Math.abs(wallet.balance),
    percentage: totalBalance > 0 ? (Math.abs(wallet.balance) / totalBalance) * 100 : 0,
    color: wallet.color.replace('bg-', ''),
    type: wallet.type,
    isPositive: wallet.balance >= 0
  }));

  const categoryTotals = {
    checking: wallets
      .filter(wallet => ['ethereum', 'polygon', 'optimism'].includes(wallet.type))
      .reduce((sum, wallet) => sum + wallet.balance, 0),
    savings: wallets
      .filter(wallet => ['base', 'celo', 'avalanche'].includes(wallet.type))
      .reduce((sum, wallet) => sum + wallet.balance, 0),
    investment: wallets
      .filter(wallet => ['arbitrum', 'solana', 'bsc'].includes(wallet.type))
      .reduce((sum, wallet) => sum + wallet.balance, 0),
    credit: wallets
      .filter(wallet => wallet.balance < 0)
      .reduce((sum, wallet) => sum + wallet.balance, 0)
  };

  const monthlyTrends = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => ({
    month,
    checking: Math.max(0, categoryTotals.checking * (0.82 + index * 0.03)),
    savings: Math.max(0, categoryTotals.savings * (0.82 + index * 0.03)),
    investment: Math.max(0, categoryTotals.investment * (0.82 + index * 0.03)),
    credit: Math.min(0, categoryTotals.credit * (0.82 + index * 0.03))
  }));

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  const walletGrowth = wallets.map(wallet => {
    const previousBalance = wallet.balance * 0.9;
    const growth = calculateGrowth(wallet.balance, previousBalance);

    return {
      ...wallet,
      growth,
      previousBalance
    };
  });

  const assetTypes = wallets.reduce((acc, wallet) => {
    if (wallet.balance > 0) {
      const existing = acc.find(item => item.type === wallet.type);
      if (existing) {
        existing.value += wallet.balance;
      } else {
        acc.push({
          type: wallet.type,
          value: wallet.balance,
          color: wallet.color
        });
      }
    }
    return acc;
  }, [] as Array<{type: string, value: number, color: string}>);

  const avgGrowth = walletGrowth.length
    ? walletGrowth.reduce((sum, wallet) => sum + wallet.growth, 0) / walletGrowth.length
    : 0;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Total Assets</span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  ${wallets.filter(w => w.balance > 0).reduce((sum, w) => sum + w.balance, 0).toLocaleString()}
                  <TrendingDown className="w-4 h-4 text-expense-red" />
                  <span className="text-sm text-muted-foreground">Total Liabilities</span>
                </div>
                <div className="text-2xl font-bold text-expense-red">
                  ${Math.abs(wallets.filter(w => w.balance < 0).reduce((sum, w) => sum + w.balance, 0)).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm text-muted-foreground">Net Worth</span>
                </div>
                <div className="text-2xl font-bold text-success">
                  ${wallets.reduce((sum, w) => sum + w.balance, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-accent" />
                  <span className="text-sm text-muted-foreground">Avg Growth</span>
                </div>
                <div className="text-2xl font-bold text-accent">
                  {avgGrowth.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Wallet Performance */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Wallet Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {walletGrowth.map((wallet) => (
                  <div key={wallet.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded ${wallet.color}`} />
                      <div>
                        <div className="font-medium">{wallet.name}</div>
                        <div className="text-sm text-muted-foreground">{wallet.type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${wallet.balance.toLocaleString()}</div>
                      <div className={`text-sm flex items-center gap-1 ${
                        wallet.growth >= 0 ? 'text-success' : 'text-expense-red'
                      }`}>
                        {wallet.growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(wallet.growth).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wallet Distribution Pie Chart */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-primary" />
                  Wallet Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={walletDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                    >
                      {walletDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Balance']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Asset Allocation */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {assetTypes.map((asset, index) => {
                  const percentage = (asset.value / assetTypes.reduce((sum, a) => sum + a.value, 0)) * 100;
                  return (
                    <div key={asset.type} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="capitalize font-medium">{asset.type}</span>
                        <span>${asset.value.toLocaleString()}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <div className="text-sm text-muted-foreground text-right">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Balance Trends (6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyTrends}>
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
                  <Line type="monotone" dataKey="checking" stroke="#3b82f6" strokeWidth={2} name="Checking" />
                  <Line type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={2} name="Savings" />
                  <Line type="monotone" dataKey="investment" stroke="#8b5cf6" strokeWidth={2} name="Investment" />
                  <Line type="monotone" dataKey="credit" stroke="#ef4444" strokeWidth={2} name="Credit" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Monthly Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyTrends}>
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
                  <Bar dataKey="checking" fill="#3b82f6" name="Checking" />
                  <Bar dataKey="savings" fill="#10b981" name="Savings" />
                  <Bar dataKey="investment" fill="#8b5cf6" name="Investment" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};