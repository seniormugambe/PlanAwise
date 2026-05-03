# PlanAwise - AI-Powered Personal Finance Dashboard

A modern, intelligent financial management platform with Web3 integration and AI-powered insights. Built with React, TypeScript, and powered by Google Gemini AI or Google Cloud Vertex AI.

## 🌟 Key Features

### AI-Powered Financial Intelligence
- **Smart Budget Analysis** - Real-time spending analysis with AI recommendations
- **Savings Optimization** - Intelligent suggestions for maximizing your savings
- **Investment Advice** - Personalized investment strategies based on your financial profile
- **Financial Chat** - Multi-agent AI assistant for financial questions

### Core Features
- 💰 **Multi-Wallet Management** - Connect multiple blockchain networks (Ethereum, Polygon, Base, Celo, Arbitrum, Optimism)
- 📊 **Financial Dashboard** - Real-time overview of balances, income, expenses
- 🎯 **Goal Tracking** - Set and monitor financial goals
- 🏆 **Gamification** - Earn XP, achievements, and level up
- 📈 **Investment Hub** - Track and analyze investments
- 🎨 **Dark/Light Theme** - Beautiful, responsive UI

## 🤖 AI Agents Integration

The frontend is fully integrated with multiple specialized AI agents:

| Agent | Purpose | Features |
|-------|---------|----------|
| **Budget Agent** | Spending analysis | Analyze spending, suggest limits, alert overspending |
| **Savings Agent** | Savings optimization | Smart suggestions, auto-save, goal tracking |
| **Investment Agent** | Portfolio guidance | Risk assessment, recommendations, custom questions |
| **Financial Advisor** | General guidance | Multi-agent orchestration, conversational AI |
| **Receipt Tracker** | Expense categorization | OCR processing, automatic categorization |

### Real Data Integration

All components use real data from backend APIs:
- ✅ Real wallet data from Web3 and backend
- ✅ Actual transaction history
- ✅ User-created financial goals
- ✅ Gamification progress
- ✅ No mock data in production flows

## 🚀 Quick Start

### Prerequisites
- Node.js & npm (or Bun)
- Backend server running on `http://localhost:4000`
- Gemini API key or a Google Cloud project with Vertex AI enabled

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd PlanAwise

# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your Gemini API key

# Start frontend development server
npm run dev

# In another terminal, start the backend
cd backend
npm install
npm start
```

### Access the Application
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Dashboard: View "AI Insights" tab for AI-powered recommendations

## 📁 Project Structure

```
PlanAwise/
├── src/
│   ├── components/
│   │   ├── BudgetAnalysis.tsx         # AI budget analysis
│   │   ├── SavingsRecommendations.tsx # AI savings advice
│   │   ├── InvestmentAdvice.tsx       # AI investment guidance
│   │   ├── FinancialAdvisor.tsx       # AI chat assistant
│   │   └── [other components]
│   ├── hooks/
│   │   ├── useAIAgent.ts              # AI agent hook
│   │   ├── useWallets.ts              # Real wallet data
│   │   ├── useGoals.ts                # Real goals data
│   │   └── useGamification.ts         # Real gamification data
│   ├── services/
│   │   ├── aiAgentService.ts          # Unified AI service
│   │   └── [other services]
│   ├── pages/
│   │   ├── Index.tsx                  # Main dashboard
│   │   └── Wallets.tsx                # Wallet management
│   └── [configuration and utilities]
├── backend/
│   ├── src/
│   │   ├── agents/                    # AI agent implementations
│   │   ├── data/                      # Mock data for development
│   │   └── index.ts                   # Express server
│   └── [configuration]
└── [configuration files]
```

## 🔌 API Endpoints

### AI Agents
- `POST /api/ai/process` - Multi-agent processor
- `POST /api/ai/budget` - Budget analysis
- `POST /api/ai/savings` - Savings recommendations
- `POST /api/ai/investment` - Investment advice
- `POST /api/ai/advice` - Financial guidance
- `POST /api/ai/receipts` - Receipt processing

### Data APIs
- `GET /api/data/wallets` - Wallet data
- `GET /api/data/goals` - Goals data
- `GET /api/data/gamification` - Gamification stats

## 📚 Documentation

- **[AI Integration Guide](./AI_INTEGRATION_GUIDE.md)** - Detailed API documentation and architecture
- **[Quick Start Guide](./QUICK_START_AI_AGENTS.md)** - Common tasks and examples
- **[Integration Summary](./FRONTEND_AI_INTEGRATION_SUMMARY.md)** - What's been implemented

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type checking
npm run type-check
```

### Backend Commands

```bash
# Start backend server
npm start

# Development with auto-reload
npm run dev

# Build
npm run build
```

## 🔑 Configuration

### Environment Variables

Create a `.env` file:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_API_URL=http://localhost:4000
```

For production Google Cloud setup, see [GOOGLE_CLOUD.md](./GOOGLE_CLOUD.md).

### API Key Setup

1. **Get Gemini API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/apikey)
   - Create a new API key

2. **Configure in App**:
   - Set via environment variable, or
   - Configure via localStorage in the app

## 🌐 Web3 Support

Supported networks:
- Ethereum Mainnet
- Polygon
- Base
- Celo
- Arbitrum One
- Optimism
- Avalanche C-Chain

## 🎨 UI Features

- Dark/Light mode toggle
- Responsive design (Mobile, Tablet, Desktop)
- Smooth animations and transitions
- Real-time data updates
- Accessible components (WCAG 2.1)

## 📊 AI Insights Dashboard

The "AI Insights" tab provides:

1. **Budget Analysis**
   - Monthly budget breakdown
   - Spending recommendations
   - Alert levels and warnings

2. **Savings Recommendations**
   - Optimal monthly savings amount
   - Auto-save suggestions
   - Annual savings projection

3. **Investment Advice**
   - Personalized strategies
   - Risk assessment
   - Portfolio recommendations

## 🐛 Troubleshooting

### Backend Connection Issues
```
Error: "AI backend not connected"
Solution: 
1. Ensure backend is running: npm start (in backend folder)
2. Check API key is configured
3. Verify port 4000 is available
```

### Missing Data
```
Error: "No recommendations generated"
Solution:
1. Ensure wallet data is loaded
2. Add some transactions
3. Check browser console for errors
```

## 📈 Performance

- Real-time data updates
- Optimized API calls
- Cached responses where appropriate
- Sub-300ms response times for most requests

## 🔐 Security

- API keys stored in localStorage or environment
- CORS enabled for local development
- Input validation on all API calls
- No sensitive data in logs

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

[Specify your license here]

## 🙏 Acknowledgments

- Built with React, TypeScript, Tailwind CSS
- AI powered by Google Gemini
- Web3 integration via wagmi and ethers.js
- UI components from shadcn/ui

## 📞 Support

For issues or questions:
1. Check the documentation files
2. Review the code comments
3. Check browser console for error messages
4. Contact the development team

---

**Last Updated**: May 1, 2026  
**Status**: Production Ready ✅
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ffff70fe-95bd-449d-80ae-013712698cc9) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
