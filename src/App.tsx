import React, { useState, useMemo, useRef } from 'react';
import {
  Account,
  ScenarioParams,
  Transaction,
  TransactionCategory,
  TransactionStatus,
} from './types/finance';
import {
  INITIAL_ACCOUNTS,
  INITIAL_TRANSACTIONS,
} from './data/initialData';
import {
  calculateCategoryBreakdown,
  calculateFinancialRatios,
  calculateRunningBalances,
  formatCurrency,
  generateCashflowTimeline,
  getCurrentLiquidBalance,
  getInitialLiquidBalance,
} from './utils/financialMath';
import { Header, ActiveTab } from './components/Header';
import { RatioCards } from './components/RatioCards';
import { CashflowChart } from './components/CashflowChart';
import { CategoricalBreakdown } from './components/CategoricalBreakdown';
import { RunningBalanceLedger } from './components/RunningBalanceLedger';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { AddTransactionModal } from './components/AddTransactionModal';
import { ArchitectureDocs } from './components/ArchitectureDocs';
import {
  Building2,
  CreditCard,
  Wallet,
  Sparkles,
  TrendingUp,
  Receipt,
  PieChart,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export default function App() {
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<ActiveTab>('DASHBOARD');
  const [categoryFilter, setCategoryFilter] = useState<TransactionCategory | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Hidden file input for JSON import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // What-If Scenario State
  const [scenario, setScenario] = useState<ScenarioParams>({
    incomeDeltaPercent: 0,
    expenseDeltaPercent: 0,
    oneTimeExpense: 0,
    oneTimeExpenseDate: '2026-10-25',
    oneTimeIncome: 0,
    oneTimeIncomeDate: '2026-10-28',
    isActive: false,
  });

  // Filter transactions by selected account
  const accountTransactions = useMemo(() => {
    if (selectedAccountId === 'ALL') {
      return transactions;
    }
    return transactions.filter((tx) => tx.accountId === selectedAccountId);
  }, [transactions, selectedAccountId]);

  // Baseline Starting Balance
  const baselineStartingBalance = useMemo(() => {
    return getInitialLiquidBalance(accounts, selectedAccountId);
  }, [accounts, selectedAccountId]);

  // Current liquid cash balance
  const currentLiquidBalance = useMemo(() => {
    return getCurrentLiquidBalance(accounts, selectedAccountId);
  }, [accounts, selectedAccountId]);

  // Running balance calculation with optional active scenario
  const transactionsWithBalance = useMemo(() => {
    return calculateRunningBalances(accountTransactions, baselineStartingBalance, scenario);
  }, [accountTransactions, baselineStartingBalance, scenario]);

  // Baseline running balances (without scenario, for differential analysis)
  const baselineTransactionsWithBalance = useMemo(() => {
    return calculateRunningBalances(accountTransactions, baselineStartingBalance, {
      ...scenario,
      isActive: false,
    });
  }, [accountTransactions, baselineStartingBalance, scenario]);

  // Metrics & Solvency Ratios
  const ratios = useMemo(() => {
    return calculateFinancialRatios(transactionsWithBalance, currentLiquidBalance);
  }, [transactionsWithBalance, currentLiquidBalance]);

  const baselineRatios = useMemo(() => {
    return calculateFinancialRatios(baselineTransactionsWithBalance, currentLiquidBalance);
  }, [baselineTransactionsWithBalance, currentLiquidBalance]);

  // Daily cashflow timeline curve for SVG chart
  const cashflowTimeline = useMemo(() => {
    return generateCashflowTimeline(transactionsWithBalance);
  }, [transactionsWithBalance]);

  // Categorical breakdowns
  const expenseBreakdowns = useMemo(() => {
    return calculateCategoryBreakdown(accountTransactions, 'EXPENSE');
  }, [accountTransactions]);

  const incomeBreakdowns = useMemo(() => {
    return calculateCategoryBreakdown(accountTransactions, 'INCOME');
  }, [accountTransactions]);

  // Transaction Actions
  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);

    // Update account balance
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === newTx.accountId) {
          const delta = newTx.type === 'INCOME' ? newTx.amount : -newTx.amount;
          return {
            ...acc,
            currentBalance: Math.round((acc.currentBalance + delta) * 100) / 100,
          };
        }
        return acc;
      })
    );
  };

  const handleDeleteTransaction = (id: string) => {
    const txToDelete = transactions.find((t) => t.id === id);
    if (!txToDelete) return;

    setTransactions((prev) => prev.filter((t) => t.id !== id));

    // Revert balance impact on account
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === txToDelete.accountId) {
          const revertDelta = txToDelete.type === 'INCOME' ? -txToDelete.amount : txToDelete.amount;
          return {
            ...acc,
            currentBalance: Math.round((acc.currentBalance + revertDelta) * 100) / 100,
          };
        }
        return acc;
      })
    );
  };

  const handleToggleStatus = (id: string) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === id) {
          const nextStatus: TransactionStatus =
            tx.status === 'CLEARED'
              ? 'PENDING'
              : tx.status === 'PENDING'
              ? 'SCHEDULED'
              : 'CLEARED';
          return { ...tx, status: nextStatus };
        }
        return tx;
      })
    );
  };

  // Switch to Ledger view with filtered category
  const handleFilterCategoryInLedger = (category: TransactionCategory) => {
    setCategoryFilter(category);
    setActiveTab('LEDGER');
  };

  // Presets
  const handleSelectPreset = (presetName: string) => {
    if (presetName === 'AGENCY') {
      setAccounts(INITIAL_ACCOUNTS);
      setTransactions(INITIAL_TRANSACTIONS);
    } else if (presetName === 'PROFESSIONAL') {
      setAccounts([
        {
          id: 'acc-1',
          name: 'Personal Operating Checking',
          type: 'CHECKING',
          institution: 'Standard Chartered Kenya',
          accountNumberMask: '•••• 1122',
          startingBalance: 650000,
          currentBalance: 820000,
          currency: 'KES',
          color: '#10B981',
        },
        {
          id: 'acc-2',
          name: 'Emergency Reserve (MMF)',
          type: 'HIGH_YIELD',
          institution: 'Sanlam / NCBA Money Market Fund',
          accountNumberMask: '•••• 8831',
          startingBalance: 2400000,
          currentBalance: 2480000,
          currency: 'KES',
          color: '#06B6D4',
        },
      ]);
      setTransactions([
        {
          id: 'p-1',
          date: '2026-09-01',
          description: 'Tech Lead Salary - Direct Deposit',
          amount: 620000,
          type: 'INCOME',
          category: 'Salary & Wages',
          accountId: 'acc-1',
          status: 'CLEARED',
          recurrence: 'MONTHLY',
        },
        {
          id: 'p-2',
          date: '2026-09-02',
          description: 'Apartment Rent (Kilimani)',
          amount: 140000,
          type: 'EXPENSE',
          category: 'Housing & Rent',
          accountId: 'acc-1',
          status: 'CLEARED',
          recurrence: 'MONTHLY',
        },
        {
          id: 'p-3',
          date: '2026-09-05',
          description: 'Groceries & Household Supplies',
          amount: 45000,
          type: 'EXPENSE',
          category: 'Food & Dining',
          accountId: 'acc-1',
          status: 'CLEARED',
          recurrence: 'BIWEEKLY',
        },
        {
          id: 'p-4',
          date: '2026-09-15',
          description: 'Tech Lead Salary - Mid-Month Deposit',
          amount: 620000,
          type: 'INCOME',
          category: 'Salary & Wages',
          accountId: 'acc-1',
          status: 'CLEARED',
          recurrence: 'MONTHLY',
        },
        {
          id: 'p-5',
          date: '2026-09-20',
          description: 'Comprehensive Vehicle Fuel & Maintenance',
          amount: 24000,
          type: 'EXPENSE',
          category: 'Transportation',
          accountId: 'acc-1',
          status: 'CLEARED',
          recurrence: 'MONTHLY',
        },
        {
          id: 'p-6',
          date: '2026-10-01',
          description: 'Tech Lead Salary - Direct Deposit',
          amount: 620000,
          type: 'INCOME',
          category: 'Salary & Wages',
          accountId: 'acc-1',
          status: 'CLEARED',
          recurrence: 'MONTHLY',
        },
        {
          id: 'p-7',
          date: '2026-10-02',
          description: 'Apartment Rent (Kilimani)',
          amount: 140000,
          type: 'EXPENSE',
          category: 'Housing & Rent',
          accountId: 'acc-1',
          status: 'CLEARED',
          recurrence: 'MONTHLY',
        },
        {
          id: 'p-8',
          date: '2026-10-15',
          description: 'Tech Lead Salary - Mid-Month Deposit',
          amount: 620000,
          type: 'INCOME',
          category: 'Salary & Wages',
          accountId: 'acc-1',
          status: 'CLEARED',
          recurrence: 'MONTHLY',
        },
      ]);
    } else if (presetName === 'FREELANCE') {
      setAccounts(INITIAL_ACCOUNTS.slice(0, 2));
      setTransactions([
        {
          id: 'f-1',
          date: '2026-09-05',
          description: 'FinTech Mobile App UI/UX - Milestone 1',
          amount: 450000,
          type: 'INCOME',
          category: 'Freelance & Consulting',
          accountId: 'acc-1',
          status: 'CLEARED',
          recurrence: 'NONE',
        },
        {
          id: 'f-2',
          date: '2026-09-12',
          description: 'Studio Rent & High-Speed Fiber',
          amount: 90000,
          type: 'EXPENSE',
          category: 'Housing & Rent',
          accountId: 'acc-1',
          status: 'CLEARED',
          recurrence: 'MONTHLY',
        },
        {
          id: 'f-3',
          date: '2026-09-24',
          description: 'Backend API Architecture Advisory',
          amount: 320000,
          type: 'INCOME',
          category: 'Freelance & Consulting',
          accountId: 'acc-1',
          status: 'CLEARED',
          recurrence: 'NONE',
        },
        {
          id: 'f-4',
          date: '2026-10-08',
          description: 'Figma Organization & Adobe Creative Cloud',
          amount: 18000,
          type: 'EXPENSE',
          category: 'Utilities & Cloud',
          accountId: 'acc-1',
          status: 'CLEARED',
          recurrence: 'MONTHLY',
        },
        {
          id: 'f-5',
          date: '2026-10-14',
          description: 'Frontend Sprint Handover',
          amount: 510000,
          type: 'INCOME',
          category: 'Freelance & Consulting',
          accountId: 'acc-1',
          status: 'CLEARED',
          recurrence: 'NONE',
        },
      ]);
    } else if (presetName === 'TIGHT') {
      // Burn rate stress test: Expenses exceed income
      setAccounts([
        {
          id: 'acc-1',
          name: 'Early Runway Account',
          type: 'CHECKING',
          institution: 'KCB Corporate Checking',
          accountNumberMask: '•••• 0019',
          startingBalance: 1200000,
          currentBalance: 780000,
          currency: 'KES',
          color: '#F43F5E',
        },
      ]);
      setTransactions([
        {
          id: 't-1',
          date: '2026-09-01',
          description: 'Early Customer Subscriptions',
          amount: 180000,
          type: 'INCOME',
          category: 'SaaS & Digital Products',
          accountId: 'acc-1',
          status: 'CLEARED',
          recurrence: 'MONTHLY',
        },
        {
          id: 't-2',
          date: '2026-09-05',
          description: 'Server Infrastructure & GPU Cluster',
          amount: 240000,
          type: 'EXPENSE',
          category: 'Utilities & Cloud',
          accountId: 'acc-1',
          status: 'CLEARED',
          recurrence: 'MONTHLY',
        },
        {
          id: 't-3',
          date: '2026-09-15',
          description: 'Contract Developer Retainer',
          amount: 350000,
          type: 'EXPENSE',
          category: 'Tech & Hardware',
          accountId: 'acc-1',
          status: 'CLEARED',
          recurrence: 'MONTHLY',
        },
        {
          id: 't-4',
          date: '2026-10-01',
          description: 'Early Customer Subscriptions',
          amount: 210000,
          type: 'INCOME',
          category: 'SaaS & Digital Products',
          accountId: 'acc-1',
          status: 'CLEARED',
          recurrence: 'MONTHLY',
        },
        {
          id: 't-5',
          date: '2026-10-05',
          description: 'Server Infrastructure & GPU Cluster',
          amount: 260000,
          type: 'EXPENSE',
          category: 'Utilities & Cloud',
          accountId: 'acc-1',
          status: 'CLEARED',
          recurrence: 'MONTHLY',
        },
      ]);
    }
  };

  // Export JSON backup
  const handleExportJson = () => {
    const backup = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      accounts,
      transactions,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FinFlow_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Trigger file input
  const handleTriggerImport = () => {
    fileInputRef.current?.click();
  };

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.accounts && parsed.transactions) {
          setAccounts(parsed.accounts);
          setTransactions(parsed.transactions);
        } else {
          alert('Invalid backup file format. Missing accounts or transactions.');
        }
      } catch (err) {
        alert('Failed to parse JSON backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* FinTech Header with navigation and controls */}
      <Header
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        onSelectAccount={setSelectedAccountId}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onExportJson={handleExportJson}
        onImportJson={handleTriggerImport}
        onSelectPreset={handleSelectPreset}
        isScenarioActive={scenario.isActive}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Tab 1: Executive Dashboard (Comprehensive overview) */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6">
            {/* Primary FinTech Solvency & Ratio Banner */}
            <RatioCards ratios={ratios} liquidBalance={currentLiquidBalance} />

            {/* Quick Multi-Account Liquidity Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAccountId(acc.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                    selectedAccountId === acc.id
                      ? 'bg-slate-800/90 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="truncate font-medium">{acc.institution}</span>
                    <span className="font-mono text-[11px]">{acc.accountNumberMask}</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-white">
                    {formatCurrency(acc.currentBalance)}
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px]">
                    <span className="text-slate-400 font-medium truncate">{acc.name}</span>
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: acc.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Cashflow Chart (Running Balance & Velocity) */}
            <CashflowChart
              timeline={cashflowTimeline}
              isScenarioActive={scenario.isActive}
            />

            {/* 2-Column Split: Categorical Breakdown + Recent Ledger Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <CategoricalBreakdown
                  expenseBreakdowns={expenseBreakdowns}
                  incomeBreakdowns={incomeBreakdowns}
                  onSelectCategoryFilter={handleFilterCategoryInLedger}
                />
              </div>

              <div className="lg:col-span-6">
                {/* Ledger Quick Stream */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Receipt className="w-4 h-4" />
                      </span>
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        Recent Chronological Ledger Postings
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('LEDGER')}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition"
                    >
                      Full Ledger <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {transactionsWithBalance.slice(0, 8).map((tx) => (
                      <div
                        key={tx.id}
                        className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-100 truncate">
                            {tx.description}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="font-mono">{tx.date}</span>
                            <span>•</span>
                            <span className="truncate">{tx.category}</span>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0 font-mono">
                          <div
                            className={`font-bold ${
                              tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {tx.type === 'INCOME' ? '+' : '-'}
                            {formatCurrency(tx.amount)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Bal: <span className="text-white font-bold">{formatCurrency(tx.runningBalance)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Running Balance & Forecast Chart */}
        {activeTab === 'CHART' && (
          <div className="space-y-6">
            <RatioCards ratios={ratios} liquidBalance={currentLiquidBalance} />
            <CashflowChart
              timeline={cashflowTimeline}
              isScenarioActive={scenario.isActive}
            />
          </div>
        )}

        {/* Tab 3: Detailed Ledger Table */}
        {activeTab === 'LEDGER' && (
          <RunningBalanceLedger
            transactionsWithBalance={transactionsWithBalance}
            accounts={accounts}
            onAddTransactionClick={() => setIsAddModalOpen(true)}
            onDeleteTransaction={handleDeleteTransaction}
            onToggleStatus={handleToggleStatus}
            categoryFilter={categoryFilter}
            onClearCategoryFilter={() => setCategoryFilter(null)}
          />
        )}

        {/* Tab 4: Categorical Analytics */}
        {activeTab === 'CATEGORIES' && (
          <div className="space-y-6">
            <CategoricalBreakdown
              expenseBreakdowns={expenseBreakdowns}
              incomeBreakdowns={incomeBreakdowns}
              onSelectCategoryFilter={handleFilterCategoryInLedger}
            />
          </div>
        )}

        {/* Tab 5: Scenario Simulator */}
        {activeTab === 'SIMULATOR' && (
          <div className="space-y-6">
            <ScenarioSimulator
              scenario={scenario}
              onScenarioChange={setScenario}
              baselineRatios={baselineRatios}
              simulatedRatios={ratios}
            />

            <CashflowChart
              timeline={cashflowTimeline}
              isScenarioActive={scenario.isActive}
            />
          </div>
        )}

        {/* Tab 6: Spring Boot & Angular Architecture Docs */}
        {activeTab === 'ARCHITECTURE' && <ArchitectureDocs />}
      </main>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTransaction={handleAddTransaction}
        accounts={accounts}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500 font-mono">
        FinFlow Enterprise FinTech Engine • Income vs Expenditure Solvency Analytics • Running Balance Calculus
      </footer>
    </div>
  );
}
