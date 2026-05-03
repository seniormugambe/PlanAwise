import { Achievement, UserLevel, Streak, Challenge, Badge, GamificationStats } from '@/types/gamification';

export const mockAchievements: Achievement[] = [
  {
    id: 'first-save',
    title: 'First Steps',
    description: 'Made your first savings transaction',
    icon: '🎯',
    category: 'saving',
    points: 50,
    unlocked: true,
    unlockedAt: new Date('2024-01-01'),
    progress: 1,
    maxProgress: 1,
    rarity: 'common'
  },
  {
    id: 'emergency-fund-25',
    title: 'Safety Net Builder',
    description: 'Built 25% of your emergency fund',
    icon: '🛡️',
    category: 'saving',
    points: 100,
    unlocked: true,
    unlockedAt: new Date('2024-01-10'),
    progress: 1,
    maxProgress: 1,
    rarity: 'common'
  },
  {
    id: 'budget-master',
    title: 'Budget Master',
    description: 'Stay under budget for 3 consecutive months',
    icon: '📊',
    category: 'budgeting',
    points: 200,
    unlocked: false,
    progress: 2,
    maxProgress: 3,
    rarity: 'rare'
  },
  {
    id: 'investment-starter',
    title: 'Investment Pioneer',
    description: 'Make your first investment',
    icon: '📈',
    category: 'investing',
    points: 150,
    unlocked: true,
    unlockedAt: new Date('2024-01-15'),
    progress: 1,
    maxProgress: 1,
    rarity: 'common'
  },
  {
    id: 'goal-crusher',
    title: 'Goal Crusher',
    description: 'Complete 5 financial goals',
    icon: '🏆',
    category: 'goals',
    points: 300,
    unlocked: false,
    progress: 1,
    maxProgress: 5,
    rarity: 'epic'
  },
  {
    id: 'streak-legend',
    title: 'Consistency Legend',
    description: 'Maintain a 30-day saving streak',
    icon: '🔥',
    category: 'streaks',
    points: 500,
    unlocked: false,
    progress: 15,
    maxProgress: 30,
    rarity: 'legendary'
  },
  {
    id: 'millionaire-mindset',
    title: 'Millionaire Mindset',
    description: 'Reach $100,000 in total assets',
    icon: '💎',
    category: 'milestones',
    points: 1000,
    unlocked: false,
    progress: 29750,
    maxProgress: 100000,
    rarity: 'legendary'
  }
];

export const mockUserLevel: UserLevel = {
  level: 8,
  title: 'Financial Strategist',
  currentXP: 2350,
  xpToNext: 650,
  totalXP: 2350,
  perks: [
    'Advanced analytics unlocked',
    'Priority AI advisor responses',
    'Custom goal categories',
    'Investment insights'
  ]
};

export const mockStreaks: Streak[] = [
  {
    id: 'daily-budget-check',
    name: 'Budget Tracker',
    description: 'Check your budget daily',
    icon: '📱',
    currentStreak: 15,
    bestStreak: 23,
    lastActivity: new Date(),
    isActive: true,
    xpPerDay: 10
  },
  {
    id: 'savings-streak',
    name: 'Savings Warrior',
    description: 'Save money every day',
    icon: '💰',
    currentStreak: 8,
    bestStreak: 12,
    lastActivity: new Date(),
    isActive: true,
    xpPerDay: 25
  },
  {
    id: 'no-impulse-buy',
    name: 'Impulse Control',
    description: 'Avoid impulse purchases',
    icon: '🛡️',
    currentStreak: 5,
    bestStreak: 18,
    lastActivity: new Date(Date.now() - 86400000), // Yesterday
    isActive: false,
    xpPerDay: 15
  }
];

export const mockChallenges: Challenge[] = [
  {
    id: 'weekly-savings',
    title: 'Weekly Savings Challenge',
    description: 'Save $100 this week',
    icon: '💪',
    category: 'saving',
    difficulty: 'easy',
    reward: {
      xp: 100,
      badge: 'weekly-saver'
    },
    progress: 65,
    maxProgress: 100,
    deadline: new Date(Date.now() + 3 * 86400000), // 3 days from now
    isCompleted: false,
    isActive: true
  },
  {
    id: 'expense-tracking',
    title: 'Expense Detective',
    description: 'Track all expenses for 7 days',
    icon: '🔍',
    category: 'budgeting',
    difficulty: 'medium',
    reward: {
      xp: 150,
      title: 'Budget Detective'
    },
    progress: 4,
    maxProgress: 7,
    deadline: new Date(Date.now() + 5 * 86400000),
    isCompleted: false,
    isActive: true
  },
  {
    id: 'investment-research',
    title: 'Market Scholar',
    description: 'Research 3 investment options',
    icon: '📚',
    category: 'investing',
    difficulty: 'hard',
    reward: {
      xp: 250,
      badge: 'market-scholar',
      title: 'Investment Researcher'
    },
    progress: 1,
    maxProgress: 3,
    deadline: new Date(Date.now() + 14 * 86400000),
    isCompleted: false,
    isActive: true
  }
];

export const mockBadges: Badge[] = [
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Started your financial journey',
    icon: '🐦',
    color: 'bg-blue-500',
    earnedAt: new Date('2024-01-01'),
    rarity: 'common'
  },
  {
    id: 'goal-setter',
    name: 'Goal Setter',
    description: 'Created your first financial goal',
    icon: '🎯',
    color: 'bg-green-500',
    earnedAt: new Date('2024-01-02'),
    rarity: 'common'
  },
  {
    id: 'streak-master',
    name: 'Streak Master',
    description: 'Maintained a 7-day streak',
    icon: '🔥',
    color: 'bg-orange-500',
    earnedAt: new Date('2024-01-08'),
    rarity: 'rare'
  },
  {
    id: 'investment-guru',
    name: 'Investment Guru',
    description: 'Made 10 successful investments',
    icon: '📈',
    color: 'bg-purple-500',
    earnedAt: new Date('2024-01-20'),
    rarity: 'epic'
  }
];

export const mockGamificationStats: GamificationStats = {
  totalXP: 2350,
  level: mockUserLevel,
  achievements: mockAchievements,
  streaks: mockStreaks,
  challenges: mockChallenges,
  badges: mockBadges,
  weeklyXP: 180,
  monthlyXP: 750,
  rank: 'Top 15%',
  nextMilestone: {
    name: 'Financial Expert',
    progress: 2350,
    target: 3000
  }
};