import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Key, ExternalLink, CheckCircle, AlertCircle, Info } from "lucide-react";
import { apiUrl, guardedFetch } from "@/lib/api";

interface AIStatus {
  connected?: boolean;
  agents?: Record<string, string>;
  ai?: {
    provider?: "gemini" | "vertex" | "openai";
    model?: string;
  };
}

export const AISettings = () => {
  const [apiKey, setApiKey] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [aiProvider, setAiProvider] = useState<"gemini" | "vertex" | "openai" | null>(null);
  const [aiModel, setAiModel] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const existingKey = localStorage.getItem('openai_api_key') || import.meta.env.VITE_OPENAI_API_KEY;
      if (existingKey) {
        setApiKey(existingKey);
      }

      try {
        const response = await guardedFetch(apiUrl('/api/ai/manager/status'), {
          headers: {
            ...((existingKey) ? { 'x-api-key': existingKey } : {}),
          },
        });

        if (response.ok) {
          const data: AIStatus = await response.json();
          const agents = data.agents || {};
          const agentsActive = Object.values(agents).some((status) => status === "active");
          setIsConnected(Boolean(data.connected) || agentsActive);
          setAiProvider(data.ai?.provider || null);
          setAiModel(data.ai?.model || null);
          return;
        }
      } catch (error) {
        console.error('Failed to check AI status:', error);
      }

      setIsConnected(Boolean(existingKey));
    };

    checkStatus();
    const intervalId = window.setInterval(checkStatus, 10000);

    return () => window.clearInterval(intervalId);
  }, []);

  const handleSaveKey = async () => {
    if (!apiKey.trim()) return;
    setIsLoading(true);
    try {
      localStorage.setItem('openai_api_key', apiKey.trim());
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to save API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveKey = () => {
    localStorage.removeItem('openai_api_key');
    setApiKey("");
    setIsConnected(false);
  };

  const maskedKey = apiKey ? `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}` : "";
  const providerLabel = aiProvider === "openai"
    ? "OpenAI"
    : aiProvider === "vertex"
      ? "Google Cloud Vertex AI"
      : "AI Provider";

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
                <h3 className="font-medium">
                  {providerLabel}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isConnected ? `Ready${aiModel ? ` with ${aiModel}` : ''}` : 'Not configured'}
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
                    To enable AI-powered responses, configure `OPENAI_API_KEY` on the backend.
                    Browser API keys are optional for local testing only.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Great! Your AI assistant is connected through {providerLabel} and ready to help with personalized financial advice.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="api-key">Optional Local AI API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="api-key"
                    type={showKey ? "text" : "password"}
                    placeholder="Prefer backend OPENAI_API_KEY for production"
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
                  {isLoading ? "Connecting..." : isConnected ? "Update Local Key" : "Connect AI"}
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
                  For OpenAI, create an API key in your OpenAI dashboard and place it in
                  `backend/.env` as `OPENAI_API_KEY`.
                </p>
                <ol className="text-sm space-y-1 ml-4 list-decimal">
                  <li>Open the OpenAI API keys page</li>
                  <li>Create a new secret key</li>
                  <li>Set `AI_PROVIDER=openai` and `OPENAI_API_KEY=...` in the backend env</li>
                  <li>Restart the backend</li>
                </ol>
              </div>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open('https://platform.openai.com/api-keys', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open OpenAI API Keys
              </Button>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  For production, keep AI keys on the backend. Do not ship OpenAI keys in frontend environment variables.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
