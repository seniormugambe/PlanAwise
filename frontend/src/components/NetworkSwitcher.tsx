import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Globe } from 'lucide-react'

export const NetworkSwitcher = () => (
  <Card className="shadow-card">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Globe className="h-5 w-5 text-primary" />
        Network
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Live network switching:</span>
        <Badge variant="outline">Disabled</Badge>
      </div>
    </CardContent>
  </Card>
)
