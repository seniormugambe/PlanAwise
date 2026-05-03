export interface FinancialGoal {
  id: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  category: 'emergency' | 'vacation' | 'retirement' | 'house' | 'car' | 'education' | 'debt' | 'other';
  priority: 'high' | 'medium' | 'low';
  targetDate: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  monthlyContribution?: number;
  color: string;
  icon: string;
}

export interface GoalProgress {
  goalId: string;
  amount: number;
  date: Date;
  note?: string;
  type: 'contribution' | 'withdrawal' | 'adjustment';
}

export interface GoalSummary {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  totalTargetAmount: number;
  totalCurrentAmount: number;
  overallProgress: number;
  monthlyTarget: number;
}