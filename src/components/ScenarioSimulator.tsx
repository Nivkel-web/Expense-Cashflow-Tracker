import React from 'react';
import { FinancialRatios, ScenarioParams } from '../types/finance';
import { formatCurrency } from '../utils/financialMath';
import { Sparkles, RotateCcw, AlertTriangle, TrendingUp, Scale, Clock, Zap } from 'lucide-react';

interface ScenarioSimulatorProps {
  scenario: ScenarioParams;
  onScenarioChange: (params: ScenarioParams) => void;
  baselineRatios: FinancialRatios;
  simulatedRatios: FinancialRatios;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  scenario,
  onScenarioChange,
  baselineRatios,
  simulatedRatios,
}) => {
  const handleReset = () => {
    onScenarioChange({
      incomeDeltaPercent: 0,
      expenseDeltaPercent: 0,
      oneTimeExpense: 0,
      oneTimeExpenseDate: '2026-10-25',
      oneTimeIncome: 0,
      oneTimeIncomeDate: '2026-10-28',
      isActive: false,
    });
  };

  const handleToggleActive = () => {
    onScenarioChange({
      ...scenario,
      isActive: !scenario.isActive,
    });
  };

  // Delta computations
  const ratioDelta = simulatedRatios.incomeToExpenseRatio - baselineRatios.incomeToExpenseRatio;
  const netCashflowDelta = simulatedRatios.netCashflow - baselineRatios.netCashflow;
  const runwayDelta = simulatedRatios.runwayMonths - baselineRatios.runwayMonths;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Cashflow Stress-Testing & Scenario Simulator
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono">
                {scenario.isActive ? 'Active Simulation' : 'Simulator Idle'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Model macro shifts, expense reductions, or one-time liquidity shocks in real-time
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Baseline
          </button>

          <button
            onClick={handleToggleActive}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-lg ${
              scenario.isActive
                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            {scenario.isActive ? 'Simulation Enabled' : 'Enable Simulation'}
          </button>
        </div>
      </div>

      {/* Simulator Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ratio impact */}
        <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-slate-500" />
              Income / Expense Ratio
            </span>
            <span className="font-mono text-slate-300">Baseline: {baselineRatios.incomeToExpenseRatio.toFixed(2)}x</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white">
              {simulatedRatios.incomeToExpenseRatio.toFixed(2)}x
            </span>
            {scenario.isActive && (
              <span
                className={`text-xs font-mono font-bold ${
                  ratioDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {ratioDelta >= 0 ? '+' : ''}
                {ratioDelta.toFixed(2)}x
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Solvency health: <strong className="text-slate-200">{simulatedRatios.healthStatus}</strong>
          </p>
        </div>

        {/* Net Cashflow Impact */}
        <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
              Net Period Cashflow
            </span>
            <span className="font-mono text-slate-300">
              {formatCurrency(baselineRatios.netCashflow)}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-2xl font-bold font-mono ${
                simulatedRatios.netCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {simulatedRatios.netCashflow >= 0 ? '+' : ''}
              {formatCurrency(simulatedRatios.netCashflow)}
            </span>
            {scenario.isActive && (
              <span
                className={`text-xs font-mono font-bold ${
                  netCashflowDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {netCashflowDelta >= 0 ? '+' : ''}
                {formatCurrency(netCashflowDelta)}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Savings margin: <strong className="text-slate-200">{simulatedRatios.savingsRatePercent.toFixed(1)}%</strong>
          </p>
        </div>

        {/* Runway Impact */}
        <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Projected Runway
            </span>
            <span className="font-mono text-slate-300">
              Baseline: {baselineRatios.runwayMonths} mo
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-cyan-400">
              {simulatedRatios.runwayMonths > 60 ? '60+ mo' : `${simulatedRatios.runwayMonths} mo`}
            </span>
            {scenario.isActive && (
              <span
                className={`text-xs font-mono font-bold ${
                  runwayDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {runwayDelta >= 0 ? '+' : ''}
                {runwayDelta.toFixed(1)} mo
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Burn: <strong className="text-slate-200">{formatCurrency(simulatedRatios.monthlyProjectedBurn)}/mo</strong>
          </p>
        </div>
      </div>

      {/* Interactive Sliders & Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Income Growth / Contraction */}
        <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200">
              Recurring Income Shift (%)
            </label>
            <span
              className={`font-mono font-bold text-sm ${
                scenario.incomeDeltaPercent > 0
                  ? 'text-emerald-400'
                  : scenario.incomeDeltaPercent < 0
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {scenario.incomeDeltaPercent > 0 ? '+' : ''}
              {scenario.incomeDeltaPercent}%
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            step="5"
            value={scenario.incomeDeltaPercent}
            onChange={(e) => {
              onScenarioChange({
                ...scenario,
                incomeDeltaPercent: Number(e.target.value),
                isActive: true,
              });
            }}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>-50% (Loss of clients)</span>
            <span>0% (Status Quo)</span>
            <span>+50% (Revenue Surge)</span>
          </div>
        </div>

        {/* Expense Inflation / Cut */}
        <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200">
              Operational Expense Shift (%)
            </label>
            <span
              className={`font-mono font-bold text-sm ${
                scenario.expenseDeltaPercent < 0
                  ? 'text-emerald-400'
                  : scenario.expenseDeltaPercent > 0
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {scenario.expenseDeltaPercent > 0 ? '+' : ''}
              {scenario.expenseDeltaPercent}%
            </span>
          </div>
          <input
            type="range"
            min="-40"
            max="50"
            step="5"
            value={scenario.expenseDeltaPercent}
            onChange={(e) => {
              onScenarioChange({
                ...scenario,
                expenseDeltaPercent: Number(e.target.value),
                isActive: true,
              });
            }}
            className="w-full accent-rose-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>-40% (Austerity cuts)</span>
            <span>0% (Current OpEx)</span>
            <span>+50% (Expansion / Inflation)</span>
          </div>
        </div>

        {/* One-off CapEx Outflow Shock */}
        <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200">
              Simulate One-off Capital Outflow (KSh)
            </label>
            <span className="font-mono font-bold text-sm text-rose-400">
              {scenario.oneTimeExpense > 0 ? `-${formatCurrency(scenario.oneTimeExpense)}` : 'KSh 0'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="e.g. 50000"
              value={scenario.oneTimeExpense || ''}
              onChange={(e) => {
                onScenarioChange({
                  ...scenario,
                  oneTimeExpense: Number(e.target.value) || 0,
                  isActive: true,
                });
              }}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
            />
            <input
              type="date"
              value={scenario.oneTimeExpenseDate}
              onChange={(e) => {
                onScenarioChange({
                  ...scenario,
                  oneTimeExpenseDate: e.target.value,
                  isActive: true,
                });
              }}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            E.g. Large hardware order, enterprise software prepay, or tax assessment.
          </p>
        </div>

        {/* One-off Inflow Windfall Shock */}
        <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200">
              Simulate One-off Inflow Windfall (KSh)
            </label>
            <span className="font-mono font-bold text-sm text-emerald-400">
              {scenario.oneTimeIncome > 0 ? `+${formatCurrency(scenario.oneTimeIncome)}` : 'KSh 0'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="e.g. 150000"
              value={scenario.oneTimeIncome || ''}
              onChange={(e) => {
                onScenarioChange({
                  ...scenario,
                  oneTimeIncome: Number(e.target.value) || 0,
                  isActive: true,
                });
              }}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
            <input
              type="date"
              value={scenario.oneTimeIncomeDate}
              onChange={(e) => {
                onScenarioChange({
                  ...scenario,
                  oneTimeIncomeDate: e.target.value,
                  isActive: true,
                });
              }}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            E.g. Year-end bonus, angel investment tranche, or asset liquidation.
          </p>
        </div>
      </div>
    </div>
  );
};
