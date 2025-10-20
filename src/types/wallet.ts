export interface Wallet {
  id: string;
  name: string;
  type: 'ethereum' | 'polygon' | 'bsc' | 'arbitrum' | 'optimism' | 'base' | 'celo' | 'avalanche' | 'fantom' | 'solana';
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