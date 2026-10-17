import React, { useState, useMemo } from 'react';
import { Account, Transaction, TransactionCategory, TransactionStatus, TransactionWithBalance } from '../types/finance';
import { CATEGORY_COLORS } from '../data/initialData';
import { formatCurrency } from '../utils/financialMath';
import {
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Calendar,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';

interface RunningBalanceLedgerProps {
  transactionsWithBalance: TransactionWithBalance[];
  accounts: Account[];
  onAddTransactionClick: () => void;
  onDeleteTransaction: (id: string) => void;
  onToggleStatus: (id: string) => void;
  categoryFilter?: TransactionCategory | null;
  onClearCategoryFilter?: () => void;
}

export const RunningBalanceLedger: React.FC<RunningBalanceLedgerProps> = ({
  transactionsWithBalance,
  accounts,
  onAddTransactionClick,
  onDeleteTransaction,
  onToggleStatus,
  categoryFilter,
  onClearCategoryFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TransactionStatus>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [sortOrder, setSortOrder] = useState<'DESC' | 'ASC'>('DESC'); // Newest or oldest first

  // Account map for quick lookup
  const accountMap = useMemo(() => {
    return new Map(accounts.map((a) => [a.id, a]));
  }, [accounts]);

  // Filtered transactions
  const filteredList = useMemo(() => {
    return transactionsWithBalance.filter((tx) => {
      // Search
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesDesc = tx.description.toLowerCase().includes(query);
        const matchesMerchant = tx.merchant ? tx.merchant.toLowerCase().includes(query) : false;
        const matchesCategory = tx.category.toLowerCase().includes(query);
        const matchesTags = tx.tags ? tx.tags.some((t) => t.toLowerCase().includes(query)) : false;
        if (!matchesDesc && !matchesMerchant && !matchesCategory && !matchesTags) {
          return false;
        }
      }

      // Category
      if (categoryFilter && tx.category !== categoryFilter) {
        return false;
      }

      // Status
      if (statusFilter !== 'ALL' && tx.status !== statusFilter) {
        return false;
      }

      // Type
      if (typeFilter !== 'ALL' && tx.type !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [transactionsWithBalance, searchTerm, categoryFilter, statusFilter, typeFilter]);

  // Apply display order (default newest first for ledger view)
  const sortedDisplay = useMemo(() => {
    const list = [...filteredList];
    list.sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortOrder === 'DESC' ? timeB - timeA : timeA - timeB;
    });
    return list;
  }, [filteredList, sortOrder]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Account', 'Type', 'Amount', 'RunningBalance', 'Status', 'Merchant'];
    const rows = sortedDisplay.map((tx) => [
      tx.date,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.category,
      accountMap.get(tx.accountId)?.name || tx.accountId,
      tx.type,
      tx.type === 'INCOME' ? tx.amount : -tx.amount,
      tx.runningBalance,
      tx.status,
      `"${(tx.merchant || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FinFlow_Cashflow_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'CLEARED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" /> Cleared
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Calendar className="w-3 h-3" /> Scheduled
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-5">
      {/* Ledger Header & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Running Balance Ledger & Transaction Stream
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time chronological ledger calculating cumulative account balance on every posting
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Export CSV
          </button>

          <button
            onClick={onAddTransactionClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Post Transaction
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 text-xs">
        {/* Search */}
        <div className="lg:col-span-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search description, merchant, tag..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Type Filter */}
        <div className="lg:col-span-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="ALL">All Flows</option>
            <option value="INCOME">Inflows (+) Only</option>
            <option value="EXPENSE">Outflows (-) Only</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="lg:col-span-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="ALL">All Statuses</option>
            <option value="CLEARED">Cleared</option>
            <option value="PENDING">Pending</option>
            <option value="SCHEDULED">Scheduled</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="lg:col-span-2">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition font-mono"
          >
            <option value="DESC">Date: Newest First</option>
            <option value="ASC">Date: Oldest First</option>
          </select>
        </div>

        {/* Category Pill Indicator if active */}
        <div className="lg:col-span-2 flex items-center">
          {categoryFilter ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs w-full justify-between">
              <span className="truncate">Category: {categoryFilter}</span>
              <button
                onClick={onClearCategoryFilter}
                className="hover:text-white font-bold ml-1"
                title="Clear category filter"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="text-slate-400 text-[11px] font-mono px-2">
              Showing {sortedDisplay.length} of {transactionsWithBalance.length} records
            </div>
          )}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800 font-mono text-[11px]">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Description & Merchant</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Account</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Inflow / Outflow</th>
              <th className="py-3 px-4 text-right">Running Balance</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {sortedDisplay.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No transactions match the selected filters.
                </td>
              </tr>
            ) : (
              sortedDisplay.map((tx) => {
                const account = accountMap.get(tx.accountId);
                const isIncome = tx.type === 'INCOME';
                const catColor = CATEGORY_COLORS[tx.category] || '#94A3B8';

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {tx.date}
                    </td>

                    {/* Description & Merchant */}
                    <td className="py-3 px-4 max-w-[260px]">
                      <div className="font-semibold text-slate-100 truncate">
                        {tx.description}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate mt-0.5">
                        {tx.merchant && <span>{tx.merchant}</span>}
                        {tx.tags && tx.tags.length > 0 && (
                          <span className="text-slate-400">
                            #{tx.tags.join(' #')}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium"
                        style={{
                          backgroundColor: `${catColor}15`,
                          color: catColor,
                          border: `1px solid ${catColor}30`,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: catColor }}
                        />
                        {tx.category}
                      </span>
                    </td>

                    {/* Account */}
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      <div className="font-medium text-slate-200">
                        {account?.name || 'General Account'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {account?.accountNumberMask || 'Primary'}
                      </div>
                    </td>

                    {/* Status with toggle click */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        onClick={() => onToggleStatus(tx.id)}
                        className="cursor-pointer hover:opacity-80 transition"
                        title="Click to toggle status (Cleared -> Pending -> Scheduled)"
                      >
                        {getStatusBadge(tx.status)}
                      </button>
                    </td>

                    {/* Flow Amount */}
                    <td className="py-3 px-4 text-right font-mono whitespace-nowrap font-bold">
                      <span
                        className={`inline-flex items-center gap-1 ${
                          isIncome ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        )}
                        {isIncome ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>

                    {/* Cumulative Running Balance */}
                    <td className="py-3 px-4 text-right font-mono whitespace-nowrap">
                      <span className="font-extrabold text-white text-sm bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
                        {formatCurrency(tx.runningBalance)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        title="Delete transaction"
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
