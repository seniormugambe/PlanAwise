import { lazy, Suspense, useState, useEffect, type MouseEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatedBotAvatar } from "./AnimatedBotAvatar";
import { Heart, MessageCircle } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const FinancialAdvisor = lazy(() =>
  import("./FinancialAdvisor").then((module) => ({ default: module.FinancialAdvisor }))
);

export const AIAssistantFab = () => {
  const [searchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showHeartPulse, setShowHeartPulse] = useState(false);
  const isInvestmentPage = searchParams.get("tab") === "investments";
  const tooltipLabel = isInvestmentPage ? "Get investment advice" : "Chat with Finley";

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

  const handleFabClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!isInvestmentPage) return;

    event.preventDefault();
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent("planwise:open-investment-ai"));
    document.getElementById("investment-advice-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <button
              type="button"
              className="fixed bottom-6 right-6 z-50 cursor-pointer border-0 bg-transparent p-0"
              aria-label={tooltipLabel}
              onClick={handleFabClick}
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
                  mood={isInvestmentPage ? 'thinking' : showHeartPulse ? 'excited' : 'happy'}
                  size="xl"
                  className="shadow-finance hover:shadow-elevated transition-shadow duration-300"
                />
              </div>
            </button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="left" align="center">
          {tooltipLabel}
        </TooltipContent>
      </Tooltip>
      
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] h-[90vh] overflow-hidden p-0 animate-scale-in">
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex flex-shrink-0 items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center gap-3">
              <AnimatedBotAvatar
                mood="happy"
                size="lg"
                className="pulse-glow"
              />
              <div>
                <DialogTitle className="font-bold text-lg text-foreground">
                  Finley
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Your AI financial advisor
                </DialogDescription>
              </div>
            </div>
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
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
