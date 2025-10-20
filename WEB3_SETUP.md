# Web3 Integration Setup

This application now supports real blockchain connectivity! Here's how to set it up:

## Prerequisites

1. **WalletConnect Project ID**
   - Go to [WalletConnect Cloud](https://cloud.walletconnect.com)
   - Create a new project
   - Copy your Project ID
   - Add it to your `.env` file as `VITE_WALLETCONNECT_PROJECT_ID`

2. **RPC Provider (Optional but Recommended)**
   - **Alchemy**: Go to [Alchemy](https://www.alchemy.com), create an account, and get your API key
   - **Infura**: Go to [Infura](https://infura.io), create an account, and get your API key
   - Add to your `.env` file as `VITE_ALCHEMY_API_KEY` or `VITE_INFURA_API_KEY`

## Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your API keys:
   ```env
   VITE_WALLETCONNECT_PROJECT_ID=your_actual_project_id
   VITE_ALCHEMY_API_KEY=your_alchemy_api_key
   ```

## Supported Networks

The application supports the following blockchain networks:

- **Ethereum Mainnet** (Chain ID: 1)
- **Polygon** (Chain ID: 137)
- **BNB Smart Chain** (Chain ID: 56)
- **Arbitrum One** (Chain ID: 42161)
- **Optimism** (Chain ID: 10)
- **Base** (Chain ID: 8453)
- **Celo** (Chain ID: 42220)
- **Avalanche C-Chain** (Chain ID: 43114)
- **Fantom Opera** (Chain ID: 250)

## Features

### 🔗 Wallet Connection
- Connect MetaMask, WalletConnect, and other Web3 wallets
- Automatic network detection
- Real-time balance updates

### 🌐 Network Switching
- Switch between supported networks
- Automatic chain detection
- Network-specific configurations

### 💰 Real Balance Display
- Live balance fetching from blockchain
- USD conversion (mock rates for demo)
- Native token display

### 🔄 Multi-Chain Support
- Manage wallets across different networks
- Network-specific wallet addresses
- Chain-specific transaction history

## Usage

1. **Connect Wallet**: Click "Connect Wallet" and choose your preferred wallet
2. **Switch Networks**: Use the network switcher to change between blockchains
3. **View Balances**: See real-time balances from your connected wallets
4. **Manage Wallets**: Add, view, and manage multiple wallet addresses

## Development

The Web3 integration uses:
- **Wagmi**: React hooks for Ethereum
- **Viem**: TypeScript interface for Ethereum
- **WalletConnect**: Multi-wallet connection protocol

### Key Components

- `src/config/web3.ts` - Web3 configuration and supported chains
- `src/components/WalletConnect.tsx` - Wallet connection interface
- `src/components/NetworkSwitcher.tsx` - Network switching component
- `src/hooks/useWeb3Wallets.ts` - Web3 wallet management hook

### Testing

1. Install a Web3 wallet (MetaMask recommended)
2. Get some testnet tokens from faucets
3. Connect your wallet to the application
4. Switch between different networks
5. View your real balances and addresses

## Security Notes

- Never commit your private keys or seed phrases
- Use environment variables for API keys
- Test on testnets before using mainnet
- Always verify transaction details before signing

## Troubleshooting

### Common Issues

1. **"Unsupported Network"**: Switch to a supported network in your wallet
2. **Connection Failed**: Check your wallet is unlocked and try refreshing
3. **Balance Not Loading**: Ensure you have an RPC provider configured
4. **Transaction Errors**: Check you have enough gas and the correct network

### Getting Help

- Check browser console for error messages
- Ensure your wallet is connected and unlocked
- Verify you're on a supported network
- Check your API keys are correctly configured