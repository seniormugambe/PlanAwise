import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, ExternalLink, CheckCircle, AlertCircle, Info, Zap } from "lucide-react";
import { boundlessPayService } from "@/services/boundlessPayService";

export const BoundlessPaySetup = () => {
  const [apiKey, setApiKey] = useState("");
  const [merchantId, setMerchantId] = useState("");
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if Boundless Pay is already configured
    const config = boundlessPayService.getConfig();
    if (config) {
      setApiKey(config.apiKey);
      setMerchantId(config.merchantId);
      setEnvironment(config.environment);
      setIsConnected(boundlessPayService.isInitialized());
    }
  }, []);

  const handleConnect = async () => {
    if (!apiKey.trim() || !merchantId.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const success = await boundlessPayService.initialize({
        apiKey: apiKey.trim(),
        merchantId: merchantId.trim(),
        environment
      });

      if (success) {
        setIsConnected(true);
        setError("");
      } else {
        setError("Failed to connect to Boundless Pay. Please check your credentials.");
      }
    } catch (err) {
      setError("Connection failed. Please try again.");
      console.error('Boundless Pay connection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('boundless_pay_config');
    localStorage.removeItem('boundless_wallet_connections');
    setIsConnected(false);
    setApiKey("");
    setMerchantId("");
    setEnvironment('sandbox');
  };

  const maskedApiKey = apiKey ? `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}` : "";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CreditCard className="w-4 h-4" />
          Boundless Pay
          {isConnected && <CheckCircle className="w-3 h-3 text-green-500" />}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Boundless Pay Integration
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
              <div>
                <h3 className="font-medium">Boundless Pay</h3>
                <p className="text-sm text-muted-foreground">
                  {isConnected ? 'Connected and ready for payments' : 'Not configured'}
                </p>
              </div>
            </div>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* Configuration Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isConnected ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Connect your Boundless Pay account to enable real-time payments, transfers, and wallet management.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Great! Your payment system is connected and ready to process transactions.
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter your Boundless Pay API key..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    disabled={isConnected}
                  />
                  {isConnected && (
                    <p className="text-sm text-muted-foreground">
                      Current key: {maskedApiKey}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="merchant-id">Merchant ID</Label>
                  <Input
                    id="merchant-id"
                    placeholder="Enter your Merchant ID..."
                    value={merchantId}
                    onChange={(e) => setMerchantId(e.target.value)}
                    disabled={isConnected}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="environment">Environment</Label>
                <Select value={environment} onValueChange={(value: 'sandbox' | 'production') => setEnvironment(value)} disabled={isConnected}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                    <SelectItem value="production">Production (Live)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Use sandbox for testing, production for live transactions
                </p>
              </div>

              <div className="flex gap-2">
                {!isConnected ? (
                  <Button
                    onClick={handleConnect}
                    disabled={!apiKey.trim() || !merchantId.trim() || isLoading}
                    className="flex-1"
                  >
                    {isLoading ? "Connecting..." : "Connect Boundless Pay"}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleDisconnect}
                    className="flex-1"
                  >
                    Disconnect
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Features Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Send Payments
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Send money to other wallets or email addresses
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Request Payments
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Create payment requests and shareable links
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Real-time Sync
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Automatic balance updates and transaction history
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Multi-currency
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Support for multiple currencies and conversions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  To get your Boundless Pay credentials:
                </p>
                <ol className="text-sm space-y-1 ml-4 list-decimal">
                  <li>Visit the Boundless Pay Developer Portal</li>
                  <li>Create a new application or use existing one</li>
                  <li>Copy your API Key and Merchant ID</li>
                  <li>Start with sandbox environment for testing</li>
                </ol>
              </div>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open('https://developer.boundlesspay.com', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Developer Portal
              </Button>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Your credentials are stored securely in your browser and never sent to our servers.
                  Boundless Pay uses industry-standard encryption for all transactions.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};