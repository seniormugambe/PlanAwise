export interface Wallet {
  id: string;
  name: string;
  type: 'ethereum' | 'polygon' | 'bsc' | 'arbitrum' | 'optimism' | 'base' | 'celo' | 'avalanche' | 'fantom' | 'solana' | 'bank' | 'atm_card' | 'mobile_money';
  balance: number;
  currency: string;
  color: string;
  icon: string;
  isActive: boolean;
  lastUpdated: Date;
  network: string;
  address: string;
  chainId?: number;
  nativeToken?: string;
  // Bank/Payment specific fields
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  routingNumber?: string;
  cardNumber?: string;
  cardExpiry?: string;
  mobileProvider?: string; // e.g., M-Pesa, GCash, Airtel Money
  phoneNumber?: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  description: string;
  date: Date;
  fromWallet?: string;
  toWallet?: string;
}

export interface WalletSummary {
  totalBalance: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyChange: number;
}