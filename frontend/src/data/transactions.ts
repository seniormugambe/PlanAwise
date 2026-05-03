import { WalletTransaction } from '@/types/wallet';

export const mockTransactions: WalletTransaction[] = [
  // Checking Account Transactions
  {
    id: '1',
    walletId: '1',
    amount: -85.50,
    type: 'expense',
    category: 'Groceries',
    description: 'Whole Foods Market',
    date: new Date('2024-01-15'),
  },
  {
    id: '2',
    walletId: '1',
    amount: 2500.00,
    type: 'income',
    category: 'Salary',
    description: 'Monthly Salary',
    date: new Date('2024-01-01'),
  },
  {
    id: '3',
    walletId: '1',
    amount: -45.99,
    type: 'expense',
    category: 'Dining',
    description: 'Restaurant Dinner',
    date: new Date('2024-01-14'),
  },
  {
    id: '4',
    walletId: '1',
    amount: -120.00,
    type: 'expense',
    category: 'Utilities',
    description: 'Electric Bill',
    date: new Date('2024-01-10'),
  },
  {
    id: '5',
    walletId: '1',
    amount: -500.00,
    type: 'transfer',
    category: 'Transfer',
    description: 'Transfer to Emergency Savings',
    date: new Date('2024-01-10'),
    fromWallet: '1',
    toWallet: '2'
  },

  // Savings Account Transactions
  {
    id: '6',
    walletId: '2',
    amount: 500.00,
    type: 'transfer',
    category: 'Transfer',
    description: 'Transfer from Checking',
    date: new Date('2024-01-10'),
    fromWallet: '1',
    toWallet: '2'
  },
  {
    id: '7',
    walletId: '2',
    amount: 25.50,
    type: 'income',
    category: 'Interest',
    description: 'Monthly Interest',
    date: new Date('2024-01-01'),
  },

  // Investment Account Transactions
  {
    id: '8',
    walletId: '3',
    amount: 150.00,
    type: 'income',
    category: 'Investment',
    description: 'Dividend Payment - AAPL',
    date: new Date('2024-01-12'),
  },
  {
    id: '9',
    walletId: '3',
    amount: 1000.00,
    type: 'income',
    category: 'Investment',
    description: 'Monthly Investment Contribution',
    date: new Date('2024-01-01'),
  },
  {
    id: '10',
    walletId: '3',
    amount: 75.25,
    type: 'income',
    category: 'Investment',
    description: 'Dividend Payment - MSFT',
    date: new Date('2024-01-08'),
  },

  // Credit Card Transactions
  {
    id: '11',
    walletId: '4',
    amount: -89.99,
    type: 'expense',
    category: 'Shopping',
    description: 'Amazon Purchase',
    date: new Date('2024-01-13'),
  },
  {
    id: '12',
    walletId: '4',
    amount: -65.00,
    type: 'expense',
    category: 'Gas',
    description: 'Shell Gas Station',
    date: new Date('2024-01-11'),
  },
  {
    id: '13',
    walletId: '4',
    amount: -35.50,
    type: 'expense',
    category: 'Dining',
    description: 'Coffee Shop',
    date: new Date('2024-01-09'),
  },

  // Crypto Wallet Transactions
  {
    id: '14',
    walletId: '5',
    amount: 500.00,
    type: 'income',
    category: 'Crypto',
    description: 'Bitcoin Purchase',
    date: new Date('2024-01-05'),
  },
  {
    id: '15',
    walletId: '5',
    amount: 200.00,
    type: 'income',
    category: 'Crypto',
    description: 'Ethereum Staking Rewards',
    date: new Date('2024-01-12'),
  },

  // Cash Wallet Transactions
  {
    id: '16',
    walletId: '6',
    amount: -25.00,
    type: 'expense',
    category: 'Miscellaneous',
    description: 'Parking Meter',
    date: new Date('2024-01-14'),
  },
  {
    id: '17',
    walletId: '6',
    amount: -15.50,
    type: 'expense',
    category: 'Food',
    description: 'Food Truck Lunch',
    date: new Date('2024-01-12'),
  },
];