import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Wallet, ArrowRightLeft, DollarSign, CreditCard, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { BoundlessPaySetup } from "./BoundlessPaySetup";
import { boundlessPayService } from "@/services/boundlessPayService";
import { useWallets } from "@/hooks/useWallets";
import { useToast } from "@/hooks/use-toast";

interface WalletConnection {
  walletId: string;
  boundlessPayId?: string;
  isConnected: boolean;
  lastSync: Date | null;
  syncStatus: 'syncing' | 'success' | 'error' | 'pending';
}

export const WalletIntegration = () => {
  const { toast } = useToast();
  const { wallets, updateWallet } = useWallets();
  const [connections, setConnections] = useState<WalletConnection[]>([]);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Initialize connections for all wallets
    const savedConnections = localStorage.getItem('boundless_wallet_connections');
    if (savedConnections) {
      setConnections(JSON.parse(savedConnections));
    } else {
      const initialConnections = wallets.map(wallet => ({
        walletId: wallet.id,
        isConnected: false,
        lastSync: null,
        syncStatus: 'pending' as const
      }));
      setConnections(initialConnections);
    }
  }, [wallets]);

  useEffect(() => {
    // Save connections to localStorage whenever they change
    localStorage.setItem('boundless_wallet_connections', JSON.stringify(connections));
  }, [connections]);

  const connectWallet = async (walletId: string) => {
    if (!boundlessPayService.isConfigured()) {
      toast({
        title: "Boundless Pay Not Configured",
        description: "Please set up Boundless Pay first",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(walletId);
    
    try {
      // Simulate API call to connect wallet
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const boundlessPayId = `bp_wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      setConnections(prev => prev.map(conn => 
        conn.walletId === walletId 
          ? { 
              ...conn, 
              boundlessPayId,
              isConnected: true, 
              lastSync: new Date(),
              syncStatus: 'success' as const
            }
          : conn
      ));

      toast({
        title: "✅ Wallet Connected",
        description: "Your wallet is now synced with Boundless Pay"
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect wallet. Please try again.",
        variant: "destructive"
      });
      
      setConnections(prev => prev.map(conn => 
        conn.walletId === walletId 
          ? { ...conn, syncStatus: 'error' as const }
          : conn
      ));
    } finally {
      setIsConnecting(null);
    }
  };

  const disconnectWallet = (walletId: string) => {
    setConnections(prev => prev.map(conn => 
      conn.walletId === walletId 
        ? { 
            ...conn, 
            boundlessPayId: undefined,
            isConnected: false, 
            lastSync: null,
            syncStatus: 'pending' as const
          }
        : conn
    ));

    toast({
      title: "Wallet Disconnected",
      description: "Wallet has been removed from Boundless Pay"
    });
  };

  const syncAllWallets = async () => {
    const connectedWallets = connections.filter(c => c.isConnected);
    if (connectedWallets.length === 0) {
      toast({
        title: "No Connected Wallets",
        description: "Connect at least one wallet to sync",
        variant: "destructive"
      });
      return;
    }

    setIsSyncing(true);
    
    // Set all connected wallets to syncing status
    setConnections(prev => prev.map(conn => 
      conn.isConnected 
        ? { ...conn, syncStatus: 'syncing' as const }
        : conn
    ));

    try {
      // Simulate sync for each connected wallet
      for (const connection of connectedWallets) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate balance update (random change between -100 and +100)
        const balanceChange = (Math.random() - 0.5) * 200;
        const wallet = wallets.find(w => w.id === connection.walletId);
        
        if (wallet) {
          updateWallet(wallet.id, {
            balance: Math.max(0, wallet.balance + balanceChange)
          });
        }
      }

      // Update all connections to success
      setConnections(prev => prev.map(conn => 
        conn.isConnected 
          ? { 
              ...conn, 
              lastSync: new Date(),
              syncStatus: 'success' as const
            }
          : conn
      ));

      toast({
        title: "🔄 Sync Complete",
        description: `Updated ${connectedWallets.length} wallet(s) successfully`
      });
    } catch (error) {
      setConnections(prev => prev.map(conn => 
        conn.isConnected 
          ? { ...conn, syncStatus: 'error' as const }
          : conn
      ));

      toast({
        title: "Sync Failed",
        description: "Unable to sync wallet data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const getWalletConnection = (walletId: string) => {
    return connections.find(conn => conn.walletId === walletId);
  };

  const connectedCount = connections.filter(c => c.isConnected).length;
  const totalWallets = wallets.length;

  return (
    <div className="space-y-6">
      {/* Integration Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-primary" />
              Boundless Pay Integration
            </CardTitle>
            <div className="flex items-center gap-2">
              <BoundlessPaySetup />
              <Button 
                variant="outline" 
                onClick={syncAllWallets}
                disabled={isSyncing || connectedCount === 0}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                Sync All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Connected Wallets</p>
                <p className="text-sm text-muted-foreground">
                  {connectedCount} of {totalWallets} wallets connected
                </p>
              </div>
              <Badge variant={connectedCount > 0 ? "default" : "secondary"}>
                {connectedCount > 0 ? "Active" : "Not Connected"}
              </Badge>
            </div>
            
            <Progress value={(connectedCount / totalWallets) * 100} />
            
            {boundlessPayService.isConfigured() && (
              <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg border border-success/20 text-success text-sm">
                <CheckCircle className="w-4 h-4" />
                Boundless Pay is configured and ready for wallet connections
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Wallet Connections */}
      <div className="grid gap-4">
        {wallets.map((wallet) => {
          const connection = getWalletConnection(wallet.id);
          const isWalletConnecting = isConnecting === wallet.id;
          
          return (
            <Card key={wallet.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white`}
                      style={{ backgroundColor: wallet.color }}
                    >
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{wallet.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ${wallet.balance.toLocaleString()} • {wallet.type}
                      </p>
                      {connection?.lastSync && (
                        <p className="text-xs text-muted-foreground">
                          Last sync: {connection.lastSync.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Connection Status */}
                    {connection?.isConnected && (
                      <div className="flex items-center gap-2">
                        {connection.syncStatus === 'syncing' && (
                          <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                        )}
                        {connection.syncStatus === 'success' && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {connection.syncStatus === 'error' && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Connected
                        </Badge>
                      </div>
                    )}
                    
                    {/* Action Button */}
                    {connection?.isConnected ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => disconnectWallet(wallet.id)}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button 
                        size="sm"
                        onClick={() => connectWallet(wallet.id)}
                        disabled={!boundlessPayService.isConfigured() || isWalletConnecting}
                        className="gap-2"
                      >
                        {isWalletConnecting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            Connect
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Integration Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-green-500 mt-1" />
              <div>
                <h4 className="font-medium">Real-time Balance Updates</h4>
                <p className="text-sm text-muted-foreground">
                  Automatic synchronization keeps your balances current
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <ArrowRightLeft className="w-5 h-5 text-blue-500 mt-1" />
              <div>
                <h4 className="font-medium">Seamless Transfers</h4>
                <p className="text-sm text-muted-foreground">
                  Move money between wallets and external accounts
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-purple-500 mt-1" />
              <div>
                <h4 className="font-medium">Payment Processing</h4>
                <p className="text-sm text-muted-foreground">
                  Accept and send payments directly from your wallets
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 mt-1" />
              <div>
                <h4 className="font-medium">Transaction History</h4>
                <p className="text-sm text-muted-foreground">
                  Complete transaction tracking and reporting
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
