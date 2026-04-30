import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletOverview } from "@/components/WalletOverview";
import { WalletManager } from "@/components/WalletManager";
import { WalletTransfer } from "@/components/WalletTransfer";
import { WalletAnalytics } from "@/components/WalletAnalytics";
import { WalletConnect } from "@/components/WalletConnect";
import { PaymentMethodsDisplay } from "@/components/PaymentMethodsDisplay";
import { PaymentTransfer } from "@/components/PaymentTransfer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWallets } from "@/hooks/useWallets";

const Wallets = () => {
  const navigate = useNavigate();
  const { wallets } = useWallets();

  return (
    <div className="min-h-screen bg-background pattern-grid">
      <div className="container mx-auto p-6 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4 animate-slide-up">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="hover:bg-accent/50 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-responsive-xl font-bold text-gradient-primary">
              Wallet Management
            </h1>
            <p className="text-muted-foreground mt-1 text-pretty">
              Manage your accounts, transfers, and analyze your financial portfolio
            </p>
          </div>
        </div>

        {/* Web3 Connection */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <WalletConnect />
        </div>

        {/* Wallet Tabs */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5 glass">
              <TabsTrigger value="overview" className="transition-all duration-300">Overview</TabsTrigger>
              <TabsTrigger value="manage" className="transition-all duration-300">Manage</TabsTrigger>
              <TabsTrigger value="payments" className="transition-all duration-300">Payments</TabsTrigger>
              <TabsTrigger value="transfer" className="transition-all duration-300">Transfer</TabsTrigger>
              <TabsTrigger value="analytics" className="transition-all duration-300">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 animate-fade-in">
              <WalletOverview />
            </TabsContent>

            <TabsContent value="manage" className="space-y-6 animate-fade-in">
              <WalletManager />
            </TabsContent>

            <TabsContent value="payments" className="space-y-6 animate-fade-in">
              <PaymentMethodsDisplay wallets={wallets} />
              <PaymentTransfer />
            </TabsContent>

            <TabsContent value="transfer" className="space-y-6 animate-fade-in">
              <WalletTransfer />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6 animate-fade-in">
              <WalletAnalytics />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Wallets;