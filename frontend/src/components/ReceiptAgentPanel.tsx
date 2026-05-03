import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AgentStatusBadge } from "@/components/AgentStatusBadge";
import { useAIAgent } from "@/hooks/useAIAgent";
import type { Receipt } from "@/services/aiAgentService";
import { AlertCircle, ReceiptText, Sparkles } from "lucide-react";

export const ReceiptAgentPanel = () => {
  const { processReceipt, isLoading, error } = useAIAgent();
  const [receiptText, setReceiptText] = useState("");
  const [result, setResult] = useState<Receipt | null>(null);

  const handleProcessReceipt = async () => {
    const receipt = await processReceipt(receiptText);
    if (receipt) {
      setResult(receipt);
      setReceiptText("");
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-primary" />
            Receipt Tracking
          </CardTitle>
          <AgentStatusBadge agent="receipt" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={receiptText}
          onChange={(event) => setReceiptText(event.target.value)}
          placeholder="Paste receipt text here..."
          className="min-h-28"
        />

        <div className="flex justify-end">
          <Button
            onClick={handleProcessReceipt}
            disabled={isLoading || !receiptText.trim()}
            className="gap-2"
          >
            <Sparkles className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Process Receipt
          </Button>
        </div>

        {result && (
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Vendor</p>
                <p className="font-semibold">{result.vendor || "Unknown"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total</p>
                <p className="font-semibold">${result.total.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Items</p>
                <p className="font-semibold">{result.items?.length || 0}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
