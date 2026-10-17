import React, { useState, useMemo } from 'react';
import { CategoryBreakdown, TransactionCategory } from '../types/finance';
import { formatCurrency } from '../utils/financialMath';
import { PieChart as PieIcon, AlertCircle, CheckCircle2, Filter, Layers } from 'lucide-react';

interface CategoricalBreakdownProps {
  expenseBreakdowns: CategoryBreakdown[];
  incomeBreakdowns: CategoryBreakdown[];
  onSelectCategoryFilter?: (category: TransactionCategory) => void;
}

export const CategoricalBreakdown: React.FC<CategoricalBreakdownProps> = ({
  expenseBreakdowns,
  incomeBreakdowns,
  onSelectCategoryFilter,
}) => {
  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const currentList = activeTab === 'EXPENSE' ? expenseBreakdowns : incomeBreakdowns;
  const totalAmount = useMemo(() => {
    return currentList.reduce((sum, item) => sum + item.total, 0);
  }, [currentList]);

  // Donut chart calculations
  const donutSize = 240;
  const strokeWidth = 32;
  const radius = (donutSize - strokeWidth) / 2;
  const center = donutSize / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute strokeDasharray and strokeDashoffset for each slice
  let accumulatedPercent = 0;
  const slices = currentList.map((item) => {
    const fraction = totalAmount > 0 ? item.total / totalAmount : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += fraction;

    return {
      ...item,
      fraction,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeCategoryData = hoveredCategory
    ? currentList.find((c) => c.category === hoveredCategory)
    : currentList[0];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <PieIcon className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Categorical Cashflow Distribution</h3>
            <p className="text-xs text-slate-400">
              Granular breakdown of capital deployment and revenue origination
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
          <button
            onClick={() => {
              setActiveTab('EXPENSE');
              setHoveredCategory(null);
            }}
            className={`px-3 py-1.5 rounded-md transition font-medium ${
              activeTab === 'EXPENSE'
                ? 'bg-rose-500/20 text-rose-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Expenditure Outflows ({expenseBreakdowns.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('INCOME');
              setHoveredCategory(null);
            }}
            className={`px-3 py-1.5 rounded-md transition font-medium ${
              activeTab === 'INCOME'
                ? 'bg-emerald-500/20 text-emerald-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Inflow Origination ({incomeBreakdowns.length})
          </button>
        </div>
      </div>

      {/* Main Content Grid: Donut Chart on Left, Ranked Progress Bars on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* SVG Donut Chart with Centered Insight */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4">
          <div className="relative w-[240px] h-[240px]">
            <svg
              width={donutSize}
              height={donutSize}
              className="rotate-[-90deg] overflow-visible"
              viewBox={`0 0 ${donutSize} ${donutSize}`}
            >
              {/* Background ring */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#1E293B"
                strokeWidth={strokeWidth}
              />

              {/* Slices */}
              {slices.map((slice) => {
                const isHovered = hoveredCategory === slice.category;
                return (
                  <circle
                    key={slice.category}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredCategory(slice.category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  />
                );
              })}
            </svg>

            {/* Central summary inside donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {hoveredCategory ? 'Category Share' : activeTab === 'EXPENSE' ? 'Total Outflow' : 'Total Inflow'}
              </span>
              <span className="text-xl md:text-2xl font-bold font-mono text-white mt-0.5">
                {formatCurrency(activeCategoryData ? activeCategoryData.total : totalAmount)}
              </span>
              <span className="text-xs text-slate-400 mt-1 max-w-[140px] truncate font-medium">
                {activeCategoryData ? activeCategoryData.category : 'All Categories'}
              </span>
              {activeCategoryData && (
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {activeCategoryData.percentage}% of total
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center mt-3 font-mono">
            Hover over donut segments to isolate category allocations
          </p>
        </div>

        {/* Detailed Category Progress & Budget Tracking */}
        <div className="lg:col-span-7 space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
          {currentList.map((item) => {
            const isHovered = hoveredCategory === item.category;
            const hasBudget = item.budgetLimit && item.budgetLimit > 0;
            const budgetUsedPercent = hasBudget ? Math.round((item.total / item.budgetLimit!) * 100) : null;
            const isOverBudget = budgetUsedPercent !== null && budgetUsedPercent > 100;

            return (
              <div
                key={item.category}
                onMouseEnter={() => setHoveredCategory(item.category)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`p-3.5 rounded-xl border transition-all duration-200 ${
                  isHovered
                    ? 'bg-slate-800/90 border-slate-700 shadow-md transform -translate-y-0.5'
                    : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-md flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-sm text-slate-100 truncate">
                      {item.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono px-1.5 py-0.5 rounded bg-slate-800">
                      {item.count} txns
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 font-mono text-sm">
                    <span className="font-bold text-white">
                      {formatCurrency(item.total)}
                    </span>
                    <span className="text-xs text-slate-400 w-12 text-right">
                      {item.percentage}%
                    </span>

                    {onSelectCategoryFilter && (
                      <button
                        onClick={() => onSelectCategoryFilter(item.category)}
                        title="Filter ledger by this category"
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      >
                        <Filter className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Relative share bar */}
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>

                {/* Budget Limit Tracker (if Expense) */}
                {hasBudget && (
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                    <span className="flex items-center gap-1">
                      Budget: {formatCurrency(item.budgetLimit!)}
                      {isOverBudget ? (
                        <span className="text-rose-400 font-semibold flex items-center gap-0.5 ml-1">
                          <AlertCircle className="w-3 h-3" /> Over by {budgetUsedPercent! - 100}%
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-0.5 ml-1">
                          <CheckCircle2 className="w-3 h-3" /> {budgetUsedPercent}% used
                        </span>
                      )}
                    </span>
                    <span>Remaining: {formatCurrency(Math.max(0, item.budgetLimit! - item.total))}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
