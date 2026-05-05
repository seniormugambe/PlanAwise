import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Wallet } from 'lucide-react'

export const WalletConnect = () => (
  <Card className="shadow-card">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Wallet className="h-5 w-5 text-primary" />
        Wallet Connections Disabled
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Live Web3 wallet connections are currently turned off to keep the frontend fast.
          You can still manage tracked wallets and financial data in the app.
        </AlertDescription>
      </Alert>
    </CardContent>
  </Card>
)
