import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { apiUrl } from "@/lib/api";
import { FinancialGoal, GoalProgress } from "@/types/goal";
import { Achievement, GamificationStats } from "@/types/gamification";
import { Wallet, WalletTransaction } from "@/types/wallet";

const initialGamificationStats: GamificationStats = {
  totalXP: 0,
  level: {
    level: 1,
    title: "Financial Novice",
    currentXP: 0,
    xpToNext: 100,
    totalXP: 0,
    perks: [],
  },
  achievements: [],
  streaks: [],
  challenges: [],
  badges: [],
  weeklyXP: 0,
  monthlyXP: 0,
  rank: "N/A",
  nextMilestone: {
    name: "First milestone",
    progress: 0,
    target: 100,
  },
};

interface AppState {
  wallets: Wallet[];
  transactions: WalletTransaction[];
  goals: FinancialGoal[];
  goalProgress: GoalProgress[];
  gamification: GamificationStats;
  dataLoaded: boolean;
}

type AppAction =
  | { type: "SET_WALLET_DATA"; wallets: Wallet[]; transactions: WalletTransaction[] }
  | { type: "ADD_TRANSACTION"; transaction: WalletTransaction }
  | { type: "SET_WALLETS"; wallets: Wallet[] }
  | { type: "ADD_WALLET"; wallet: Wallet }
  | { type: "UPDATE_WALLET"; id: string; updates: Partial<Wallet> }
  | { type: "DELETE_WALLET"; id: string }
  | { type: "SET_GOALS"; goals: FinancialGoal[] }
  | { type: "ADD_GOAL"; goal: FinancialGoal }
  | { type: "UPDATE_GOAL"; id: string; updates: Partial<FinancialGoal> }
  | { type: "DELETE_GOAL"; id: string }
  | { type: "ADD_GOAL_PROGRESS"; progress: GoalProgress }
  | { type: "SET_GAMIFICATION"; stats: GamificationStats };

interface AppStateContextValue extends AppState {
  isLoading: boolean;
  showLevelUp: boolean;
  showAchievement: Achievement | null;
  addTransaction: (transaction: Omit<WalletTransaction, "id">) => WalletTransaction;
  setWallets: (wallets: Wallet[]) => void;
  addWallet: (wallet: Omit<Wallet, "id" | "lastUpdated">) => Wallet;
  updateWallet: (id: string, updates: Partial<Wallet>) => void;
  deleteWallet: (id: string) => void;
  addGoal: (goal: Omit<FinancialGoal, "id" | "createdAt" | "updatedAt">) => FinancialGoal;
  updateGoal: (id: string, updates: Partial<FinancialGoal>) => void;
  deleteGoal: (id: string) => void;
  addProgress: (progress: Omit<GoalProgress, "date">) => GoalProgress;
  addXP: (amount: number, reason?: string) => void;
  unlockAchievement: (achievementId: string) => void;
  updateStreaks: (streakId: string, increment?: boolean) => void;
  completeChallenge: (challengeId: string) => void;
  updateChallengeProgress: (challengeId: string, progress: number) => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

const parseWallet = (raw: any): Wallet => ({
  ...raw,
  lastUpdated: new Date(raw.lastUpdated),
});

const parseTransaction = (raw: any): WalletTransaction => ({
  ...raw,
  date: new Date(raw.date),
});

const parseGoal = (raw: any): FinancialGoal => ({
  ...raw,
  targetDate: new Date(raw.targetDate),
  createdAt: new Date(raw.createdAt),
  updatedAt: new Date(raw.updatedAt),
});

const parseStats = (raw: any): GamificationStats => ({
  ...raw,
  achievements: Array.isArray(raw.achievements)
    ? raw.achievements.map((achievement: any) => ({
        ...achievement,
        unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined,
      }))
    : [],
  streaks: Array.isArray(raw.streaks)
    ? raw.streaks.map((streak: any) => ({
        ...streak,
        lastActivity: new Date(streak.lastActivity),
      }))
    : [],
  challenges: Array.isArray(raw.challenges)
    ? raw.challenges.map((challenge: any) => ({
        ...challenge,
        deadline: new Date(challenge.deadline),
      }))
    : [],
  badges: Array.isArray(raw.badges)
    ? raw.badges.map((badge: any) => ({
        ...badge,
        earnedAt: new Date(badge.earnedAt),
      }))
    : [],
});

const getLevelTitle = (level: number): string => {
  if (level < 5) return "Financial Novice";
  if (level < 10) return "Budget Apprentice";
  if (level < 15) return "Savings Specialist";
  if (level < 20) return "Investment Strategist";
  if (level < 25) return "Financial Advisor";
  if (level < 30) return "Wealth Builder";
  return "Financial Master";
};

const reducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SET_WALLET_DATA":
      return {
        ...state,
        wallets: action.wallets,
        transactions: action.transactions,
        dataLoaded: true,
      };
    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [action.transaction, ...state.transactions],
        wallets: state.wallets.map((wallet) =>
          wallet.id === action.transaction.walletId
            ? {
                ...wallet,
                balance: wallet.balance + action.transaction.amount,
                lastUpdated: new Date(),
              }
            : wallet
        ),
      };
    case "SET_WALLETS":
      return { ...state, wallets: action.wallets };
    case "ADD_WALLET":
      return { ...state, wallets: [...state.wallets, action.wallet] };
    case "UPDATE_WALLET":
      return {
        ...state,
        wallets: state.wallets.map((wallet) =>
          wallet.id === action.id ? { ...wallet, ...action.updates, lastUpdated: new Date() } : wallet
        ),
      };
    case "DELETE_WALLET":
      return {
        ...state,
        wallets: state.wallets.filter((wallet) => wallet.id !== action.id),
        transactions: state.transactions.filter((transaction) => transaction.walletId !== action.id),
      };
    case "SET_GOALS":
      return { ...state, goals: action.goals };
    case "ADD_GOAL":
      return { ...state, goals: [...state.goals, action.goal] };
    case "UPDATE_GOAL":
      return {
        ...state,
        goals: state.goals.map((goal) =>
          goal.id === action.id ? { ...goal, ...action.updates, updatedAt: new Date() } : goal
        ),
      };
    case "DELETE_GOAL":
      return {
        ...state,
        goals: state.goals.filter((goal) => goal.id !== action.id),
        goalProgress: state.goalProgress.filter((progress) => progress.goalId !== action.id),
      };
    case "ADD_GOAL_PROGRESS":
      return {
        ...state,
        goalProgress: [...state.goalProgress, action.progress],
        goals: state.goals.map((goal) => {
          if (goal.id !== action.progress.goalId) return goal;
          const currentAmount =
            action.progress.type === "withdrawal"
              ? Math.max(0, goal.currentAmount - action.progress.amount)
              : goal.currentAmount + action.progress.amount;

          return { ...goal, currentAmount, updatedAt: new Date() };
        }),
      };
    case "SET_GAMIFICATION":
      return { ...state, gamification: action.stats };
    default:
      return state;
  }
};

const applyXP = (stats: GamificationStats, amount: number) => {
  const totalXP = stats.totalXP + amount;
  const currentXP = stats.level.currentXP + amount;
  const leveledUp = currentXP >= stats.level.xpToNext;
  const level = leveledUp
    ? {
        ...stats.level,
        level: stats.level.level + 1,
        currentXP: currentXP - stats.level.xpToNext,
        xpToNext: Math.floor(stats.level.xpToNext * 1.2),
        totalXP,
        title: getLevelTitle(stats.level.level + 1),
      }
    : {
        ...stats.level,
        currentXP,
        totalXP,
      };

  return {
    stats: {
      ...stats,
      totalXP,
      level,
      weeklyXP: stats.weeklyXP + amount,
      monthlyXP: stats.monthlyXP + amount,
    },
    leveledUp,
  };
};

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, {
    wallets: [],
    transactions: [],
    goals: [],
    goalProgress: [],
    gamification: initialGamificationStats,
    dataLoaded: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAppData = async () => {
      setIsLoading(true);

      const [walletResult, goalResult, gamificationResult] = await Promise.allSettled([
        fetch(apiUrl("/api/data/wallets")),
        fetch(apiUrl("/api/data/goals")),
        fetch(apiUrl("/api/data/gamification")),
      ]);

      if (!isMounted) return;

      if (walletResult.status === "fulfilled" && walletResult.value.ok) {
        const data = await walletResult.value.json();
        dispatch({
          type: "SET_WALLET_DATA",
          wallets: Array.isArray(data.wallets) ? data.wallets.map(parseWallet) : [],
          transactions: Array.isArray(data.transactions) ? data.transactions.map(parseTransaction) : [],
        });
      } else {
        dispatch({ type: "SET_WALLET_DATA", wallets: [], transactions: [] });
      }

      if (goalResult.status === "fulfilled" && goalResult.value.ok) {
        const data = await goalResult.value.json();
        dispatch({
          type: "SET_GOALS",
          goals: Array.isArray(data.goals) ? data.goals.map(parseGoal) : [],
        });
      } else {
        dispatch({ type: "SET_GOALS", goals: [] });
      }

      if (gamificationResult.status === "fulfilled" && gamificationResult.value.ok) {
        const data = await gamificationResult.value.json();
        dispatch({
          type: "SET_GAMIFICATION",
          stats: data.stats ? parseStats(data.stats) : initialGamificationStats,
        });
      } else {
        dispatch({ type: "SET_GAMIFICATION", stats: initialGamificationStats });
      }

      setIsLoading(false);
    };

    loadAppData().catch((error) => {
      console.error("Error loading app state:", error);
      if (isMounted) {
        dispatch({ type: "SET_WALLET_DATA", wallets: [], transactions: [] });
        dispatch({ type: "SET_GOALS", goals: [] });
        dispatch({ type: "SET_GAMIFICATION", stats: initialGamificationStats });
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const addTransaction = useCallback((transaction: Omit<WalletTransaction, "id">) => {
    const newTransaction: WalletTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    dispatch({ type: "ADD_TRANSACTION", transaction: newTransaction });
    return newTransaction;
  }, []);

  const setWallets = useCallback((wallets: Wallet[]) => {
    dispatch({ type: "SET_WALLETS", wallets });
  }, []);

  const addWallet = useCallback((wallet: Omit<Wallet, "id" | "lastUpdated">) => {
    const newWallet: Wallet = {
      ...wallet,
      id: Date.now().toString(),
      lastUpdated: new Date(),
    };
    dispatch({ type: "ADD_WALLET", wallet: newWallet });
    return newWallet;
  }, []);

  const updateWallet = useCallback((id: string, updates: Partial<Wallet>) => {
    dispatch({ type: "UPDATE_WALLET", id, updates });
  }, []);

  const deleteWallet = useCallback((id: string) => {
    dispatch({ type: "DELETE_WALLET", id });
  }, []);

  const addGoal = useCallback((goalData: Omit<FinancialGoal, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date();
    const goal: FinancialGoal = {
      ...goalData,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: "ADD_GOAL", goal });
    return goal;
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<FinancialGoal>) => {
    dispatch({ type: "UPDATE_GOAL", id, updates });
  }, []);

  const deleteGoal = useCallback((id: string) => {
    dispatch({ type: "DELETE_GOAL", id });
  }, []);

  const addProgress = useCallback((progress: Omit<GoalProgress, "date">) => {
    const newProgress: GoalProgress = {
      ...progress,
      date: new Date(),
    };
    dispatch({ type: "ADD_GOAL_PROGRESS", progress: newProgress });
    return newProgress;
  }, []);

  const addXP = useCallback(
    (amount: number, _reason?: string) => {
      const result = applyXP(state.gamification, amount);
      dispatch({ type: "SET_GAMIFICATION", stats: result.stats });

      if (result.leveledUp) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 5000);
      }
    },
    [state.gamification]
  );

  const unlockAchievement = useCallback(
    (achievementId: string) => {
      const achievement = state.gamification.achievements.find((item) => item.id === achievementId);
      if (!achievement || achievement.unlocked) return;

      const unlockedAchievement = {
        ...achievement,
        unlocked: true,
        unlockedAt: new Date(),
      };

      const statsWithAchievement = {
        ...state.gamification,
        achievements: state.gamification.achievements.map((item) =>
          item.id === achievementId ? unlockedAchievement : item
        ),
      };
      const result = applyXP(statsWithAchievement, achievement.points);

      dispatch({ type: "SET_GAMIFICATION", stats: result.stats });
      setShowAchievement(unlockedAchievement);
      setTimeout(() => setShowAchievement(null), 5000);

      if (result.leveledUp) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 5000);
      }
    },
    [state.gamification]
  );

  const updateStreaks = useCallback(
    (streakId: string, increment = true) => {
      let xpToAdd = 0;
      const nextStats = {
        ...state.gamification,
        streaks: state.gamification.streaks.map((streak) => {
          if (streak.id !== streakId) return streak;
          const currentStreak = increment ? streak.currentStreak + 1 : 0;
          xpToAdd = increment ? streak.xpPerDay : 0;

          return {
            ...streak,
            currentStreak,
            bestStreak: Math.max(streak.bestStreak, currentStreak),
            lastActivity: new Date(),
            isActive: increment,
          };
        }),
      };
      const result = xpToAdd > 0 ? applyXP(nextStats, xpToAdd) : { stats: nextStats, leveledUp: false };

      dispatch({ type: "SET_GAMIFICATION", stats: result.stats });
      if (result.leveledUp) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 5000);
      }
    },
    [state.gamification]
  );

  const completeChallenge = useCallback(
    (challengeId: string) => {
      let xpToAdd = 0;
      const nextStats = {
        ...state.gamification,
        challenges: state.gamification.challenges.map((challenge) => {
          if (challenge.id !== challengeId || challenge.isCompleted) return challenge;
          xpToAdd = challenge.reward.xp;
          return { ...challenge, isCompleted: true, progress: challenge.maxProgress };
        }),
      };
      const result = xpToAdd > 0 ? applyXP(nextStats, xpToAdd) : { stats: nextStats, leveledUp: false };

      dispatch({ type: "SET_GAMIFICATION", stats: result.stats });
      if (result.leveledUp) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 5000);
      }
    },
    [state.gamification]
  );

  const updateChallengeProgress = useCallback(
    (challengeId: string, progress: number) => {
      dispatch({
        type: "SET_GAMIFICATION",
        stats: {
          ...state.gamification,
          challenges: state.gamification.challenges.map((challenge) => {
            if (challenge.id !== challengeId) return challenge;
            const nextProgress = Math.min(progress, challenge.maxProgress);
            return { ...challenge, progress: nextProgress };
          }),
        },
      });

      const challenge = state.gamification.challenges.find((item) => item.id === challengeId);
      if (challenge && progress >= challenge.maxProgress && !challenge.isCompleted) {
        completeChallenge(challengeId);
      }
    },
    [completeChallenge, state.gamification]
  );

  const value = useMemo<AppStateContextValue>(
    () => ({
      ...state,
      isLoading,
      showLevelUp,
      showAchievement,
      addTransaction,
      setWallets,
      addWallet,
      updateWallet,
      deleteWallet,
      addGoal,
      updateGoal,
      deleteGoal,
      addProgress,
      addXP,
      unlockAchievement,
      updateStreaks,
      completeChallenge,
      updateChallengeProgress,
    }),
    [
      state,
      isLoading,
      showLevelUp,
      showAchievement,
      addTransaction,
      setWallets,
      addWallet,
      updateWallet,
      deleteWallet,
      addGoal,
      updateGoal,
      deleteGoal,
      addProgress,
      addXP,
      unlockAchievement,
      updateStreaks,
      completeChallenge,
      updateChallengeProgress,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return context;
};
