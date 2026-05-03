import { lazy, Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Wallet } from "lucide-react";
import type { Web3StatusProps } from "@/components/Web3Status";

const Web3StatusBoundary = lazy(() => import("@/components/Web3StatusBoundary"));

const hasSavedWeb3Session = () => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return Object.keys(window.localStorage).some(
      (key) => key.startsWith("wagmi") || key.toLowerCase().includes("walletconnect")
    );
  } catch {
    return false;
  }
};

export const DeferredWeb3Status = ({
  variant = "compact",
  showBalance,
  showNetwork,
  className = "",
}: Web3StatusProps) => {
  const [isLoaded, setIsLoaded] = useState(hasSavedWeb3Session);
  const [openConnectOnLoad, setOpenConnectOnLoad] = useState(false);

  if (!isLoaded) {
    if (variant === "minimal") {
      return (
        <Badge variant="outline" className={`gap-1 ${className}`}>
          <AlertCircle className="h-3 w-3 text-yellow-500" />
          Not Connected
        </Badge>
      );
    }

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setOpenConnectOnLoad(true);
          setIsLoaded(true);
        }}
        className={`gap-2 ${className}`}
      >
        <Wallet className="h-4 w-4" />
        Connect
      </Button>
    );
  }

  return (
    <Suspense
      fallback={
        <Button variant="outline" size="sm" disabled className={`gap-2 ${className}`}>
          <Wallet className="h-4 w-4" />
          Loading...
        </Button>
      }
    >
      <Web3StatusBoundary
        variant={variant}
        showBalance={showBalance}
        showNetwork={showNetwork}
        className={className}
        openConnectOnMount={openConnectOnLoad}
      />
    </Suspense>
  );
};
