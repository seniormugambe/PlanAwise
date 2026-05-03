import { useAccount, useConnect, useDisconnect, useBalance, useChainId } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Wallet,
  Copy,
  ExternalLink,
  Power,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Shield,
  Smartphone,
  Chrome,
  Star,
  type LucideIcon,
} from 'lucide-react'
import { supportedChains } from '@/config/web3'
import { toast } from 'sonner'
import { formatEther } from 'viem'
import { useMemo, useState } from 'react'

type WalletOptionId =
  | 'metamask'
  | 'coinbase'
  | 'walletconnect'
  | 'trust'
  | 'rainbow'
  | 'zerion'
  | 'phantom'
  | 'rabby'
  | 'brave'
  | 'browser'

type WalletOption = {
  id: WalletOptionId
  name: string
  description: string
  setupHint: string
  icon: LucideIcon
  accent: string
}

type EthereumProvider = {
  isBraveWallet?: boolean
  isCoinbaseWallet?: boolean
  isMetaMask?: boolean
  isPhantom?: boolean
  isRabby?: boolean
  isTrust?: boolean
  isZerion?: boolean
  providers?: EthereumProvider[]
}

const WALLET_OPTIONS: WalletOption[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    description: 'Browser extension and mobile wallet',
    setupHint: 'Install MetaMask or enable the extension',
    icon: Shield,
    accent: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    description: 'Coinbase smart wallet and extension',
    setupHint: 'Open Coinbase Wallet or install the extension',
    icon: Wallet,
    accent: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    description: 'Scan with supported mobile wallets',
    setupHint: 'Set VITE_WALLETCONNECT_PROJECT_ID to enable',
    icon: Smartphone,
    accent: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    description: 'Connect through extension or WalletConnect',
    setupHint: 'Install Trust Wallet or enable WalletConnect',
    icon: Wallet,
    accent: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    description: 'Mobile wallet connection',
    setupHint: 'Enable WalletConnect to use Rainbow',
    icon: Star,
    accent: 'bg-pink-500/10 text-pink-700 dark:text-pink-300',
  },
  {
    id: 'zerion',
    name: 'Zerion',
    description: 'Portfolio wallet connection',
    setupHint: 'Install Zerion or enable WalletConnect',
    icon: Wallet,
    accent: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  },
  {
    id: 'phantom',
    name: 'Phantom',
    description: 'Multi-chain wallet extension',
    setupHint: 'Install Phantom or enable WalletConnect',
    icon: Wallet,
    accent: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
  },
  {
    id: 'rabby',
    name: 'Rabby',
    description: 'Browser extension wallet',
    setupHint: 'Install Rabby and refresh this page',
    icon: Shield,
    accent: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
  },
  {
    id: 'brave',
    name: 'Brave Wallet',
    description: 'Built into the Brave browser',
    setupHint: 'Open this app in Brave and enable Brave Wallet',
    icon: Chrome,
    accent: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  },
  {
    id: 'browser',
    name: 'Browser Wallet',
    description: 'Use any injected EVM wallet',
    setupHint: 'Install or unlock a browser wallet',
    icon: Chrome,
    accent: 'bg-muted text-muted-foreground',
  },
]

const getEthereumProviders = () => {
  if (typeof window === 'undefined') {
    return []
  }

  const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum
  if (!ethereum) {
    return []
  }

  return ethereum.providers?.length ? ethereum.providers : [ethereum]
}

export const WalletConnect = () => {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const [showConnectors, setShowConnectors] = useState(false)
  
  const { data: balance } = useBalance({
    address: address,
  })

  const currentChain = supportedChains[chainId as keyof typeof supportedChains]

  const walletOptions = useMemo(() => {
    const findConnector = (terms: string[]) =>
      connectors.find((connector) => {
        const searchText = `${connector.id} ${connector.name} ${connector.type}`.toLowerCase()
        return terms.some((term) => searchText.includes(term))
      })

    const injectedConnector = findConnector(['injected'])
    const metaMaskConnector = findConnector(['metamask'])
    const coinbaseConnector = findConnector(['coinbase'])
    const walletConnectConnector = findConnector(['walletconnect'])
    const providers = getEthereumProviders()

    const installed = {
      brave: providers.some((provider) => provider.isBraveWallet),
      coinbase: providers.some((provider) => provider.isCoinbaseWallet),
      metamask: providers.some((provider) => provider.isMetaMask && !provider.isBraveWallet),
      phantom: providers.some((provider) => provider.isPhantom),
      rabby: providers.some((provider) => provider.isRabby),
      trust: providers.some((provider) => provider.isTrust),
      zerion: providers.some((provider) => provider.isZerion),
    }

    return WALLET_OPTIONS.map((option) => {
      const connector = (() => {
        switch (option.id) {
          case 'metamask':
            return metaMaskConnector ?? (installed.metamask ? injectedConnector : undefined)
          case 'coinbase':
            return coinbaseConnector ?? (installed.coinbase ? injectedConnector : undefined)
          case 'walletconnect':
            return walletConnectConnector
          case 'trust':
            return installed.trust ? injectedConnector : walletConnectConnector
          case 'rainbow':
            return walletConnectConnector
          case 'zerion':
            return installed.zerion ? injectedConnector : walletConnectConnector
          case 'phantom':
            return installed.phantom ? injectedConnector : walletConnectConnector
          case 'rabby':
            return installed.rabby ? injectedConnector : undefined
          case 'brave':
            return installed.brave ? injectedConnector : undefined
          case 'browser':
            return injectedConnector
          default:
            return undefined
        }
      })()

      const isWalletConnectSetupNeeded =
        !walletConnectConnector &&
        ['walletconnect', 'trust', 'rainbow', 'zerion', 'phantom'].includes(option.id)

      return {
        ...option,
        connector,
        isAvailable: Boolean(connector),
        statusText: connector ? 'Available' : isWalletConnectSetupNeeded ? 'Setup needed' : 'Install wallet',
      }
    })
  }, [connectors])

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast.success('Address copied to clipboard!')
    }
  }

  const openExplorer = () => {
    if (address && currentChain) {
      window.open(`${currentChain.explorer}/address/${address}`, '_blank')
    }
  }

  if (isConnected && address) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Connected Wallet
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => disconnect()}
              className="gap-2"
            >
              <Power className="w-4 h-4" />
              Disconnect
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border bg-gradient-card">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${currentChain?.color || 'bg-gray-500'}`}>
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">Main Wallet</h4>
                  <Badge variant="secondary" className="text-xs">
                    {currentChain?.name || 'Unknown Network'}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0"
                    onClick={copyAddress}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0"
                    onClick={openExplorer}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-foreground">
                {balance ? `${parseFloat(formatEther(balance.value)).toFixed(4)}` : '0.0000'}
              </div>
              <div className="text-xs text-muted-foreground">
                {currentChain?.nativeToken || 'ETH'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          Connect Wallet
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DropdownMenu open={showConnectors} onOpenChange={setShowConnectors}>
          <DropdownMenuTrigger asChild>
            <Button className="w-full gap-2" disabled={isPending}>
              <Wallet className="w-4 h-4" />
              {isPending ? 'Connecting...' : 'Connect Wallet'}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className="w-[min(28rem,calc(100vw-2rem))] p-2"
          >
            <DropdownMenuLabel className="px-2 py-1.5">Choose a wallet</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {walletOptions.map((option) => {
              const Icon = option.icon

              return (
                <DropdownMenuItem
                  key={option.id}
                  disabled={!option.isAvailable || isPending}
                  className="flex cursor-pointer items-start gap-3 rounded-md p-3"
                  onSelect={(event) => {
                    event.preventDefault()
                    if (!option.connector) {
                      return
                    }

                    connect(
                      { connector: option.connector },
                      {
                        onError: (error) => {
                          toast.error(error.message || `Unable to connect ${option.name}`)
                        },
                      },
                    )
                    setShowConnectors(false)
                  }}
                >
                  <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${option.accent}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium leading-none">{option.name}</span>
                      <Badge
                        variant={option.isAvailable ? 'secondary' : 'outline'}
                        className="shrink-0 gap-1 text-[10px]"
                      >
                        {option.isAvailable ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-yellow-500" />
                        )}
                        {option.statusText}
                      </Badge>
                    </div>
                    <p className="text-xs leading-5 text-muted-foreground">
                      {option.isAvailable ? option.description : option.setupHint}
                    </p>
                  </div>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Connect your wallet to access real blockchain data and make transactions
        </p>
      </CardContent>
    </Card>
  )
}
