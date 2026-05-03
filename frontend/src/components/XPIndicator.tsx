import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Star, Crown, Zap } from "lucide-react";
import { useGamification } from "@/hooks/useGamification";

export const XPIndicator = () => {
  const { stats, getProgressToNextLevel } = useGamification();

  return (
    <div className="flex items-center gap-3 p-3 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
          <Crown className="w-4 h-4 text-white" />
        </div>
        <div className="hidden sm:block">
          <div className="text-sm font-bold">Level {stats.level.level}</div>
          <div className="text-xs text-muted-foreground">{stats.level.title}</div>
        </div>
      </div>
      
      <div className="flex-1 min-w-[100px] max-w-[150px]">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">XP</span>
          <span className="font-medium">{stats.level.currentXP} / {stats.level.xpToNext}</span>
        </div>
        <Progress value={getProgressToNextLevel()} className="h-2" />
      </div>

      <div className="flex items-center gap-1">
        <Badge variant="secondary" className="text-xs">
          <Star className="w-3 h-3 mr-1 text-yellow-500" />
          {stats.totalXP.toLocaleString()}
        </Badge>
      </div>
    </div>
  );
};