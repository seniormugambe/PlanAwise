export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'saving' | 'budgeting' | 'investing' | 'goals' | 'streaks' | 'milestones';
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserLevel {
  level: number;
  title: string;
  currentXP: number;
  xpToNext: number;
  totalXP: number;
  perks: string[];
}

export interface Streak {
  id: string;
  name: string;
  description: string;
  icon: string;
  currentStreak: number;
  bestStreak: number;
  lastActivity: Date;
  isActive: boolean;
  xpPerDay: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  reward: {
    xp: number;
    badge?: string;
    title?: string;
  };
  progress: number;
  maxProgress: number;
  deadline: Date;
  isCompleted: boolean;
  isActive: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface GamificationStats {
  totalXP: number;
  level: UserLevel;
  achievements: Achievement[];
  streaks: Streak[];
  challenges: Challenge[];
  badges: Badge[];
  weeklyXP: number;
  monthlyXP: number;
  rank: string;
  nextMilestone: {
    name: string;
    progress: number;
    target: number;
  };
}