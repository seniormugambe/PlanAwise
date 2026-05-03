import { useCallback, useMemo } from "react";
import { Wallet, WalletTransaction, WalletSummary } from "@/types/wallet";
import { useAppState } from "@/state/AppStateProvider";

export const useWallets = () => {
  const {
    wallets: storedWallets,
    transactions,
    addTransaction,
    addWallet,
    updateWallet,
    deleteWallet,
  } = useAppState();

  const wallets = useMemo(() => storedWallets, [storedWallets]);

  const getWalletById = useCallback(
    (id: string) => {
      return wallets.find((wallet) => wallet.id === id);
    },
    [wallets]
  );

  const getWalletTransactions = useCallback(
    (walletId: string) => {
      return transactions.filter((transaction) => transaction.walletId === walletId);
    },
    [transactions]
  );

  const getWalletSummary = useCallback((): WalletSummary => {
    const totalAssets = wallets
      .filter((wallet) => wallet.balance > 0)
      .reduce((sum, wallet) => sum + wallet.balance, 0);

    const totalLiabilities = Math.abs(
      wallets
        .filter((wallet) => wallet.balance < 0)
        .reduce((sum, wallet) => sum + wallet.balance, 0)
    );

    const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
    const netWorth = totalAssets - totalLiabilities;
    const monthlyChange = totalBalance * 0.05;

    return {
      totalBalance,
      totalAssets,
      totalLiabilities,
      netWorth,
      monthlyChange,
    };
  }, [wallets]);

  const transferBetweenWallets = useCallback(
    (
      fromWalletId: string,
      toWalletId: string,
      amount: number,
      description: string = "Wallet Transfer"
    ) => {
      const fromWallet = getWalletById(fromWalletId);
      const toWallet = getWalletById(toWalletId);

      if (!fromWallet || !toWallet) {
        throw new Error("Invalid wallet IDs");
      }

      if (fromWallet.balance < amount) {
        throw new Error("Insufficient funds");
      }

      const transferOut: Omit<WalletTransaction, "id"> = {
        walletId: fromWalletId,
        amount: -amount,
        type: "transfer",
        category: "Transfer",
        description: description || `Transfer to ${toWallet.name}`,
        date: new Date(),
        fromWallet: fromWalletId,
        toWallet: toWalletId,
      };

      const transferIn: Omit<WalletTransaction, "id"> = {
        walletId: toWalletId,
        amount,
        type: "transfer",
        category: "Transfer",
        description: description || `Transfer from ${fromWallet.name}`,
        date: new Date(),
        fromWallet: fromWalletId,
        toWallet: toWalletId,
      };

      addTransaction(transferOut);
      addTransaction(transferIn);

      return { success: true, message: "Transfer completed successfully" };
    },
    [addTransaction, getWalletById]
  );

  return {
    wallets,
    transactions,
    getWalletById,
    getWalletTransactions,
    getWalletSummary,
    addTransaction,
    transferBetweenWallets,
    addWallet: addWallet as (wallet: Omit<Wallet, "id" | "lastUpdated">) => Wallet,
    updateWallet,
    deleteWallet,
  };
};
