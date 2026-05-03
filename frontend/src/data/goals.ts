import { FinancialGoal } from '@/types/goal';

export const mockGoals: FinancialGoal[] = [
  {
    id: '1',
    title: 'Emergency Fund',
    description: 'Build a safety net for unexpected expenses',
    targetAmount: 6000,
    currentAmount: 4500,
    category: 'emergency',
    priority: 'high',
    targetDate: new Date('2024-06-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    isActive: true,
    monthlyContribution: 500,
    color: 'bg-red-500',
    icon: '🚨'
  },
  {
    id: '2',
    title: 'Vacation to Europe',
    description: 'Dream trip to explore European cities',
    targetAmount: 5000,
    currentAmount: 2800,
    category: 'vacation',
    priority: 'medium',
    targetDate: new Date('2024-08-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    isActive: true,
    monthlyContribution: 400,
    color: 'bg-blue-500',
    icon: '✈️'
  },
  {
    id: '3',
    title: 'Retirement Savings',
    description: 'Long-term retirement planning',
    targetAmount: 20000,
    currentAmount: 15000,
    category: 'retirement',
    priority: 'high',
    targetDate: new Date('2024-12-31'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    isActive: true,
    monthlyContribution: 800,
    color: 'bg-green-500',
    icon: '🏖️'
  }
];

export const goalCategories = [
  { value: 'emergency', label: 'Emergency Fund', icon: '🚨', color: 'bg-red-500' },
  { value: 'vacation', label: 'Vacation', icon: '✈️', color: 'bg-blue-500' },
  { value: 'retirement', label: 'Retirement', icon: '🏖️', color: 'bg-green-500' },
  { value: 'house', label: 'House Down Payment', icon: '🏠', color: 'bg-purple-500' },
  { value: 'car', label: 'New Car', icon: '🚗', color: 'bg-orange-500' },
  { value: 'education', label: 'Education', icon: '🎓', color: 'bg-indigo-500' },
  { value: 'debt', label: 'Debt Payoff', icon: '💳', color: 'bg-pink-500' },
  { value: 'other', label: 'Other', icon: '🎯', color: 'bg-gray-500' }
] as const;