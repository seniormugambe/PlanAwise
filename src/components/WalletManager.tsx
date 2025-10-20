import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight,
  Plus,
  Search,
  Filter,
  Calendar,
  Wallet,
  Copy,
  ExternalLink
} from "lucide-react";
import { AddWalletDialog } from "@/components/AddWalletDialog";
import { NetworkSwitcher } from "@/components/NetworkSwitcher";
import { useWallets } from "@/hooks/useWallets";
import { useWeb3Wallets } from "@/hooks/useWeb3Wallets";
import React, { useState } from "react";
import { toast } from "sonner";

export const WalletManager = () => {
  const { wallets, transactions, addWallet, getWalletTransactions } = useWallets();
  const { isConnected, refreshBalance } = useWeb3Wallets();
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Set the first wallet as selected when wallets are loaded
  React.useEffect(() => {
    if (wallets.length > 0 && !selectedWallet) {
      setSelectedWallet(wallets[0]);
    }
  }, [wallets, selectedWallet]);

  const walletTransactions = selectedWallet ? getWalletTransactions(selectedWallet.id).filter(t => 
    (searchTerm === '' || t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
     t.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterType === 'all' || t.type === filterType)
  ) : [];

  const handleAddWallet = (walletData: any) => {
    const newWallet = addWallet(walletData);
    toast.success(`${newWallet.name} wallet added successfully!`);
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard!');
  };

  const getExplorerUrl = (wallet: any) => {
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
    return explorers[wallet.type] + wallet.address;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income': return <ArrowDownLeft className="w-4 h-4 text-success" />;
      case 'expense': return <ArrowUpRight className="w-4 h-4 text-expense-red" />;
      case 'transfer': return <ArrowLeftRight className="w-4 h-4 text-primary" />;
      default: return <ArrowUpRight className="w-4 h-4" />;
    }
  };

  if (wallets.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading wallets...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Network Switcher */}
      {isConnected && (
        <NetworkSwitcher />
      )}

      {/* Wallet Selector */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Wallet Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-4">
            {wallets.map((wallet) => (
              <Button
                key={wallet.id}
                variant={selectedWallet?.id === wallet.id ? "default" : "outline"}
                className="h-auto p-3 flex flex-col items-center gap-2"
                onClick={() => setSelectedWallet(wallet)}
              >
                <div className={`w-8 h-8 rounded-lg ${wallet.color} flex items-center justify-center`}>
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium truncate max-w-20">{wallet.name}</div>
                  <div className="text-xs text-muted-foreground">
                    ${wallet.balance.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {wallet.nativeToken}
                  </div>
                </div>
              </Button>
            ))}
          </div>
          <div className="flex justify-center">
            <AddWalletDialog onAddWallet={handleAddWallet} />
          </div>
        </CardContent>
      </Card>

      {/* Selected Wallet Details */}
      {selectedWallet && (
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${selectedWallet.color}`}>
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedWallet.name}</h3>
                  <p className="text-muted-foreground">
                    {selectedWallet.network} • Chain ID: {selectedWallet.chainId}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {selectedWallet.address.slice(0, 6)}...{selectedWallet.address.slice(-4)}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => copyAddress(selectedWallet.address)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => window.open(getExplorerUrl(selectedWallet), '_blank')}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  ${selectedWallet.balance.toLocaleString()}
                </div>
                <Badge variant="secondary" className="capitalize">
                  {selectedWallet.nativeToken}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Transaction Management */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transactions</CardTitle>
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="finance">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Transaction
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Transaction</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input id="amount" type="number" placeholder="0.00" />
                      </div>
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                            <SelectItem value="transfer">Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input id="category" placeholder="e.g., Groceries, Salary" />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input id="description" placeholder="Transaction description" />
                    </div>
                    <Button className="w-full">Add Transaction</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {walletTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found
              </div>
            ) : (
              walletTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border bg-gradient-card">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.category} • {transaction.date.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className={`font-semibold ${
                    transaction.amount > 0 ? 'text-success' : 'text-expense-red'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};