# ManagementFlow

Personal finance management PWA (Indonesian language). All data stored in `localStorage`.

## Stack

- **Framework**: React 19, TypeScript 6.0, Vite 8
- **Build**: `npm run build` run `tsc -b && vite build` (typecheck then bundle)
- **Dev**: `npm run dev` — Vite HMR
- **Lint**: `npm run lint` — ESLint (`eslint.config.js`)

## TypeScript

- `verbatimModuleSyntax: true` — use `import type` for type-only imports
- `erasableSyntaxOnly: true` — no enums, no namespaces, no parameter properties
- Project references: `tsconfig.app.json` (src/) + `tsconfig.node.json` (vite.config.ts)
- `noUnusedLocals` / `noUnusedParameters` on — unused imports/vars are build errors

## Architecture

- **Firebase Auth** (email/password + Google Sign-In via popup). Config in `src/lib/firebase.ts`.
- **CRUD** via `localStorage` (keys: `incomes_${uid}`, `expenses_${uid}`, `budgets_${uid}`, `goals_${uid}`, `recurringIncomes_${uid}`, `safeLimit_${uid}`) — each key is prefixed with the Firebase user's UID so data is isolated per-account. All 6 data contexts use `useAuth()` to get the UID and load/persist data via `useEffect` on UID changes.
- **Email verification** uses a 6-digit code system (simulated — code stored in localStorage, shown in UI as demo). Keys: `emailVerifications` (code+expiry), `verifiedEmails` (list of verified addresses), `resetCodes` (password reset codes). Codes expire after 10 minutes.
- **Registration flow**: `createUserWithEmailAndPassword` → redirect to `/verify-email?email=...` → enter code → verified → dashboard
- **Login flow**: `signInWithEmailAndPassword` → check `verifiedEmails` → if unverified redirect to `/verify-email`
- **Forgot password flow**: enter email → `fetchSignInMethodsForEmail` (validate exists) → generate code → verify code → `sendPasswordResetEmail` (sends real Firebase reset link)
- **Google Sign-In**: `signInWithPopup` with Google provider — auto-verified (Google handles email verification)
- **ProtectedRoute** waits for Firebase `onAuthStateChanged` loading state before rendering
- **User type** (`src/types.ts`) now includes `uid: string`
- **Contexts** nested in `src/main.tsx` in this order (outermost first): `ThemeProvider` → `AuthProvider` → ... (rest unchanged)
- **Contexts** nested in `src/main.tsx` in this order (outermost first): `ThemeProvider` → `AuthProvider` → `IncomeProvider` → `RecurringIncomeProvider` → `ExpenseProvider` → `BudgetProvider` → `GoalProvider` → `ToastProvider`. Do not reorder.
## Routing

| Path | Page | Auth |
|------|------|------|
| `/login` | Login | public |
| `/register` | Register | public |
| `/forgot-password` | ForgotPassword | public |
| `/verify-email` | VerifyEmail | public (redirects if no email param) |
| `/dashboard` | Dashboard | protected |
| `/pemasukan` | Pemasukan | protected |
| `/pengeluaran` | Pengeluaran | protected |
| `/laporan` | Laporan | protected |
| `/budget` | BudgetPage | protected |
| `/goals` | GoalsPage | protected |
| `/profile` | Profile | protected |
| `*` | → redirect to `/dashboard` | — |
- **Recurring income**: `RecurringIncomeProvider` auto-generates income entries on the configured day of month. The check runs from `RecurringIncomeAuto` component inside `ToastProvider`. Form on Pemasukan page.
- **Recurring expense**: `RecurringExpenseProvider` auto-generates expense entries on the configured day of month via `RecurringExpenseAuto`. Form on Pengeluaran page.
- **Date picker is a `<select>` 1-31**, not a free-text input — prevents invalid day values.
- **Safe limit**: set in Profile → Pengaturan → Batas Aman Saldo (`localStorage key: safeLimit`). Dashboard shows warning banner when saldo drops below.
- **Above-average expense warning**: `ExpenseForm` checks if current month total exceeds average monthly expense, shows warning toast.
- **Stale component**: `src/components/Dashboard.tsx` has been deleted (use `src/pages/Dashboard.tsx`).

## Key packages

- `firebase` v12 — Auth (email/password + Google)
- `react-router-dom` v7 — routing
- `recharts` — bar/pie charts
- `lucide-react` — icons

## Conventions

- Indonesian UI labels: Pemasukan (income), Pengeluaran (expense), Laporan (reports)
- Categories defined in `src/data/categories.ts` as `const` arrays + derived literal types
- IDs generated as `Date.now().toString(36) + Math.random().toString(36).slice(2, 9)`
- Date format: `yyyy-mm-dd` strings, Indonesian locale (`id-ID`) for display
- CSS animations use `stagger-item` class for staggered fade-in
- No `import React from 'react'` needed (React 19 JSX transform)

## Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Dev server with HMR |
| `npm run build` | `tsc -b && vite build` |
| `npm run lint` | ESLint |

No test framework installed.
