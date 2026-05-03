import { WagmiProvider } from 'wagmi'
import { config } from '@/config/web3'
import { ReactNode } from 'react'

interface Web3ProviderProps {
  children: ReactNode
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  return (
    <WagmiProvider config={config}>
      {children}
    </WagmiProvider>
  )
}
