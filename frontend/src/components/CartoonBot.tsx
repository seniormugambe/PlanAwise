import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CartoonBotProps {
  isThinking?: boolean;
  isHappy?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

export const CartoonBot = ({ 
  isThinking = false, 
  isHappy = false, 
  size = "md", 
  className,
  onClick 
}: CartoonBotProps) => {
  const [eyeState, setEyeState] = useState<'normal' | 'blink' | 'wink'>('normal');
  const [isAnimating, setIsAnimating] = useState(false);

  // Random blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setEyeState('blink');
        setTimeout(() => setEyeState('normal'), 150);
      }
    }, 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Thinking animation
  useEffect(() => {
    if (isThinking) {
      setIsAnimating(true);
      const thinkingInterval = setInterval(() => {
        setEyeState(prev => prev === 'normal' ? 'blink' : 'normal');
      }, 800);

      return () => {
        clearInterval(thinkingInterval);
        setIsAnimating(false);
      };
    }
  }, [isThinking]);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  const handleClick = () => {
    if (onClick) {
      setEyeState('wink');
      setTimeout(() => setEyeState('normal'), 300);
      onClick();
    }
  };

  return (
    <div 
      className={cn(
        "relative cursor-pointer transition-all duration-300 hover:scale-110",
        sizeClasses[size],
        className
      )}
      onClick={handleClick}
    >
      {/* Bot Body */}
      <div className={cn(
        "relative w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg border-2 border-blue-300",
        isThinking && "animate-pulse",
        isAnimating && "animate-bounce"
      )}>
        
        {/* Shine effect */}
        <div className="absolute top-1 left-1 w-2 h-2 bg-white/40 rounded-full blur-sm" />
        
        {/* Eyes */}
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 flex gap-1">
          {/* Left Eye */}
          <div className={cn(
            "w-1.5 h-1.5 bg-white rounded-full transition-all duration-150",
            eyeState === 'blink' && "h-0.5",
            eyeState === 'wink' && "h-0.5"
          )}>
            <div className={cn(
              "w-0.5 h-0.5 bg-gray-800 rounded-full mt-0.5 ml-0.5 transition-all duration-150",
              isHappy && "bg-blue-800",
              eyeState === 'blink' && "opacity-0",
              eyeState === 'wink' && "opacity-0"
            )} />
          </div>
          
          {/* Right Eye */}
          <div className={cn(
            "w-1.5 h-1.5 bg-white rounded-full transition-all duration-150",
            eyeState === 'blink' && "h-0.5",
            eyeState === 'wink' && "w-1.5 h-1.5" // Right eye stays open during wink
          )}>
            <div className={cn(
              "w-0.5 h-0.5 bg-gray-800 rounded-full mt-0.5 ml-0.5 transition-all duration-150",
              isHappy && "bg-blue-800",
              eyeState === 'blink' && "opacity-0"
            )} />
          </div>
        </div>

        {/* Mouth */}
        <div className={cn(
          "absolute bottom-1/3 left-1/2 transform -translate-x-1/2 transition-all duration-300",
          isHappy ? "w-2 h-1 border-b-2 border-white rounded-full" : "w-1 h-0.5 bg-white rounded-full",
          isThinking && "animate-pulse"
        )} />

        {/* Antenna */}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
          <div className="w-0.5 h-2 bg-blue-300" />
          <div className={cn(
            "w-1 h-1 bg-yellow-400 rounded-full -mt-0.5 -ml-0.25 transition-all duration-300",
            isThinking && "animate-ping"
          )} />
        </div>

        {/* Thinking bubbles */}
        {isThinking && (
          <div className="absolute -top-3 -right-2 flex flex-col gap-1">
            <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-0.5 h-0.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-0.5 h-0.5 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        )}

        {/* Happy sparkles */}
        {isHappy && (
          <>
            <div className="absolute -top-1 -left-1 w-1 h-1 bg-yellow-300 rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 w-1 h-1 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
            <div className="absolute -bottom-1 left-0 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
          </>
        )}
      </div>
    </div>
  );
};