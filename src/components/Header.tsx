import React from 'react';
import { Account } from '../types/finance';
import { formatCurrency } from '../utils/financialMath';
import {
  Wallet,
  Building2,
  TrendingUp,
  Plus,
  Download,
  Upload,
  Sparkles,
  LayoutDashboard,
  LineChart,
  Receipt,
  PieChart,
  Cpu,
} from 'lucide-react';

export type ActiveTab = 'DASHBOARD' | 'CHART' | 'LEDGER' | 'CATEGORIES' | 'SIMULATOR' | 'ARCHITECTURE';

interface HeaderProps {
  accounts: Account[];
  selectedAccountId: string;
  onSelectAccount: (accountId: string) => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onExportJson: () => void;
  onImportJson: () => void;
  onSelectPreset: (presetName: string) => void;
  isScenarioActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
  activeTab,
  onSelectTab,
  onOpenAddModal,
  onExportJson,
  onImportJson,
  onSelectPreset,
  isScenarioActive,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar with branding, account switcher and quick actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-extrabold shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-white">
                  FinFlow
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  FinTech
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Angular • Spring Boot
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Expense & Cashflow Tracker • Running Balance & Ratio Analytics
              </p>
            </div>
          </div>

          {/* Account selector & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Account Switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200">
              <Building2 className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <select
                value={selectedAccountId}
                onChange={(e) => onSelectAccount(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-1"
              >
                <option value="ALL" className="bg-slate-900 text-white">
                  Consolidated Liquidity (All Accounts)
                </option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id} className="bg-slate-900 text-white">
                    {acc.name} ({formatCurrency(acc.currentBalance)})
                  </option>
                ))}
              </select>
            </div>

            {/* Presets Switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    onSelectPreset(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="bg-transparent text-slate-300 font-medium focus:outline-none cursor-pointer"
              >
                <option value="" disabled className="bg-slate-900 text-slate-400">
                  Load Scenario Dataset...
                </option>
                <option value="AGENCY" className="bg-slate-900 text-white">
                  FinTech Agency & SaaS (High Margin)
                </option>
                <option value="PROFESSIONAL" className="bg-slate-900 text-white">
                  Salaried Senior Engineer (50/30/20)
                </option>
                <option value="FREELANCE" className="bg-slate-900 text-white">
                  Freelance Consultant (Variable Flows)
                </option>
                <option value="TIGHT" className="bg-slate-900 text-white">
                  Burn Rate Stress Test (Deficit)
                </option>
              </select>
            </div>

            {/* Export / Import */}
            <button
              onClick={onExportJson}
              title="Backup financial ledger to JSON"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onImportJson}
              title="Restore / Import financial ledger"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            >
              <Upload className="w-4 h-4" />
            </button>

            {/* Post Transaction Button */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Post Transaction</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 scrollbar-none text-xs font-semibold">
          <button
            onClick={() => onSelectTab('DASHBOARD')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === 'DASHBOARD'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Executive Dashboard
          </button>

          <button
            onClick={() => onSelectTab('CHART')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === 'CHART'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <LineChart className="w-4 h-4" />
            Running Balance Chart
          </button>

          <button
            onClick={() => onSelectTab('LEDGER')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === 'LEDGER'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Transaction Ledger
          </button>

          <button
            onClick={() => onSelectTab('CATEGORIES')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === 'CATEGORIES'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <PieChart className="w-4 h-4" />
            Categorical Analytics
          </button>

          <button
            onClick={() => onSelectTab('SIMULATOR')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === 'SIMULATOR'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            What-If Simulator
            {isScenarioActive && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('ARCHITECTURE')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === 'ARCHITECTURE'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4 text-emerald-400" />
            Angular & Spring Boot Specs
          </button>
        </nav>
      </div>
    </header>
  );
};
