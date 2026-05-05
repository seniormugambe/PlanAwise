import { useMemo, useState, type FormEvent } from "react";
import { Bot, PiggyBank, Search, Send, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useFinancialChat } from "@/hooks/useFinancialChat";
import { useGoals } from "@/hooks/useGoals";
import { useWallets } from "@/hooks/useWallets";
import { buildFinancialContext } from "@/lib/financialContext";

const quickActions = [
  {
    label: "How can I save more?",
    prompt: "How can I save more money based on my current income, expenses, wallets, and goals?",
    icon: PiggyBank,
  },
  {
    label: "Analyze my spending",
    prompt: "Analyze my spending and tell me the highest-impact budget change I should make next.",
    icon: Search,
  },
  {
    label: "Is it safe to invest now?",
    prompt: "Is it safe for me to invest now, or should I prioritize savings, debt, or cash flow first?",
    icon: TrendingUp,
  },
];

export const PlanWiseCopilot = () => {
  const { messages, isLoading, sendMessage, clearChat } = useFinancialChat();
  const { transactions, getWalletSummary } = useWallets();
  const { getActiveGoals } = useGoals();
  const [question, setQuestion] = useState("");

  const walletSummary = getWalletSummary();
  const activeGoals = getActiveGoals();
  const visibleMessages = messages.filter((message) => message.id !== "welcome").slice(-4);
  const context = useMemo(
    () => buildFinancialContext(walletSummary, activeGoals, transactions),
    [walletSummary, activeGoals, transactions]
  );

  const askCopilot = async (prompt: string) => {
    const nextPrompt = prompt.trim();
    if (!nextPrompt || isLoading) return;

    await sendMessage(nextPrompt, {
      context,
      transactions: transactions.slice(-20),
    });
    setQuestion("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await askCopilot(question);
  };

  return (
    <Card className="border-primary/30 bg-card text-left shadow-card dark:border-primary/35">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Bot className="h-5 w-5 text-primary" />
              PlanWise AI Copilot
            </CardTitle>
            <CardDescription className="text-foreground/75">
              Ask about your finances and get a contextual answer from the agent system.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="w-fit">
            <Sparkles className="mr-1 h-3 w-3" />
            Interactive
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask AI about your finances..."
            className="min-h-20 resize-none"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => askCopilot(action.prompt)}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {action.label}
                  </Button>
                );
              })}
            </div>
            <Button type="submit" disabled={isLoading || !question.trim()} className="gap-2">
              {isLoading ? <Sparkles className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Ask AI
            </Button>
          </div>
        </form>

        <div className="rounded-md border border-border/80 bg-muted/30 p-4 shadow-sm dark:bg-background/35">
          {visibleMessages.length === 0 ? (
            <div className="flex items-start gap-3 text-sm text-foreground/80">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
              <p>
                Copilot uses your wallet totals, recent transactions, goals, and chat context. Money-moving actions still require approval.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleMessages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-md p-3 text-sm ${
                    message.isUser
                      ? "ml-auto max-w-[88%] bg-primary text-primary-foreground"
                      : "mr-auto max-w-[92%] border border-border/80 bg-background text-foreground shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  {!message.isUser && (
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {message.agentUsed && <span>{Array.isArray(message.agentUsed) ? message.agentUsed.join(", ") : message.agentUsed}</span>}
                      {typeof message.confidence === "number" && <span>{Math.round(message.confidence * 100)}% confidence</span>}
                    </div>
                  )}
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" onClick={clearChat}>
                Clear chat
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
