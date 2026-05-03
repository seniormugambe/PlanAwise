import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AnimatedBotAvatarProps {
  mood?: 'happy' | 'thinking' | 'excited' | 'neutral' | 'winking';
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: () => void;
  isTyping?: boolean;
}

export const AnimatedBotAvatar = ({ 
  mood = 'neutral',
  size = "md", 
  className,
  onClick,
  isTyping = false
}: AnimatedBotAvatarProps) => {
  const [currentExpression, setCurrentExpression] = useState(mood);
  const [isBlinking, setIsBlinking] = useState(false);
  const [showHeartEyes, setShowHeartEyes] = useState(false);

  // Auto-blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.8 && !isTyping) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 200);
      }
    }, 3000);

    return () => clearInterval(blinkInterval);
  }, [isTyping]);

  // Update expression based on mood
  useEffect(() => {
    setCurrentExpression(mood);
    
    if (mood === 'excited') {
      setShowHeartEyes(true);
      setTimeout(() => setShowHeartEyes(false), 2000);
    }
  }, [mood]);

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14", 
    lg: "w-18 h-18",
    xl: "w-24 h-24"
  };

  const handleClick = () => {
    if (onClick) {
      setCurrentExpression('winking');
      setTimeout(() => setCurrentExpression('happy'), 500);
      onClick();
    }
  };

  const getEyeStyle = (isLeft: boolean) => {
    if (showHeartEyes) {
      return "text-red-500 text-xs";
    }
    
    if (isBlinking || (currentExpression === 'winking' && isLeft)) {
      return "w-3 h-1 bg-gray-800 rounded-full";
    }
    
    if (currentExpression === 'thinking') {
      return "w-3 h-3 bg-white rounded-full border border-gray-300";
    }
    
    return "w-3 h-3 bg-white rounded-full";
  };

  const getPupilStyle = () => {
    if (showHeartEyes || isBlinking || currentExpression === 'winking') {
      return "hidden";
    }
    
    if (currentExpression === 'thinking') {
      return "w-1.5 h-1.5 bg-gray-600 rounded-full animate-pulse";
    }
    
    if (currentExpression === 'excited') {
      return "w-2 h-2 bg-gray-800 rounded-full";
    }
    
    return "w-1.5 h-1.5 bg-gray-800 rounded-full";
  };

  const getMouthStyle = () => {
    switch (currentExpression) {
      case 'happy':
      case 'excited':
        return "w-4 h-2 border-b-2 border-white rounded-full";
      case 'thinking':
        return "w-2 h-1 bg-white/60 rounded-full animate-pulse";
      case 'winking':
        return "w-3 h-1.5 border-b-2 border-white rounded-full";
      default:
        return "w-2 h-1 bg-white rounded-full";
    }
  };

  return (
    <div 
      className={cn(
        "relative cursor-pointer transition-all duration-500 hover:scale-110 select-none",
        sizeClasses[size],
        className
      )}
      onClick={handleClick}
    >
      {/* Main Bot Body */}
      <div className={cn(
        "relative w-full h-full rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 shadow-xl border-3 border-blue-200",
        currentExpression === 'thinking' && "animate-pulse",
        currentExpression === 'excited' && "animate-bounce",
        isTyping && "animate-pulse"
      )}>
        
        {/* Glossy shine effect */}
        <div className="absolute top-2 left-2 w-3 h-3 bg-white/50 rounded-full blur-sm" />
        <div className="absolute top-1 left-1 w-2 h-2 bg-white/70 rounded-full" />
        
        {/* Antenna with glowing tip */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-1 h-4 bg-gradient-to-t from-blue-400 to-blue-200 rounded-full" />
          <div className={cn(
            "w-2 h-2 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full -mt-1 -ml-0.5 shadow-lg",
            (currentExpression === 'thinking' || isTyping) && "animate-ping",
            currentExpression === 'excited' && "animate-bounce"
          )} />
        </div>

        {/* Eyes Container */}
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 flex gap-2">
          {/* Left Eye */}
          <div className="relative flex items-center justify-center">
            {showHeartEyes ? (
              <span className="text-red-500 text-lg animate-pulse">❤️</span>
            ) : (
              <div className={getEyeStyle(true)}>
                <div className={cn("absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2", getPupilStyle())} />
              </div>
            )}
          </div>
          
          {/* Right Eye */}
          <div className="relative flex items-center justify-center">
            {showHeartEyes ? (
              <span className="text-red-500 text-lg animate-pulse">❤️</span>
            ) : (
              <div className={getEyeStyle(false)}>
                <div className={cn("absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2", getPupilStyle())} />
              </div>
            )}
          </div>
        </div>

        {/* Cheeks (when happy or excited) */}
        {(currentExpression === 'happy' || currentExpression === 'excited') && (
          <>
            <div className="absolute top-1/2 left-1 w-2 h-2 bg-pink-300/60 rounded-full blur-sm" />
            <div className="absolute top-1/2 right-1 w-2 h-2 bg-pink-300/60 rounded-full blur-sm" />
          </>
        )}

        {/* Mouth */}
        <div className={cn(
          "absolute bottom-1/3 left-1/2 transform -translate-x-1/2 transition-all duration-300",
          getMouthStyle()
        )} />

        {/* Thinking bubbles */}
        {(currentExpression === 'thinking' || isTyping) && (
          <div className="absolute -top-4 -right-3 flex flex-col gap-1">
            <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0s' }} />
            <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.3s' }} />
            <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.6s' }} />
          </div>
        )}

        {/* Excitement sparkles */}
        {currentExpression === 'excited' && (
          <>
            <div className="absolute -top-2 -left-2 text-yellow-400 animate-spin">✨</div>
            <div className="absolute -top-2 -right-2 text-yellow-400 animate-spin" style={{ animationDelay: '0.5s' }}>⭐</div>
            <div className="absolute -bottom-2 left-0 text-yellow-400 animate-bounce" style={{ animationDelay: '1s' }}>💫</div>
            <div className="absolute -bottom-2 right-0 text-yellow-400 animate-bounce" style={{ animationDelay: '1.5s' }}>✨</div>
          </>
        )}

        {/* Happy glow */}
        {currentExpression === 'happy' && (
          <div className="absolute inset-0 rounded-full bg-yellow-300/20 animate-pulse" />
        )}
      </div>

      {/* Floating name tag */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-popover/90 backdrop-blur-sm px-2 py-1 rounded-full border border-border text-xs font-medium text-popover-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Finley AI
      </div>
    </div>
  );
};
