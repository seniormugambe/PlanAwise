import { useCallback } from 'react'
import { supportedChains } from '@/config/web3'

export const useWeb3Wallets = () => {
  const switchNetwork = useCallback(async () => false, [])
  const refreshBalance = useCallback(async () => undefined, [])
  const getWalletBalance = useCallback(async () => 0, [])

  return {
    connectedWallets: [],
    isConnected: false,
    currentChain: undefined,
    address: undefined,
    balance: 0,
    chainId: undefined,
    switchNetwork,
    refreshBalance,
    getWalletBalance,
    supportedChains: Object.entries(supportedChains).map(([id, chain]) => ({
      id: Number(id),
      ...chain,
    })),
  }
}
