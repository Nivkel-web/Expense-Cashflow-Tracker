import {
  Account,
  CategoryBreakdown,
  FinancialRatios,
  ScenarioParams,
  Transaction,
  TransactionCategory,
  TransactionWithBalance,
  CashflowPoint,
} from '../types/finance';
import { CATEGORY_BUDGETS, CATEGORY_COLORS } from '../data/initialData';

const NEEDS_CATEGORIES: TransactionCategory[] = [
  'Housing & Rent',
  'Utilities & Cloud',
  'Healthcare & Insurance',
  'Transportation',
  'Taxes & Compliance',
];

const WANTS_CATEGORIES: TransactionCategory[] = [
  'Food & Dining',
  'Entertainment & Leisure',
  'Tech & Hardware',
  'Marketing & Ads',
  'Education & Learning',
  'Miscellaneous',
];

export function getInitialLiquidBalance(accounts: Account[], accountIdFilter: string = 'ALL'): number {
  if (accountIdFilter !== 'ALL') {
    const acc = accounts.find((a) => a.id === accountIdFilter);
    return acc ? acc.startingBalance : 0;
  }
  // Total of all non-credit card starting balances minus starting credit card liabilities
  return accounts.reduce((sum, acc) => {
    return sum + acc.startingBalance;
  }, 0);
}

export function getCurrentLiquidBalance(accounts: Account[], accountIdFilter: string = 'ALL'): number {
  if (accountIdFilter !== 'ALL') {
    const acc = accounts.find((a) => a.id === accountIdFilter);
    return acc ? acc.currentBalance : 0;
  }
  return accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
}

export function calculateRunningBalances(
  transactions: Transaction[],
  startingBalance: number,
  scenario?: ScenarioParams
): TransactionWithBalance[] {
  // Clone and sort chronologically (oldest first)
  const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // If scenario active, apply modifiers
  let adjustedList = sorted.map((tx) => {
    let effectiveAmount = tx.amount;
    if (scenario && scenario.isActive) {
      if (tx.type === 'INCOME' && scenario.incomeDeltaPercent !== 0) {
        effectiveAmount = tx.amount * (1 + scenario.incomeDeltaPercent / 100);
      } else if (tx.type === 'EXPENSE' && scenario.expenseDeltaPercent !== 0) {
        effectiveAmount = tx.amount * (1 + scenario.expenseDeltaPercent / 100);
      }
    }
    return { ...tx, amount: effectiveAmount };
  });

  // Inject scenario one-off items if present
  if (scenario && scenario.isActive) {
    if (scenario.oneTimeIncome > 0 && scenario.oneTimeIncomeDate) {
      adjustedList.push({
        id: 'scenario-income-sim',
        date: scenario.oneTimeIncomeDate,
        description: 'Simulated Inflow Shock',
        amount: scenario.oneTimeIncome,
        type: 'INCOME',
        category: 'Freelance & Consulting',
        accountId: 'acc-1',
        status: 'SCHEDULED',
        recurrence: 'NONE',
        notes: 'Scenario Simulator Injection',
        tags: ['Simulation'],
      });
    }
    if (scenario.oneTimeExpense > 0 && scenario.oneTimeExpenseDate) {
      adjustedList.push({
        id: 'scenario-expense-sim',
        date: scenario.oneTimeExpenseDate,
        description: 'Simulated CapEx Outflow Shock',
        amount: scenario.oneTimeExpense,
        type: 'EXPENSE',
        category: 'Tech & Hardware',
        accountId: 'acc-1',
        status: 'SCHEDULED',
        recurrence: 'NONE',
        notes: 'Scenario Simulator Injection',
        tags: ['Simulation'],
      });
    }
    adjustedList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  let running = startingBalance;
  return adjustedList.map((tx) => {
    const netImpact = tx.type === 'INCOME' ? tx.amount : -tx.amount;
    running += netImpact;
    return {
      ...tx,
      netImpact,
      runningBalance: Math.round(running * 100) / 100,
    };
  });
}

export function calculateFinancialRatios(
  transactions: TransactionWithBalance[],
  currentLiquidBalance: number
): FinancialRatios {
  let totalIncome = 0;
  let totalExpense = 0;
  let needsTotal = 0;
  let wantsTotal = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'INCOME') {
      totalIncome += tx.amount;
    } else {
      totalExpense += tx.amount;
      if (NEEDS_CATEGORIES.includes(tx.category)) {
        needsTotal += tx.amount;
      } else {
        wantsTotal += tx.amount;
      }
    }
  });

  const netCashflow = totalIncome - totalExpense;
  const incomeToExpenseRatio = totalExpense > 0 ? totalIncome / totalExpense : totalIncome > 0 ? 99 : 1;
  const expenditureRatePercent = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
  const savingsRatePercent = totalIncome > 0 ? (netCashflow / totalIncome) * 100 : 0;

  // Assume period covers roughly 60 days of transactional data
  const daysEstimate = 60;
  const averageDailyBurn = totalExpense / daysEstimate;
  const monthlyProjectedBurn = averageDailyBurn * 30;

  // Runway in months:
  const runwayMonths = monthlyProjectedBurn > 0 ? Math.max(0, currentLiquidBalance / monthlyProjectedBurn) : 99;

  let healthStatus: FinancialRatios['healthStatus'] = 'HEALTHY';
  if (incomeToExpenseRatio >= 1.5) {
    healthStatus = 'OPTIMAL';
  } else if (incomeToExpenseRatio >= 1.15) {
    healthStatus = 'HEALTHY';
  } else if (incomeToExpenseRatio >= 1.0) {
    healthStatus = 'MODERATE';
  } else if (incomeToExpenseRatio >= 0.8) {
    healthStatus = 'CAUTION';
  } else {
    healthStatus = 'DEFICIT';
  }

  // 50/30/20 Rule computation relative to total income
  const baseDenominator = totalIncome > 0 ? totalIncome : totalExpense || 1;
  const needsPercent = (needsTotal / baseDenominator) * 100;
  const wantsPercent = (wantsTotal / baseDenominator) * 100;
  const savingsPercent = Math.max(0, (netCashflow / baseDenominator) * 100);

  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpense: Math.round(totalExpense * 100) / 100,
    netCashflow: Math.round(netCashflow * 100) / 100,
    incomeToExpenseRatio: Math.round(incomeToExpenseRatio * 100) / 100,
    expenditureRatePercent: Math.round(expenditureRatePercent * 10) / 10,
    savingsRatePercent: Math.round(savingsRatePercent * 10) / 10,
    averageDailyBurn: Math.round(averageDailyBurn * 100) / 100,
    monthlyProjectedBurn: Math.round(monthlyProjectedBurn * 100) / 100,
    runwayMonths: Math.round(runwayMonths * 10) / 10,
    healthStatus,
    rule503020: {
      needs: { amount: needsTotal, percentage: Math.round(needsPercent), target: 50 },
      wants: { amount: wantsTotal, percentage: Math.round(wantsPercent), target: 30 },
      savings: { amount: Math.max(0, netCashflow), percentage: Math.round(savingsPercent), target: 20 },
    },
  };
}

export function calculateCategoryBreakdown(
  transactions: Transaction[],
  typeFilter: 'EXPENSE' | 'INCOME' = 'EXPENSE'
): CategoryBreakdown[] {
  const filtered = transactions.filter((tx) => tx.type === typeFilter);
  const totalAmount = filtered.reduce((acc, tx) => acc + tx.amount, 0);

  const grouped: Record<string, { total: number; count: number; category: TransactionCategory }> = {};

  filtered.forEach((tx) => {
    if (!grouped[tx.category]) {
      grouped[tx.category] = { total: 0, count: 0, category: tx.category };
    }
    grouped[tx.category].total += tx.amount;
    grouped[tx.category].count += 1;
  });

  return Object.values(grouped)
    .map((item) => ({
      category: item.category,
      type: typeFilter,
      total: Math.round(item.total * 100) / 100,
      percentage: totalAmount > 0 ? Math.round((item.total / totalAmount) * 1000) / 10 : 0,
      budgetLimit: CATEGORY_BUDGETS[item.category],
      count: item.count,
      color: CATEGORY_COLORS[item.category] || '#94A3B8',
    }))
    .sort((a, b) => b.total - a.total);
}

export function generateCashflowTimeline(
  transactionsWithBalance: TransactionWithBalance[],
  currentDateStr: string = '2026-10-17'
): CashflowPoint[] {
  // Aggregate by date
  const dateMap = new Map<string, { inflow: number; outflow: number; net: number; balance: number; isProjected: boolean }>();

  transactionsWithBalance.forEach((tx) => {
    const isProjected = new Date(tx.date).getTime() > new Date(currentDateStr).getTime();
    const existing = dateMap.get(tx.date) || {
      inflow: 0,
      outflow: 0,
      net: 0,
      balance: tx.runningBalance,
      isProjected,
    };

    if (tx.type === 'INCOME') {
      existing.inflow += tx.amount;
    } else {
      existing.outflow += tx.amount;
    }
    existing.net = existing.inflow - existing.outflow;
    existing.balance = tx.runningBalance; // latest running balance on that day
    existing.isProjected = isProjected;
    dateMap.set(tx.date, existing);
  });

  const points: CashflowPoint[] = [];
  const sortedDates = Array.from(dateMap.keys()).sort();

  sortedDates.forEach((date) => {
    const data = dateMap.get(date)!;
    const d = new Date(date);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    points.push({
      date,
      label,
      inflow: Math.round(data.inflow),
      outflow: Math.round(data.outflow),
      net: Math.round(data.net),
      balance: Math.round(data.balance),
      isProjected: data.isProjected,
    });
  });

  return points;
}

export function formatCurrency(amount: number, currency: string = 'KES'): string {
  const formatted = Math.abs(amount).toLocaleString('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const prefix = amount < 0 ? '-KSh ' : 'KSh ';
  return `${prefix}${formatted}`;
}

