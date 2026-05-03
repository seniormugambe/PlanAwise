import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIPoweredHeader } from "@/components/AIPoweredHeader";
import { AIPoweredDashboard } from "@/components/AIPoweredDashboard";
import { GoalTracker } from "@/components/GoalTracker";
import { SavingsProgress } from "@/components/SavingsProgress";
import { NotificationCenter } from "@/components/NotificationCenter";
import { InvestmentHub } from "@/components/InvestmentHub";
import { AIAssistantFab } from "@/components/AIAssistantFab";
import { LevelUpNotification } from "@/components/LevelUpNotification";
import { AchievementNotification } from "@/components/AchievementNotification";
import { useGamification } from "@/hooks/useGamification";
import { BudgetAnalysis } from "@/components/BudgetAnalysis";
import { SavingsRecommendations } from "@/components/SavingsRecommendations";
import { InvestmentAdvice } from "@/components/InvestmentAdvice";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Bell,
  Brain,
  Home,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";

const dashboardTabs = ["dashboard", "ai-insights", "investments", "goals", "notifications"] as const;

const Index = () => {
  const { stats, showLevelUp, showAchievement } = useGamification();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedTab = searchParams.get("tab") || "dashboard";
  const currentTab = dashboardTabs.includes(requestedTab as typeof dashboardTabs[number])
    ? requestedTab
    : "dashboard";

  const handleTabChange = (tab: string) => {
    if (tab === "wallets") {
      navigate("/wallets");
      return;
    }

    setSearchParams(tab === "dashboard" ? {} : { tab });
  };

  const mobileTabs = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "ai-insights", label: "Insights", icon: Brain },
    { id: "investments", label: "Invest", icon: TrendingUp },
    { id: "goals", label: "Goals", icon: Target },
    { id: "notifications", label: "Activity", icon: Bell },
    { id: "wallets", label: "Wallets", icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AIPoweredHeader />

      <div className="container mx-auto p-4 pb-20 md:pb-8">
        {/* Mobile Tab Navigation - Only show on mobile */}
        <div className="md:hidden mb-6">
          <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="mb-4 flex h-auto w-full justify-start gap-1 overflow-x-auto p-1">
              {mobileTabs.map((tab) => {
                const Icon = tab.icon;

                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="min-w-20 flex-col gap-1 px-3 py-2 text-xs"
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6 mt-4">
              <AIPoweredDashboard />
            </TabsContent>

            <TabsContent value="ai-insights" className="space-y-6 mt-4">
              <BudgetAnalysis />
              <SavingsRecommendations />
              <InvestmentAdvice />
            </TabsContent>

            <TabsContent value="investments" className="mt-4">
              <InvestmentHub />
            </TabsContent>

            <TabsContent value="goals" className="space-y-6 mt-4">
              <GoalTracker />
              <SavingsProgress />
            </TabsContent>

            <TabsContent value="notifications" className="mt-4">
              <NotificationCenter />
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop Content - Show all content without tabs */}
        <div className="hidden md:block space-y-8">
          {currentTab === "dashboard" && (
            <AIPoweredDashboard />
          )}

          {currentTab === "ai-insights" && (
            <div className="space-y-8">
              <div className="text-center py-6">
                <h2 className="text-3xl font-bold text-gradient-primary mb-2">
                  AI-Powered Financial Insights
                </h2>
                <p className="text-muted-foreground text-lg">
                  Get personalized recommendations from our AI financial assistant
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-1">
                  <BudgetAnalysis />
                </div>
                <div className="xl:col-span-1">
                  <SavingsRecommendations />
                </div>
                <div className="xl:col-span-1">
                  <InvestmentAdvice />
                </div>
              </div>
            </div>
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
              <InvestmentHub />
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GoalTracker />
                <SavingsProgress />
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

      {/* Mobile AI Assistant FAB */}
      <div className="md:hidden">
        <AIAssistantFab />
      </div>

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
