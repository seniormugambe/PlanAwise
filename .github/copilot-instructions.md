# Copilot Instructions for AI Coding Agents

## Project Overview
- **Tech stack:** Vite, React, TypeScript, shadcn-ui, Tailwind CSS
- **Purpose:** Personal finance app with gamification, AI-powered financial advice, wallet integration, and payment processing.

## Architecture & Key Patterns
- **AI Advisors:**
  - Core logic in `src/services/aiFinancialAdvisor.ts`, `lovableAiAdvisor.ts`, and `geminiAiService.ts`.
  - Each advisor class exposes `getAdvice(question: string): Promise<AdviceResponse>` and manages a `FinancialContext` object.
  - Use `getInstance()` for singleton access.
  - Advice responses are categorized (`budgeting`, `saving`, `investing`, `debt`, `general`) and often include confidence scores.
- **Gamification:**
  - Achievements, streaks, and user levels defined in `src/data/gamification.ts` and `src/types/gamification.ts`.
  - Gamification logic is surfaced in UI via components like `GamificationPanel`, `AchievementNotification`, and hooks (`useGamification`).
- **Wallets & Payments:**
  - Wallet management in `src/components/WalletManager.tsx`, analytics in `WalletAnalytics.tsx`.
  - Payment integration via `BoundlessPayService` (`src/services/boundlessPayService.ts`), with config and status types in `src/types/boundlessPay.ts`.
  - Use `initialize`, `saveConfig`, and `processPayment` methods for payment flows. API keys are stored in browser localStorage.
- **UI Conventions:**
  - All UI primitives (Button, Card, Input, etc.) are in `src/components/ui/` and follow shadcn-ui conventions.
  - Use Tailwind utility classes for styling. Prefer composable, stateless components.
  - Bot personalities and suggested questions are defined in `FinancialAdvisor.tsx`.

## Developer Workflows
- **Local development:**
  - Start with `npm run dev` (Vite server, port 8080).
  - Hot reload is enabled; aliases use `@` for `src/`.
- **API Keys:**
  - Gemini API key: set via browser localStorage or `.env` (`VITE_GEMINI_API_KEY`).
  - Boundless Pay API key: set via UI, validated for format (`bp_...`, length >= 32).
- **Testing & Debugging:**
  - No formal test suite detected; rely on manual UI/logic validation.
  - Use mock data in `src/data/` for gamification and wallet features.
- **Deployment:**
  - Deploy via Lovable platform (see README for details).

## Project-Specific Conventions
- **Advice responses:** Always include actionable, personalized feedback and encouragement. Use emojis and positive language.
- **Gamification:** All achievements, streaks, and levels should be surfaced in the UI and updated reactively.
- **Wallets:** Real-time balance updates and seamless transfers are expected. Use mock implementations for local dev.
- **External Integrations:**
  - Boundless Pay: Always start in sandbox for testing. Credentials never sent to server; stored locally.
  - Gemini AI: Fallback to local responses if API/model is unavailable.

## Example Patterns
- **AI Advisor usage:**
  ```ts
  import { aiAdvisor } from '@/services/aiFinancialAdvisor';
  const advice = await aiAdvisor.getAdvice('How can I save more?');
  ```
- **Gamification update:**
  ```ts
  import { useGamification } from '@/hooks/useGamification';
  const { unlockAchievement } = useGamification();
  unlockAchievement('early-bird');
  ```
- **Payment flow:**
  ```ts
  import { BoundlessPayService } from '@/services/boundlessPayService';
  const service = BoundlessPayService.getInstance();
  await service.initialize({ apiKey, merchantId });
  const tx = await service.processPayment(100, 'USD', 'creditCard');
  ```

## References
- [README.md](../../README.md) for deployment and platform info
- `src/services/` for AI and payment logic
- `src/data/` and `src/types/` for gamification and wallet schemas
- `src/components/ui/` for UI conventions

---
**Feedback:** If any section is unclear or missing, please specify so it can be improved for future AI agents.
