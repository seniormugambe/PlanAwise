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
  BarChart3
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { XPIndicator } from "@/components/XPIndicator";
import { DeferredWeb3Status } from "@/components/DeferredWeb3Status";
import { AddGoalDialog } from "@/components/AddGoalDialog";
import { useNavigate, useLocation } from "react-router-dom";

const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    description: "Overview & insights"
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

  const currentTab = location.pathname === "/wallets" ? "wallets" : "dashboard";

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
                <h1 className="text-xl font-bold text-foreground">PlanAwise</h1>
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
                      <h2 className="text-lg font-bold">PlanAwise</h2>
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
                          className="w-full justify-start h-auto p-3"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            if (item.id === "wallets") {
                              navigate("/wallets");
                            }
                          }}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <div className="text-left">
                              <div className="font-medium">{item.label}</div>
                              <div className="text-xs text-muted-foreground">{item.description}</div>
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
            <TabsList className="grid w-full grid-cols-5 h-12">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <TabsTrigger
                    key={item.id}
                    value={item.id}
                    className="flex items-center gap-2 h-10"
                    onClick={() => {
                      if (item.id === "wallets") {
                        navigate("/wallets");
                      }
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{item.label}</span>
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
