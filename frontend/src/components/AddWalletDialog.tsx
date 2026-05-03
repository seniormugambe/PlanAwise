import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Wallet, Building2, CreditCard, Smartphone } from "lucide-react";
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

const bankConfigs = {
  bank: { name: 'Bank Account', color: 'bg-green-600', icon: 'Building2' },
  atm_card: { name: 'ATM/Debit Card', color: 'bg-blue-700', icon: 'CreditCard' },
  mobile_money: { name: 'Mobile Money', color: 'bg-teal-600', icon: 'Smartphone' }
};

const mobileProviders = [
  'M-Pesa',
  'GCash',
  'Airtel Money',
  'Vodafone M-Pesa',
  'Orange Money',
  'JioMoney',
  'PayTM',
  'PhonePe',
  'Google Pay',
  'Other'
];

export const AddWalletDialog = ({ onAddWallet }: AddWalletDialogProps) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('web3');
  
  // Web3 form state
  const [web3Form, setWeb3Form] = useState({
    name: '',
    type: '' as keyof typeof networkConfigs,
    address: '',
    balance: 0
  });

  // Bank form state
  const [bankForm, setBankForm] = useState({
    name: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    routingNumber: '',
    balance: 0,
    currency: 'USD'
  });

  // ATM Card form state
  const [atmForm, setAtmForm] = useState({
    name: '',
    cardNumber: '',
    cardExpiry: '',
    bankName: '',
    accountHolder: '',
    balance: 0,
    network: 'Visa',
    currency: 'USD'
  });

  // Mobile Money form state
  const [mobileForm, setMobileForm] = useState({
    name: '',
    phoneNumber: '',
    mobileProvider: '',
    accountHolder: '',
    balance: 0,
    currency: 'USD'
  });

  const handleWeb3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!web3Form.name || !web3Form.type || !web3Form.address) return;

    const config = networkConfigs[web3Form.type];
    const newWallet: Omit<WalletType, 'id' | 'lastUpdated'> = {
      name: web3Form.name,
      type: web3Form.type,
      balance: web3Form.balance,
      currency: 'USD',
      color: config.color,
      icon: 'Coins',
      isActive: true,
      network: config.name,
      address: web3Form.address,
      chainId: config.chainId,
      nativeToken: config.nativeToken
    };

    onAddWallet(newWallet);
    setWeb3Form({ name: '', type: '' as keyof typeof networkConfigs, address: '', balance: 0 });
    setOpen(false);
  };

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankForm.name || !bankForm.bankName || !bankForm.accountNumber) return;

    const newWallet: Omit<WalletType, 'id' | 'lastUpdated'> = {
      name: bankForm.name,
      type: 'bank',
      balance: bankForm.balance,
      currency: bankForm.currency,
      color: 'bg-green-600',
      icon: 'Building2',
      isActive: true,
      network: 'Bank Account',
      address: `BANK-${Date.now()}`,
      bankName: bankForm.bankName,
      accountNumber: bankForm.accountNumber,
      accountHolder: bankForm.accountHolder,
      routingNumber: bankForm.routingNumber
    };

    onAddWallet(newWallet);
    setBankForm({ name: '', bankName: '', accountNumber: '', accountHolder: '', routingNumber: '', balance: 0, currency: 'USD' });
    setOpen(false);
  };

  const handleAtmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!atmForm.name || !atmForm.cardNumber) return;

    const newWallet: Omit<WalletType, 'id' | 'lastUpdated'> = {
      name: atmForm.name,
      type: 'atm_card',
      balance: atmForm.balance,
      currency: atmForm.currency,
      color: 'bg-blue-700',
      icon: 'CreditCard',
      isActive: true,
      network: atmForm.network,
      address: `CARD-${Date.now()}`,
      cardNumber: atmForm.cardNumber,
      cardExpiry: atmForm.cardExpiry,
      bankName: atmForm.bankName,
      accountHolder: atmForm.accountHolder
    };

    onAddWallet(newWallet);
    setAtmForm({ name: '', cardNumber: '', cardExpiry: '', bankName: '', accountHolder: '', balance: 0, network: 'Visa', currency: 'USD' });
    setOpen(false);
  };

  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileForm.name || !mobileForm.phoneNumber || !mobileForm.mobileProvider) return;

    const providerConfig = mobileForm.mobileProvider === 'M-Pesa' ? { color: 'bg-teal-600', currency: 'KES' } :
                          mobileForm.mobileProvider === 'GCash' ? { color: 'bg-sky-500', currency: 'PHP' } :
                          mobileForm.mobileProvider === 'Airtel Money' ? { color: 'bg-red-700', currency: 'INR' } :
                          { color: 'bg-purple-600', currency: mobileForm.currency };

    const newWallet: Omit<WalletType, 'id' | 'lastUpdated'> = {
      name: mobileForm.name,
      type: 'mobile_money',
      balance: mobileForm.balance,
      currency: providerConfig.currency,
      color: providerConfig.color,
      icon: 'Smartphone',
      isActive: true,
      network: mobileForm.mobileProvider,
      address: `MOBILE-${Date.now()}`,
      mobileProvider: mobileForm.mobileProvider,
      phoneNumber: mobileForm.phoneNumber,
      accountHolder: mobileForm.accountHolder
    };

    onAddWallet(newWallet);
    setMobileForm({ name: '', phoneNumber: '', mobileProvider: '', accountHolder: '', balance: 0, currency: 'USD' });
    setOpen(false);
  };

  const generateRandomAddress = () => {
    if (web3Form.type === 'solana') {
      const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789';
      let result = '';
      for (let i = 0; i < 44; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setWeb3Form(prev => ({ ...prev, address: result }));
    } else {
      const hex = '0123456789abcdef';
      let result = '0x';
      for (let i = 0; i < 40; i++) {
        result += hex.charAt(Math.floor(Math.random() * hex.length));
      }
      setWeb3Form(prev => ({ ...prev, address: result }));
    }
  };

  const maskCardNumber = (num: string) => {
    const cleaned = num.replace(/\s+/g, '');
    if (cleaned.length < 4) return cleaned;
    return '****' + cleaned.slice(-4);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="finance" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Add New Payment Method
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="web3" className="text-xs">Web3</TabsTrigger>
            <TabsTrigger value="bank" className="text-xs">Bank</TabsTrigger>
            <TabsTrigger value="atm" className="text-xs">Card</TabsTrigger>
            <TabsTrigger value="mobile" className="text-xs">Mobile</TabsTrigger>
          </TabsList>

          {/* Web3 Tab */}
          <TabsContent value="web3" className="space-y-4">
            <form onSubmit={handleWeb3Submit} className="space-y-4">
              <div>
                <Label htmlFor="web3-name">Wallet Name</Label>
                <Input
                  id="web3-name"
                  value={web3Form.name}
                  onChange={(e) => setWeb3Form(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., My Trading Wallet"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="web3-network">Network</Label>
                <Select 
                  value={web3Form.type} 
                  onValueChange={(value: keyof typeof networkConfigs) => 
                    setWeb3Form(prev => ({ ...prev, type: value }))
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
                <Label htmlFor="web3-address">Wallet Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="web3-address"
                    value={web3Form.address}
                    onChange={(e) => setWeb3Form(prev => ({ ...prev, address: e.target.value }))}
                    placeholder={web3Form.type === 'solana' ? 'Solana address...' : '0x...'}
                    required
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={generateRandomAddress}
                    disabled={!web3Form.type}
                  >
                    Generate
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="web3-balance">Initial Balance (USD)</Label>
                <Input
                  id="web3-balance"
                  type="number"
                  step="0.01"
                  min="0"
                  value={web3Form.balance}
                  onChange={(e) => setWeb3Form(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
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
          </TabsContent>

          {/* Bank Tab */}
          <TabsContent value="bank" className="space-y-4">
            <form onSubmit={handleBankSubmit} className="space-y-4">
              <div>
                <Label htmlFor="bank-name">Account Name</Label>
                <Input
                  id="bank-name"
                  value={bankForm.name}
                  onChange={(e) => setBankForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Main Checking Account"
                  required
                />
              </div>

              <div>
                <Label htmlFor="bank-provider">Bank Name</Label>
                <Input
                  id="bank-provider"
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm(prev => ({ ...prev, bankName: e.target.value }))}
                  placeholder="e.g., First National Bank"
                  required
                />
              </div>

              <div>
                <Label htmlFor="bank-account">Account Number</Label>
                <Input
                  id="bank-account"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder="Last 4 digits or full account number"
                  required
                />
              </div>

              <div>
                <Label htmlFor="bank-routing">Routing Number</Label>
                <Input
                  id="bank-routing"
                  value={bankForm.routingNumber}
                  onChange={(e) => setBankForm(prev => ({ ...prev, routingNumber: e.target.value }))}
                  placeholder="Optional"
                />
              </div>

              <div>
                <Label htmlFor="bank-holder">Account Holder Name</Label>
                <Input
                  id="bank-holder"
                  value={bankForm.accountHolder}
                  onChange={(e) => setBankForm(prev => ({ ...prev, accountHolder: e.target.value }))}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bank-balance">Balance</Label>
                  <Input
                    id="bank-balance"
                    type="number"
                    step="0.01"
                    min="0"
                    value={bankForm.balance}
                    onChange={(e) => setBankForm(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="bank-currency">Currency</Label>
                  <Select value={bankForm.currency} onValueChange={(v) => setBankForm(prev => ({ ...prev, currency: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                      <SelectItem value="AUD">AUD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Add Bank Account
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* ATM Card Tab */}
          <TabsContent value="atm" className="space-y-4">
            <form onSubmit={handleAtmSubmit} className="space-y-4">
              <div>
                <Label htmlFor="atm-name">Card Name</Label>
                <Input
                  id="atm-name"
                  value={atmForm.name}
                  onChange={(e) => setAtmForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., My Visa Card"
                  required
                />
              </div>

              <div>
                <Label htmlFor="atm-network">Card Type</Label>
                <Select value={atmForm.network} onValueChange={(v) => setAtmForm(prev => ({ ...prev, network: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Visa">Visa</SelectItem>
                    <SelectItem value="Mastercard">Mastercard</SelectItem>
                    <SelectItem value="AmEx">American Express</SelectItem>
                    <SelectItem value="Discover">Discover</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="atm-number">Card Number</Label>
                <Input
                  id="atm-number"
                  value={atmForm.cardNumber}
                  onChange={(e) => setAtmForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                  placeholder="Last 4 digits or full card number"
                  required
                />
              </div>

              <div>
                <Label htmlFor="atm-expiry">Expiry Date</Label>
                <Input
                  id="atm-expiry"
                  value={atmForm.cardExpiry}
                  onChange={(e) => setAtmForm(prev => ({ ...prev, cardExpiry: e.target.value }))}
                  placeholder="MM/YY"
                />
              </div>

              <div>
                <Label htmlFor="atm-bank">Bank Name</Label>
                <Input
                  id="atm-bank"
                  value={atmForm.bankName}
                  onChange={(e) => setAtmForm(prev => ({ ...prev, bankName: e.target.value }))}
                  placeholder="e.g., First National Bank"
                />
              </div>

              <div>
                <Label htmlFor="atm-holder">Cardholder Name</Label>
                <Input
                  id="atm-holder"
                  value={atmForm.accountHolder}
                  onChange={(e) => setAtmForm(prev => ({ ...prev, accountHolder: e.target.value }))}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="atm-balance">Available Balance</Label>
                  <Input
                    id="atm-balance"
                    type="number"
                    step="0.01"
                    min="0"
                    value={atmForm.balance}
                    onChange={(e) => setAtmForm(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="atm-currency">Currency</Label>
                  <Select value={atmForm.currency} onValueChange={(v) => setAtmForm(prev => ({ ...prev, currency: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                      <SelectItem value="AUD">AUD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Add Card
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Mobile Money Tab */}
          <TabsContent value="mobile" className="space-y-4">
            <form onSubmit={handleMobileSubmit} className="space-y-4">
              <div>
                <Label htmlFor="mobile-name">Account Name</Label>
                <Input
                  id="mobile-name"
                  value={mobileForm.name}
                  onChange={(e) => setMobileForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., My M-Pesa Account"
                  required
                />
              </div>

              <div>
                <Label htmlFor="mobile-provider">Mobile Money Provider</Label>
                <Select value={mobileForm.mobileProvider} onValueChange={(v) => setMobileForm(prev => ({ ...prev, mobileProvider: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {mobileProviders.map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mobile-phone">Phone Number</Label>
                <Input
                  id="mobile-phone"
                  value={mobileForm.phoneNumber}
                  onChange={(e) => setMobileForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="e.g., +254712345678"
                  required
                />
              </div>

              <div>
                <Label htmlFor="mobile-holder">Account Holder Name</Label>
                <Input
                  id="mobile-holder"
                  value={mobileForm.accountHolder}
                  onChange={(e) => setMobileForm(prev => ({ ...prev, accountHolder: e.target.value }))}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mobile-balance">Balance</Label>
                  <Input
                    id="mobile-balance"
                    type="number"
                    step="0.01"
                    min="0"
                    value={mobileForm.balance}
                    onChange={(e) => setMobileForm(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="mobile-currency">Currency</Label>
                  <Select value={mobileForm.currency} onValueChange={(v) => setMobileForm(prev => ({ ...prev, currency: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KES">KES (Kenya)</SelectItem>
                      <SelectItem value="PHP">PHP (Philippines)</SelectItem>
                      <SelectItem value="INR">INR (India)</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Add Mobile Money
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
