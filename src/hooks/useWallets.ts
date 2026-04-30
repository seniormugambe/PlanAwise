import { useState, useCallback, useEffect } from 'react';
import { Wallet, WalletTransaction, WalletSummary } from '@/types/wallet';
import { useWeb3Wallets } from '@/hooks/useWeb3Wallets';

const parseWallet = (raw: any): Wallet => ({
  ...raw,
  lastUpdated: new Date(raw.lastUpdated),
});

const parseTransaction = (raw: any): WalletTransaction => ({
  ...raw,
  date: new Date(raw.date),
});

export const useWallets = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const { connectedWallets, isConnected } = useWeb3Wallets();

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const response = await fetch('/api/data/wallets');
        if (!response.ok) {
          throw new Error('Failed to load wallet data');
        }

        const data = await response.json();
        const backendWallets = Array.isArray(data.wallets) ? data.wallets.map(parseWallet) : [];
        const backendTransactions = Array.isArray(data.transactions)
          ? data.transactions.map(parseTransaction)
          : [];

        const allWallets = isConnected && connectedWallets.length > 0
          ? [...connectedWallets, ...backendWallets.slice(1)]
          : backendWallets;

        setWallets(allWallets);
        setTransactions(backendTransactions);
      } catch (error) {
        console.error('Error loading wallet data:', error);
        setWallets([]);
        setTransactions([]);
      }
    };

    fetchWalletData();
  }, [connectedWallets, isConnected]);

  const getWalletById = useCallback((id: string) => {
    return wallets.find(wallet => wallet.id === id);
  }, [wallets]);

  const getWalletTransactions = useCallback((walletId: string) => {
    return transactions.filter(transaction => transaction.walletId === walletId);
  }, [transactions]);

  const getWalletSummary = useCallback((): WalletSummary => {
    const totalAssets = wallets
      .filter(w => w.balance > 0)
      .reduce((sum, wallet) => sum + wallet.balance, 0);
    
    const totalLiabilities = Math.abs(wallets
      .filter(w => w.balance < 0)
      .reduce((sum, wallet) => sum + wallet.balance, 0));
    
    const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
    const netWorth = totalAssets - totalLiabilities;
    
    // Calculate monthly change (mock data - 5% growth)
    const monthlyChange = totalBalance * 0.05;

    return {
      totalBalance,
      totalAssets,
      totalLiabilities,
      netWorth,
      monthlyChange
    };
  }, [wallets]);

  const addTransaction = useCallback((transaction: Omit<WalletTransaction, 'id'>) => {
    const newTransaction: WalletTransaction = {
      ...transaction,
      id: Date.now().toString()
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Update wallet balance
    setWallets(prev => prev.map(wallet => {
      if (wallet.id === transaction.walletId) {
        return {
          ...wallet,
          balance: wallet.balance + transaction.amount,
          lastUpdated: new Date()
        };
      }
      return wallet;
    }));

    return newTransaction;
  }, []);

  const transferBetweenWallets = useCallback((
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    description: string = 'Wallet Transfer'
  ) => {
    const fromWallet = getWalletById(fromWalletId);
    const toWallet = getWalletById(toWalletId);

    if (!fromWallet || !toWallet) {
      throw new Error('Invalid wallet IDs');
    }

    if (fromWallet.balance < amount) {
      throw new Error('Insufficient funds');
    }

    // Create transfer transactions
    const transferOut: Omit<WalletTransaction, 'id'> = {
      walletId: fromWalletId,
      amount: -amount,
      type: 'transfer',
      category: 'Transfer',
      description: `Transfer to ${toWallet.name}`,
      date: new Date(),
      fromWallet: fromWalletId,
      toWallet: toWalletId
    };

    const transferIn: Omit<WalletTransaction, 'id'> = {
      walletId: toWalletId,
      amount: amount,
      type: 'transfer',
      category: 'Transfer',
      description: `Transfer from ${fromWallet.name}`,
      date: new Date(),
      fromWallet: fromWalletId,
      toWallet: toWalletId
    };

    // Add both transactions
    addTransaction(transferOut);
    addTransaction(transferIn);

    return { success: true, message: 'Transfer completed successfully' };
  }, [getWalletById, addTransaction]);

  const addWallet = useCallback((wallet: Omit<Wallet, 'id' | 'lastUpdated'>) => {
    const newWallet: Wallet = {
      ...wallet,
      id: Date.now().toString(),
      lastUpdated: new Date()
    };
    
    setWallets(prev => [...prev, newWallet]);
    return newWallet;
  }, []);

  const updateWallet = useCallback((id: string, updates: Partial<Wallet>) => {
    setWallets(prev => prev.map(wallet => 
      wallet.id === id 
        ? { ...wallet, ...updates, lastUpdated: new Date() }
        : wallet
    ));
  }, []);

  const deleteWallet = useCallback((id: string) => {
    setWallets(prev => prev.filter(wallet => wallet.id !== id));
    setTransactions(prev => prev.filter(transaction => transaction.walletId !== id));
  }, []);

  return {
    wallets,
    transactions,
    getWalletById,
    getWalletTransactions,
    getWalletSummary,
    addTransaction,
    transferBetweenWallets,
    addWallet,
    updateWallet,
    deleteWallet
  };
};