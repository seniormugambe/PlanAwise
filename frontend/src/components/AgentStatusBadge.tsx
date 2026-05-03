import { Badge } from "@/components/ui/badge";
import { AgentName, useAgentManagerStatus } from "@/hooks/useAgentManagerStatus";
import { Bot, CircleDashed, WifiOff } from "lucide-react";

const agentLabels: Record<AgentName, string> = {
  budget: "Budget Agent",
  savings: "Savings Agent",
  investment: "Investment Agent",
  advisor: "Advisor Agent",
  receipt: "Receipt Agent",
};

interface AgentStatusBadgeProps {
  agent: AgentName;
  className?: string;
  label?: string;
}

export const AgentStatusBadge = ({ agent, className, label }: AgentStatusBadgeProps) => {
  const { isAgentActive, isLoading, isError } = useAgentManagerStatus();

  if (isLoading) {
    return (
      <Badge variant="outline" className={`w-fit gap-1.5 ${className || ""}`}>
        <CircleDashed className="h-3 w-3 animate-spin" />
        Checking {label || agentLabels[agent]}
      </Badge>
    );
  }

  if (isError || !isAgentActive(agent)) {
    return (
      <Badge variant="secondary" className={`w-fit gap-1.5 ${className || ""}`}>
        <WifiOff className="h-3 w-3" />
        {label || agentLabels[agent]} offline
      </Badge>
    );
  }

  return (
    <Badge variant="default" className={`w-fit gap-1.5 ${className || ""}`}>
      <Bot className="h-3 w-3" />
      {label || agentLabels[agent]} active
    </Badge>
  );
};
