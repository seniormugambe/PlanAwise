import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, X, Sparkles } from "lucide-react";
import { Achievement } from "@/types/gamification";

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementNotification = ({ achievement, onClose }: AchievementNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-muted-foreground bg-muted';
      case 'rare': return 'text-blue-700 bg-blue-500/10 dark:text-blue-300';
      case 'epic': return 'text-purple-700 bg-purple-500/10 dark:text-purple-300';
      case 'legendary': return 'text-amber-700 bg-amber-500/10 dark:text-amber-300';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-500 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <Card className="relative max-w-sm p-6 bg-gradient-to-br from-card to-card/80 border-2 border-primary/30 shadow-2xl backdrop-blur-sm">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(achievement.rarity)} opacity-10 animate-pulse`} />
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1.5 + Math.random() * 1.5}s`
              }}
            >
              <Sparkles className="w-1.5 h-1.5 text-primary/60" />
            </div>
          ))}
        </div>

        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="absolute top-2 right-2 hover:bg-white/20 z-10"
        >
          <X className="w-3 h-3" />
        </Button>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${getRarityColor(achievement.rarity)} rounded-full flex items-center justify-center shadow-lg animate-bounce`}>
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground">Achievement Unlocked!</h3>
                <Badge className={`text-xs ${getRarityBadgeColor(achievement.rarity)}`}>
                  {achievement.rarity}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3 text-yellow-500" />
                <span>{achievement.points} XP</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{achievement.icon}</span>
              <h4 className="font-semibold text-lg text-foreground">{achievement.title}</h4>
            </div>
            <p className="text-sm text-muted-foreground">{achievement.description}</p>
          </div>

          <Button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            size="sm"
            className="mt-4 w-full bg-gradient-primary hover:shadow-lg transition-all duration-300"
          >
            <Trophy className="w-3 h-3 mr-2" />
            Awesome!
          </Button>
        </div>
      </Card>
    </div>
  );
};
