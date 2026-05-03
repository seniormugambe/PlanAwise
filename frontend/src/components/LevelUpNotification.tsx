import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Star, Sparkles, X } from "lucide-react";

interface LevelUpNotificationProps {
  show: boolean;
  level: number;
  title: string;
  onClose: () => void;
}

export const LevelUpNotification = ({ show, level, title, onClose }: LevelUpNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <Card className={`relative max-w-md mx-4 p-8 text-center bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30 shadow-2xl transform transition-all duration-500 ${
        isVisible ? 'scale-100 rotate-0' : 'scale-75 rotate-12'
      }`}>
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <Star className="w-2 h-2 text-yellow-400 fill-current" />
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
          className="absolute top-2 right-2 hover:bg-white/20"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Content */}
        <div className="relative z-10">
          <div className="mb-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Crown className="w-10 h-10 text-white" />
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              Level Up!
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </h2>
            <div className="text-4xl font-bold text-gradient-primary">
              Level {level}
            </div>
            <div className="text-lg font-semibold text-accent">
              {title}
            </div>
          </div>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p>🎉 Congratulations! You've reached a new level!</p>
            <p>Keep up the great work managing your finances!</p>
          </div>

          <Button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="mt-6 bg-gradient-primary hover:shadow-lg transition-all duration-300"
          >
            <Star className="w-4 h-4 mr-2" />
            Awesome!
          </Button>
        </div>
      </Card>
    </div>
  );
};