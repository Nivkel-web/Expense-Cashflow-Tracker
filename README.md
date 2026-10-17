# FinFlow — Enterprise Expense & Cashflow Tracker

> **FinTech Financial Dashboard** tracking **Income vs Expenditure Ratios**, dynamic **Running Balance Calculators**, categorical spend distributions, and cash runway projections.
> Engineered with **Spring Boot 3 (Java 21)**, **Angular 18+ Standalone Signals**, and **PostgreSQL 16**.

---

## 📋 Table of Contents
1. [Overview & Core Features](#overview--core-features)
2. [Architecture & System Topology](#architecture--system-topology)
3. [Financial Algorithms & Mathematical Formulas](#financial-algorithms--mathematical-formulas)
4. [Prerequisites](#prerequisites)
5. [Quickstart with Docker Compose](#quickstart-with-docker-compose)
6. [Manual Project Setup & Installation](#manual-project-setup--installation)
   - [Backend: Spring Boot 3 Setup](#backend-spring-boot-3-setup)
   - [Database: PostgreSQL & Flyway](#database-postgresql--flyway)
   - [Frontend: Angular 18+ Setup](#frontend-angular-18-setup)
   - [Web Dashboard (Vite SPA)](#web-dashboard-vite-spa)
7. [Environment Configurations & application.yml](#environment-configurations--applicationyml)
8. [REST API Documentation (OpenAPI / Swagger)](#rest-api-documentation-openapi--swagger)
9. [Database Schema (Flyway V1 DDL)](#database-schema-flyway-v1-ddl)
10. [Testing & Verification](#testing--verification)
11. [Production Deployment & Security](#production-deployment--security)

---

## 🎯 Overview & Core Features

FinFlow provides treasury managers, fintech operators, and personal finance users with real-time solvency visibility, preventing liquidity crunches through continuous financial telemetry:

* **Income vs Expenditure Ratio Gauge:** Instant solvency diagnostic ($R = \frac{\text{Total Inflows}}{\text{Total Outflows}}$) with automated health tiers: *Optimal (>1.5x)*, *Healthy (>1.15x)*, *Parity (1.0x)*, and *Deficit (<0.85x)*.
* **Continuous Running Balance Ledger:** O(N) chronological calculator tracking exact cumulative account liquidity after each posting.
* **Visual Cashflow Velocity:** Interactive SVG curved trajectory contrasting historical cleared transactions against a 30/60/90-day forward projection horizon.
* **Granular Categorical Breakdowns:** Donut visualizations and 50/30/20 budget tracking (Needs, Wants, Savings).
* **What-If Scenario Simulator:** Real-time stress-testing modeling $\pm X\%$ revenue adjustments, operating expense reductions, and one-time capital expenditures (CapEx shocks).
* **Multi-Account Liquidity Consolidation:** Segregated tracking across operating checking accounts, high-yield reserves (HYSA), credit card liabilities, and investment portfolios.
* **Data Portability:** JSON ledger backup/restore and one-click CSV export formatted for financial auditors.

---

## 🏗️ Architecture & System Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│   Angular 18+ / React 19 Client  │  Tailwind CSS  │  Signals Graph     │
│   - CashflowDashboardComponent   │  - RunningBalanceTableComponent     │
│   - SolvencyRatioGaugeComponent  │  - ScenarioSimulatorComponent       │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ HTTPS / JSON (REST API)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        SPRING BOOT 3.3 GATEWAY                         │
│   Java 21 (Virtual Threads)      │  Spring Security (OAuth2 / JWT)     │
│   - CashflowCalculationService   │  - FinancialRatioEngine             │
│   - TransactionController        │  - CashflowProjectionEngine         │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Spring Data JPA / Hibernate 6
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          PERSISTENCE LAYER                             │
│   PostgreSQL 16 (ACID Double-Entry Ledger) │ Flyway Schema Migrations   │
│   - accounts table (NUMERIC 15,2)          │ Composite B-Tree Indexes  │
│   - transactions table (Status / Category) │ Read-replica partitioning │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📐 Financial Algorithms & Mathematical Formulas

### 1. Income vs Expenditure Ratio
$$\text{Ratio} = \frac{\sum_{i=1}^{n} \text{Income}_i}{\sum_{j=1}^{m} \text{Expense}_j}$$

$$\text{Expense Burden \%} = \left(\frac{\sum \text{Expense}}{\sum \text{Income}}\right) \times 100\%$$

$$\text{Savings Rate \%} = \left(\frac{\sum \text{Income} - \sum \text{Expense}}{\sum \text{Income}}\right) \times 100\%$$

### 2. Continuous Chronological Running Balance
Given baseline initial balance $B_0$ and chronologically ordered transactions $T = [t_1, t_2, \dots, t_k]$ sorted by timestamp $t$:
$$B_k = B_{k-1} + \Delta_k \quad \text{where } \Delta_k = \begin{cases} +\text{amount}_k & \text{if Type} = \text{INCOME} \\ -\text{amount}_k & \text{if Type} = \text{EXPENSE} \end{cases}$$

### 3. Projected Cash Runway
$$\text{Daily Burn} = \frac{\sum_{\text{Period}} \text{Expense}}{\text{Days in Period}}$$

$$\text{Monthly Projected Burn} = \text{Daily Burn} \times 30$$

$$\text{Runway (Months)} = \frac{\text{Current Liquid Capital}}{\text{Monthly Projected Burn}}$$

---

## 💻 Prerequisites

Ensure your system meets the following minimum requirements before starting:

* **Java Development Kit (JDK):** Version 21 LTS (Eclipse Temurin or OpenJDK)
* **Build Tool:** Apache Maven 3.9+ or Gradle 8.5+
* **Node.js:** Version 20.x or 22.x LTS
* **Package Manager:** npm 10+ or pnpm 9+
* **Angular CLI (for Angular client):** `npm install -g @angular/cli@18`
* **Docker & Docker Compose:** Docker Engine 24+ and Docker Compose v2+
* **Database:** PostgreSQL 16+ (or run via provided Docker service)

---

## 🚀 Quickstart with Docker Compose

The fastest way to spin up the entire FinTech stack (PostgreSQL, Spring Boot backend, and web frontend):

```bash
# 1. Clone the repository
git clone https://github.com/your-username/finflow-cashflow-tracker.git
cd finflow-cashflow-tracker

# 2. Launch all services in detached mode
docker compose up -d

# 3. Verify healthy containers
docker compose ps
```

### Access Ports:
* **Web Client:** `http://localhost:4200` (or `http://localhost:3000`)
* **Spring Boot API:** `http://localhost:8080/api/v1`
* **Swagger UI / OpenAPI:** `http://localhost:8080/swagger-ui.html`
* **PostgreSQL:** `localhost:5432` (`db: finflow_ledger`, `user: finflow_admin`)

---

## 🛠️ Manual Project Setup & Installation

### Backend: Spring Boot 3 Setup

#### 1. Navigate to backend directory:
```bash
cd backend
```

#### 2. Configure Database Connection:
Ensure PostgreSQL is running locally or via Docker:
```bash
docker run --name finflow-postgres -e POSTGRES_DB=finflow_ledger -e POSTGRES_USER=finflow_admin -e POSTGRES_PASSWORD=FinFlowSecret2026! -p 5432:5432 -d postgres:16-alpine
```

#### 3. Build & Run with Maven:
```bash
# Clean, run unit tests, and compile
./mvnw clean install

# Launch Spring Boot application
./mvnw spring-boot:run
```

Or using Gradle:
```bash
./gradlew bootRun
```

The Spring Boot backend will run on port `8080` with automatic Flyway migrations executed on startup.

---

### Database: PostgreSQL & Flyway

Flyway migrations are located in `backend/src/main/resources/db/migration/`:
* `V1__init_schema.sql` creates the `accounts`, `transactions`, and `categories` tables.
* `V2__seed_fintech_data.sql` inserts baseline starting balances and demo ledger transactions.

To manually trigger Flyway migration:
```bash
./mvnw flyway:migrate
```

---

### Frontend: Angular 18+ Setup

#### 1. Navigate to frontend directory:
```bash
cd frontend
```

#### 2. Install Dependencies:
```bash
npm install
```

#### 3. Configure API Base URL:
Verify `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1'
};
```

#### 4. Run Angular Development Server:
```bash
ng serve --open --port 4200
```

Navigate to `http://localhost:4200/`.

---

### Web Dashboard (Vite SPA)

To run the lightweight Vite development server:
```bash
# In the root repository directory
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## ⚙️ Environment Configurations & application.yml

### `backend/src/main/resources/application.yml`
```yaml
server:
  port: 8080
  servlet:
    context-path: /

spring:
  application:
    name: finflow-cashflow-tracker
  threads:
    virtual:
      enabled: true # Java 21 Project Loom high-throughput virtual threads

  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/finflow_ledger}
    username: ${SPRING_DATASOURCE_USERNAME:finflow_admin}
    password: ${SPRING_DATASOURCE_PASSWORD:FinFlowSecret2026!}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      idle-timeout: 30000
      pool-name: FinFlowHikariPool

  jpa:
    database-platform: org.hibernate.dialect.PostgreSQLDialect
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate.format_sql: true
      hibernate.default_schema: public

  flyway:
    enabled: true
    baseline-on-migrate: true
    locations: classpath:db/migration

# Spring Security & JWT Configuration
security:
  jwt:
    secret-key: ${JWT_SECRET_KEY:9a4f2c8d7e1b5a3f6c8d0e2b4a7c9e1f3a5b7d9e}
    expiration-ms: 86400000 # 24 hours

logging:
  level:
    com.fintech.finflow: DEBUG
    org.springframework.web: INFO
```

---

## 📡 REST API Documentation (OpenAPI / Swagger)

### 1. Calculate Running Balance Stream
* **Endpoint:** `GET /api/v1/cashflow/running-balance`
* **Query Parameters:**
  * `accountId` (UUID, optional): Filter by account ID (defaults to all consolidated accounts)
  * `startDate` (ISO-8601 Date, e.g. `2026-09-01`)
  * `endDate` (ISO-8601 Date, e.g. `2026-11-15`)

**Response Payload (`200 OK`):**
```json
{
  "startingBalance": 1450000.00,
  "currentLiquidBalance": 1824000.00,
  "currency": "KES",
  "transactions": [
    {
      "id": "c1f7a0b3-e5d4-4b5f-9a1c-8e3b2a5d7f1e",
      "date": "2026-09-01",
      "description": "Enterprise Retainer - Cloud Solutions",
      "amount": 680000.00,
      "type": "INCOME",
      "category": "Freelance & Consulting",
      "status": "CLEARED",
      "netImpact": 680000.00,
      "runningBalance": 2130000.00
    },
    {
      "id": "e2a4b6c8-1d3f-4a5b-9c7e-0f2a4b6d8e0a",
      "date": "2026-09-02",
      "description": "Westlands Office Lease & Co-working Hub",
      "amount": 210000.00,
      "type": "EXPENSE",
      "category": "Housing & Rent",
      "status": "CLEARED",
      "netImpact": -210000.00,
      "runningBalance": 1920000.00
    }
  ]
}
```

### 2. Solvency & Financial Ratio Telemetry
* **Endpoint:** `GET /api/v1/cashflow/ratios`

**Response Payload (`200 OK`):**
```json
{
  "totalIncome": 3811500.00,
  "totalExpense": 1150950.00,
  "netCashflow": 2660550.00,
  "incomeToExpenseRatio": 3.31,
  "expenditureRatePercent": 30.2,
  "savingsRatePercent": 69.8,
  "monthlyProjectedBurn": 575475.00,
  "runwayMonths": 13.9,
  "healthStatus": "OPTIMAL",
  "currency": "KES",
  "rule503020": {
    "needs": { "amount": 689200.00, "percentage": 18, "target": 50 },
    "wants": { "amount": 461750.00, "percentage": 12, "target": 30 },
    "savings": { "amount": 2660550.00, "percentage": 70, "target": 20 }
  }
}
```

### 3. Record New Transaction
* **Endpoint:** `POST /api/v1/transactions`
* **Request Body:**
```json
{
  "accountId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "date": "2026-10-18",
  "description": "Cloud Hosting & Server Prepayment",
  "amount": 145000.00,
  "type": "EXPENSE",
  "category": "Utilities & Cloud",
  "status": "CLEARED",
  "recurrence": "MONTHLY",
  "merchant": "Amazon Web Services East Africa",
  "tags": ["DevOps", "Infrastructure"]
}
```

---

## 🗄️ Database Schema (Flyway V1 DDL)

`backend/src/main/resources/db/migration/V1__init_schema.sql`:

```sql
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    type VARCHAR(32) NOT NULL CHECK (type IN ('CHECKING', 'SAVINGS', 'HIGH_YIELD', 'CREDIT_CARD', 'INVESTMENT')),
    institution VARCHAR(120) NOT NULL,
    account_number_mask VARCHAR(16) NOT NULL,
    starting_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    current_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'KES',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    type VARCHAR(16) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    category VARCHAR(64) NOT NULL,
    status VARCHAR(16) NOT NULL CHECK (status IN ('CLEARED', 'PENDING', 'SCHEDULED')),
    recurrence VARCHAR(16) NOT NULL DEFAULT 'NONE',
    merchant VARCHAR(120),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- B-Tree composite index for microsecond chronological running balance lookups
CREATE INDEX idx_transactions_account_date ON transactions(account_id, date ASC);
CREATE INDEX idx_transactions_type_date ON transactions(type, date);
CREATE INDEX idx_transactions_category ON transactions(category);
```

---

## 🧪 Testing & Verification

### Run Spring Boot Unit & Integration Tests:
```bash
cd backend
./mvnw test
```
* **`CashflowCalculationServiceTest.java`**: Verifies `BigDecimal` rounding mode `HALF_EVEN`, boundary condition handling when expenses are zero, and chronological sort invariance.
* **`TransactionRepositoryTest.java`**: Uses `@DataJpaTest` with Testcontainers PostgreSQL.

### Run Angular Unit & Component Tests:
```bash
cd frontend
ng test --watch=false --browsers=ChromeHeadless
```
Verifies Angular Signals computed graphs:
* `runningBalanceLedger()` recomputes automatically on transaction push.
* `incomeExpenseRatio()` handles zero denominator without throwing NaN.

---

## 🔒 Production Deployment & Security

1. **Monetary Precision:** Always use `BigDecimal` / PostgreSQL `NUMERIC(15, 2)`. Never use IEEE-754 floating-point primitives (`float`/`double`) for monetary balances.
2. **Double-Entry Isolation:** Enforce `@Transactional(isolation = Isolation.REPEATABLE_READ)` during concurrent transaction ledger updates.
3. **CORS Configuration:** Restrict allowed origins in `WebSecurityConfig.java` to trusted frontend domains (`https://app.finflow.io`).
4. **Audit Logging:** Database trigger tracks balance deltas in `account_audit_logs`.

---

## 📄 License
This project is licensed under the Apache 2.0 License.
