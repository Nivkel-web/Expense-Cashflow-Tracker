import React from 'react';
import { FinancialRatios } from '../types/finance';
import { formatCurrency } from '../utils/financialMath';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
} from 'lucide-react';

interface RatioCardsProps {
  ratios: FinancialRatios;
  liquidBalance: number;
}

export const RatioCards: React.FC<RatioCardsProps> = ({ ratios, liquidBalance }) => {
  const getStatusColor = (status: FinancialRatios['healthStatus']) => {
    switch (status) {
      case 'OPTIMAL':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'HEALTHY':
        return 'text-teal-400 bg-teal-500/10 border-teal-500/30';
      case 'MODERATE':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'CAUTION':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'DEFICIT':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    }
  };

  const getStatusLabel = (status: FinancialRatios['healthStatus']) => {
    switch (status) {
      case 'OPTIMAL':
        return 'Superior Cash Inflow (High Margin)';
      case 'HEALTHY':
        return 'Balanced Surplus (Financially Sound)';
      case 'MODERATE':
        return 'Near Break-Even (Buffer Recommended)';
      case 'CAUTION':
        return 'Elevated Burn (High Outflow)';
      case 'DEFICIT':
        return 'Negative Cashflow (Depleting Reserves)';
    }
  };

  // Ratio calculation: ratio of income to expense
  const ratioValue = ratios.incomeToExpenseRatio;
  // Percentage gauge fill (1.0 = 50%, 2.0 = 100%, 0.5 = 25%)
  const ratioFillPercentage = Math.min(100, Math.max(10, (ratioValue / 2) * 100));

  return (
    <div className="space-y-4">
      {/* Primary FinTech Ratio Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/90 border border-slate-800 p-5 md:p-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Income vs Expenditure Hero Metric */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Scale className="w-5 h-5" />
              </span>
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
                  Core Solvency Ratio
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">Income vs Expenditure Ratio</h3>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl md:text-5xl font-extrabold font-mono tracking-tight text-white">
                {ratioValue.toFixed(2)}x
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${getStatusColor(ratios.healthStatus)}`}>
                {ratios.healthStatus}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              For every <strong className="text-slate-200 font-mono">KSh 1.00</strong> spent, your cash engine generates{' '}
              <strong className="text-emerald-400 font-mono">KSh {ratioValue.toFixed(2)}</strong>.
              <span className="block mt-0.5 text-slate-400">
                Expense ratio: <strong className="text-slate-300 font-mono">{ratios.expenditureRatePercent}%</strong> of gross revenue.
              </span>
            </p>

            {/* Gauge bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>0.5x (Deficit)</span>
                <span className="text-slate-300 font-bold">1.0x (Parity)</span>
                <span>2.0x+ (Surplus)</span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    ratioValue >= 1.5
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : ratioValue >= 1.0
                      ? 'bg-gradient-to-r from-teal-500 to-amber-400'
                      : 'bg-gradient-to-r from-rose-500 to-orange-400'
                  }`}
                  style={{ width: `${ratioFillPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Ratios & Solvency Indicators */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
            {/* Net Cashflow */}
            <div className="bg-slate-950/60 backdrop-blur-md rounded-xl p-3.5 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Net Cashflow</span>
                {ratios.netCashflow >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-rose-400" />
                )}
              </div>
              <div
                className={`text-xl font-bold font-mono mt-1 ${
                  ratios.netCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {ratios.netCashflow >= 0 ? '+' : ''}
                {formatCurrency(ratios.netCashflow)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {ratios.savingsRatePercent.toFixed(1)}% savings margin
              </div>
            </div>

            {/* Cash Runway */}
            <div className="bg-slate-950/60 backdrop-blur-md rounded-xl p-3.5 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Cash Runway</span>
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-xl font-bold font-mono mt-1 text-cyan-400">
                {ratios.runwayMonths > 60 ? '60+ mo' : `${ratios.runwayMonths} mo`}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                At {formatCurrency(ratios.monthlyProjectedBurn)}/mo burn
              </div>
            </div>

            {/* Total Liquid Capital */}
            <div className="bg-slate-950/60 backdrop-blur-md rounded-xl p-3.5 border border-slate-800/80 hover:border-slate-700 transition col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total Liquidity</span>
                <PiggyBank className="w-4 h-4 text-violet-400" />
              </div>
              <div className="text-xl font-bold font-mono mt-1 text-violet-300">
                {formatCurrency(liquidBalance)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Available cash reserves
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Inflow, Outflow, and 50/30/20 Rule Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Inflow */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4.5 flex items-center justify-between hover:border-emerald-500/30 transition">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Total Inflow (Income)
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {formatCurrency(ratios.totalIncome)}
            </div>
            <p className="text-xs text-slate-400">Payroll, clients, products & yields</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Total Outflow */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4.5 flex items-center justify-between hover:border-rose-500/30 transition">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Total Outflow (Expenditures)
            </span>
            <div className="text-2xl font-bold font-mono text-rose-400">
              {formatCurrency(ratios.totalExpense)}
            </div>
            <p className="text-xs text-slate-400">Fixed overhead, operations, taxes</p>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/20">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        {/* 50/30/20 Budget Rule Allocation */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4.5 flex flex-col justify-between hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              50/30/20 Rule Allocation
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Needs / Wants / Savings</span>
          </div>

          <div className="space-y-2 my-2">
            <div className="h-2.5 w-full bg-slate-800 rounded-full flex overflow-hidden">
              <div
                className="bg-blue-500 h-full"
                style={{ width: `${ratios.rule503020.needs.percentage}%` }}
                title={`Needs: ${ratios.rule503020.needs.percentage}% (Target 50%)`}
              />
              <div
                className="bg-purple-500 h-full"
                style={{ width: `${ratios.rule503020.wants.percentage}%` }}
                title={`Wants: ${ratios.rule503020.wants.percentage}% (Target 30%)`}
              />
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${ratios.rule503020.savings.percentage}%` }}
                title={`Savings: ${ratios.rule503020.savings.percentage}% (Target 20%)`}
              />
            </div>

            <div className="flex justify-between text-xs font-mono">
              <span className="text-blue-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Needs {ratios.rule503020.needs.percentage}%
              </span>
              <span className="text-purple-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Wants {ratios.rule503020.wants.percentage}%
              </span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Savings {ratios.rule503020.savings.percentage}%
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Target benchmark: 50% fixed essentials, 30% discretionary, 20% retained.
          </div>
        </div>
      </div>
    </div>
  );
};
