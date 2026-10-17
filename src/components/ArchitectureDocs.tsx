import React, { useState } from 'react';
import {
  Code2,
  Server,
  Layers,
  Terminal,
  Database,
  CheckCircle2,
  Copy,
  Check,
  FileCode,
  Cpu,
  Shield,
  Box,
} from 'lucide-react';

export const ArchitectureDocs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SPRING_BOOT' | 'ANGULAR' | 'API' | 'DOCKER'>('OVERVIEW');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const springBootServiceCode = `package com.fintech.finflow.service;

import com.fintech.finflow.dto.CashflowSummaryDto;
import com.fintech.finflow.dto.TransactionWithBalanceDto;
import com.fintech.finflow.model.Transaction;
import com.fintech.finflow.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class CashflowCalculationService {

    private final TransactionRepository transactionRepository;

    public CashflowCalculationService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    /**
     * Calculates the chronological running balance for an account or organization.
     * Preserves strict monetary precision using BigDecimal.
     */
    public List<TransactionWithBalanceDto> calculateRunningBalances(
            UUID accountId,
            BigDecimal startingBaselineBalance,
            LocalDate startDate,
            LocalDate endDate
    ) {
        List<Transaction> transactions = transactionRepository
                .findByAccountIdAndDateBetweenOrderByDateAsc(accountId, startDate, endDate);

        List<TransactionWithBalanceDto> ledgerWithBalances = new ArrayList<>();
        BigDecimal currentRunningBalance = startingBaselineBalance;

        for (Transaction tx : transactions) {
            BigDecimal netImpact = tx.getType() == Transaction.Type.INCOME
                    ? tx.getAmount()
                    : tx.getAmount().negate();

            currentRunningBalance = currentRunningBalance.add(netImpact);

            ledgerWithBalances.add(new TransactionWithBalanceDto(
                    tx.getId(),
                    tx.getDate(),
                    tx.getDescription(),
                    tx.getAmount(),
                    tx.getType(),
                    tx.getCategory(),
                    tx.getStatus(),
                    currentRunningBalance.setScale(2, RoundingMode.HALF_EVEN),
                    netImpact
            ));
        }

        return ledgerWithBalances;
    }

    /**
     * Computes the Income vs Expenditure Solvency Ratio and Cash Runway.
     */
    public CashflowSummaryDto computeSolvencyRatios(UUID accountId, LocalDate startDate, LocalDate endDate) {
        BigDecimal totalIncome = transactionRepository.sumByType(accountId, Transaction.Type.INCOME, startDate, endDate);
        BigDecimal totalExpense = transactionRepository.sumByType(accountId, Transaction.Type.EXPENSE, startDate, endDate);

        BigDecimal netCashflow = totalIncome.subtract(totalExpense);

        // Income to Expense Ratio: (Income / Expense)
        BigDecimal ratio = totalExpense.compareTo(BigDecimal.ZERO) > 0
                ? totalIncome.divide(totalExpense, 4, RoundingMode.HALF_UP)
                : BigDecimal.valueOf(99.0);

        // Savings Rate: (Net Cashflow / Income) * 100
        BigDecimal savingsRate = totalIncome.compareTo(BigDecimal.ZERO) > 0
                ? netCashflow.multiply(BigDecimal.valueOf(100)).divide(totalIncome, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new CashflowSummaryDto(totalIncome, totalExpense, netCashflow, ratio, savingsRate);
    }
}`;

  const angularSignalCode = `// Angular 18/19 Standalone Signals Architecture
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CashflowApiService } from '../services/cashflow-api.service';
import { Transaction, Account, FinancialRatios } from '../models/finflow.model';

@Component({
  selector: 'app-cashflow-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="dashboard-grid">
      <div class="ratio-banner">
        <h2>Income vs Expenditure Ratio</h2>
        <span class="ratio-stat">{{ incomeExpenseRatio() | number:'1.2-2' }}x</span>
        <span class="badge" [class.optimal]="isSolvencyOptimal()">
          {{ solvencyHealthStatus() }}
        </span>
      </div>

      <div class="running-balance-card">
        <h3>Calculated Liquid Balance</h3>
        <p class="balance-display">{{ currentLiquidBalance() | currency }}</p>
      </div>
    </div>
  \`
})
export class CashflowDashboardComponent {
  private api = inject(CashflowApiService);

  // Writable Signals
  public transactions = signal<Transaction[]>([]);
  public accounts = signal<Account[]>([]);
  public selectedAccountId = signal<string | null>(null);

  // Reactive Computed Signals (Signals Graph)
  public runningBalanceLedger = computed(() => {
    const list = [...this.transactions()].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    let balance = 15000; // Baseline
    return list.map(tx => {
      const delta = tx.type === 'INCOME' ? tx.amount : -tx.amount;
      balance += delta;
      return { ...tx, runningBalance: balance, netImpact: delta };
    });
  });

  public totalIncome = computed(() =>
    this.transactions()
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  public totalExpense = computed(() =>
    this.transactions()
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  public incomeExpenseRatio = computed(() => {
    const expense = this.totalExpense();
    return expense > 0 ? this.totalIncome() / expense : 99;
  });

  public isSolvencyOptimal = computed(() => this.incomeExpenseRatio() >= 1.5);
  public solvencyHealthStatus = computed(() => {
    const r = this.incomeExpenseRatio();
    if (r >= 1.5) return 'OPTIMAL';
    if (r >= 1.15) return 'HEALTHY';
    if (r >= 1.0) return 'BREAK_EVEN';
    return 'DEFICIT';
  });
}`;

  const dockerComposeYaml = `version: '3.8'

services:
  # PostgreSQL 16 FinTech Database
  postgres-db:
    image: postgres:16-alpine
    container_name: finflow-postgres
    environment:
      POSTGRES_DB: finflow_ledger
      POSTGRES_USER: finflow_admin
      POSTGRES_PASSWORD: \${DB_PASSWORD:-FinFlowSecret2026!}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U finflow_admin -d finflow_ledger"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Spring Boot 3.3 Backend API
  spring-backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: finflow-backend
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres-db:5432/finflow_ledger
      SPRING_DATASOURCE_USERNAME: finflow_admin
      SPRING_DATASOURCE_PASSWORD: \${DB_PASSWORD:-FinFlowSecret2026!}
      SPRING_JPA_HIBERNATE_DDL_AUTO: validate
      SPRING_FLYWAY_ENABLED: 'true'
    ports:
      - "8080:8080"
    depends_on:
      postgres-db:
        condition: service_healthy

  # Angular 18 Standalone Frontend
  angular-frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: finflow-frontend
    ports:
      - "4200:80"
    depends_on:
      - spring-backend

volumes:
  postgres_data:
    driver: local`;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Server className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Angular + Spring Boot FinTech Architecture
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                Production Specs
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Enterprise architecture blueprint: Java 21 Spring Boot 3 & Angular 18 Standalone Signals
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs flex-wrap">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3 py-1.5 rounded-md transition font-medium ${
              activeTab === 'OVERVIEW'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            System Topology
          </button>
          <button
            onClick={() => setActiveTab('SPRING_BOOT')}
            className={`px-3 py-1.5 rounded-md transition font-medium ${
              activeTab === 'SPRING_BOOT'
                ? 'bg-emerald-500/20 text-emerald-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Spring Boot Service
          </button>
          <button
            onClick={() => setActiveTab('ANGULAR')}
            className={`px-3 py-1.5 rounded-md transition font-medium ${
              activeTab === 'ANGULAR'
                ? 'bg-rose-500/20 text-rose-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Angular Signals
          </button>
          <button
            onClick={() => setActiveTab('DOCKER')}
            className={`px-3 py-1.5 rounded-md transition font-medium ${
              activeTab === 'DOCKER'
                ? 'bg-cyan-500/20 text-cyan-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Docker Compose
          </button>
        </div>
      </div>

      {/* Tab 1: System Topology Overview */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <Layers className="w-4 h-4" />
                Angular 18+ Client Layer
              </div>
              <p className="text-xs text-slate-300">
                Standalone Components, Signal-based reactivity (<code className="text-rose-300 font-mono">computed()</code> for running balance recalculations), RxJS HTTP streams, and Tailwind styling.
              </p>
              <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside font-mono">
                <li>Zone-less / Signals reactive graph</li>
                <li>Zero change-detection thrashing</li>
                <li>Client-side SVG chart engine</li>
              </ul>
            </div>

            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Server className="w-4 h-4" />
                Spring Boot 3.3 Core
              </div>
              <p className="text-xs text-slate-300">
                Java 21 Virtual Threads (Project Loom), Spring Security JWT, Spring Data JPA with Flyway schema versioning, and BigDecimal financial precision.
              </p>
              <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside font-mono">
                <li>O(N) Running Balance algorithm</li>
                <li>Income vs Expenditure aggregator</li>
                <li>Stateless JWT + OAuth2 Resource Server</li>
              </ul>
            </div>

            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Database className="w-4 h-4" />
                PostgreSQL 16 & Flyway
              </div>
              <p className="text-xs text-slate-300">
                ACID-compliant double-entry ledger database with composite indexes on <code className="text-cyan-300 font-mono">(account_id, date)</code> for microsecond running balance queries.
              </p>
              <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside font-mono">
                <li>NUMERIC(15, 2) currency columns</li>
                <li>Row-level locking for concurrent writes</li>
                <li>Automated Flyway migrations</li>
              </ul>
            </div>
          </div>

          {/* Architecture Data Flow Diagram */}
          <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 font-mono text-xs text-slate-300 space-y-3">
            <div className="text-slate-400 font-bold text-xs uppercase tracking-wider">
              FinTech Request Lifecycle:
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800/80 leading-relaxed text-slate-300 overflow-x-auto whitespace-pre">
{`[ Angular 18 Client ]  ---(GET /api/v1/cashflow/running-balance?accountId=xxx)--->  [ Spring Boot 3 Gateway ]
                                                                                           |
                                                                                           v
[ Signals computed() ] <---(JSON: { transactionsWithBalance, ratios, runway })---   [ CashflowCalculationService ]
                                                                                           | (Queries sorted by date)
                                                                                           v
                                                                                [ PostgreSQL 16 DB (Flyway) ]`}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Spring Boot Service */}
      {activeTab === 'SPRING_BOOT' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-emerald-400 flex items-center gap-1.5">
              <FileCode className="w-4 h-4" />
              CashflowCalculationService.java
            </span>
            <button
              onClick={() => copyToClipboard(springBootServiceCode, 'spring')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition"
            >
              {copiedKey === 'spring' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Java Code
                </>
              )}
            </button>
          </div>
          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed max-h-[460px] overflow-y-auto">
            {springBootServiceCode}
          </pre>
        </div>
      )}

      {/* Tab 3: Angular Signals Component */}
      {activeTab === 'ANGULAR' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-rose-400 flex items-center gap-1.5">
              <FileCode className="w-4 h-4" />
              cashflow-dashboard.component.ts (Angular 18+)
            </span>
            <button
              onClick={() => copyToClipboard(angularSignalCode, 'angular')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition"
            >
              {copiedKey === 'angular' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Angular Code
                </>
              )}
            </button>
          </div>
          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed max-h-[460px] overflow-y-auto">
            {angularSignalCode}
          </pre>
        </div>
      )}

      {/* Tab 4: Docker Compose */}
      {activeTab === 'DOCKER' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-cyan-400 flex items-center gap-1.5">
              <Box className="w-4 h-4" />
              docker-compose.yml (Full-Stack FinTech Stack)
            </span>
            <button
              onClick={() => copyToClipboard(dockerComposeYaml, 'docker')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition"
            >
              {copiedKey === 'docker' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy YAML
                </>
              )}
            </button>
          </div>
          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed max-h-[460px] overflow-y-auto">
            {dockerComposeYaml}
          </pre>
        </div>
      )}
    </div>
  );
};
