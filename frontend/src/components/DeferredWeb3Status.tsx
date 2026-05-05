import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import type { Web3StatusProps } from "@/components/Web3Status";

export const DeferredWeb3Status = ({
  className = "",
}: Web3StatusProps) => (
  <Badge variant="outline" className={`gap-1 ${className}`}>
    <AlertCircle className="h-3 w-3 text-muted-foreground" />
    Web3 Off
  </Badge>
);
