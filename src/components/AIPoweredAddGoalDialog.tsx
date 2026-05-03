import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGoals } from "@/hooks/useGoals";
import { useWallets } from "@/hooks/useWallets";
import { useAIAgent } from "@/hooks/useAIAgent";
import { Plus, Sparkles, Target, TrendingUp, PiggyBank, Lightbulb, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AISuggestedGoal {
  title: string;
  description: string;
  targetAmount: number;
  category: string;
  timeframe: string;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  expectedSavings: number;
}

export const AIPoweredAddGoalDialog = () => {
  const [open, setOpen] = useState(false);
  const [isAISuggesting, setIsAISuggesting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestedGoal[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestedGoal | null>(null);
  const [customGoal, setCustomGoal] = useState({
    title: '',
    description: '',
    targetAmount: '',
    category: '',
    timeframe: ''
  });

  const { addGoal } = useGoals();
  const { getWalletSummary } = useWallets();
  const { processQuery } = useAIAgent();
  const { toast } = useToast();

  const summary = getWalletSummary();

  const generateAISuggestions = async () => {
    setIsAISuggesting(true);

    try {
      const prompt = `
        Based on this financial profile, suggest 3 personalized financial goals:
        - Monthly Income: $${summary.monthlyIncome || 0}
        - Monthly Expenses: $${summary.monthlyExpenses || 0}
        - Current Savings: $${summary.totalAssets || 0}
        - Total Balance: $${summary.totalBalance || 0}
        - Existing Goals: ${summary.goals?.length || 0}

        For each goal, provide:
        1. Title (concise, motivating)
        2. Description (2-3 sentences)
        3. Target Amount (realistic based on their financial situation)
        4. Category (Emergency Fund, Vacation, Car, House, Education, Retirement, Investment, Debt Payoff, etc.)
        5. Timeframe (3 months, 6 months, 1 year, 2 years, 5 years)
        6. Reasoning (why this goal suits their situation)
        7. Priority (high/medium/low)
        8. Expected Monthly Savings needed

        Return as JSON array of goal objects.
      `;

      const response = await processQuery(prompt);

      if (response?.answer) {
        try {
          // Try to parse JSON from the response
          const suggestions = extractGoalsFromText(response.answer);
          setAiSuggestions(suggestions);
        } catch (parseError) {
          console.error('Error parsing AI suggestions:', parseError);
          // Fallback suggestions
          setAiSuggestions(getFallbackSuggestions());
        }
      } else {
        setAiSuggestions(getFallbackSuggestions());
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      setAiSuggestions(getFallbackSuggestions());
    } finally {
      setIsAISuggesting(false);
    }
  };

  const extractGoalsFromText = (text: string): AISuggestedGoal[] => {
    try {
      // Look for JSON in the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback: extract goals from text format
      const goals: AISuggestedGoal[] = [];
      const sections = text.split(/\d+\.\s+/).filter(s => s.trim());

      for (let i = 0; i < Math.min(sections.length, 3); i++) {
        const section = sections[i];
        // Parse goal from text - this is a simplified parser
        const lines = section.split('\n').map(l => l.trim()).filter(l => l);

        if (lines.length >= 5) {
          goals.push({
            title: lines[0] || `Goal ${i + 1}`,
            description: lines[1] || 'AI-suggested financial goal',
            targetAmount: parseFloat(lines[2]?.replace(/[^0-9.]/g, '') || '1000'),
            category: lines[3] || 'Savings',
            timeframe: lines[4] || '1 year',
            reasoning: lines[5] || 'Based on your financial profile',
            priority: 'medium' as const,
            expectedSavings: 100
          });
        }
      }

      return goals.length > 0 ? goals : getFallbackSuggestions();
    } catch (error) {
      return getFallbackSuggestions();
    }
  };

  const getFallbackSuggestions = (): AISuggestedGoal[] => [
    {
      title: "Emergency Fund",
      description: "Build a 3-6 month emergency fund to protect against unexpected expenses.",
      targetAmount: Math.max(3000, summary.monthlyExpenses * 3),
      category: "Emergency Fund",
      timeframe: "6 months",
      reasoning: "Everyone needs an emergency fund. Based on your expenses, this is a realistic target.",
      priority: "high",
      expectedSavings: Math.max(200, summary.monthlyIncome * 0.1)
    },
    {
      title: "Vacation Fund",
      description: "Save for your dream vacation or a staycation to recharge and create memories.",
      targetAmount: 2000,
      category: "Vacation",
      timeframe: "1 year",
      reasoning: "Travel goals help maintain work-life balance and provide motivation for saving.",
      priority: "medium",
      expectedSavings: 167
    },
    {
      title: "Investment Starter",
      description: "Begin investing regularly to build long-term wealth through compound growth.",
      targetAmount: 1000,
      category: "Investment",
      timeframe: "3 months",
      reasoning: "Starting small with investments can lead to significant growth over time.",
      priority: "medium",
      expectedSavings: 333
    }
  ];

  const handleSelectSuggestion = (suggestion: AISuggestedGoal) => {
    setSelectedSuggestion(suggestion);
    setCustomGoal({
      title: suggestion.title,
      description: suggestion.description,
      targetAmount: suggestion.targetAmount.toString(),
      category: suggestion.category,
      timeframe: suggestion.timeframe
    });
  };

  const handleCreateGoal = async () => {
    const goalData = selectedSuggestion || customGoal;

    if (!goalData.title || !goalData.targetAmount) {
      toast({
        title: "Missing Information",
        description: "Please provide a goal title and target amount.",
        variant: "destructive"
      });
      return;
    }

    try {
      await addGoal({
        title: goalData.title,
        description: goalData.description,
        targetAmount: parseFloat(goalData.targetAmount),
        category: goalData.category,
        deadline: calculateDeadline(goalData.timeframe),
        priority: selectedSuggestion?.priority || 'medium'
      });

      toast({
        title: "Goal Created!",
        description: `${goalData.title} has been added to your goals.`,
      });

      setOpen(false);
      setSelectedSuggestion(null);
      setCustomGoal({
        title: '',
        description: '',
        targetAmount: '',
        category: '',
        timeframe: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive"
      });
    }
  };

  const calculateDeadline = (timeframe: string): Date => {
    const now = new Date();
    const months = timeframe.includes('month') ? parseInt(timeframe) :
                   timeframe.includes('year') ? parseInt(timeframe) * 12 : 12;
    now.setMonth(now.getMonth() + months);
    return now;
  };

  useEffect(() => {
    if (open && aiSuggestions.length === 0) {
      generateAISuggestions();
    }
  }, [open]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI-Powered Goal Creation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* AI Suggestions Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                AI-Suggested Goals
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={generateAISuggestions}
                disabled={isAISuggesting}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isAISuggesting ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {isAISuggesting ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiSuggestions.map((suggestion, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedSuggestion === suggestion ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{suggestion.title}</CardTitle>
                        <Badge className={getPriorityColor(suggestion.priority)}>
                          {suggestion.priority.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{suggestion.description}</p>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Target:</span>
                          <span className="font-semibold">${suggestion.targetAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Timeframe:</span>
                          <span>{suggestion.timeframe}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Monthly Savings:</span>
                          <span className="text-green-600">${suggestion.expectedSavings}</span>
                        </div>
                      </div>

                      <Alert>
                        <Target className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {suggestion.reasoning}
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Custom Goal Form */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">
              {selectedSuggestion ? 'Customize Selected Goal' : 'Create Custom Goal'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  value={customGoal.title}
                  onChange={(e) => setCustomGoal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Emergency Fund, New Car, Vacation"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount ($)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  value={customGoal.targetAmount}
                  onChange={(e) => setCustomGoal(prev => ({ ...prev, targetAmount: e.target.value }))}
                  placeholder="5000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={customGoal.category} onValueChange={(value) => setCustomGoal(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Emergency Fund">Emergency Fund</SelectItem>
                    <SelectItem value="Vacation">Vacation</SelectItem>
                    <SelectItem value="Car">Car</SelectItem>
                    <SelectItem value="House">House</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Retirement">Retirement</SelectItem>
                    <SelectItem value="Investment">Investment</SelectItem>
                    <SelectItem value="Debt Payoff">Debt Payoff</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeframe">Timeframe</Label>
                <Select value={customGoal.timeframe} onValueChange={(value) => setCustomGoal(prev => ({ ...prev, timeframe: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3 months">3 months</SelectItem>
                    <SelectItem value="6 months">6 months</SelectItem>
                    <SelectItem value="1 year">1 year</SelectItem>
                    <SelectItem value="2 years">2 years</SelectItem>
                    <SelectItem value="5 years">5 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={customGoal.description}
                  onChange={(e) => setCustomGoal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your goal and why it's important to you..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGoal} className="gap-2">
              <Target className="w-4 h-4" />
              Create Goal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};