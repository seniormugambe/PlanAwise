import { useCallback } from "react";
import { useAppState } from "@/state/AppStateProvider";

export const useGamification = () => {
  const {
    gamification: stats,
    showLevelUp,
    showAchievement,
    addXP,
    unlockAchievement,
    updateStreaks,
    completeChallenge,
    updateChallengeProgress,
  } = useAppState();

  const getProgressToNextLevel = useCallback(() => {
    return (stats.level.currentXP / stats.level.xpToNext) * 100;
  }, [stats.level.currentXP, stats.level.xpToNext]);

  const getActiveStreaks = useCallback(() => {
    return stats.streaks.filter((streak) => streak.isActive);
  }, [stats.streaks]);

  const getActiveChallenges = useCallback(() => {
    return stats.challenges.filter((challenge) => challenge.isActive && !challenge.isCompleted);
  }, [stats.challenges]);

  const getRecentAchievements = useCallback(() => {
    return stats.achievements
      .filter((achievement) => achievement.unlocked)
      .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
      .slice(0, 3);
  }, [stats.achievements]);

  return {
    stats,
    showLevelUp,
    showAchievement,
    addXP,
    unlockAchievement,
    updateStreaks,
    completeChallenge,
    updateChallengeProgress,
    getProgressToNextLevel,
    getActiveStreaks,
    getActiveChallenges,
    getRecentAchievements,
  };
};
