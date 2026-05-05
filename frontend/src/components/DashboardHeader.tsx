import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  Home,
  TrendingUp,
  Wallet,
  Bell,
  Settings,
  Plus,
  Sparkles,
  Target,
  PiggyBank,
  BarChart3,
  PieChart
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { XPIndicator } from "@/components/XPIndicator";
import { DeferredWeb3Status } from "@/components/DeferredWeb3Status";
import { AddGoalDialog } from "@/components/AddGoalDialog";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    description: "Overview & insights"
  },
  {
    id: "budget",
    label: "Budget",
    icon: PieChart,
    description: "Spending plan"
  },
  {
    id: "investments",
    label: "Investments",
    icon: TrendingUp,
    description: "Portfolio & growth"
  },
  {
    id: "wallets",
    label: "Wallets",
    icon: Wallet,
    description: "Manage accounts"
  },
  {
    id: "goals",
    label: "Goals",
    icon: Target,
    description: "Track progress"
  },
  {
    id: "notifications",
    label: "Activity",
    icon: Bell,
    description: "Updates & alerts"
  }
];

export const DashboardHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                <p className="text-xs text-muted-foreground hidden sm:block">Smart Finance, Smarter You</p>
              </div>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <XPIndicator />
            <DeferredWeb3Status variant="compact" />
            <ThemeToggle />
            <AddGoalDialog />
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="w-4 h-4" />
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
                      <p className="text-sm text-muted-foreground">Your AI Finance Assistant</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
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
                      <span className="text-sm font-medium">Quick Actions</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <AddGoalDialog />
                      <Button variant="outline" size="sm" className="justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <XPIndicator />
                      <DeferredWeb3Status variant="compact" />
                    </div>
                    <div className="flex justify-center">
                      <ThemeToggle />
                    </div>
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
              {navigationItems.map((item) => {
                const Icon = item.icon;
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

        {/* Mobile Quick Stats */}
        <div className="md:hidden">
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <PiggyBank className="w-4 h-4 text-primary" />
                  <span className="font-medium">Welcome back!</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  AI Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
