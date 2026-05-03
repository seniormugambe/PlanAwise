import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, BellRing, Bot, DollarSign, TrendingUp, Target, AlertTriangle, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AgentStatusBadge } from "@/components/AgentStatusBadge";
import { useAIAgent } from "@/hooks/useAIAgent";
import { useGoals } from "@/hooks/useGoals";
import { useWallets } from "@/hooks/useWallets";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  type: 'achievement' | 'goal' | 'investment' | 'payment' | 'warning' | 'agent';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionable?: boolean;
  agent?: string;
  source?: 'system' | 'agent';
}

interface NotificationSettings {
  agentUpdates: boolean;
  goalReminders: boolean;
  investmentAlerts: boolean;
  paymentNotifications: boolean;
  achievementCelebrations: boolean;
  lowBalanceWarnings: boolean;
  pushEnabled: boolean;
}

export const NotificationCenter = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { transactions, getWalletSummary } = useWallets();
  const { goals } = useGoals();
  const { detectAndRunAutomation } = useAIAgent();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'achievement',
      title: '🎉 Goal Achieved!',
      message: 'Congratulations! You reached your Emergency Fund goal of $5,000',
      timestamp: new Date(Date.now() - 300000),
      read: false,
      actionable: true
    },
    {
      id: '2',
      type: 'investment',
      title: '📈 Investment Agent Update',
      message: 'Your portfolio is ready for diversification. The Investment Agent can review your allocation.',
      timestamp: new Date(Date.now() - 3600000),
      read: false,
      actionable: true,
      agent: 'investment',
      source: 'agent'
    },
    {
      id: '3',
      type: 'payment',
      title: '💳 Payment Processed',
      message: 'Your monthly savings transfer of $500 was successful',
      timestamp: new Date(Date.now() - 7200000),
      read: true
    },
    {
      id: '4',
      type: 'warning',
      title: '⚠️ Low Balance Alert',
      message: 'Your checking account balance is below $200',
      timestamp: new Date(Date.now() - 10800000),
      read: false,
      actionable: true
    }
  ]);

  const [settings, setSettings] = useState<NotificationSettings>({
    agentUpdates: true,
    goalReminders: true,
    investmentAlerts: true,
    paymentNotifications: true,
    achievementCelebrations: true,
    lowBalanceWarnings: true,
    pushEnabled: false
  });

  const [unreadCount, setUnreadCount] = useState(0);
  const [dismissedAgentIds, setDismissedAgentIds] = useState<Set<string>>(new Set());

  const currentMonthTransactions = useMemo(() => {
    const now = new Date();

    return transactions.filter((transaction) => {
      const date = transaction.date instanceof Date ? transaction.date : new Date(transaction.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
  }, [transactions]);

  const financialContext = useMemo(() => {
    const summary = getWalletSummary();
    const monthlyIncome = currentMonthTransactions
      .filter((transaction) => transaction.amount > 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const monthlyExpenses = Math.abs(
      currentMonthTransactions
        .filter((transaction) => transaction.amount < 0)
        .reduce((sum, transaction) => sum + transaction.amount, 0)
    );

    return {
      monthlyIncome,
      monthlyExpenses,
      currentSavings: summary.totalAssets,
      totalBalance: summary.totalBalance,
      goals: goals.map((goal) => ({
        title: goal.title,
        current: goal.currentAmount,
        target: goal.targetAmount,
      })),
    };
  }, [currentMonthTransactions, getWalletSummary, goals]);

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const shouldShowAgentNotification = useCallback(
    (agent: string, type: string) => {
      if (!settings.agentUpdates) return false;
      if (agent === 'investment') return settings.investmentAlerts;
      if (agent === 'savings') return settings.goalReminders;
      if (agent === 'budget' && type === 'low_balance') return settings.lowBalanceWarnings;
      return true;
    },
    [settings.agentUpdates, settings.goalReminders, settings.investmentAlerts, settings.lowBalanceWarnings]
  );

  const createAgentNotification = useCallback((result: any): Notification | null => {
    const trigger = result.trigger;
    if (!trigger || !shouldShowAgentNotification(trigger.agent, trigger.type)) return null;

    const titleByAgent: Record<string, string> = {
      investment: '📈 Investment Agent Update',
      savings: '🏦 Savings Agent Opportunity',
      budget: trigger.type === 'low_balance' ? '⚠️ Budget Agent Alert' : '💸 Budget Agent Update',
      advisor: '🤖 Advisor Agent Update',
      receipt: '🧾 Receipt Agent Update',
    };
    const message =
      result.response?.answer ||
      trigger.query ||
      'An AI agent found a new financial update for you.';

    return {
      id: `agent-${result.triggerId}`,
      type: trigger.agent === 'investment'
        ? 'investment'
        : trigger.type === 'low_balance'
          ? 'warning'
          : 'agent',
      title: titleByAgent[trigger.agent] || '🤖 Agent Update',
      message: message.length > 220 ? `${message.slice(0, 220)}...` : message,
      timestamp: new Date(result.executedAt || result.timestamp || Date.now()),
      read: false,
      actionable: ['investment', 'savings', 'budget'].includes(trigger.agent),
      agent: trigger.agent,
      source: 'agent',
    };
  }, [shouldShowAgentNotification]);

  const mergeAgentNotifications = useCallback(
    (agentResults: any[]) => {
      const nextAgentNotifications = agentResults
        .map(createAgentNotification)
        .filter((notification): notification is Notification => Boolean(notification))
        .filter((notification) => !dismissedAgentIds.has(notification.id));

      if (nextAgentNotifications.length === 0) return;

      setNotifications((prev) => {
        const byId = new Map(prev.map((notification) => [notification.id, notification]));

        nextAgentNotifications.forEach((notification) => {
          const existing = byId.get(notification.id);
          byId.set(notification.id, existing ? { ...notification, read: existing.read } : notification);
        });

        return Array.from(byId.values()).sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );
      });
    },
    [createAgentNotification, dismissedAgentIds]
  );

  const refreshAgentNotifications = useCallback(async () => {
    if (!settings.agentUpdates) return;

    const result = await detectAndRunAutomation(financialContext, currentMonthTransactions);
    if (!result) return;

    mergeAgentNotifications([
      ...(result.executed || []),
      ...(result.pending || []),
      ...(result.triggers || []),
    ]);
  }, [
    currentMonthTransactions,
    detectAndRunAutomation,
    financialContext,
    mergeAgentNotifications,
    settings.agentUpdates,
  ]);

  useEffect(() => {
    refreshAgentNotifications();
    const intervalId = window.setInterval(refreshAgentNotifications, 45000);

    return () => window.clearInterval(intervalId);
  }, [refreshAgentNotifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    if (id.startsWith('agent-')) {
      setDismissedAgentIds((prev) => new Set(prev).add(id));
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'achievement':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'goal':
        return <Target className="w-4 h-4 text-blue-500" />;
      case 'investment':
        return <TrendingUp className="w-4 h-4 text-purple-500" />;
      case 'payment':
        return <DollarSign className="w-4 h-4 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'agent':
        return <Bot className="w-4 h-4 text-primary" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const handleAction = (notification: Notification) => {
    switch (notification.type) {
      case 'achievement':
        toast({
          title: "🎉 Celebration Time!",
          description: "Share your achievement with friends or set a new goal!"
        });
        break;
      case 'investment':
        navigate('/?tab=investments');
        toast({
          title: "📈 Investment Guide",
          description: "Opening investment recommendations..."
        });
        break;
      case 'agent':
        if (notification.agent === 'savings') {
          navigate('/?tab=goals');
        }
        toast({
          title: "Agent update opened",
          description: "Review the related feature for next steps."
        });
        break;
      case 'warning':
        toast({
          title: "💰 Quick Transfer",
          description: "Would you like to transfer funds now?"
        });
        break;
    }
    markAsRead(notification.id);
  };

  const enablePushNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setSettings(prev => ({ ...prev, pushEnabled: true }));
        toast({
          title: "🔔 Push Notifications Enabled",
          description: "You'll now receive important financial updates"
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <BellRing className="w-6 h-6 text-primary" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs p-0"
              >
                {unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">Notifications</h2>
            <p className="text-muted-foreground">Stay updated with your financial progress</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <AgentStatusBadge agent="investment" />
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead} size="sm">
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="agent-updates">Live Agent Updates</Label>
              <Switch
                id="agent-updates"
                checked={settings.agentUpdates}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, agentUpdates: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="goal-reminders">Goal Reminders</Label>
              <Switch 
                id="goal-reminders"
                checked={settings.goalReminders}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, goalReminders: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="investment-alerts">Investment Alerts</Label>
              <Switch 
                id="investment-alerts"
                checked={settings.investmentAlerts}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, investmentAlerts: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="payment-notifications">Payment Notifications</Label>
              <Switch 
                id="payment-notifications"
                checked={settings.paymentNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, paymentNotifications: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="achievement-celebrations">Achievement Celebrations</Label>
              <Switch 
                id="achievement-celebrations"
                checked={settings.achievementCelebrations}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, achievementCelebrations: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="low-balance-warnings">Low Balance Warnings</Label>
              <Switch 
                id="low-balance-warnings"
                checked={settings.lowBalanceWarnings}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, lowBalanceWarnings: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="push-enabled">Browser Notifications</Label>
              <Switch 
                id="push-enabled"
                checked={settings.pushEnabled}
                onCheckedChange={(checked) => {
                  if (checked) {
                    enablePushNotifications();
                  } else {
                    setSettings(prev => ({ ...prev, pushEnabled: false }));
                  }
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No notifications yet</p>
                <p className="text-sm">You'll see important updates here</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    notification.read 
                      ? 'bg-muted/30 border-border' 
                      : 'bg-card border-primary/20 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.timestamp.toLocaleDateString()} at{' '}
                          {notification.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {notification.actionable && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAction(notification)}
                        >
                          Take Action
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
