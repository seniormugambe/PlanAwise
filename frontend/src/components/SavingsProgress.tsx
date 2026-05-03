import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PiggyBank, TrendingUp } from "lucide-react";
import { useGoals } from "@/hooks/useGoals";

export const SavingsProgress = () => {
  const { getGoalSummary } = useGoals();
  const summary = getGoalSummary();

  const monthlyTarget = summary.monthlyTarget;
  const yearlyTarget = summary.totalTargetAmount;
  const currentSaved = summary.totalCurrentAmount;
  const overallProgress = Math.min(100, summary.overallProgress);
  const projection = monthlyTarget * 12 + currentSaved;
  const monthlyProgress = yearlyTarget > 0 ? Math.min(100, (monthlyTarget / (yearlyTarget / 12)) * 100) : 0;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="w-5 h-5 text-success" />
          Savings Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-sm">Goal Progress</h4>
            <div className="text-right">
              <div className="font-semibold text-success">
                ${currentSaved.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                of ${yearlyTarget.toLocaleString()}
              </div>
            </div>
          </div>
          <Progress value={overallProgress} className="h-3" />
          <div className="text-xs text-muted-foreground text-center">
            {Math.round(overallProgress)}% of overall goal progress
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-sm">Monthly Plan</h4>
            <div className="text-right">
              <div className="font-semibold text-primary">
                ${monthlyTarget.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                monthly contribution goal
              </div>
            </div>
          </div>
          <Progress value={monthlyProgress} className="h-3" />
          <div className="text-xs text-muted-foreground text-center">
            {Math.round(monthlyProgress)}% of the monthly savings plan
          </div>
        </div>

        <div className="bg-gradient-success/10 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="font-semibold text-sm">Projection</span>
          </div>
          <p className="text-xs text-muted-foreground">
            At your current contribution pace, you may reach <span className="font-semibold text-success">
            ${projection.toLocaleString()}
            </span> in the next 12 months.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
