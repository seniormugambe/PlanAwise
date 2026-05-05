import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, Wallet } from 'lucide-react'

export interface Web3StatusProps {
  variant?: 'full' | 'compact' | 'minimal'
  showBalance?: boolean
  showNetwork?: boolean
  className?: string
  openConnectOnMount?: boolean
}

export const Web3Status = ({
  variant = 'compact',
  className = '',
}: Web3StatusProps) => {
  if (variant === 'full') {
    return (
      <Card className={`shadow-card ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Wallet className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h4 className="font-medium">Web3 Disabled</h4>
              <p className="text-sm text-muted-foreground">
                Live wallet connections are turned off for a faster frontend.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Badge variant="outline" className={`gap-1 ${className}`}>
      <AlertCircle className="h-3 w-3 text-muted-foreground" />
      Web3 Off
    </Badge>
  )
}
