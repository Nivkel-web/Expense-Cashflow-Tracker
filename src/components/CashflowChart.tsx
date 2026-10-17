import React, { useState, useMemo } from 'react';
import { CashflowPoint } from '../types/finance';
import { formatCurrency } from '../utils/financialMath';
import { TrendingUp, Calendar, Layers, Eye, Sparkles } from 'lucide-react';

interface CashflowChartProps {
  timeline: CashflowPoint[];
  currentDateStr?: string;
  isScenarioActive?: boolean;
}

export const CashflowChart: React.FC<CashflowChartProps> = ({
  timeline,
  currentDateStr = '2026-10-17',
  isScenarioActive = false,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'COMBINED' | 'BALANCE' | 'FLOWS'>('COMBINED');
  const [timeHorizon, setTimeHorizon] = useState<'ALL' | 'HISTORICAL' | 'PROJECTED'>('ALL');

  // Filter timeline based on timeHorizon
  const displayPoints = useMemo(() => {
    if (timeHorizon === 'HISTORICAL') {
      return timeline.filter((p) => !p.isProjected);
    }
    if (timeHorizon === 'PROJECTED') {
      return timeline.filter((p) => p.isProjected);
    }
    return timeline;
  }, [timeline, timeHorizon]);

  if (displayPoints.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        No cashflow points available for the selected range.
      </div>
    );
  }

  // Calculate scales
  const balances = displayPoints.map((p) => p.balance);
  const minBalance = Math.min(...balances);
  const maxBalance = Math.max(...balances);
  const flows = displayPoints.map((p) => Math.max(p.inflow, p.outflow));
  const maxFlow = Math.max(1, ...flows);

  // SVG dimensions
  const svgWidth = 900;
  const svgHeight = 320;
  const padding = { top: 30, right: 30, bottom: 45, left: 70 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Add buffer to Y-axis so curve doesn't clip
  const yBuffer = (maxBalance - minBalance) * 0.15 || 2000;
  const yDomainMin = Math.floor((minBalance - yBuffer) / 1000) * 1000;
  const yDomainMax = Math.ceil((maxBalance + yBuffer) / 1000) * 1000;
  const yRange = yDomainMax - yDomainMin || 1;

  const getX = (index: number) => {
    if (displayPoints.length === 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (displayPoints.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return padding.top + chartHeight - ((val - yDomainMin) / yRange) * chartHeight;
  };

  // Build SVG path for running balance
  const pointsWithCoords = displayPoints.map((p, i) => ({
    ...p,
    x: getX(i),
    y: getY(p.balance),
  }));

  // Create smooth curved path
  const linePath = pointsWithCoords.reduce((acc, curr, i, arr) => {
    if (i === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[i - 1];
    const cpX = (prev.x + curr.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }, '');

  // Area path for gradient fill under the curve
  const areaPath = `${linePath} L ${pointsWithCoords[pointsWithCoords.length - 1].x} ${
    padding.top + chartHeight
  } L ${pointsWithCoords[0].x} ${padding.top + chartHeight} Z`;

  // Find index of current date or first projected point
  const firstProjectedIndex = displayPoints.findIndex((p) => p.isProjected);
  const projectionDividerX =
    firstProjectedIndex !== -1 ? getX(firstProjectedIndex) : null;

  // Active hover point
  const activePoint = hoverIndex !== null ? displayPoints[hoverIndex] : displayPoints[displayPoints.length - 1];
  const activeCoord = hoverIndex !== null ? pointsWithCoords[hoverIndex] : pointsWithCoords[pointsWithCoords.length - 1];

  // Grid tick marks
  const yTicks = [
    yDomainMin,
    yDomainMin + yRange * 0.25,
    yDomainMin + yRange * 0.5,
    yDomainMin + yRange * 0.75,
    yDomainMax,
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Running Balance Trajectory & Cashflow Velocity
              {isScenarioActive && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  What-If Active
                </span>
              )}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time cumulative ledger balance with scheduled forward liquidity projection
          </p>
        </div>

        {/* View & Horizon Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Horizon selector */}
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setTimeHorizon('ALL')}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                timeHorizon === 'ALL'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Full Horizon
            </button>
            <button
              onClick={() => setTimeHorizon('HISTORICAL')}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                timeHorizon === 'HISTORICAL'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cleared Only
            </button>
            <button
              onClick={() => setTimeHorizon('PROJECTED')}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                timeHorizon === 'PROJECTED'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Projected
            </button>
          </div>

          {/* Layer selector */}
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('COMBINED')}
              className={`px-2 py-1 rounded-md transition ${
                viewMode === 'COMBINED' ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-slate-400'
              }`}
              title="Overlay running balance and daily inflow/outflow"
            >
              Combined
            </button>
            <button
              onClick={() => setViewMode('BALANCE')}
              className={`px-2 py-1 rounded-md transition ${
                viewMode === 'BALANCE' ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-slate-400'
              }`}
              title="Show running balance curve only"
            >
              Balance
            </button>
            <button
              onClick={() => setViewMode('FLOWS')}
              className={`px-2 py-1 rounded-md transition ${
                viewMode === 'FLOWS' ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-slate-400'
              }`}
              title="Show daily volume flows only"
            >
              Flows
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Tooltip Card summary bar */}
      <div className="flex flex-wrap items-center justify-between bg-slate-950/60 rounded-xl px-4 py-2.5 border border-slate-800/80 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            {activePoint.date}
            {activePoint.isProjected ? (
              <span className="text-[10px] text-cyan-400 font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                Projected
              </span>
            ) : (
              <span className="text-[10px] text-emerald-400 font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                Cleared
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 font-mono">
          <div>
            <span className="text-slate-400 text-[11px] mr-1.5">Running Balance:</span>
            <span className="font-bold text-white text-sm">
              {formatCurrency(activePoint.balance)}
            </span>
          </div>

          <div className="hidden sm:block">
            <span className="text-slate-400 text-[11px] mr-1.5">Inflow:</span>
            <span className="text-emerald-400 font-bold">
              +{formatCurrency(activePoint.inflow)}
            </span>
          </div>

          <div className="hidden sm:block">
            <span className="text-slate-400 text-[11px] mr-1.5">Outflow:</span>
            <span className="text-rose-400 font-bold">
              -{formatCurrency(activePoint.outflow)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-[11px] mr-1.5">Net Day:</span>
            <span
              className={`font-bold ${
                activePoint.net >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {activePoint.net >= 0 ? '+' : ''}
              {formatCurrency(activePoint.net)}
            </span>
          </div>
        </div>
      </div>

      {/* SVG Responsive Chart */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible cursor-crosshair"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            {/* Linear gradient for running balance area */}
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
              <stop offset="85%" stopColor="#10B981" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>

            {/* Projected area gradient */}
            <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
            </linearGradient>

            {/* Pattern for projected background */}
            <pattern id="stripes" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#334155" strokeWidth="1" strokeOpacity="0.25" />
            </pattern>
          </defs>

          {/* Projected Zone Background Shade */}
          {projectionDividerX !== null && (
            <g>
              <rect
                x={projectionDividerX}
                y={padding.top}
                width={padding.left + chartWidth - projectionDividerX}
                height={chartHeight}
                fill="url(#stripes)"
              />
              <line
                x1={projectionDividerX}
                y1={padding.top}
                x2={projectionDividerX}
                y2={padding.top + chartHeight}
                stroke="#06B6D4"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                strokeOpacity="0.7"
              />
              <text
                x={projectionDividerX + 8}
                y={padding.top + 14}
                fill="#06B6D4"
                fontSize="10"
                fontFamily="var(--font-mono)"
                fontWeight="600"
              >
                PROJECTION HORIZON →
              </text>
            </g>
          )}

          {/* Horizontal Grid lines */}
          {yTicks.map((tickVal, i) => {
            const y = getY(tickVal);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke="#334155"
                  strokeOpacity="0.35"
                  strokeDasharray="2 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                >
                  {formatCurrency(tickVal)}
                </text>
              </g>
            );
          })}

          {/* Daily Inflow & Outflow Volume Bars (if Flows or Combined mode) */}
          {(viewMode === 'FLOWS' || viewMode === 'COMBINED') && (
            <g opacity={viewMode === 'COMBINED' ? 0.45 : 0.85}>
              {displayPoints.map((p, i) => {
                const x = getX(i);
                const barWidth = Math.max(3, chartWidth / (displayPoints.length * 2.8));
                const zeroY = padding.top + chartHeight;

                // Scale bar heights relative to maxFlow
                const inflowHeight = (p.inflow / maxFlow) * (chartHeight * 0.45);
                const outflowHeight = (p.outflow / maxFlow) * (chartHeight * 0.45);

                return (
                  <g key={`bar-${i}`}>
                    {/* Inflow bar */}
                    {p.inflow > 0 && (
                      <rect
                        x={x - barWidth}
                        y={zeroY - inflowHeight}
                        width={barWidth - 1}
                        height={inflowHeight}
                        fill="#10B981"
                        rx="1"
                      />
                    )}
                    {/* Outflow bar */}
                    {p.outflow > 0 && (
                      <rect
                        x={x}
                        y={zeroY - outflowHeight}
                        width={barWidth - 1}
                        height={outflowHeight}
                        fill="#F43F5E"
                        rx="1"
                      />
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* Running Balance Area & Line (if Balance or Combined mode) */}
          {(viewMode === 'BALANCE' || viewMode === 'COMBINED') && (
            <g>
              {/* Area Under Curve */}
              <path d={areaPath} fill="url(#balanceGradient)" />

              {/* Glowing Line */}
              <path
                d={linePath}
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {pointsWithCoords.map((pt, i) => (
                <circle
                  key={`pt-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={hoverIndex === i ? 5 : 2.5}
                  fill={pt.isProjected ? '#06B6D4' : '#10B981'}
                  stroke="#0F172A"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />
              ))}
            </g>
          )}

          {/* Active hover scrub vertical guide */}
          {activeCoord && (
            <g>
              <line
                x1={activeCoord.x}
                y1={padding.top}
                x2={activeCoord.x}
                y2={padding.top + chartHeight}
                stroke="#94A3B8"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.8"
              />
              <circle
                cx={activeCoord.x}
                cy={activeCoord.y}
                r="6"
                fill="#38BDF8"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                filter="drop-shadow(0 0 6px rgba(56, 189, 248, 0.7))"
              />
            </g>
          )}

          {/* Invisible interactive hover rects */}
          {displayPoints.map((_, i) => {
            const x = getX(i);
            const sliceWidth = chartWidth / displayPoints.length;
            return (
              <rect
                key={`hit-${i}`}
                x={x - sliceWidth / 2}
                y={padding.top}
                width={sliceWidth}
                height={chartHeight}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(i)}
              />
            );
          })}

          {/* X Axis Labels */}
          {displayPoints.map((p, i) => {
            // Render every 3rd or 4th label to prevent clutter
            const step = Math.ceil(displayPoints.length / 8);
            if (i % step !== 0 && i !== displayPoints.length - 1) return null;
            const x = getX(i);
            return (
              <text
                key={`xlabel-${i}`}
                x={x}
                y={padding.top + chartHeight + 20}
                textAnchor="middle"
                fill="#64748B"
                fontSize="10"
                fontFamily="var(--font-mono)"
              >
                {p.label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Chart Legend */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-mono">
            <span className="w-3 h-0.5 bg-emerald-400 rounded-full" />
            Running Balance (Cumulative)
          </span>
          <span className="flex items-center gap-1.5 font-mono">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
            Inflows
          </span>
          <span className="flex items-center gap-1.5 font-mono">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm" />
            Outflows
          </span>
          <span className="flex items-center gap-1.5 font-mono">
            <span className="w-2.5 h-2.5 bg-cyan-400/50 border border-cyan-400 rounded-sm" />
            Projected Horizon
          </span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          Hover across chart to inspect day-by-day cash delta & liquidity
        </div>
      </div>
    </div>
  );
};
