import { useAccount, useConnect, useDisconnect, useBalance, useChainId } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Wallet, Copy, ExternalLink, Power, ChevronDown } from 'lucide-react'
import { supportedChains } from '@/config/web3'
import { toast } from 'sonner'
import { formatEther } from 'viem'
import { useState } from 'react'

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
        <Dialog open={showConnectors} onOpenChange={setShowConnectors}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2" disabled={isPending}>
              <Wallet className="w-4 h-4" />
              {isPending ? 'Connecting...' : 'Connect Wallet'}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Choose a Wallet</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {connectors.map((connector) => (
                <Button
                  key={connector.uid}
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => {
                    connect({ connector })
                    setShowConnectors(false)
                  }}
                  disabled={isPending}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{connector.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {connector.type === 'injected' ? 'Browser Extension' : 'Mobile & Desktop'}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
        
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Connect your wallet to access real blockchain data and make transactions
        </p>
      </CardContent>
    </Card>
  )
}