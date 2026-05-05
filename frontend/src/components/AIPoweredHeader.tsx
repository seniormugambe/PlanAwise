import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  Home,
  Brain,
  TrendingUp,
  Wallet,
  Bell,
  Settings,
  Plus,
  Sparkles,
  Target,
  PiggyBank,
  BarChart3,
  Lightbulb,
  PieChart,
  Zap
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { XPIndicator } from "@/components/XPIndicator";
import { NotificationBell } from "@/components/NotificationBell";
import { AIPoweredAddGoalDialog } from "@/components/AIPoweredAddGoalDialog";
import { useNavigate, useLocation } from "react-router-dom";
import { useAIPoweredUI } from "@/hooks/useAIPoweredUI";
import { cn } from "@/lib/utils";

const iconMap = {
  home: Home,
  brain: Brain,
  'trending-up': TrendingUp,
  wallet: Wallet,
  bell: Bell,
  settings: Settings,
  target: Target,
  'piggy-bank': PiggyBank,
  'bar-chart': BarChart3,
  'pie-chart': PieChart,
  lightbulb: Lightbulb,
  zap: Zap,
};

export const AIPoweredHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { uiConfig, isAnalyzing } = useAIPoweredUI();

  const visibleTabIds = ["dashboard", "budget", "investments", "goals", "notifications"];
  const activeSearchTab = new URLSearchParams(location.search).get("tab") || "dashboard";
  const currentTab = location.pathname === "/wallets"
    ? "wallets"
    : visibleTabIds.includes(activeSearchTab)
      ? activeSearchTab
      : "dashboard";

  const navigateToTab = (tabId: string) => {
    if (tabId === "wallets") {
      navigate("/wallets");
      return;
    }

    navigate(tabId === "dashboard" ? "/" : `/?tab=${tabId}`);
  };

  // Default navigation items (fallback)
  const defaultNavigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "home",
      description: "Overview & insights"
    },
    {
      id: "budget",
      label: "Budget",
      icon: "pie-chart",
      description: "Spending plan"
    },
    {
      id: "investments",
      label: "Investments",
      icon: "trending-up",
      description: "Portfolio & growth"
    },
    {
      id: "wallets",
      label: "Wallets",
      icon: "wallet",
      description: "Manage accounts"
    },
    {
      id: "goals",
      label: "Goals",
      icon: "target",
      description: "Track progress"
    },
    {
      id: "notifications",
      label: "Activity",
      icon: "bell",
      description: "Updates & alerts"
    }
  ];

  // Use AI-powered navigation if available, otherwise fallback to default
  const navigationItems = uiConfig?.navigation.primaryTabs.map(tab => ({
    id: tab.id,
    label: tab.label,
    icon: getIconForTab(tab.id),
    description: getDescriptionForTab(tab.id),
    visible: tab.visible,
    priority: tab.priority
  })) || defaultNavigationItems.map(item => ({ ...item, visible: true, priority: 1 }));

  function getIconForTab(tabId: string): string {
    const iconMapping: Record<string, string> = {
      dashboard: 'home',
      budget: 'pie-chart',
      investments: 'trending-up',
      wallets: 'wallet',
      goals: 'target',
      notifications: 'bell'
    };
    return iconMapping[tabId] || 'home';
  }

  function getDescriptionForTab(tabId: string): string {
    const descriptionMapping: Record<string, string> = {
      dashboard: 'Overview & insights',
      budget: 'Spending plan',
      investments: 'Portfolio & growth',
      wallets: 'Manage accounts',
      goals: 'Track progress',
      notifications: 'Updates & alerts'
    };
    return descriptionMapping[tabId] || 'Navigation';
  }

  // AI-powered quick actions
  const quickActions = uiConfig?.navigation.quickActions || [];

  const runQuickAction = (label: string, action: () => void) => {
    if (label === "View Budget") {
      navigate("/?tab=budget");
      return;
    }

    action();
  };

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 py-4">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">PlanWise</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {isAnalyzing ? 'AI Analyzing...' : 'AI-Powered Finance'}
                </p>
              </div>
            </div>

            {/* AI Status Indicator */}
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {isAnalyzing ? (
                  <>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse mr-1" />
                    AI Analyzing
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Active
                  </>
                )}
              </Badge>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <XPIndicator />
            <NotificationBell />
            <ThemeToggle />

            {/* AI-Powered Quick Actions */}
            {quickActions.map((action, index) => {
              const Icon = iconMap[action.icon as keyof typeof iconMap] || Lightbulb;
              return (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => runQuickAction(action.label, action.action)}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {action.label}
                </Button>
              );
            })}

            <AIPoweredAddGoalDialog />
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <Menu className="w-4 h-4" />
                  {quickActions.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs">
                      {quickActions.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">PlanWise</h2>
                      <p className="text-sm text-muted-foreground">
                        {isAnalyzing ? 'AI Analyzing your profile...' : 'AI-Powered Finance Assistant'}
                      </p>
                    </div>
                  </div>

                  {/* AI Quick Actions */}
                  {quickActions.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        AI Recommendations
                      </h3>
                      <div className="space-y-2">
                        {quickActions.map((action, index) => {
                          const Icon = iconMap[action.icon as keyof typeof iconMap] || Lightbulb;
                          return (
                            <Button
                              key={index}
                              variant="outline"
                              className="w-full justify-start h-auto p-3"
                              onClick={() => {
                                runQuickAction(action.label, action.action);
                                setIsMobileMenuOpen(false);
                              }}
                            >
                              <div className="flex items-center gap-3 w-full">
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                <div className="text-left">
                                  <div className="font-medium">{action.label}</div>
                                </div>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold mb-3">Navigation</h3>
                    {navigationItems.filter(item => item.visible).map((item) => {
                      const Icon = iconMap[item.icon as keyof typeof iconMap] || Home;
                      const isActive = currentTab === item.id;
                      return (
                        <Button
                          key={item.id}
                          variant={isActive ? "default" : "ghost"}
                          className={cn(
                            "w-full justify-start h-auto p-3 border transition-all",
                            isActive
                              ? "border-primary/30 bg-primary text-primary-foreground shadow-sm"
                              : "border-transparent hover:border-border hover:bg-muted"
                          )}
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            navigateToTab(item.id);
                          }}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <div className="min-w-0 flex-1 text-left">
                              <div className="flex items-center gap-2 font-medium">
                                {item.label}
                                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                              </div>
                              <div className={cn("text-xs", isActive ? "text-primary-foreground/75" : "text-muted-foreground")}>
                                {item.description}
                              </div>
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Account</span>
                    </div>
                    <div>
                      <AIPoweredAddGoalDialog />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <XPIndicator />
                      <NotificationBell />
                    </div>
                    <div className="flex justify-center">
                      <ThemeToggle />
                    </div>

                    {/* AI Status */}
                    <Card className="bg-primary/10 border-primary/20">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="font-medium text-foreground">AI Status</span>
                          <Badge variant="secondary" className="text-xs">
                            {isAnalyzing ? 'Analyzing' : 'Active'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <Tabs value={currentTab} className="w-full">
            <TabsList className="grid h-12 w-full auto-cols-fr grid-flow-col">
              {navigationItems.filter(item => item.visible).map((item) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap] || Home;
                const isActive = currentTab === item.id;
                return (
                  <TabsTrigger
                    key={item.id}
                    value={item.id}
                    className={cn(
                      "relative flex h-10 items-center gap-2 rounded-md border border-transparent px-3 font-medium text-muted-foreground transition-all",
                      "hover:border-border hover:bg-background/70 hover:text-foreground",
                      "data-[state=active]:border-primary/30 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                    )}
                    onClick={() => navigateToTab(item.id)}
                  >
                    <Icon className={cn("w-4 h-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                    <span className="hidden lg:inline">{item.label}</span>
                    {isActive && <span className="absolute bottom-1 h-1 w-5 rounded-full bg-primary-foreground/80" />}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        {/* Mobile AI Insights Banner */}
        <div className="md:hidden">
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <span className="font-medium">
                    {isAnalyzing ? 'AI Analyzing...' : 'AI-Powered Dashboard'}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {quickActions.length} Actions
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
