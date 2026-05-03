import { useChainId, useSwitchChain } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Globe, AlertCircle } from 'lucide-react'
import { supportedChains } from '@/config/web3'
import { toast } from 'sonner'

export const NetworkSwitcher = () => {
  const chainId = useChainId()
  const { switchChain, isPending } = useSwitchChain()

  const currentChain = supportedChains[chainId as keyof typeof supportedChains]
  const isUnsupportedChain = !currentChain

  const handleNetworkSwitch = async (targetChainId: string) => {
    try {
      await switchChain({ chainId: parseInt(targetChainId) })
      toast.success(`Switched to ${supportedChains[parseInt(targetChainId) as keyof typeof supportedChains]?.name}`)
    } catch (error) {
      toast.error('Failed to switch network')
      console.error('Network switch error:', error)
    }
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Network
          {isUnsupportedChain && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="w-3 h-3" />
              Unsupported
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Network:</span>
            <Badge variant={isUnsupportedChain ? "destructive" : "secondary"}>
              {currentChain?.name || `Chain ${chainId}`}
            </Badge>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Switch Network:</label>
            <Select
              value={chainId.toString()}
              onValueChange={handleNetworkSwitch}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(supportedChains).map(([id, chain]) => (
                  <SelectItem key={id} value={id}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${chain.color}`} />
                      {chain.name} ({chain.nativeToken})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isUnsupportedChain && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">
                This network is not supported. Please switch to a supported network to continue.
              </p>
            </div>
          )}

          {isPending && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-primary">
                Switching network... Please confirm in your wallet.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}