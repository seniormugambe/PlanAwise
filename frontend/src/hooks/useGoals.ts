import { useCallback } from "react";
import { FinancialGoal, GoalProgress, GoalSummary } from "@/types/goal";
import { useAppState } from "@/state/AppStateProvider";

export const useGoals = () => {
  const {
    goals,
    goalProgress,
    addGoal,
    updateGoal,
    deleteGoal,
    addProgress,
  } = useAppState();

  const getGoalById = useCallback(
    (id: string) => {
      return goals.find((goal) => goal.id === id);
    },
    [goals]
  );

  const getActiveGoals = useCallback(() => {
    return goals.filter((goal) => goal.isActive);
  }, [goals]);

  const getGoalSummary = useCallback((): GoalSummary => {
    const activeGoals = getActiveGoals();
    const completedGoals = goals.filter((goal) => goal.currentAmount >= goal.targetAmount);

    const totalTargetAmount = activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalCurrentAmount = activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const overallProgress =
      totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;
    const monthlyTarget = activeGoals.reduce(
      (sum, goal) => sum + (goal.monthlyContribution || 0),
      0
    );

    return {
      totalGoals: goals.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      totalTargetAmount,
      totalCurrentAmount,
      overallProgress,
      monthlyTarget,
    };
  }, [goals, getActiveGoals]);

  const getGoalProgress = useCallback(
    (goalId: string) => {
      return goalProgress.filter((progress) => progress.goalId === goalId);
    },
    [goalProgress]
  );

  const calculateMonthsToGoal = useCallback((goal: FinancialGoal) => {
    if (!goal.monthlyContribution || goal.monthlyContribution <= 0) return null;

    const remaining = goal.targetAmount - goal.currentAmount;
    if (remaining <= 0) return 0;

    return Math.ceil(remaining / goal.monthlyContribution);
  }, []);

  const getGoalsByCategory = useCallback(
    (category: FinancialGoal["category"]) => {
      return goals.filter((goal) => goal.category === category && goal.isActive);
    },
    [goals]
  );

  return {
    goals,
    goalProgress,
    getGoalById,
    getActiveGoals,
    getGoalSummary,
    addGoal: addGoal as (
      goalData: Omit<FinancialGoal, "id" | "createdAt" | "updatedAt">
    ) => FinancialGoal,
    updateGoal,
    deleteGoal,
    addProgress: addProgress as (progress: Omit<GoalProgress, "date">) => GoalProgress,
    getGoalProgress,
    calculateMonthsToGoal,
    getGoalsByCategory,
  };
};
