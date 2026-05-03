import { useAccount, useBalance, useChainId, useSwitchChain } from 'wagmi'
import { useCallback, useEffect, useState } from 'react'
import { supportedChains } from '@/config/web3'
import { Wallet } from '@/types/wallet'
import { formatEther } from 'viem'

export const useWeb3Wallets = () => {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [connectedWallets, setConnectedWallets] = useState<Wallet[]>([])

  const { data: balance, refetch: refetchBalance } = useBalance({
    address: address,
  })

  const currentChain = supportedChains[chainId as keyof typeof supportedChains]

  // Create wallet object from connected account
  const createWalletFromAccount = useCallback(() => {
    if (!address || !isConnected || !currentChain) return null

    const balanceValue = balance ? parseFloat(formatEther(balance.value)) : 0

    return {
      id: `${chainId}-${address}`,
      name: `${currentChain.name} Wallet`,
      type: getWalletType(chainId),
      balance: balanceValue * 2000, // Mock USD conversion (ETH ~$2000)
      currency: 'USD',
      color: currentChain.color,
      icon: 'Coins',
      isActive: true,
      lastUpdated: new Date(),
      network: currentChain.name,
      address: address,
      chainId: chainId,
      nativeToken: currentChain.nativeToken,
    } as Wallet
  }, [address, isConnected, currentChain, balance, chainId])

  // Get wallet type based on chain ID
  const getWalletType = (chainId: number): Wallet['type'] => {
    const chainMap: Record<number, Wallet['type']> = {
      1: 'ethereum',
      137: 'polygon',
      56: 'bsc',
      42161: 'arbitrum',
      10: 'optimism',
      8453: 'base',
      42220: 'celo',
      43114: 'avalanche',
      250: 'fantom',
    }
    return chainMap[chainId] || 'ethereum'
  }

  // Update connected wallets when account changes
  useEffect(() => {
    const wallet = createWalletFromAccount()
    if (wallet) {
      setConnectedWallets([wallet])
    } else {
      setConnectedWallets([])
    }
  }, [createWalletFromAccount])

  const switchNetwork = useCallback(async (targetChainId: number) => {
    try {
      await switchChain({ chainId: targetChainId })
      return true
    } catch (error) {
      console.error('Failed to switch network:', error)
      return false
    }
  }, [switchChain])

  const refreshBalance = useCallback(async () => {
    await refetchBalance()
  }, [refetchBalance])

  const getWalletBalance = useCallback(async (walletAddress: string, targetChainId?: number) => {
    // This would typically involve switching chains and fetching balance
    // For now, return the current balance if it matches
    if (walletAddress.toLowerCase() === address?.toLowerCase()) {
      return balance ? parseFloat(formatEther(balance.value)) : 0
    }
    return 0
  }, [address, balance])

  return {
    connectedWallets,
    isConnected,
    currentChain,
    address,
    balance: balance ? parseFloat(formatEther(balance.value)) : 0,
    chainId,
    switchNetwork,
    refreshBalance,
    getWalletBalance,
    supportedChains: Object.entries(supportedChains).map(([id, chain]) => ({
      id: parseInt(id),
      ...chain,
    })),
  }
}