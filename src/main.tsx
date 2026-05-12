import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { IncomeProvider } from './context/IncomeContext'
import { RecurringIncomeProvider } from './context/RecurringIncomeContext'
import { RecurringExpenseProvider } from './context/RecurringExpenseContext'
import { ExpenseProvider } from './context/ExpenseContext'
import { BudgetProvider } from './context/BudgetContext'
import { GoalProvider } from './context/GoalContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import RecurringIncomeAuto from './components/RecurringIncomeAuto'
import RecurringExpenseAuto from './components/RecurringExpenseAuto'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <IncomeProvider>
            <RecurringIncomeProvider>
              <ExpenseProvider>
                <RecurringExpenseProvider>
                  <BudgetProvider>
                    <GoalProvider>
                      <ToastProvider>
                        <RecurringIncomeAuto />
                        <RecurringExpenseAuto />
                        <App />
                      </ToastProvider>
                    </GoalProvider>
                  </BudgetProvider>
                </RecurringExpenseProvider>
              </ExpenseProvider>
            </RecurringIncomeProvider>
          </IncomeProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
