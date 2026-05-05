export const supportedChains = {
  1: {
    name: 'Ethereum',
    nativeToken: 'ETH',
    color: 'bg-indigo-500',
    explorer: 'https://etherscan.io',
  },
  137: {
    name: 'Polygon',
    nativeToken: 'MATIC',
    color: 'bg-purple-500',
    explorer: 'https://polygonscan.com',
  },
  56: {
    name: 'BNB Smart Chain',
    nativeToken: 'BNB',
    color: 'bg-yellow-600',
    explorer: 'https://bscscan.com',
  },
  42161: {
    name: 'Arbitrum One',
    nativeToken: 'ETH',
    color: 'bg-blue-400',
    explorer: 'https://arbiscan.io',
  },
  10: {
    name: 'Optimism',
    nativeToken: 'ETH',
    color: 'bg-red-500',
    explorer: 'https://optimistic.etherscan.io',
  },
  8453: {
    name: 'Base',
    nativeToken: 'ETH',
    color: 'bg-blue-600',
    explorer: 'https://basescan.org',
  },
  42220: {
    name: 'Celo',
    nativeToken: 'CELO',
    color: 'bg-yellow-500',
    explorer: 'https://celoscan.io',
  },
  43114: {
    name: 'Avalanche',
    nativeToken: 'AVAX',
    color: 'bg-red-600',
    explorer: 'https://snowtrace.io',
  },
  250: {
    name: 'Fantom',
    nativeToken: 'FTM',
    color: 'bg-blue-700',
    explorer: 'https://ftmscan.com',
  },
} as const;
