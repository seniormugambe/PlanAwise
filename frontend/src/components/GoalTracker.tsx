import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";
import { useGoals } from "@/hooks/useGoals";
import { AgentStatusBadge } from "@/components/AgentStatusBadge";

const categoryLabels: Record<string, string> = {
  emergency: 'Emergency',
  vacation: 'Planned Purchase',
  retirement: 'Recurring',
  house: 'Home',
  car: 'Vehicle',
  education: 'Education',
  debt: 'Debt Payoff',
  other: 'Other'
};

const getTimeRemaining = (targetDate: Date) => {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  if (diff <= 0) return 'Due soon';
  const months = Math.ceil(diff / (1000 * 60 * 60 * 24 * 30));
  return `${months} month${months === 1 ? '' : 's'} left`;
};

export const GoalTracker = () => {
  const { goals, calculateMonthsToGoal } = useGoals();

  const sortedGoals = useMemo(() => {
    return [...goals].sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (b.priority === 'high' && a.priority !== 'high') return 1;
      return 0;
    });
  }, [goals]);

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Financial Goals
          </CardTitle>
          <AgentStatusBadge agent="advisor" label="Goal Advisor" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {sortedGoals.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No goals configured yet. Add a goal to start tracking real progress.
          </div>
        ) : (
          sortedGoals.map((goal) => {
            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const monthsToGoal = calculateMonthsToGoal(goal);
            const deadline = monthsToGoal !== null ? `${monthsToGoal} month${monthsToGoal === 1 ? '' : 's'} left` : getTimeRemaining(goal.targetDate);

            return (
              <div key={goal.id} className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${goal.color} text-white`}>
                      <span className="text-lg">{goal.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{goal.title}</h4>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {categoryLabels[goal.category] || 'Goal'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-semibold">${goal.currentAmount.toLocaleString()}</div>
                    <div className="text-muted-foreground">of ${goal.targetAmount.toLocaleString()}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Progress value={Math.min(100, progress)} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Math.round(progress)}% complete</span>
                    <span>{deadline}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
