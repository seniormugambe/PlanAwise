import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  Coins,
  Globe,
  TrendingUp, 
  Plus,
  Eye,
  EyeOff,
  MoreHorizontal,
  Copy,
  ExternalLink
} from "lucide-react";
import { useWallets } from "@/hooks/useWallets";
import { Wallet as WalletType } from "@/types/wallet";
import { useState } from "react";
import { toast } from "sonner";

const iconMap = {
  Wallet,
  Coins,
  Globe,
  TrendingUp,
};

const getWalletTypeLabel = (type: WalletType['type']) => {
  const labels = {
    ethereum: 'Ethereum',
    polygon: 'Polygon',
    bsc: 'BSC',
    arbitrum: 'Arbitrum',
    optimism: 'Optimism',
    base: 'Base',
    celo: 'Celo',
    avalanche: 'Avalanche',
    fantom: 'Fantom',
    solana: 'Solana'
  };
  return labels[type];
};

export const WalletOverview = () => {
  const { wallets } = useWallets();
  const [showBalances, setShowBalances] = useState(true);

  if (wallets.length === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-8 text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading wallets...</p>
        </CardContent>
      </Card>
    );
  }

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const totalAssets = wallets.reduce((sum, wallet) => sum + wallet.balance, 0); // Web3 wallets don't have negative balances
  const totalLiabilities = 0; // Web3 wallets don't have liabilities

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard!');
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Wallet Overview
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalances(!showBalances)}
            >
              {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button size="sm" variant="finance">
              <Plus className="w-4 h-4 mr-2" />
              Add Wallet
            </Button>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {showBalances ? `$${totalBalance.toLocaleString()}` : '••••••'}
            </div>
            <div className="text-sm text-muted-foreground">Net Worth</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">
              {showBalances ? `$${totalAssets.toLocaleString()}` : '••••••'}
            </div>
            <div className="text-sm text-muted-foreground">Assets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-expense-red">
              {showBalances ? `$${totalLiabilities.toLocaleString()}` : '••••••'}
            </div>
            <div className="text-sm text-muted-foreground">Liabilities</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {wallets.map((wallet) => {
          const IconComponent = iconMap[wallet.icon as keyof typeof iconMap] || Coins;
          
          return (
            <div key={wallet.id} className="flex items-center justify-between p-4 rounded-lg border bg-gradient-card hover:shadow-card transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${wallet.color}`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{wallet.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {getWalletTypeLabel(wallet.type)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-5 w-5 p-0"
                      onClick={() => copyAddress(wallet.address)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-semibold text-foreground">
                    {showBalances ? 
                      `$${wallet.balance.toLocaleString()}` : 
                      '••••••'
                    }
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {wallet.nativeToken}
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};