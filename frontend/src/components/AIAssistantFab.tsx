import { lazy, Suspense, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AnimatedBotAvatar } from "./AnimatedBotAvatar";
import { Heart, MessageCircle } from "lucide-react";

const FinancialAdvisor = lazy(() =>
  import("./FinancialAdvisor").then((module) => ({ default: module.FinancialAdvisor }))
);

export const AIAssistantFab = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showHeartPulse, setShowHeartPulse] = useState(false);

  // Periodic heart pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen && Math.random() > 0.7) {
        setShowHeartPulse(true);
        setTimeout(() => setShowHeartPulse(false), 2000);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Bounce animation on hover
  const handleMouseEnter = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="fixed bottom-6 right-6 z-50 cursor-pointer border-0 bg-transparent p-0"
          aria-label="Chat with Finley"
        >
          {/* Floating hearts animation */}
          {showHeartPulse && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className="absolute w-4 h-4 text-red-400 animate-bounce"
                  style={{
                    left: `${-10 + i * 10}px`,
                    top: `${-20 + i * 5}px`,
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: '2s'
                  }}
                />
              ))}
            </div>
          )}
          
          <div
            onMouseEnter={handleMouseEnter}
            className={`group relative transition-all duration-500 ${
              isAnimating ? 'animate-bounce' : 'hover:scale-110'
            }`}
          >
            <AnimatedBotAvatar
              mood={showHeartPulse ? 'excited' : 'happy'}
              size="xl"
              className="shadow-finance hover:shadow-elevated transition-shadow duration-300"
            />
            <div className="absolute bottom-full right-0 mb-2 rounded-lg border border-border/50 bg-gradient-card px-3 py-1 text-sm shadow-card opacity-0 transition-opacity duration-300 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
              Chat with Finley
            </div>
          </div>
        </button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] h-[90vh] p-0 animate-scale-in">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center gap-3">
              <AnimatedBotAvatar
                mood="happy"
                size="lg"
                className="pulse-glow"
              />
              <div>
                <h2 className="font-bold text-lg text-foreground">
                  Finley
                </h2>
                <p className="text-sm text-muted-foreground">
                  Your AI financial advisor
                </p>
              </div>
            </div>
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 overflow-hidden">
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Loading Finley...
                </div>
              }
            >
              <FinancialAdvisor />
            </Suspense>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
