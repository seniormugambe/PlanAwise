import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { XPIndicator } from "@/components/XPIndicator";
import { AddGoalDialog } from "@/components/AddGoalDialog";
import { Web3Status } from "@/components/Web3Status";
import { Settings, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const DashboardHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
      <div className="animate-fade-in flex-1">
        <h1 className="text-responsive-xl font-bold text-gradient-primary">
          Finance Dashboard
        </h1>
        <p className="text-muted-foreground mt-1 text-pretty">
          Track your savings, goals, and spending in one place
        </p>
      </div>
      
      {/* XP Indicator - Hidden on mobile */}
      <div className="hidden md:block">
        <XPIndicator />
      </div>
      
      <div className="flex items-center gap-3 flex-wrap">
        {/* Web3 Status */}
        <Web3Status variant="compact" />
        
        <ThemeToggle />
        <Button variant="outline" size="sm" onClick={() => navigate('/wallets')}>
          <Wallet className="w-4 h-4 mr-2" />
          Wallets
        </Button>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
        <AddGoalDialog />
      </div>
    </div>
  );
};