# ManagementFlow

Personal finance management PWA (Indonesian language). All data stored in **Firestore** (`firebase/firestore`).

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
- **Firestore CRUD** via `src/lib/firestore.ts` — `loadItems<T>(collection, uid)` / `saveItems<T>(collection, uid, items)` / `deleteItems(collection, uid)`. Each user's data is stored in Firestore documents (one doc per collection, keyed by UID). All 6 data contexts use `useAuth()` to get the UID and load/persist data via `useEffect` on UID changes.
- **Toast "Data telah disimpan"** — each context's `persist` function calls `showToast` from `src/lib/toastBus.ts` (global event bus) after saving to Firestore. `ToastContext` registers its `showToast` function with the bus on mount.
- **Rate limiting** via `src/lib/rateLimit.ts` — max 3 attempts per day per action (`register`, `verifyEmail`, `forgotPassword`). Tracks count+date in localStorage key `mf_rateLimits`. Resets daily.
- **Login failure tracker** — counts consecutive failed login attempts per email (`mf_loginFailures`). After 3+ failures, successful login redirects to forgot-password page (force password reset). No attempt cap on login.
- **Email verification** uses Firebase email verification (triggered via `sendEmailVerification`). Simulated 6-digit code system removed.
- **Registration flow**: `createUserWithEmailAndPassword` → send email verification → redirect to `/verify-email?email=...&sent=1` → poll `emailVerified` every 3s → dashboard
- **Login flow**: `signInWithEmailAndPassword` → check `emailVerified` → if unverified redirect to `/verify-email`
- **Forgot password flow**: enter email → `sendPasswordResetEmail` (Firebase). Removed `fetchSignInMethodsForEmail` to avoid email enumeration protection issues.
- **Google Sign-In**: `signInWithPopup` with Google provider — auto-verified (Google handles email verification)
- **ProtectedRoute** waits for Firebase `onAuthStateChanged` loading state before rendering
- **User type** (`src/types.ts`) now includes `uid: string`
- **Contexts** nested in `src/main.tsx` in this order (outermost first): `ThemeProvider` → `AuthProvider` → `IncomeProvider` → `RecurringIncomeProvider` → `ExpenseProvider` → `RecurringExpenseProvider` → `BudgetProvider` → `GoalProvider` → `ToastProvider`. Do not reorder.
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
- **Safe limit**: set in Profile → Pengaturan → Batas Aman Saldo (stored in Firestore `settings` collection). Dashboard shows warning banner when saldo drops below.
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
