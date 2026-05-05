import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertTriangle, Bell, Target, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const notificationPreview = [
  {
    title: "You exceeded food budget",
    detail: "Dining and food spending is above the usual range.",
    icon: AlertTriangle,
    tone: "text-amber-600",
  },
  {
    title: "Goal 60% complete",
    detail: "Your active savings goal is past the halfway mark.",
    icon: Target,
    tone: "text-blue-600",
  },
  {
    title: "Portfolio review ready",
    detail: "Check whether investing fits your current cash flow.",
    icon: TrendingUp,
    tone: "text-purple-600",
  },
];

export const NotificationBell = () => {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative gap-2">
          <Bell className="h-4 w-4" />
          <span className="hidden lg:inline">Notifications</span>
          <Badge
            variant="destructive"
            className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center px-1 text-xs"
          >
            3
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          <Badge variant="secondary">3 new</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notificationPreview.map((notification) => {
          const Icon = notification.icon;

          return (
            <DropdownMenuItem
              key={notification.title}
              className="cursor-pointer items-start gap-3 rounded-md p-3"
              onClick={() => navigate("/?tab=notifications")}
            >
              <Icon className={`mt-0.5 h-4 w-4 ${notification.tone}`} />
              <div>
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-xs text-muted-foreground">{notification.detail}</p>
              </div>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer justify-center text-sm font-medium"
          onClick={() => navigate("/?tab=notifications")}
        >
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
