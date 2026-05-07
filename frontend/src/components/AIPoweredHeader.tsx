import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger, DrawerHeader, DrawerFooter } from "@/components/ui/drawer";
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
  Zap,
  X
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
        <div className="flex items-center justify-between mb-4 gap-3">
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

          <div className="flex items-center gap-2">
            <Drawer open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <DrawerTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Menu className="w-4 h-4" />
                  <span className="hidden md:inline">Navigation</span>
                </Button>
              </DrawerTrigger>

              <DrawerContent className="w-full max-w-sm">
                <DrawerHeader className="flex items-start justify-between gap-4 px-5 pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/10">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight text-foreground">PlanWise</h2>
                      <p className="text-sm text-muted-foreground">
                        {isAnalyzing ? 'AI Analyzing your profile...' : 'AI-Powered Finance Assistant'}
                      </p>
                    </div>
                  </div>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon" className="inline-flex h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70">
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close navigation</span>
                    </Button>
                  </DrawerClose>
                </DrawerHeader>
                <div className="h-px bg-border/70" />

                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {quickActions.length > 0 && (
                    <div className="mb-6 rounded-[22px] border border-border/70 bg-muted/5 p-4 shadow-sm">
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        AI Recommendations
                      </div>
                      <div className="space-y-2">
                        {quickActions.map((action, index) => {
                          const Icon = iconMap[action.icon as keyof typeof iconMap] || Lightbulb;
                          return (
                            <Button
                              key={index}
                              variant="secondary"
                              className="w-full justify-start rounded-3xl border border-border/60 bg-background/90 px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                              onClick={() => {
                                runQuickAction(action.label, action.action);
                                setIsMobileMenuOpen(false);
                              }}
                            >
                              <div className="flex items-center gap-3 w-full">
                                <Icon className="w-5 h-5 flex-shrink-0 text-primary" />
                                <div>
                                  <div className="font-medium text-foreground">{action.label}</div>
                                  {action.description && (
                                    <div className="text-xs text-muted-foreground">{action.description}</div>
                                  )}
                                </div>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="font-semibold mb-3 text-sm uppercase tracking-[0.24em] text-muted-foreground">Quick links</h3>
                    {navigationItems.filter(item => item.visible).map((item) => {
                      const Icon = iconMap[item.icon as keyof typeof iconMap] || Home;
                      const isActive = currentTab === item.id;
                      return (
                        <Button
                          key={item.id}
                          variant={isActive ? "default" : "ghost"}
                          className={cn(
                            "w-full justify-start h-auto rounded-3xl border px-4 py-3 text-left transition-all duration-200",
                            isActive
                              ? "border-primary/20 bg-primary/10 text-foreground shadow-sm"
                              : "border-transparent hover:border-border hover:bg-muted/70"
                          )}
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            navigateToTab(item.id);
                          }}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                {item.label}
                                {isActive && <span className="h-2 w-2 rounded-full bg-primary" />}
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
                </div>

                <DrawerFooter>
                  <div className="space-y-3">
                    <AIPoweredAddGoalDialog />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Button variant="outline" size="sm" className="w-full justify-center">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                      <ThemeToggle />
                    </div>
                    <div className="flex items-center justify-between">
                      <XPIndicator />
                      <NotificationBell />
                    </div>
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
                </DrawerFooter>
              </DrawerContent>
            </Drawer>

            <div className="hidden md:flex items-center gap-2">
              <XPIndicator />
              <NotificationBell />
              <ThemeToggle />
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
          </div>
        </div>

        {/* Navigation drawer is handled by the button above */}

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
