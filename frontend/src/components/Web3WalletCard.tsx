import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Wallet } from "lucide-react";
import { Wallet as WalletType } from '@/types/wallet';
import { toast } from "sonner";

interface Web3WalletCardProps {
  wallet: WalletType;
  isSelected?: boolean;
  onClick?: () => void;
}

export const Web3WalletCard = ({ wallet, isSelected, onClick }: Web3WalletCardProps) => {
  const copyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(wallet.address);
    toast.success('Address copied to clipboard!');
  };

  const openExplorer = (e: React.MouseEvent) => {
    e.stopPropagation();
    const explorers: Record<string, string> = {
      ethereum: 'https://etherscan.io/address/',
      polygon: 'https://polygonscan.com/address/',
      bsc: 'https://bscscan.com/address/',
      arbitrum: 'https://arbiscan.io/address/',
      optimism: 'https://optimistic.etherscan.io/address/',
      base: 'https://basescan.org/address/',
      celo: 'https://celoscan.io/address/',
      avalanche: 'https://snowtrace.io/address/',
      fantom: 'https://ftmscan.com/address/',
      solana: 'https://solscan.io/account/'
    };
    const url = explorers[wallet.type] + wallet.address;
    window.open(url, '_blank');
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary shadow-lg' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${wallet.color} flex items-center justify-center`}>
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{wallet.name}</h3>
              <p className="text-xs text-muted-foreground">{wallet.network}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {wallet.nativeToken}
          </Badge>
        </div>

        <div className="mb-3">
          <div className="text-lg font-bold">
            ${wallet.balance.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            Last updated: {wallet.lastUpdated.toLocaleDateString()}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <code className="text-xs bg-muted px-2 py-1 rounded flex-1 mr-2 truncate">
            {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
          </code>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={copyAddress}
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={openExplorer}
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};