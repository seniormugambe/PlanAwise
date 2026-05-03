import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, PieChart, BarChart3, DollarSign, Target, Shield, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Investment {
  id: string;
  name: string;
  type: 'stocks' | 'bonds' | 'etf' | 'crypto' | 'real-estate';
  amount: number;
  currentValue: number;
  change: number;
  changePercent: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface InvestmentOption {
  id: string;
  name: string;
  type: 'stocks' | 'bonds' | 'etf' | 'crypto' | 'real-estate';
  description: string;
  minimumAmount: number;
  expectedReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
  duration: string;
}

export const InvestmentHub = () => {
  const { toast } = useToast();
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [investmentAmount, setInvestmentAmount] = useState<string>("");
  
  const [portfolio, setPortfolio] = useState<Investment[]>([
    {
      id: '1',
      name: 'S&P 500 ETF',
      type: 'etf',
      amount: 2500,
      currentValue: 2750,
      change: 250,
      changePercent: 10,
      riskLevel: 'medium'
    },
    {
      id: '2',
      name: 'Government Bonds',
      type: 'bonds',
      amount: 1500,
      currentValue: 1575,
      change: 75,
      changePercent: 5,
      riskLevel: 'low'
    },
    {
      id: '3',
      name: 'Tech Stocks',
      type: 'stocks',
      amount: 1000,
      currentValue: 1200,
      change: 200,
      changePercent: 20,
      riskLevel: 'high'
    }
  ]);

  const investmentOptions: InvestmentOption[] = [
    {
      id: '1',
      name: 'Balanced Growth Fund',
      type: 'etf',
      description: 'Diversified portfolio with 60% stocks, 40% bonds',
      minimumAmount: 100,
      expectedReturn: 8,
      riskLevel: 'medium',
      duration: 'Long-term (5+ years)'
    },
    {
      id: '2',
      name: 'High-Yield Savings',
      type: 'bonds',
      description: 'Conservative investment with guaranteed returns',
      minimumAmount: 50,
      expectedReturn: 4.5,
      riskLevel: 'low',
      duration: 'Short-term (1-3 years)'
    },
    {
      id: '3',
      name: 'Growth Stocks Portfolio',
      type: 'stocks',
      description: 'Aggressive growth potential with higher volatility',
      minimumAmount: 250,
      expectedReturn: 12,
      riskLevel: 'high',
      duration: 'Long-term (7+ years)'
    },
    {
      id: '4',
      name: 'Real Estate Investment Trust',
      type: 'real-estate',
      description: 'Diversified real estate exposure with monthly dividends',
      minimumAmount: 500,
      expectedReturn: 9,
      riskLevel: 'medium',
      duration: 'Medium-term (3-7 years)'
    },
    {
      id: '5',
      name: 'Cryptocurrency Index',
      type: 'crypto',
      description: 'Exposure to top cryptocurrencies with high volatility',
      minimumAmount: 100,
      expectedReturn: 15,
      riskLevel: 'high',
      duration: 'Long-term (5+ years)'
    }
  ];

  const wallets = [
    { id: 'savings', name: 'Savings Account', balance: 12500 },
    { id: 'checking', name: 'Checking Account', balance: 3200 },
    { id: 'investment', name: 'Investment Account', balance: 8750 }
  ];

  const totalPortfolioValue = portfolio.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalGains = portfolio.reduce((sum, inv) => sum + inv.change, 0);
  const totalGainsPercent = ((totalGains / (totalPortfolioValue - totalGains)) * 100).toFixed(1);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-700 bg-green-500/10 dark:text-green-300';
      case 'medium': return 'text-amber-700 bg-amber-500/10 dark:text-amber-300';
      case 'high': return 'text-red-700 bg-red-500/10 dark:text-red-300';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stocks': return <TrendingUp className="w-4 h-4" />;
      case 'bonds': return <Shield className="w-4 h-4" />;
      case 'etf': return <PieChart className="w-4 h-4" />;
      case 'crypto': return <Zap className="w-4 h-4" />;
      case 'real-estate': return <BarChart3 className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const handleInvestment = (optionId: string) => {
    const option = investmentOptions.find(opt => opt.id === optionId);
    const wallet = wallets.find(w => w.id === selectedWallet);
    const amount = parseFloat(investmentAmount);

    if (!option || !wallet || !amount) {
      toast({
        title: "Invalid Investment",
        description: "Please select a wallet, investment option, and amount",
        variant: "destructive"
      });
      return;
    }

    if (amount < option.minimumAmount) {
      toast({
        title: "Minimum Amount Required",
        description: `Minimum investment for ${option.name} is $${option.minimumAmount}`,
        variant: "destructive"
      });
      return;
    }

    if (amount > wallet.balance) {
      toast({
        title: "Insufficient Funds",
        description: `Not enough balance in ${wallet.name}`,
        variant: "destructive"
      });
      return;
    }

    // Simulate investment
    const newInvestment: Investment = {
      id: Date.now().toString(),
      name: option.name,
      type: option.type,
      amount: amount,
      currentValue: amount,
      change: 0,
      changePercent: 0,
      riskLevel: option.riskLevel
    };

    setPortfolio(prev => [...prev, newInvestment]);
    setInvestmentAmount("");
    
    toast({
      title: "🎉 Investment Successful!",
      description: `Invested $${amount} in ${option.name}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Investment Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                ${totalPortfolioValue.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${totalGains >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(totalGains).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                {totalGains >= 0 ? 'Total Gains' : 'Total Losses'}
              </p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${totalGains >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalGains >= 0 ? '+' : ''}{totalGainsPercent}%
              </p>
              <p className="text-sm text-muted-foreground">Overall Return</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
          <TabsTrigger value="invest">Invest</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
        </TabsList>

        {/* Current Portfolio */}
        <TabsContent value="portfolio" className="space-y-4">
          {portfolio.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Start Your Investment Journey</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any investments yet. Start building your portfolio today!
                </p>
                <Button>Browse Investment Options</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {portfolio.map((investment) => (
                <Card key={investment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(investment.type)}
                        <div>
                          <h4 className="font-semibold">{investment.name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">
                            {investment.type.replace('-', ' ')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">${investment.currentValue.toLocaleString()}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={getRiskColor(investment.riskLevel)} variant="outline">
                            {investment.riskLevel} risk
                          </Badge>
                          <span className={`text-sm ${
                            investment.change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {investment.change >= 0 ? '+' : ''}${investment.change} 
                            ({investment.changePercent >= 0 ? '+' : ''}{investment.changePercent}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Investment Form */}
        <TabsContent value="invest" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Make New Investment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Wallet</Label>
                  <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose funding source..." />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name} - ${wallet.balance.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Investment Amount</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount..."
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Investment Options */}
        <TabsContent value="opportunities" className="space-y-4">
          <div className="grid gap-4">
            {investmentOptions.map((option) => (
              <Card key={option.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getTypeIcon(option.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{option.name}</h4>
                          <Badge className={getRiskColor(option.riskLevel)} variant="outline">
                            {option.riskLevel} risk
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {option.description}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Expected Return</p>
                            <p className="font-semibold text-green-600">{option.expectedReturn}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Minimum</p>
                            <p className="font-semibold">${option.minimumAmount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="font-semibold">{option.duration}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Type</p>
                            <p className="font-semibold capitalize">{option.type.replace('-', ' ')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleInvestment(option.id)}
                      disabled={!selectedWallet || !investmentAmount}
                      className="ml-4"
                    >
                      Invest Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
