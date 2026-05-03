import { useQuery } from "@tanstack/react-query";
import { apiUrl } from "@/lib/api";

export type AgentName = "budget" | "savings" | "investment" | "advisor" | "receipt";

export interface AgentManagerStatus {
  agents: Partial<Record<AgentName, string>>;
  ai?: {
    provider?: string;
    model?: string;
  };
}

const fetchAgentManagerStatus = async (): Promise<AgentManagerStatus> => {
  const apiKey = localStorage.getItem("gemini_api_key") || import.meta.env.VITE_GEMINI_API_KEY;
  const response = await fetch(apiUrl("/api/ai/manager/status"), {
    headers: {
      ...(apiKey ? { "x-api-key": apiKey } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Agent status failed with ${response.status}`);
  }

  return response.json();
};

export const useAgentManagerStatus = () => {
  const query = useQuery({
    queryKey: ["ai-agent-manager-status"],
    queryFn: fetchAgentManagerStatus,
    staleTime: 5000,
    refetchInterval: 10000,
    retry: 1,
  });

  const agents = query.data?.agents || {};

  return {
    ...query,
    agents,
    provider: query.data?.ai?.provider,
    model: query.data?.ai?.model,
    isAgentActive: (agent: AgentName) => agents[agent] === "active",
  };
};
