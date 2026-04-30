import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet } from '@/types/wallet';
import { Building2, CreditCard, Smartphone, DollarSign, Phone, Hash, CalendarDays, Banknote } from "lucide-react";

interface PaymentMethodsDisplayProps {
  wallets: Wallet[];
}

export const PaymentMethodsDisplay = ({ wallets }: PaymentMethodsDisplayProps) => {
  const bankWallets = wallets.filter(w => w.type === 'bank');
  const atmWallets = wallets.filter(w => w.type === 'atm_card');
  const mobileWallets = wallets.filter(w => w.type === 'mobile_money');

  const BankCard = ({ wallet }: { wallet: Wallet }) => (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${wallet.color} text-white`}>
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base">{wallet.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{wallet.bankName}</p>
            </div>
          </div>
          <Badge variant="secondary">{wallet.currency}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Hash className="w-4 h-4" />
              <span>Account</span>
            </div>
            <p className="font-mono text-sm font-semibold">{wallet.accountNumber}</p>
          </div>
          {wallet.routingNumber && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Hash className="w-4 h-4" />
                <span>Routing</span>
              </div>
              <p className="font-mono text-sm">{wallet.routingNumber}</p>
            </div>
          )}
        </div>
        {wallet.accountHolder && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Account Holder</p>
            <p className="text-sm font-medium">{wallet.accountHolder}</p>
          </div>
        )}
        <div className="pt-2 border-t flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Balance</span>
          <p className="text-lg font-bold">${wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </CardContent>
    </Card>
  );

  const AtmCard = ({ wallet }: { wallet: Wallet }) => (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${wallet.color} text-white`}>
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base">{wallet.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{wallet.network}</p>
            </div>
          </div>
          <Badge variant="secondary">{wallet.currency}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Banknote className="w-4 h-4" />
              <span>Card Number</span>
            </div>
            <p className="font-mono text-sm font-semibold">{wallet.cardNumber}</p>
          </div>
          {wallet.cardExpiry && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <CalendarDays className="w-4 h-4" />
                <span>Expiry</span>
              </div>
              <p className="font-mono text-sm">{wallet.cardExpiry}</p>
            </div>
          )}
        </div>
        {wallet.bankName && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Bank Name</p>
            <p className="text-sm font-medium">{wallet.bankName}</p>
          </div>
        )}
        {wallet.accountHolder && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Cardholder</p>
            <p className="text-sm font-medium">{wallet.accountHolder}</p>
          </div>
        )}
        <div className="pt-2 border-t flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Available Balance</span>
          <p className="text-lg font-bold">${wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </CardContent>
    </Card>
  );

  const MobileMoneyCard = ({ wallet }: { wallet: Wallet }) => (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${wallet.color} text-white`}>
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base">{wallet.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{wallet.mobileProvider}</p>
            </div>
          </div>
          <Badge variant="secondary">{wallet.currency}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Phone className="w-4 h-4" />
            <span>Phone Number</span>
          </div>
          <p className="font-mono text-sm font-semibold">{wallet.phoneNumber}</p>
        </div>
        {wallet.accountHolder && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Account Holder</p>
            <p className="text-sm font-medium">{wallet.accountHolder}</p>
          </div>
        )}
        <div className="pt-2 border-t flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Balance</span>
          <p className="text-lg font-bold">{wallet.currency} {wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Bank Accounts Section */}
      {bankWallets.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Bank Accounts</h3>
            <Badge variant="outline">{bankWallets.length}</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {bankWallets.map(wallet => (
              <BankCard key={wallet.id} wallet={wallet} />
            ))}
          </div>
        </div>
      )}

      {/* ATM/Debit Cards Section */}
      {atmWallets.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">ATM/Debit Cards</h3>
            <Badge variant="outline">{atmWallets.length}</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {atmWallets.map(wallet => (
              <AtmCard key={wallet.id} wallet={wallet} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Money Section */}
      {mobileWallets.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Mobile Money</h3>
            <Badge variant="outline">{mobileWallets.length}</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {mobileWallets.map(wallet => (
              <MobileMoneyCard key={wallet.id} wallet={wallet} />
            ))}
          </div>
        </div>
      )}

      {!bankWallets.length && !atmWallets.length && !mobileWallets.length && (
        <Card className="shadow-card border-dashed">
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>No payment methods added yet. Click "Add Payment Method" to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
