import { useState, useCallback, useEffect } from 'react';
import { Wallet, WalletTransaction, WalletSummary } from '@/types/wallet';
import { mockWallets } from '@/data/wallets';
import { mockTransactions } from '@/data/transactions';
import { useWeb3Wallets } from '@/hooks/useWeb3Wallets';

export const useWallets = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const { connectedWallets, isConnected } = useWeb3Wallets();

  // Initialize with mock data and merge with connected wallets
  useEffect(() => {
    try {
      // Combine mock wallets with real connected wallets
      const allWallets = isConnected && connectedWallets.length > 0 
        ? [...connectedWallets, ...mockWallets.slice(1)] // Replace first mock wallet with real one
        : mockWallets;
      
      setWallets(allWallets);
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      setWallets(mockWallets);
      setTransactions([]);
    }
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