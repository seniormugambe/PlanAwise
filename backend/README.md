# PlanWise AI Backend

This folder contains a separate backend service for the AI agent used by the PlanWise frontend.

## Agent Layer

The backend now includes the following agent modules:

- **Budget Agent**
  - Tracks spending
  - Suggests spending limits
  - Alerts overspending
- **Savings Agent**
  - Detects extra money
  - Recommends savings or auto-save amounts
  - Prepares smart contract deposit payloads for Web3 deposits
- **Financial Advisor Agent**
  - Chat-based assistant
  - Answers financial questions
  - Gives recommendations using OpenAI, Gemini, Vertex AI, or fallback logic
- **Investment Agent**
  - Provides investment guidance based on risk profile and cash flow
- **Receipt Tracker Agent**
  - Parses receipts from raw text
  - Tracks receipt records as a feature

## Setup

1. Copy `.env.example` to `.env`.
2. Choose an AI provider:
   - For OpenAI, set `AI_PROVIDER=openai`, `OPENAI_API_KEY`, and optionally `OPENAI_MODEL`.
   - For Google Cloud, set `AI_PROVIDER=vertex`, `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, and `VERTEX_AI_MODEL`.
   - For local Gemini API fallback, set `GEMINI_API_KEY`.
3. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
4. Run the backend in development:
   ```bash
   npm run dev
   ```

## API

- `POST /api/ai/advice`
  - Returns financial advice from the Financial Advisor Agent.
  - Body: `{ question: string, context?: object }`
- `POST /api/ai/financial-advice`
  - Alias for the Financial Advisor Agent.
  - Body: `{ question: string, context?: object }`
- `POST /api/ai/budget`
  - Returns spending analysis, suggested limits, or overspending alerts.
  - Body: `{ mode?: 'analyze'|'suggest'|'alert', context?: object, transactions?: array }`
- `POST /api/ai/savings`
  - Returns savings recommendations or auto-save suggestions.
  - Body: `{ context?: object, transactions?: array, autoSave?: boolean }`
- `POST /api/ai/savings/deposit`
  - Prepares a smart contract deposit payload for Web3 usage.
  - Body: `{ amount: number, contractAddress?: string, chainId?: number }`
- `POST /api/ai/investment`
  - Returns investment guidance.
  - Body: `{ question?: string, context?: object, transactions?: array }`
- `POST /api/ai/receipts`
  - Adds a receipt to the tracker from raw receipt text.
  - Body: `{ receiptText: string }`
- `GET /api/ai/receipts`
  - Lists tracked receipt records.
- `GET /api/ai/status`
  - Returns whether the AI advisor is connected.

The frontend is configured to proxy `/api` requests to this backend during development.

## Google Cloud / Vertex AI

When deployed on Cloud Run, the backend authenticates to Vertex AI through the Cloud Run service account. Locally, use Application Default Credentials:

```bash
gcloud auth application-default login
```

See `../GOOGLE_CLOUD.md` for Cloud Run deployment and frontend `VITE_API_URL` setup.
