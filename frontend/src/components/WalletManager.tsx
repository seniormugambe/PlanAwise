import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight,
  Plus,
  Search
} from "lucide-react";
import { AddWalletDialog } from "@/components/AddWalletDialog";
import { useWallets } from "@/hooks/useWallets";
import { useState } from "react";
import { toast } from "sonner";

export const WalletManager = () => {
  const { transactions, addWallet } = useWallets();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredTransactions = transactions.filter(t =>
    (searchTerm === '' || t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
     t.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterType === 'all' || t.type === filterType)
  );

  const handleAddWallet = (walletData: any) => {
    const newWallet = addWallet(walletData);
    toast.success(`${newWallet.name} wallet added successfully!`);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income': return <ArrowDownLeft className="w-4 h-4 text-success" />;
      case 'expense': return <ArrowUpRight className="w-4 h-4 text-expense-red" />;
      case 'transfer': return <ArrowLeftRight className="w-4 h-4 text-primary" />;
      default: return <ArrowUpRight className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardContent className="flex justify-center p-6">
          <div className="w-full sm:w-auto">
            <AddWalletDialog onAddWallet={handleAddWallet} />
          </div>
        </CardContent>
      </Card>

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
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
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
