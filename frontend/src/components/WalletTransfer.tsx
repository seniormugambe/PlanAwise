import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeftRight, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useWallets } from '@/hooks/useWallets';

export const WalletTransfer = () => {
  const { wallets, transferBetweenWallets } = useWallets();
  const [fromWallet, setFromWallet] = useState<string>('');
  const [toWallet, setToWallet] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const availableWallets = wallets.filter(w => w.isActive);
  const fromWalletData = availableWallets.find(w => w.id === fromWallet);
  const toWalletData = availableWallets.find(w => w.id === toWallet);

  const handleTransfer = async () => {
    if (!fromWallet || !toWallet || !amount || fromWallet === toWallet) {
      return;
    }

    setIsProcessing(true);

    try {
      transferBetweenWallets(fromWallet, toWallet, Number(amount), description || 'Wallet Transfer');
      alert('Transfer completed successfully!');
      setFromWallet('');
      setToWallet('');
      setAmount('');
      setDescription('');
    } catch (error: any) {
      console.error('Transfer error:', error);
      alert(error?.message || 'Unable to complete transfer.');
    } finally {
      setIsProcessing(false);
    }
  };

  const canTransfer = fromWallet && toWallet && amount && 
                     fromWallet !== toWallet && 
                     parseFloat(amount) > 0 &&
                     fromWalletData && 
                     parseFloat(amount) <= fromWalletData.balance;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-primary" />
          Transfer Between Wallets
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* From Wallet */}
        <div className="space-y-2">
          <Label htmlFor="from-wallet">From Wallet</Label>
          <Select value={fromWallet} onValueChange={setFromWallet}>
            <SelectTrigger>
              <SelectValue placeholder="Select source wallet" />
            </SelectTrigger>
            <SelectContent>
              {availableWallets.map((wallet) => (
                <SelectItem key={wallet.id} value={wallet.id}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${wallet.color}`} />
                    <span>{wallet.name}</span>
                    <span className="text-muted-foreground">
                      (${wallet.balance.toLocaleString()})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fromWalletData && (
            <div className="text-sm text-muted-foreground">
              Available balance: ${fromWalletData.balance.toLocaleString()}
            </div>
          )}
        </div>

        {/* Transfer Direction Indicator */}
        <div className="flex justify-center">
          <div className="p-2 rounded-full bg-primary/10">
            <ArrowRight className="w-4 h-4 text-primary" />
          </div>
        </div>

        {/* To Wallet */}
        <div className="space-y-2">
          <Label htmlFor="to-wallet">To Wallet</Label>
          <Select value={toWallet} onValueChange={setToWallet}>
            <SelectTrigger>
              <SelectValue placeholder="Select destination wallet" />
            </SelectTrigger>
            <SelectContent>
              {availableWallets
                .filter(w => w.id !== fromWallet)
                .map((wallet) => (
                <SelectItem key={wallet.id} value={wallet.id}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${wallet.color}`} />
                    <span>{wallet.name}</span>
                    <span className="text-muted-foreground">
                      (${wallet.balance.toLocaleString()})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-8"
              min="0"
              step="0.01"
            />
          </div>
          {fromWalletData && amount && parseFloat(amount) > fromWalletData.balance && (
            <div className="text-sm text-expense-red">
              Insufficient funds. Available: ${fromWalletData.balance.toLocaleString()}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Add a note for this transfer..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* Transfer Summary */}
        {fromWalletData && toWalletData && amount && (
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <h4 className="font-medium">Transfer Summary</h4>
            <div className="flex justify-between text-sm">
              <span>From:</span>
              <span>{fromWalletData.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>To:</span>
              <span>{toWalletData.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Amount:</span>
              <span className="font-medium">${parseFloat(amount).toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-sm">
                <span>New balance ({fromWalletData.name}):</span>
                <span>${(fromWalletData.balance - parseFloat(amount)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>New balance ({toWalletData.name}):</span>
                <span>${(toWalletData.balance + parseFloat(amount)).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Button */}
        <Button 
          className="w-full" 
          onClick={handleTransfer}
          disabled={!canTransfer || isProcessing}
          variant="finance"
        >
          {isProcessing ? (
            <>
              <ArrowLeftRight className="w-4 h-4 mr-2 animate-pulse" />
              Processing Transfer...
            </>
          ) : (
            <>
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Transfer ${amount || '0.00'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};