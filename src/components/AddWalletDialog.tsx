import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Wallet } from "lucide-react";
import { Wallet as WalletType } from '@/types/wallet';

interface AddWalletDialogProps {
  onAddWallet: (wallet: Omit<WalletType, 'id' | 'lastUpdated'>) => void;
}

const networkConfigs = {
  ethereum: { name: 'Ethereum Mainnet', chainId: 1, nativeToken: 'ETH', color: 'bg-indigo-500' },
  polygon: { name: 'Polygon', chainId: 137, nativeToken: 'MATIC', color: 'bg-purple-500' },
  bsc: { name: 'BNB Smart Chain', chainId: 56, nativeToken: 'BNB', color: 'bg-yellow-600' },
  arbitrum: { name: 'Arbitrum One', chainId: 42161, nativeToken: 'ETH', color: 'bg-blue-400' },
  optimism: { name: 'Optimism', chainId: 10, nativeToken: 'ETH', color: 'bg-red-500' },
  base: { name: 'Base', chainId: 8453, nativeToken: 'ETH', color: 'bg-blue-600' },
  celo: { name: 'Celo', chainId: 42220, nativeToken: 'CELO', color: 'bg-yellow-500' },
  avalanche: { name: 'Avalanche C-Chain', chainId: 43114, nativeToken: 'AVAX', color: 'bg-red-600' },
  fantom: { name: 'Fantom Opera', chainId: 250, nativeToken: 'FTM', color: 'bg-blue-700' },
  solana: { name: 'Solana', nativeToken: 'SOL', color: 'bg-gradient-to-r from-purple-400 to-pink-400' }
};

export const AddWalletDialog = ({ onAddWallet }: AddWalletDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '' as keyof typeof networkConfigs,
    address: '',
    balance: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.address) {
      return;
    }

    const config = networkConfigs[formData.type];
    
    const newWallet: Omit<WalletType, 'id' | 'lastUpdated'> = {
      name: formData.name,
      type: formData.type,
      balance: formData.balance,
      currency: 'USD',
      color: config.color,
      icon: 'Coins',
      isActive: true,
      network: config.name,
      address: formData.address,
      chainId: config.chainId,
      nativeToken: config.nativeToken
    };

    onAddWallet(newWallet);
    setFormData({ name: '', type: '' as keyof typeof networkConfigs, address: '', balance: 0 });
    setOpen(false);
  };

  const generateRandomAddress = () => {
    if (formData.type === 'solana') {
      // Generate Solana-style address
      const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789';
      let result = '';
      for (let i = 0; i < 44; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setFormData(prev => ({ ...prev, address: result }));
    } else {
      // Generate Ethereum-style address
      const hex = '0123456789abcdef';
      let result = '0x';
      for (let i = 0; i < 40; i++) {
        result += hex.charAt(Math.floor(Math.random() * hex.length));
      }
      setFormData(prev => ({ ...prev, address: result }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="finance" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Add New Web3 Wallet
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Wallet Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., My Trading Wallet"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="network">Network</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: keyof typeof networkConfigs) => 
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(networkConfigs).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${config.color}`} />
                      {config.name} ({config.nativeToken})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="address">Wallet Address</Label>
            <div className="flex gap-2">
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder={formData.type === 'solana' ? 'Solana address...' : '0x...'}
                required
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={generateRandomAddress}
                disabled={!formData.type}
              >
                Generate
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="balance">Initial Balance (USD)</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              min="0"
              value={formData.balance}
              onChange={(e) => setFormData(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Wallet
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};