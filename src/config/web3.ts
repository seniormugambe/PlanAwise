import { http, createConfig } from 'wagmi'
import { mainnet, polygon, bsc, arbitrum, optimism, base, celo, avalanche, fantom } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

// WalletConnect project ID - get this from https://cloud.walletconnect.com
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

export const config = createConfig({
  chains: [mainnet, polygon, bsc, arbitrum, optimism, base, celo, avalanche, fantom],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId }),
  ],
  transports: {
    [mainnet.id]: http(
      import.meta.env.VITE_ALCHEMY_API_KEY 
        ? `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`
        : undefined
    ),
    [polygon.id]: http(
      import.meta.env.VITE_ALCHEMY_API_KEY 
        ? `https://polygon-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`
        : undefined
    ),
    [bsc.id]: http(),
    [arbitrum.id]: http(
      import.meta.env.VITE_ALCHEMY_API_KEY 
        ? `https://arb-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`
        : undefined
    ),
    [optimism.id]: http(
      import.meta.env.VITE_ALCHEMY_API_KEY 
        ? `https://opt-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`
        : undefined
    ),
    [base.id]: http(
      import.meta.env.VITE_ALCHEMY_API_KEY 
        ? `https://base-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`
        : undefined
    ),
    [celo.id]: http(),
    [avalanche.id]: http(),
    [fantom.id]: http(),
  },
})

export const supportedChains = {
  [mainnet.id]: {
    name: 'Ethereum',
    nativeToken: 'ETH',
    color: 'bg-indigo-500',
    explorer: 'https://etherscan.io',
  },
  [polygon.id]: {
    name: 'Polygon',
    nativeToken: 'MATIC',
    color: 'bg-purple-500',
    explorer: 'https://polygonscan.com',
  },
  [bsc.id]: {
    name: 'BNB Smart Chain',
    nativeToken: 'BNB',
    color: 'bg-yellow-600',
    explorer: 'https://bscscan.com',
  },
  [arbitrum.id]: {
    name: 'Arbitrum One',
    nativeToken: 'ETH',
    color: 'bg-blue-400',
    explorer: 'https://arbiscan.io',
  },
  [optimism.id]: {
    name: 'Optimism',
    nativeToken: 'ETH',
    color: 'bg-red-500',
    explorer: 'https://optimistic.etherscan.io',
  },
  [base.id]: {
    name: 'Base',
    nativeToken: 'ETH',
    color: 'bg-blue-600',
    explorer: 'https://basescan.org',
  },
  [celo.id]: {
    name: 'Celo',
    nativeToken: 'CELO',
    color: 'bg-yellow-500',
    explorer: 'https://celoscan.io',
  },
  [avalanche.id]: {
    name: 'Avalanche',
    nativeToken: 'AVAX',
    color: 'bg-red-600',
    explorer: 'https://snowtrace.io',
  },
  [fantom.id]: {
    name: 'Fantom',
    nativeToken: 'FTM',
    color: 'bg-blue-700',
    explorer: 'https://ftmscan.com',
  },
} as const;

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}