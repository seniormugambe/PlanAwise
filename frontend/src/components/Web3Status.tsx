import { useAccount, useBalance, useChainId, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  Power, 
  ChevronDown, 
  AlertCircle,
  CheckCircle,
  Globe,
  Zap
} from 'lucide-react'
import { supportedChains } from '@/config/web3'
import { toast } from 'sonner'
import { formatEther } from 'viem'
import { useState } from 'react'
import { WalletConnect } from './WalletConnect'

export interface Web3StatusProps {
  variant?: 'full' | 'compact' | 'minimal'
  showBalance?: boolean
  showNetwork?: boolean
  className?: string
  openConnectOnMount?: boolean
}

export const Web3Status = ({ 
  variant = 'compact', 
  showBalance = true, 
  showNetwork = true,
  className = '',
  openConnectOnMount = false,
}: Web3StatusProps) => {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const [showConnectDialog, setShowConnectDialog] = useState(openConnectOnMount)
  
  const { data: balance } = useBalance({
    address: address,
  })

  const currentChain = supportedChains[chainId as keyof typeof supportedChains]
  const isUnsupportedChain = !currentChain

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

  // Minimal variant - just connection status
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {isConnected ? (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            Connected
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1">
            <AlertCircle className="w-3 h-3 text-yellow-500" />
            Not Connected
          </Badge>
        )}
      </div>
    )
  }

  // Compact variant - status with popover
  if (variant === 'compact') {
    if (!isConnected) {
      return (
        <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`gap-2 ${className}`}
            >
              <Wallet className="w-4 h-4" />
              Connect
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0">
            <WalletConnect />
          </DialogContent>
        </Dialog>
      )
    }

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={`gap-2 ${className}`}>
            <div className="flex items-center gap-2">
              {isUnsupportedChain ? (
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              ) : (
                <div className={`w-3 h-3 rounded-full ${currentChain?.color || 'bg-gray-500'}`} />
              )}
              <span className="hidden sm:inline">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium">Connected</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => disconnect()}
                className="gap-1 text-red-500 hover:text-red-600"
              >
                <Power className="w-3 h-3" />
                Disconnect
              </Button>
            </div>

            {/* Network Info */}
            {showNetwork && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Network</span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant={isUnsupportedChain ? "destructive" : "secondary"} className="gap-1">
                    {!isUnsupportedChain && (
                      <div className={`w-2 h-2 rounded-full ${currentChain.color}`} />
                    )}
                    {currentChain?.name || `Chain ${chainId}`}
                  </Badge>
                  {isUnsupportedChain && (
                    <span className="text-xs text-destructive">Unsupported</span>
                  )}
                </div>
              </div>
            )}

            {/* Balance */}
            {showBalance && balance && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Balance</span>
                </div>
                <div className="text-lg font-semibold">
                  {parseFloat(formatEther(balance.value)).toFixed(4)} {currentChain?.nativeToken || 'ETH'}
                </div>
              </div>
            )}

            {/* Address */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Address</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                  {address}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openExplorer}
                  className="h-6 w-6 p-0"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  // Full variant - detailed card
  if (variant === 'full') {
    if (!isConnected) {
      return (
        <Card className={`shadow-card ${className}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Wallet className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-medium">Web3 Wallet</h4>
                  <p className="text-sm text-muted-foreground">Not connected</p>
                </div>
              </div>
              <Button onClick={() => setShowConnectDialog(true)} size="sm">
                Connect
              </Button>
            </div>
            <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
              <DialogContent className="p-0">
                <WalletConnect />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className={`shadow-card ${className}`}>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${currentChain?.color || 'bg-gray-500'}`}>
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Connected Wallet</h4>
                  <p className="text-sm text-muted-foreground">
                    {currentChain?.name || `Chain ${chainId}`}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => disconnect()}
                className="gap-1"
              >
                <Power className="w-3 h-3" />
                Disconnect
              </Button>
            </div>

            {/* Network Warning */}
            {isUnsupportedChain && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive font-medium">
                    Unsupported Network
                  </span>
                </div>
                <p className="text-xs text-destructive mt-1">
                  Please switch to a supported network to access all features.
                </p>
              </div>
            )}

            {/* Balance */}
            {showBalance && balance && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm font-medium">Balance</span>
                <div className="text-right">
                  <div className="font-semibold">
                    {parseFloat(formatEther(balance.value)).toFixed(4)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {currentChain?.nativeToken || 'ETH'}
                  </div>
                </div>
              </div>
            )}

            {/* Address */}
            <div className="space-y-2">
              <span className="text-sm font-medium">Address</span>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                  {address}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openExplorer}
                  className="h-6 w-6 p-0"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
