import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Send } from "lucide-react";
import { useState } from "react";
import { useWallets } from '@/hooks/useWallets';
import { Wallet } from '@/types/wallet';

export const PaymentTransfer = () => {
  const { wallets, transferBetweenWallets } = useWallets();
  const [fromWallet, setFromWallet] = useState<string>('');
  const [toWallet, setToWallet] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transferType, setTransferType] = useState<'bank' | 'atm' | 'mobile'>('bank');

  const availableWallets = wallets.filter(w => {
    if (transferType === 'bank') return w.type === 'bank' && w.isActive;
    if (transferType === 'atm') return w.type === 'atm_card' && w.isActive;
    if (transferType === 'mobile') return w.type === 'mobile_money' && w.isActive;
    return false;
  });

  const fromWalletData = availableWallets.find(w => w.id === fromWallet);
  const toWalletData = availableWallets.find(w => w.id === toWallet);

  const handleTransfer = async () => {
    if (!fromWallet || !toWallet || !amount || fromWallet === toWallet) {
      return;
    }

    setIsProcessing(true);

    try {
      transferBetweenWallets(fromWallet, toWallet, Number(amount), description || 'Payment Transfer');
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

  const getWalletDisplay = (wallet: Wallet) => {
    if (wallet.type === 'bank') {
      return `${wallet.name} (${wallet.bankName}) - ${wallet.accountNumber}`;
    } else if (wallet.type === 'atm_card') {
      return `${wallet.name} (${wallet.network}) - ${wallet.cardNumber}`;
    } else if (wallet.type === 'mobile_money') {
      return `${wallet.name} (${wallet.mobileProvider}) - ${wallet.phoneNumber}`;
    }
    return wallet.name;
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          Payment Transfer
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Transfer Type Selection */}
        <div>
          <Label htmlFor="transfer-type">Payment Method Type</Label>
          <Select value={transferType} onValueChange={(v: any) => {
            setTransferType(v);
            setFromWallet('');
            setToWallet('');
          }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank">Bank Accounts</SelectItem>
              <SelectItem value="atm">ATM/Debit Cards</SelectItem>
              <SelectItem value="mobile">Mobile Money</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {availableWallets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No {transferType === 'bank' ? 'bank accounts' : transferType === 'atm' ? 'debit cards' : 'mobile money accounts'} available.</p>
            <p className="text-sm">Add one using the "Add Payment Method" button.</p>
          </div>
        ) : (
          <>
            {/* From Wallet */}
            <div className="space-y-2">
              <Label htmlFor="from-wallet">From</Label>
              <Select value={fromWallet} onValueChange={setFromWallet}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source account" />
                </SelectTrigger>
                <SelectContent>
                  {availableWallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${wallet.color}`} />
                        <span>{getWalletDisplay(wallet)}</span>
                        <span className="text-muted-foreground">
                          ({wallet.currency} {wallet.balance.toLocaleString()})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fromWalletData && (
                <div className="text-sm text-muted-foreground">
                  Available balance: {fromWalletData.currency} {fromWalletData.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              <Label htmlFor="to-wallet">To</Label>
              <Select value={toWallet} onValueChange={setToWallet}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination account" />
                </SelectTrigger>
                <SelectContent>
                  {availableWallets.filter(w => w.id !== fromWallet).map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${wallet.color}`} />
                        <span>{getWalletDisplay(wallet)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="flex gap-2">
                <span className="inline-flex items-center px-3 bg-muted text-muted-foreground rounded-md text-sm">
                  {fromWalletData?.currency || 'USD'}
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Payment for invoice #123"
                rows={3}
              />
            </div>

            {/* Transfer Summary */}
            {amount && fromWalletData && toWalletData && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-semibold">Transfer Summary</h4>
                <div className="flex justify-between text-sm">
                  <span>From:</span>
                  <span className="font-medium">{getWalletDisplay(fromWalletData)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>To:</span>
                  <span className="font-medium">{getWalletDisplay(toWalletData)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span>Amount:</span>
                  <span>{fromWalletData.currency} {parseFloat(amount).toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Transfer Button */}
            <Button 
              onClick={handleTransfer}
              disabled={!canTransfer || isProcessing}
              className="w-full gap-2"
              size="lg"
            >
              <Send className="w-4 h-4" />
              {isProcessing ? 'Processing...' : 'Complete Transfer'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
