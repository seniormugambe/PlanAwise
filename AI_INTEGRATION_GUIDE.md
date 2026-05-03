# AI Agent Integration Guide

## Overview

The PlanAwise Frontend has been fully integrated with AI Agents for real financial analysis and recommendations. This document explains the integration architecture and how to use the features.

## Architecture

### Service Layer
- **`aiAgentService.ts`**: Unified service that wraps all AI agent endpoints
  - Handles API communication with backend agents
  - Manages API key configuration
  - Provides specialized methods for each agent type
  - Formats financial context for agent processing

### Custom Hooks
- **`useAIAgent.ts`**: React hook for accessing AI agent functionality
  - Provides loading/error states
  - Simplifies agent API calls
  - Handles response parsing and error handling

### Components Using AI Agents
1. **BudgetAnalysis** (`frontend/src/components/BudgetAnalysis.tsx`)
   - Uses: Budget AI Agent
   - Features: Spending analysis, budget recommendations, expense alerts
   - Modes: Analyze, Suggest, Alert

2. **SavingsRecommendations** (`frontend/src/components/SavingsRecommendations.tsx`)
   - Uses: Savings AI Agent
   - Features: Savings optimization, auto-save suggestions, goal tracking
   - Provides actionable monthly savings recommendations

3. **InvestmentAdvice** (`frontend/src/components/InvestmentAdvice.tsx`)
   - Uses: Investment AI Agent
   - Features: Portfolio analysis, investment recommendations, risk assessment
   - Supports custom investment questions

4. **FinancialAdvisor** (`frontend/src/components/FinancialAdvisor.tsx`)
   - Uses: Multi-agent orchestration system
   - Features: Chat-based financial guidance
   - Automatically selects the best agent for each question

## Data Flow

### From Mock to Real Data

1. **Frontend Hooks** - Fetch data from backend APIs:
   ```
   useWallets() → /api/data/wallets
   useGoals() → /api/data/goals
   useGamification() → /api/data/gamification
   useFinancialChat() → /api/ai/process
   ```

2. **AI Agent Service** - Sends financial data to AI agents:
   ```
   Financial Context (income, expenses, goals, wallets)
   ↓
   AI Agent Processing
   ↓
   Recommendations & Analysis
   ```

3. **Real Data Sources**:
   - Wallet data from Web3 integration and backend
   - Transaction history from blockchain/ledger
   - Goals from user-created financial goals
   - Gamification stats from backend

## Agent Endpoints

### Budget Analysis
```
POST /api/ai/budget
{
  context: FinancialContext,
  transactions: WalletTransaction[],
  mode: 'analyze' | 'suggest' | 'alert'
}
```

### Savings Recommendations
```
POST /api/ai/savings
{
  context: FinancialContext,
  transactions: WalletTransaction[],
  autoSave: boolean
}
```

### Investment Advice
```
POST /api/ai/investment
{
  context: FinancialContext,
  transactions: WalletTransaction[],
  question?: string
}
```

### Financial Advice (Chat)
```
POST /api/ai/advice
{
  question: string,
  context: FinancialContext
}
```

### Unified Query Processor
```
POST /api/ai/process
{
  query: string,
  context: FinancialContext,
  transactions: WalletTransaction[],
  preferredAgent: 'auto' | 'budget' | 'savings' | 'investment' | 'advisor'
}
```

## Using the AI Services in Components

### Example: Budget Analysis Component

```typescript
import { useAIAgent } from '@/hooks/useAIAgent';
import { useWallets } from '@/hooks/useWallets';

export const MyComponent = () => {
  const { wallets, transactions } = useWallets();
  const { getBudgetAdvice, isLoading, error } = useAIAgent();

  useEffect(() => {
    const fetchAdvice = async () => {
      const response = await getBudgetAdvice(
        {
          monthlyIncome: 5500,
          monthlyExpenses: 3420,
          totalBalance: 12450,
        },
        transactions
      );
      
      if (response) {
        console.log(response.answer);
      }
    };

    fetchAdvice();
  }, []);

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error} />;
  
  return <div>{/* render advice */}</div>;
};
```

## Financial Context Structure

```typescript
interface FinancialContext {
  monthlyIncome?: number;           // Monthly salary/income
  monthlyExpenses?: number;         // Monthly spending
  currentSavings?: number;          // Current savings amount
  totalBalance?: number;            // Total account balance
  goals?: Array<{                   // Financial goals
    title: string;
    current: number;
    target: number;
  }>;
  wallets?: Wallet[];               // All connected wallets
  recentTransactions?: Transaction[];// Recent transactions
}
```

## Key Features Enabled

### 1. Intelligent Budget Management
- Analyzes spending patterns
- Suggests budget limits based on income and expenses
- Alerts when spending exceeds recommendations
- Recommends categories for improvement

### 2. Smart Savings Optimization
- Calculates optimal savings amount
- Recommends auto-save frequency
- Tracks progress toward savings goals
- Estimates time to reach financial goals

### 3. Personalized Investment Guidance
- Risk assessment based on financial situation
- Investment recommendations tailored to profile
- Portfolio analysis and optimization
- Support for custom investment questions

### 4. Multi-Agent Orchestration
- Automatically selects best agent for user queries
- Combines insights from multiple agents for complex questions
- Maintains conversation context
- Learning-based agent selection

## Real Data Integration

### Wallet Data
```
Source: /api/data/wallets
Returns: Wallet[], Transaction[]
Used by: BudgetAnalysis, SavingsRecommendations, InvestmentAdvice
```

### Goals Data
```
Source: /api/data/goals
Returns: FinancialGoal[]
Used by: Goal Tracker, AI context preparation
```

### Gamification Stats
```
Source: /api/data/gamification
Returns: GamificationStats
Used by: GamificationPanel
```

### Transactions Data
```
Source: useWallets() hook
Returns: WalletTransaction[]
Used by: All AI agents for analysis
```

## API Key Configuration

The system supports two ways to provide API keys:

1. **Environment Variable**:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

2. **Local Storage**:
   ```typescript
   const aiAgent = useAIAgent();
   aiAgent.setApiKey('your_api_key_here');
   ```

## Status Checking

```typescript
const { checkStatus, isConnected } = useAIAgent();

await checkStatus(); // Returns boolean indicating connection
```

## Error Handling

All AI agent calls include error handling:

```typescript
const { isLoading, error } = useAIAgent();

if (error) {
  // Handle error - could be:
  // - Network error
  // - Invalid API key
  // - Backend service unavailable
}
```

## Performance Optimization

- Responses are cached where appropriate
- Requests are debounced in input fields
- Real-time analysis updates on transaction changes
- Lazy loading of agent components

## Future Enhancements

- [ ] Receipt OCR processing via Receipt Agent
- [ ] Automated portfolio rebalancing suggestions
- [ ] Debt payoff optimization strategies
- [ ] Tax optimization recommendations
- [ ] Retirement planning analysis
- [ ] Long-term wealth building strategies

## Troubleshooting

### API Key Issues
If you see "AI backend not connected" errors:
1. Verify API key is set correctly
2. Check that backend service is running on port 4000
3. Ensure GEMINI_API_KEY environment variable is configured

### No Recommendations Generated
1. Ensure you have transaction data
2. Check that financial context is properly populated
3. Verify internet connection to backend

### Components Not Updating
1. Check browser console for error messages
2. Verify data is being fetched from hooks
3. Check that wallet data is loaded before AI requests

## Support

For issues or questions about the AI agent integration, please refer to the backend documentation or contact the development team.
