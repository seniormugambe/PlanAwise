import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Key, ExternalLink, CheckCircle, AlertCircle, Info } from "lucide-react";

export const AISettings = () => {
  const [apiKey, setApiKey] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    // Check if API key exists
    const existingKey = localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY;
    if (existingKey) {
      setApiKey(existingKey);
      setIsConnected(true);
    }
  }, []);

  const handleSaveKey = async () => {
    if (!apiKey.trim()) return;
    setIsLoading(true);
    try {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to save API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey("");
    setIsConnected(false);
  };

  const maskedKey = apiKey ? `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}` : "";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          AI Settings
          {isConnected && <CheckCircle className="w-3 h-3 text-green-500" />}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            AI Configuration
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
              <div>
                <h3 className="font-medium">Google Gemini AI</h3>
                <p className="text-sm text-muted-foreground">
                  {isConnected ? 'Connected and ready' : 'Not configured'}
                </p>
              </div>
            </div>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* API Key Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">API Key Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isConnected ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    To enable AI-powered responses, you'll need a Google Gemini API key. 
                    Don't worry - it's free to get started!
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Great! Your AI assistant is connected and ready to help with personalized financial advice.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="api-key">Gemini API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="api-key"
                    type={showKey ? "text" : "password"}
                    placeholder="Enter your Gemini API key..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setShowKey(!showKey)}
                    className="px-3"
                  >
                    {showKey ? "Hide" : "Show"}
                  </Button>
                </div>
                {isConnected && (
                  <p className="text-sm text-muted-foreground">
                    Current key: {maskedKey}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveKey}
                  disabled={!apiKey.trim() || isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Connecting..." : isConnected ? "Update Key" : "Connect AI"}
                </Button>
                {isConnected && (
                  <Button
                    variant="outline"
                    onClick={handleRemoveKey}
                  >
                    Disconnect
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How to Get Your API Key</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Follow these simple steps to get your free Gemini API key:
                </p>
                <ol className="text-sm space-y-1 ml-4 list-decimal">
                  <li>Visit Google AI Studio</li>
                  <li>Sign in with your Google account</li>
                  <li>Click "Get API Key" and create a new key</li>
                  <li>Copy the key and paste it above</li>
                </ol>
              </div>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open('https://makersuite.google.com/app/apikey', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Get Your Free API Key
              </Button>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Your API key is stored locally in your browser and never sent to our servers. 
                  Gemini offers generous free usage limits for personal use.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};