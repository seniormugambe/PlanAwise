import { AIPoweredHeader } from "@/components/AIPoweredHeader";
import { AIPoweredDashboard } from "@/components/AIPoweredDashboard";
import { GoalTracker } from "@/components/GoalTracker";
import { SavingsProgress } from "@/components/SavingsProgress";
import { NotificationCenter } from "@/components/NotificationCenter";
import { InvestmentHub } from "@/components/InvestmentHub";
import { BudgetAnalysis } from "@/components/BudgetAnalysis";
import { CashflowChart } from "@/components/CashflowChart";
import { AIAssistantFab } from "@/components/AIAssistantFab";
import { LevelUpNotification } from "@/components/LevelUpNotification";
import { AchievementNotification } from "@/components/AchievementNotification";
import { useGamification } from "@/hooks/useGamification";
import { SavingsRecommendations } from "@/components/SavingsRecommendations";
import { InvestmentAdvice } from "@/components/InvestmentAdvice";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Bell, Home, PieChart, Target, TrendingUp } from "lucide-react";

const dashboardTabs = ["dashboard", "budget", "investments", "goals", "notifications"] as const;

const mobileNavigationItems = [
  { id: "dashboard", label: "Home", icon: Home },
  { id: "budget", label: "Budget", icon: PieChart },
  { id: "investments", label: "Invest", icon: TrendingUp },
  { id: "goals", label: "Goals", icon: Target },
  { id: "notifications", label: "Alerts", icon: Bell },
] as const;

const Index = () => {
  const { stats, showLevelUp, showAchievement } = useGamification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const requestedTab = searchParams.get("tab") || "dashboard";
  const currentTab = dashboardTabs.includes(requestedTab as typeof dashboardTabs[number])
    ? requestedTab
    : "dashboard";


  return (
    <div className="min-h-screen bg-background">
      <AIPoweredHeader />

      <div className="container mx-auto p-4 pb-20 md:pb-8">
        {/* Mobile content is controlled by the drawer navigation */}
        <div className="md:hidden mb-6">
          {currentTab === "dashboard" && <AIPoweredDashboard />}
          {currentTab === "budget" && (
            <div className="space-y-6">
              <BudgetAnalysis />
              <CashflowChart />
            </div>
          )}
          {currentTab === "investments" && (
            <div className="space-y-6">
              <InvestmentAdvice />
              <InvestmentHub />
            </div>
          )}
          {currentTab === "goals" && (
            <div className="space-y-6">
              <GoalTracker />
              <SavingsProgress />
              <SavingsRecommendations />
            </div>
          )}
          {currentTab === "notifications" && <NotificationCenter />}
        </div>

        {/* Desktop Content - Show all content without tabs */}
        <div className="hidden md:block space-y-8">
          {currentTab === "dashboard" && (
            <AIPoweredDashboard />
          )}

          {currentTab === "investments" && (
            <div className="space-y-6">
              <div className="text-center py-6">
                <h2 className="text-3xl font-bold text-gradient-primary mb-2">
                  Investment Portfolio
                </h2>
                <p className="text-muted-foreground text-lg">
                  Track and manage your investment growth
                </p>
              </div>
              <InvestmentAdvice />
              <InvestmentHub />
            </div>
          )}

          {currentTab === "budget" && (
            <div className="space-y-6">
              <div className="text-center py-6">
                <h2 className="text-3xl font-bold text-gradient-primary mb-2">
                  Budget Center
                </h2>
                <p className="text-muted-foreground text-lg">
                  Review spending, budget status, and top expense categories
                </p>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <BudgetAnalysis />
                <CashflowChart />
              </div>
            </div>
          )}

          {currentTab === "goals" && (
            <div className="space-y-6">
              <div className="text-center py-6">
                <h2 className="text-3xl font-bold text-gradient-primary mb-2">
                  Financial Goals
                </h2>
                <p className="text-muted-foreground text-lg">
                  Set, track, and achieve your financial objectives
                </p>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <GoalTracker />
                <SavingsProgress />
                <SavingsRecommendations />
              </div>
            </div>
          )}

          {currentTab === "notifications" && (
            <div className="space-y-6">
              <div className="text-center py-6">
                <h2 className="text-3xl font-bold text-gradient-primary mb-2">
                  Activity & Notifications
                </h2>
                <p className="text-muted-foreground text-lg">
                  Stay updated with your financial activity
                </p>
              </div>
              <NotificationCenter />
            </div>
          )}
        </div>
      </div>

      <AIAssistantFab />

      {/* Gamification Notifications */}
      <LevelUpNotification
        show={showLevelUp}
        level={stats.level.level}
        title={stats.level.title}
        onClose={() => {}}
      />

      <AchievementNotification
        achievement={showAchievement}
        onClose={() => {}}
      />
    </div>
  );
};

export default Index;
