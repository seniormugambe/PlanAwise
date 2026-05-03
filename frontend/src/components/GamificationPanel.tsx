import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Star, 
  Flame, 
  Target, 
  Award, 
  TrendingUp,
  Calendar,
  Zap,
  Crown,
  Medal
} from "lucide-react";
import { useGamification } from "@/hooks/useGamification";

export const GamificationPanel = () => {
  const { 
    stats, 
    getProgressToNextLevel, 
    getActiveStreaks, 
    getActiveChallenges, 
    getRecentAchievements 
  } = useGamification();

  const activeStreaks = getActiveStreaks();
  const activeChallenges = getActiveChallenges();
  const recentAchievements = getRecentAchievements();

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-muted-foreground bg-muted';
      case 'rare': return 'text-blue-700 bg-blue-500/10 dark:text-blue-300';
      case 'epic': return 'text-purple-700 bg-purple-500/10 dark:text-purple-300';
      case 'legendary': return 'text-amber-700 bg-amber-500/10 dark:text-amber-300';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-700 bg-green-500/10 dark:text-green-300';
      case 'medium': return 'text-amber-700 bg-amber-500/10 dark:text-amber-300';
      case 'hard': return 'text-red-700 bg-red-500/10 dark:text-red-300';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <Card className="wallet-card card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gradient-primary">
          <Trophy className="w-5 h-5 text-primary" />
          Your Progress
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Level Progress */}
        <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Level {stats.level.level}</h3>
                <p className="text-sm text-muted-foreground">{stats.level.title}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{stats.totalXP.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total XP</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {stats.level.level + 1}</span>
              <span>{stats.level.currentXP} / {stats.level.xpToNext} XP</span>
            </div>
            <Progress value={getProgressToNextLevel()} className="h-3" />
          </div>
        </div>

        <Tabs defaultValue="achievements" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="achievements" className="text-xs">
              <Award className="w-3 h-3 mr-1" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="streaks" className="text-xs">
              <Flame className="w-3 h-3 mr-1" />
              Streaks
            </TabsTrigger>
            <TabsTrigger value="challenges" className="text-xs">
              <Target className="w-3 h-3 mr-1" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="badges" className="text-xs">
              <Medal className="w-3 h-3 mr-1" />
              Badges
            </TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Recent Achievements</h4>
              <Badge variant="secondary">
                {stats.achievements.filter(a => a.unlocked).length} / {stats.achievements.length}
              </Badge>
            </div>
            {recentAchievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-3 p-3 bg-card rounded-lg border animate-fade-in">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium">{achievement.title}</h5>
                    <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                      {achievement.rarity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs font-medium">{achievement.points} XP</span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Locked Achievements */}
            <div className="space-y-2">
              <h5 className="font-medium text-sm text-muted-foreground">In Progress</h5>
              {stats.achievements.filter(a => !a.unlocked).slice(0, 2).map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border-dashed border">
                  <div className="text-2xl opacity-50">{achievement.icon}</div>
                  <div className="flex-1">
                    <h5 className="font-medium opacity-75">{achievement.title}</h5>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    <div className="mt-2">
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="h-2" 
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {achievement.progress} / {achievement.maxProgress}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="streaks" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Active Streaks</h4>
              <Badge variant="secondary">{activeStreaks.length} active</Badge>
            </div>
            {stats.streaks.map((streak) => (
              <div key={streak.id} className={`flex items-center gap-3 p-3 rounded-lg border ${
                streak.isActive ? 'bg-card' : 'bg-muted/30 opacity-75'
              }`}>
                <div className="text-2xl">{streak.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium">{streak.name}</h5>
                    {streak.isActive && <Flame className="w-4 h-4 text-orange-500" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{streak.description}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold text-primary">{streak.currentStreak}</span>
                      <span className="text-xs text-muted-foreground">current</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{streak.bestStreak}</span>
                      <span className="text-xs text-muted-foreground">best</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs">{streak.xpPerDay} XP/day</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="challenges" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Active Challenges</h4>
              <Badge variant="secondary">{activeChallenges.length} active</Badge>
            </div>
            {activeChallenges.map((challenge) => (
              <div key={challenge.id} className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                <div className="text-2xl">{challenge.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium">{challenge.title}</h5>
                    <Badge className={`text-xs ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{challenge.description}</p>
                  <div className="space-y-2">
                    <Progress 
                      value={(challenge.progress / challenge.maxProgress) * 100} 
                      className="h-2" 
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span>{challenge.progress} / {challenge.maxProgress}</span>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>{Math.ceil((challenge.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs font-medium">{challenge.reward.xp} XP reward</span>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="badges" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Earned Badges</h4>
              <Badge variant="secondary">{stats.badges.length} earned</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {stats.badges.map((badge) => (
                <div key={badge.id} className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                  <div className={`w-10 h-10 ${badge.color} rounded-full flex items-center justify-center text-white text-lg`}>
                    {badge.icon}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-sm">{badge.name}</h5>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                    <Badge className={`text-xs mt-1 ${getRarityColor(badge.rarity)}`}>
                      {badge.rarity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
