import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Cell,
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  DollarSign,
  PieChart,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallets } from "@/hooks/useWallets";

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

type DisplayCurrency = "USD" | "UGX";

const riskScoreMap = {
  low: 3,
  medium: 6,
  high: 9,
} as const;

const allocationData = [
  { name: "Stocks", value: 40, color: "hsl(var(--primary))" },
  { name: "Bonds", value: 30, color: "hsl(var(--success))" },
  { name: "ETFs", value: 30, color: "hsl(var(--warning))" },
];

const performanceTrendData = [
  { month: "Jan", value: 4625 },
  { month: "Feb", value: 4740 },
  { month: "Mar", value: 4930 },
  { month: "Apr", value: 5105 },
  { month: "May", value: 5350 },
  { month: "Jun", value: 5525 },
];

const opportunityHighlights = [
  {
    title: "AI Opportunity",
    asset: "US Treasury Bonds",
    insight: "Stable returns are attractive for reducing portfolio volatility.",
    badge: "AI pick",
    optionId: "2",
    icon: Shield,
  },
  {
    title: "Trending Asset",
    asset: "Balanced Growth Fund",
    insight: "Diversified exposure fits long-term savers with moderate risk.",
    badge: "Trending",
    optionId: "1",
    icon: TrendingUp,
  },
  {
    title: "DeFi Yield Watch",
    asset: "Tokenized Cash Yield",
    insight: "Estimated yields look useful, but smart-contract and liquidity risk need review.",
    badge: "Web3",
    optionId: "5",
    icon: Zap,
  },
];

export const InvestmentHub = () => {
  const { toast } = useToast();
  const { wallets } = useWallets();
  const [displayCurrency, setDisplayCurrency] = useState<DisplayCurrency>("USD");
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [investmentAmount, setInvestmentAmount] = useState<string>("");
  const [selectedOptionId, setSelectedOptionId] = useState<string>("1");
  const [activeTab, setActiveTab] = useState("overview");
  
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

  const fundingWallets = wallets.filter((wallet) => wallet.isActive && wallet.balance > 0);

  const totalPortfolioValue = portfolio.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalGains = portfolio.reduce((sum, inv) => sum + inv.change, 0);
  const totalGainsPercent = ((totalGains / (totalPortfolioValue - totalGains)) * 100).toFixed(1);
  const growthRiskValue = portfolio
    .filter((investment) => investment.riskLevel === 'high' || investment.riskLevel === 'medium')
    .reduce((sum, investment) => sum + investment.currentValue, 0);
  const growthRiskPercent = totalPortfolioValue > 0 ? Math.round((growthRiskValue / totalPortfolioValue) * 100) : 0;
  const bondOption = investmentOptions.find((option) => option.type === 'bonds') || investmentOptions[0];
  const diversificationScore = 72;
  const suggestedRebalanceAmount = Math.round(totalPortfolioValue * 0.1);
  const selectedOption = investmentOptions.find((option) => option.id === selectedOptionId) || investmentOptions[0];
  const selectedFundingWallet = fundingWallets.find((wallet) => wallet.id === selectedWallet);
  const enteredAmount = Number(investmentAmount) || 0;
  const amount = displayCurrency === "UGX" ? enteredAmount / 3800 : enteredAmount;
  const projectedAnnualReturn = selectedOption ? amount * (selectedOption.expectedReturn / 100) : 0;
  const availableAfterInvestment = selectedFundingWallet ? selectedFundingWallet.balance - amount : 0;

  const readiness = useMemo(() => {
    let score = 30;
    if (selectedWallet) score += 20;
    if (amount >= (selectedOption?.minimumAmount || 0)) score += 25;
    if (selectedFundingWallet && amount <= selectedFundingWallet.balance * 0.25) score += 15;
    if (selectedOption?.riskLevel !== 'high') score += 10;
    return Math.min(score, 100);
  }, [amount, selectedFundingWallet, selectedOption, selectedWallet]);

  const formatMoney = (value: number) => {
    const convertedValue = displayCurrency === "UGX" ? value * 3800 : value;

    return new Intl.NumberFormat(displayCurrency === "UGX" ? "en-UG" : "en-US", {
      style: "currency",
      currency: displayCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(convertedValue);
  };

  const toInputAmount = (value: number) => displayCurrency === "UGX" ? Math.round(value * 3800) : value;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'border-green-500/30 bg-green-500/10 text-green-700 dark:border-green-400/40 dark:bg-green-500/15 dark:text-green-300';
      case 'medium': return 'border-amber-500/40 bg-amber-500/15 text-amber-800 dark:border-amber-400/50 dark:bg-amber-500/20 dark:text-amber-200';
      case 'high': return 'border-red-500/50 bg-red-500/20 text-red-800 dark:border-red-400/60 dark:bg-red-500/25 dark:text-red-200';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getRiskScore = (risk: Investment["riskLevel"]) => riskScoreMap[risk];

  const getRiskLabel = (risk: Investment["riskLevel"]) => {
    const label = risk.charAt(0).toUpperCase() + risk.slice(1);
    return `${label} Risk (${getRiskScore(risk)}/10)`;
  };

  const getRiskBarColor = (risk: Investment["riskLevel"]) => {
    switch (risk) {
      case "low":
        return "bg-green-500";
      case "medium":
        return "bg-amber-500";
      case "high":
        return "bg-red-500";
      default:
        return "bg-muted-foreground";
    }
  };

  const RiskBadge = ({ risk }: { risk: Investment["riskLevel"] }) => (
    <Badge className={`${getRiskColor(risk)} gap-2`} variant="outline">
      <span>{getRiskLabel(risk)}</span>
      <span className="flex h-1.5 w-10 overflow-hidden rounded-full bg-background/60">
        <span
          className={`${getRiskBarColor(risk)} h-full rounded-full`}
          style={{ width: `${getRiskScore(risk) * 10}%` }}
        />
      </span>
    </Badge>
  );

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

  const handleInvestment = (optionId: string = selectedOptionId) => {
    const option = investmentOptions.find(opt => opt.id === optionId);
    const wallet = fundingWallets.find(w => w.id === selectedWallet);
    const amount = parseFloat(investmentAmount);

    if (!option || !wallet || !amount) {
      toast({
        title: "Plan Not Ready",
        description: "Please select a wallet, investment option, and amount",
        variant: "destructive"
      });
      return;
    }

    if (amount < option.minimumAmount) {
      toast({
        title: "Minimum Amount Required",
        description: `Minimum investment for ${option.name} is ${formatMoney(option.minimumAmount)}`,
        variant: "destructive"
      });
      return;
    }

    if (amount > wallet.balance) {
      toast({
        title: "Insufficient Funds",
        description: `Not enough balance in ${wallet.name}. Available: ${formatMoney(wallet.balance)}`,
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
      title: "Investment Plan Added",
      description: `${formatMoney(amount)} staged for ${option.name}. Final approval should happen with a licensed partner.`,
    });
  };

  const handleRebalancePortfolio = () => {
    setSelectedOptionId(bondOption.id);
    setInvestmentAmount(String(toInputAmount(suggestedRebalanceAmount)));
    setActiveTab("invest");

    toast({
      title: "Rebalance plan prepared",
      description: `PlanWise selected ${bondOption.name} and suggested ${formatMoney(suggestedRebalanceAmount)} for a safer allocation.`,
    });
  };

  const handleAskInvestmentAI = () => {
    document.getElementById("investment-advice-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCurrencyChange = (value: string) => {
    setDisplayCurrency(value as DisplayCurrency);
    setInvestmentAmount("");
  };

  const handleViewDetails = (investment: Investment) => {
    toast({
      title: investment.name,
      description: `${investment.type.replace('-', ' ')} holding worth ${formatMoney(investment.currentValue)} with ${getRiskLabel(investment.riskLevel)}.`,
    });
  };

  const handleBuyMore = (investment: Investment) => {
    const matchingOption = investmentOptions.find((option) => option.type === investment.type);
    if (matchingOption) {
      setSelectedOptionId(matchingOption.id);
    }

    setInvestmentAmount(String(toInputAmount(Math.max(100, Math.round(investment.currentValue * 0.1)))));
    setActiveTab("invest");

    toast({
      title: "Buy-more plan prepared",
      description: `PlanWise staged a top-up flow for ${investment.name}. Review wallet and amount before approval.`,
    });
  };

  const handleSellReview = (investment: Investment) => {
    toast({
      title: "Sell review started",
      description: `PlanWise flagged ${investment.name} for review. Add brokerage approval before executing any sale.`,
    });
  };

  const handleSelectOpportunity = (optionId: string, asset: string) => {
    setSelectedOptionId(optionId);
    setInvestmentAmount("");
    setActiveTab("invest");

    toast({
      title: "Opportunity selected",
      description: `${asset} is ready for review in the investment planner.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* AI Investment Dashboard */}
      <Card className="border-primary/25 shadow-card">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                AI Investment Dashboard
              </CardTitle>
              <p className="mt-1 text-sm text-foreground/75">
                A decision-making system for risk, diversification, and next investment moves.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={displayCurrency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="h-9 w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="UGX">UGX</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setActiveTab("opportunities")}>
                Browse Options
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" className="gap-2" onClick={() => setActiveTab("invest")}>
                Create Plan
                <Sparkles className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-lg border bg-muted/25 p-4">
                <p className="text-2xl font-bold text-primary">
                  {formatMoney(totalPortfolioValue)}
                </p>
                <p className="text-sm text-muted-foreground">Total Value</p>
              </div>
              <div className="rounded-lg border bg-muted/25 p-4">
                <p className={`text-2xl font-bold ${totalGains >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatMoney(Math.abs(totalGains))}
                </p>
                <p className="text-sm text-muted-foreground">
                  {totalGains >= 0 ? 'Total Gains' : 'Total Losses'}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/25 p-4">
                <p className={`text-2xl font-bold ${totalGains >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalGains >= 0 ? '+' : ''}{totalGainsPercent}%
                </p>
                <p className="text-sm text-muted-foreground">Overall Return</p>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Performance Trend</h3>
                  <p className="text-xs text-muted-foreground">Portfolio growth over time</p>
                </div>
                <Badge className="bg-green-500/10 text-green-700 dark:text-green-300">+19.5%</Badge>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceTrendData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="portfolioGrowth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      tickFormatter={(value: number) =>
                        displayCurrency === "UGX" ? `${Math.round((value * 3800) / 1000000)}M` : `$${(value / 1000).toFixed(1)}k`
                      }
                    />
                    <Tooltip formatter={(value: number) => [formatMoney(value), "Portfolio value"]} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#portfolioGrowth)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="gap-2" onClick={handleRebalancePortfolio}>
              Rebalance Now
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setActiveTab("invest")}>
              Create Plan
              <Sparkles className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleAskInvestmentAI}>
              Ask AI
              <Sparkles className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-border/80 shadow-card">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Portfolio Allocation
                </CardTitle>
                <p className="mt-1 text-sm text-foreground/75">
                  Target mix for balanced growth and lower volatility.
                </p>
              </div>
              <Badge variant="secondary">Balanced profile</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] xl:grid-cols-1">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={88}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${name} ${value}%`}
                      labelLine={false}
                    >
                      {allocationData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}%`, "Allocation"]} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {allocationData.map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </span>
                      <span className="font-semibold">{item.value}%</span>
                    </div>
                    <Progress value={item.value} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-primary/30 bg-primary/5 shadow-card dark:border-primary/40">
          <CardContent className="p-0">
            <div className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="rounded-md bg-primary/15 p-2">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">AI Investment Insight</p>
                  <h3 className="text-lg font-bold text-foreground">Portfolio risk check</h3>
                </div>
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-foreground/85">
                You are exposed to growth and higher-risk assets ({growthRiskPercent}%).
                Consider moving about 10% into bonds or conservative income products before adding more volatile positions.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" className="gap-2" onClick={handleRebalancePortfolio}>
                  Rebalance Portfolio
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="outline" className="gap-2" onClick={handleAskInvestmentAI}>
                  Ask AI
                  <Sparkles className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="border-t bg-background/55 p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold">Risk exposure</span>
                <Badge className={growthRiskPercent >= 60 ? "bg-red-500/10 text-red-700 dark:text-red-300" : "bg-amber-500/10 text-amber-700 dark:text-amber-300"}>
                  {growthRiskPercent}% growth risk
                </Badge>
              </div>
              <Progress value={growthRiskPercent} className="h-2" />
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border bg-muted/25 p-3">
                  <p className="text-muted-foreground">Suggested shift</p>
                  <p className="font-semibold">{formatMoney(suggestedRebalanceAmount)}</p>
                </div>
                <div className="rounded-md border bg-muted/25 p-3">
                  <p className="text-muted-foreground">Safer target</p>
                  <p className="font-semibold">{bondOption.name}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid h-12 w-full grid-cols-3 border-b bg-transparent p-0">
          <TabsTrigger
            value="overview"
            className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent font-semibold text-muted-foreground shadow-none transition-all hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            My Portfolio
          </TabsTrigger>
          <TabsTrigger
            value="invest"
            className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent font-semibold text-muted-foreground shadow-none transition-all hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            Invest
          </TabsTrigger>
          <TabsTrigger
            value="opportunities"
            className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent font-semibold text-muted-foreground shadow-none transition-all hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            Opportunities
          </TabsTrigger>
        </TabsList>

        {/* Current Portfolio */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="grid gap-4 p-4 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="font-semibold">Emergency buffer first</p>
                  <p className="text-xs text-foreground/70">Invest only after bills and short-term goals.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Risk matched to timeline</p>
                  <p className="text-xs text-foreground/70">Lower risk for near-term money, higher only for long-term.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-semibold">AI checks before action</p>
                  <p className="text-xs text-foreground/70">Use the Investment Agent before staging a plan.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            {portfolio.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Start Your Investment Journey</h3>
                  <p className="text-muted-foreground mb-4">
                    You don't have any investments yet. Start building your portfolio today!
                  </p>
                  <Button onClick={() => setActiveTab("opportunities")}>Browse Investment Options</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {portfolio.map((investment) => (
                  <Card key={investment.id} className="transition-all hover:border-primary/30 hover:shadow-card">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(investment.type)}
                          <div>
                            <h4 className="font-semibold">{investment.name}</h4>
                            <p className="text-sm text-muted-foreground capitalize">
                              {investment.type.replace('-', ' ')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="lg:text-right">
                          <p className="font-semibold">{formatMoney(investment.currentValue)}</p>
                          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                            <RiskBadge risk={investment.riskLevel} />
                            <span className={`text-sm ${
                              investment.change >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {investment.change >= 0 ? '+' : ''}{formatMoney(investment.change)}
                              ({investment.changePercent >= 0 ? '+' : ''}{investment.changePercent}%)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                        <Button size="sm" variant="outline" onClick={() => handleViewDetails(investment)}>
                          View Details
                        </Button>
                        <Button size="sm" onClick={() => handleBuyMore(investment)}>
                          Buy More
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-500/30 text-red-700 hover:bg-red-500/10 dark:text-red-300" onClick={() => handleSellReview(investment)}>
                          Sell
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Card className="h-fit border-primary/25 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Opportunities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {opportunityHighlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.title}
                      type="button"
                      className="w-full rounded-lg border bg-background/60 p-3 text-left transition-all hover:border-primary/30 hover:bg-background"
                      onClick={() => handleSelectOpportunity(item.optionId, item.asset)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="mt-0.5 h-4 w-4 text-primary" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{item.asset}</p>
                            <Badge variant="secondary" className="text-[10px]">{item.badge}</Badge>
                          </div>
                          <p className="mt-1 text-xs text-foreground/70">{item.insight}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Investment Form */}
        <TabsContent value="invest" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stage a New Investment Plan</CardTitle>
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
                      {fundingWallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name} - {formatMoney(wallet.balance)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Investment Amount ({displayCurrency})</Label>
                  <Input
                    type="number"
                    placeholder={displayCurrency === "UGX" ? "Enter amount in UGX..." : "Enter amount in USD..."}
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Values are converted using an estimated rate of 1 USD = 3,800 UGX.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-2">
                  <Label>Investment Option</Label>
                  <Select value={selectedOptionId} onValueChange={setSelectedOptionId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose investment option..." />
                    </SelectTrigger>
                    <SelectContent>
                      {investmentOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name} - {option.expectedReturn}% expected
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="rounded-lg border bg-muted/25 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      {getTypeIcon(selectedOption.type)}
                      <h4 className="font-semibold">{selectedOption.name}</h4>
                      <RiskBadge risk={selectedOption.riskLevel} />
                    </div>
                    <p className="text-sm text-foreground/75">{selectedOption.description}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-primary/25 bg-primary/5 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold">Plan readiness</span>
                    <Badge variant="secondary">{readiness}%</Badge>
                  </div>
                  <Progress value={readiness} className="mb-4 h-2" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Projected yearly return</span>
                      <span className="font-semibold">{formatMoney(projectedAnnualReturn)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Minimum required</span>
                      <span className="font-semibold">{formatMoney(selectedOption.minimumAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wallet after plan</span>
                      <span className={`font-semibold ${availableAfterInvestment >= 0 ? "text-foreground" : "text-red-600"}`}>
                        {formatMoney(availableAfterInvestment)}
                      </span>
                    </div>
                  </div>
                  <Button className="mt-4 w-full gap-2" onClick={() => handleInvestment()}>
                    Stage Investment Plan
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Investment Options */}
        <TabsContent value="opportunities" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {opportunityHighlights.map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.title} className="border-primary/25 bg-primary/5 shadow-sm">
                  <CardContent className="flex h-full flex-col gap-4 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="rounded-md bg-primary/15 p-2">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="secondary">{item.badge}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary">{item.title}</p>
                      <h3 className="mt-1 text-lg font-bold text-foreground">{item.asset}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-foreground/75">{item.insight}</p>
                    </div>
                    <Button
                      className="mt-auto gap-2"
                      onClick={() => handleSelectOpportunity(item.optionId, item.asset)}
                    >
                      Invest Now
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">All Investment Opportunities</h3>
              <p className="text-sm text-muted-foreground">Compare expected returns, minimums, duration, and risk.</p>
            </div>
          </div>

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
                          <RiskBadge risk={option.riskLevel} />
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
                            <p className="font-semibold">{formatMoney(option.minimumAmount)}</p>
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
                      onClick={() => {
                        setSelectedOptionId(option.id);
                        setActiveTab("invest");
                      }}
                      className="ml-4"
                    >
                      Select Plan
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
