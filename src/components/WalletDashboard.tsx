import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft,
  Plus,
  Eye,
  EyeOff,
  Coins,
  Globe
} from "lucide-react";
import { useWallets } from "@/hooks/useWallets";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const iconMap = {
  Wallet,
  Coins,
  Globe,
  TrendingUp,
};

export const WalletDashboard = () => {
  const { wallets, transactions, getWalletSummary } = useWallets();
  const [showBalances, setShowBalances] = useState(true);
  const navigate = useNavigate();
  
  // Show loading state if wallets haven't loaded yet
  if (wallets.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="wallet-card animate-fade-in">
          <CardContent className="p-8 text-center">
            <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground">Loading wallet data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const summary = getWalletSummary();
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getWalletName = (walletId: string) => {
    return wallets.find(w => w.id === walletId)?.name || 'Unknown Wallet';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="wallet-card animate-fade-in">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Worth</p>
                <p className="text-2xl font-bold text-gradient-primary">
                  {showBalances ? `$${summary.netWorth.toLocaleString()}` : '••••••'}
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg pulse-glow">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="wallet-card animate-fade-in status-positive">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assets</p>
                <p className="text-2xl font-bold text-gradient-success">
                  {showBalances ? `$${summary.totalAssets.toLocaleString()}` : '••••••'}
                </p>
              </div>
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="wallet-card animate-fade-in status-negative">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Liabilities</p>
                <p className="text-2xl font-bold text-expense-red">
                  {showBalances ? `$${summary.totalLiabilities.toLocaleString()}` : '••••••'}
                </p>
              </div>
              <div className="p-2 bg-expense-red/10 rounded-lg">
                <TrendingDown className="w-5 h-5 text-expense-red" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="wallet-card animate-fade-in status-neutral">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Change</p>
                <p className="text-2xl font-bold text-gradient-success">
                  {showBalances ? `+$${summary.monthlyChange.toLocaleString()}` : '••••••'}
                </p>
              </div>
              <div className="p-2 bg-success/10 rounded-lg">
                <ArrowUpRight className="w-5 h-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wallet Overview */}
        <Card className="wallet-card card-elevated animate-slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-gradient-primary">
                <Wallet className="w-5 h-5 text-primary" />
                My Wallets
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalances(!showBalances)}
                  className="hover:bg-accent/50 transition-all duration-300"
                >
                  {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button size="sm" onClick={() => navigate('/wallets')} className="btn-glow">
                  View All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {wallets.slice(0, 4).map((wallet, index) => {
              const IconComponent = iconMap[wallet.icon as keyof typeof iconMap] || Wallet;
              // Web3 wallets don't have negative balances
              
              return (
                <div 
                  key={wallet.id} 
                  className="wallet-card card-interactive p-3 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${wallet.color} transition-all duration-300 hover:scale-110`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-balance">{wallet.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {wallet.network} • {wallet.nativeToken}
                      </div>
                    </div>
                    <div className={`font-semibold transition-colors duration-300 ${
                      isNegative ? 'text-expense-red' : 'text-foreground'
                    }`}>
                      {showBalances ? 
                        `${isNegative ? '-' : ''}$${Math.abs(wallet.balance).toLocaleString()}` : 
                        '••••••'
                      }
                    </div>
                  </div>
                </div>
              );
            })}
            {wallets.length > 4 && (
              <Button 
                variant="outline" 
                className="w-full mt-3 btn-glow hover:shadow-finance transition-all duration-300"
                onClick={() => navigate('/wallets')}
              >
                View {wallets.length - 4} More Wallets
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="wallet-card card-elevated animate-slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gradient-primary">Recent Transactions</CardTitle>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => navigate('/wallets?tab=manage')}
                className="btn-glow hover:shadow-finance transition-all duration-300"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTransactions.map((transaction, index) => (
              <div 
                key={transaction.id} 
                className="wallet-card card-interactive p-3 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                    transaction.type === 'income' ? 'bg-success/10' :
                    transaction.type === 'expense' ? 'bg-expense-red/10' :
                    'bg-primary/10'
                  }`}>
                    {transaction.type === 'income' ? (
                      <ArrowDownLeft className="w-4 h-4 text-success" />
                    ) : transaction.type === 'expense' ? (
                      <ArrowUpRight className="w-4 h-4 text-expense-red" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-balance">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground text-pretty">
                      {getWalletName(transaction.walletId)} • {transaction.date.toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`font-semibold transition-colors duration-300 ${
                    transaction.amount > 0 ? 'text-success' : 'text-expense-red'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground animate-fade-in">
                <div className="pattern-dots opacity-20 w-16 h-16 mx-auto mb-4 rounded-full"></div>
                No recent transactions
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};