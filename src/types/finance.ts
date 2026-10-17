export type TransactionType = 'INCOME' | 'EXPENSE';

export type TransactionCategory =
  | 'Salary & Wages'
  | 'Freelance & Consulting'
  | 'Investment & Dividends'
  | 'SaaS & Digital Products'
  | 'Housing & Rent'
  | 'Food & Dining'
  | 'Transportation'
  | 'Utilities & Cloud'
  | 'Tech & Hardware'
  | 'Marketing & Ads'
  | 'Healthcare & Insurance'
  | 'Entertainment & Leisure'
  | 'Education & Learning'
  | 'Taxes & Compliance'
  | 'Miscellaneous';

export type AccountType = 'CHECKING' | 'SAVINGS' | 'HIGH_YIELD' | 'CREDIT_CARD' | 'INVESTMENT';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  institution: string;
  accountNumberMask: string;
  startingBalance: number;
  currentBalance: number;
  currency: string;
  color: string;
}

export type TransactionStatus = 'CLEARED' | 'PENDING' | 'SCHEDULED';
export type RecurrenceFrequency = 'NONE' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number; // positive number
  type: TransactionType;
  category: TransactionCategory;
  accountId: string;
  status: TransactionStatus;
  recurrence: RecurrenceFrequency;
  notes?: string;
  merchant?: string;
  tags?: string[];
}

export interface TransactionWithBalance extends Transaction {
  runningBalance: number;
  netImpact: number;
}

export interface CategoryBreakdown {
  category: TransactionCategory;
  type: TransactionType;
  total: number;
  percentage: number;
  budgetLimit?: number;
  count: number;
  color: string;
}

export interface FinancialRatios {
  totalIncome: number;
  totalExpense: number;
  netCashflow: number; // Income - Expense
  incomeToExpenseRatio: number; // Income / Expense
  expenditureRatePercent: number; // (Expense / Income) * 100
  savingsRatePercent: number; // ((Income - Expense) / Income) * 100
  averageDailyBurn: number;
  monthlyProjectedBurn: number;
  runwayMonths: number;
  healthStatus: 'OPTIMAL' | 'HEALTHY' | 'MODERATE' | 'CAUTION' | 'DEFICIT';
  rule503020: {
    needs: { amount: number; percentage: number; target: number };
    wants: { amount: number; percentage: number; target: number };
    savings: { amount: number; percentage: number; target: number };
  };
}

export interface CashflowPoint {
  date: string;
  label: string;
  inflow: number;
  outflow: number;
  net: number;
  balance: number;
  isProjected: boolean;
}

export interface ScenarioParams {
  incomeDeltaPercent: number; // e.g. +10% or -10%
  expenseDeltaPercent: number; // e.g. -15%
  oneTimeExpense: number;
  oneTimeExpenseDate: string;
  oneTimeIncome: number;
  oneTimeIncomeDate: string;
  isActive: boolean;
}
