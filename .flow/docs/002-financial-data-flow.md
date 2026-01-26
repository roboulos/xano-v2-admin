# Financial Data Flow - V2 Backend

> Task 1.2: Document financial data flow (contribution → income → revshare)

## Financial Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           FINANCIAL DATA FLOW                                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌──────────────┐                                                                   │
│  │ TRANSACTION  │                                                                   │
│  │    (675)     │                                                                   │
│  └──────┬───────┘                                                                   │
│         │                                                                           │
│         │ closes                                                                    │
│         v                                                                           │
│  ┌──────────────────────────────────────────────────────────────────────┐          │
│  │                    CONTRIBUTION FLOW                                  │          │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐       │          │
│  │  │ CONTRIBUTION │───>│   INCOME     │───>│ REVSHARE_TOTALS  │       │          │
│  │  │    (701)     │    │    (695)     │    │      (383)       │       │          │
│  │  │  Raw revshare│    │ Unified view │    │ Aggregated sums  │       │          │
│  │  └──────────────┘    └──────────────┘    └──────────────────┘       │          │
│  │        │                                          │                  │          │
│  │        │                                          v                  │          │
│  │        │                                  ┌──────────────────┐       │          │
│  │        │                                  │ REVSHARE_PAYMENT │       │          │
│  │        │                                  │      (697)       │       │          │
│  │        │                                  │ Payment records  │       │          │
│  │        │                                  └──────────────────┘       │          │
│  │        │                                                             │          │
│  │        v                                                             │          │
│  │  ┌──────────────────┐                                               │          │
│  │  │ CONTRIBUTIONS_   │                                               │          │
│  │  │    PENDING       │                                               │          │
│  │  │      (431)       │                                               │          │
│  │  │ Awaiting process │                                               │          │
│  │  └──────────────────┘                                               │          │
│  └──────────────────────────────────────────────────────────────────────┘          │
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐          │
│  │                      EQUITY FLOW                                      │          │
│  │  ┌──────────────────┐    ┌──────────────┐    ┌──────────────┐       │          │
│  │  │ EQUITY_          │───>│ EQUITY_      │───>│ EQUITY_      │       │          │
│  │  │ TRANSACTIONS     │    │ MONTHLY      │    │ ANNUAL       │       │          │
│  │  │     (399)        │    │   (702)      │    │   (699)      │       │          │
│  │  │ Individual txns  │    │ Monthly roll │    │ Yearly sum   │       │          │
│  │  └──────────────────┘    └──────────────┘    └──────────────┘       │          │
│  └──────────────────────────────────────────────────────────────────────┘          │
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐          │
│  │                      BILLING (STRIPE)                                 │          │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐       │          │
│  │  │ STRIPE_      │───>│ STRIPE_      │───>│ SUBSCRIPTION_    │       │          │
│  │  │ PRODUCT (718)│    │ PRICING (717)│    │ PACKAGES (719)   │       │          │
│  │  └──────────────┘    └──────────────┘    └──────────────────┘       │          │
│  │        │                                                             │          │
│  │        v                                                             │          │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐       │          │
│  │  │ STRIPE_      │───>│ COMMISSION_  │───>│ OUTGOING_        │       │          │
│  │  │ SUBSCRIPTIONS│    │ PLAN (418)   │    │ PAYMENTS (720)   │       │          │
│  │  │    (716)     │    │ Payment rules│    │ Disbursements    │       │          │
│  │  └──────────────┘    └──────────────┘    └──────────────────┘       │          │
│  └──────────────────────────────────────────────────────────────────────┘          │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. CONTRIBUTION Domain

### contribution (Table ID: 701)

**Purpose**: Records rev share contributions from closed transactions.

| Field                     | Type      | Description                |
| ------------------------- | --------- | -------------------------- |
| id                        | int       | Primary key                |
| amount                    | decimal   | Contribution amount        |
| contribution_type         | text      | Type of contribution       |
| status                    | text      | Processing status          |
| source                    | text      | Data source                |
| contribution_date         | timestamp | When contribution occurred |
| contribution_id_raw       | text      | External ID                |
| tier                      | text      | Network tier               |
| notes                     | text      | Additional notes           |
| sync_source               | text      | Sync origin                |
| is_demo                   | bool      | Demo flag                  |
| **user_id**               | int       | FK → user                  |
| **agent_id**              | int       | FK → agent                 |
| **transaction_id**        | int       | FK → transaction           |
| **contributing_agent_id** | int       | FK → agent (source)        |
| **receiving_agent_id**    | int       | FK → agent (recipient)     |

**Key Relationships**:

- `contribution.transaction_id` → `transaction.id` (source deal)
- `contribution.contributing_agent_id` → `agent.id` (who generated)
- `contribution.receiving_agent_id` → `agent.id` (who receives rev share)

---

### contributions_pending (Table ID: 431)

**Purpose**: Staging table for contributions awaiting processing.

| Field                        | Type      | Description                 |
| ---------------------------- | --------- | --------------------------- |
| id                           | int       | Primary key                 |
| amount                       | decimal   | Pending amount              |
| status                       | text      | Pending/Processing/Complete |
| contribution_type            | text      |                             |
| source                       | text      |                             |
| transaction_type             | text      |                             |
| deal_type                    | text      |                             |
| transaction_status           | text      |                             |
| pending_reason               | text      | Why pending                 |
| processing_date              | timestamp |                             |
| closing_date                 | date      |                             |
| contribution_date            | timestamp |                             |
| tier_at_contribution         | int       | Tier when created           |
| notes                        | text      |                             |
| sync_source                  | text      |                             |
| processing_error             | text      | Error message if failed     |
| **user_id**                  | int       | FK → user                   |
| **agent_id**                 | int       | FK → agent                  |
| **transaction_id**           | int       | FK → transaction            |
| **contributing_agent_id**    | int       | FK → agent                  |
| **receiving_agent_id**       | int       | FK → agent                  |
| (+ many more staging fields) |           |                             |

**39 total fields** - extensive staging for pending contribution processing.

---

## 2. INCOME Domain

### income (Table ID: 695)

**Purpose**: Unified income view across all sources (GCI, rev share, bonuses).

| Field               | Type      | Description            |
| ------------------- | --------- | ---------------------- |
| id                  | int       | Primary key            |
| amount              | decimal   | Income amount          |
| income_type         | text      | GCI/RevShare/Bonus/etc |
| source              | text      | Where income came from |
| status              | text      | Status                 |
| income_date         | timestamp | When earned            |
| period_month        | int       | Month (1-12)           |
| period_year         | int       | Year                   |
| description         | text      | Details                |
| notes               | text      |                        |
| income_id_raw       | text      | External ID            |
| sync_source         | text      |                        |
| is_demo             | bool      |                        |
| **user_id**         | int       | FK → user              |
| **agent_id**        | int       | FK → agent             |
| **transaction_id**  | int       | FK → transaction       |
| **contribution_id** | int       | FK → contribution      |
| **listing_id**      | int       | FK → listing           |

**Key Insight**: Income table consolidates all income types into a single queryable table, with FKs back to the source (transaction, contribution, or listing).

---

## 3. REVSHARE Domain

### revshare_totals (Table ID: 383)

**Purpose**: Aggregated rev share totals by agent.

| Field                  | Type      | Description               |
| ---------------------- | --------- | ------------------------- |
| id                     | int       | Primary key               |
| total_amount           | decimal   | All-time rev share earned |
| ytd_amount             | decimal   | Year-to-date              |
| mtd_amount             | decimal   | Month-to-date             |
| last_contribution_date | timestamp | Most recent               |
| tier                   | text      | Current tier              |
| **user_id**            | int       | FK → user                 |
| **agent_id**           | int       | FK → agent                |

---

### revshare_payment (Table ID: 697)

**Purpose**: Records of rev share payments made to agents.

| Field             | Type      | Description      |
| ----------------- | --------- | ---------------- |
| id                | int       | Primary key      |
| amount            | decimal   | Payment amount   |
| status            | text      | Pending/Paid/etc |
| payment_date      | timestamp | When paid        |
| payment_method    | text      | ACH/Check/etc    |
| payment_reference | text      | Reference number |
| period_start      | date      | Coverage start   |
| period_end        | date      | Coverage end     |
| notes             | text      |                  |
| payment_id_raw    | text      | External ID      |
| **user_id**       | int       | FK → user        |
| **agent_id**      | int       | FK → agent       |

---

## 4. EQUITY Domain

### equity_transactions (Table ID: 399)

**Purpose**: Individual equity ledger entries.

| Field            | Type      | Description             |
| ---------------- | --------- | ----------------------- |
| id               | int       | Primary key             |
| transaction_type | text      | Grant/Vest/Exercise/etc |
| amount           | decimal   | Share amount            |
| price            | decimal   | Price per share         |
| value            | decimal   | Total value             |
| status           | text      |                         |
| transaction_date | timestamp |                         |
| vesting_date     | date      |                         |
| expiration_date  | date      |                         |
| grant_type       | text      |                         |
| grant_id_raw     | text      |                         |
| notes            | text      |                         |
| source           | text      |                         |
| sync_source      | text      |                         |
| **user_id**      | int       | FK → user               |
| **agent_id**     | int       | FK → agent              |

---

### equity_monthly (Table ID: 702)

**Purpose**: Monthly equity rollup for reporting.

| Field                 | Type      | Description      |
| --------------------- | --------- | ---------------- |
| id                    | int       | Primary key      |
| period_month          | int       | Month (1-12)     |
| period_year           | int       | Year             |
| total_shares          | decimal   | Shares held      |
| vested_shares         | decimal   | Vested portion   |
| unvested_shares       | decimal   | Unvested portion |
| total_value           | decimal   | Current value    |
| grants_this_period    | decimal   | New grants       |
| vested_this_period    | decimal   | Newly vested     |
| exercised_this_period | decimal   | Exercised        |
| forfeited_this_period | decimal   | Forfeited        |
| calculated_at         | timestamp | When computed    |
| notes                 | text      |                  |
| **user_id**           | int       | FK → user        |
| **agent_id**          | int       | FK → agent       |

---

### equity_annual (Table ID: 699)

**Purpose**: Annual equity summary.

| Field               | Type      | Description        |
| ------------------- | --------- | ------------------ |
| id                  | int       | Primary key        |
| period_year         | int       | Year               |
| total_shares        | decimal   | EOY shares         |
| vested_shares       | decimal   | EOY vested         |
| unvested_shares     | decimal   | EOY unvested       |
| total_value         | decimal   | EOY value          |
| grants_this_year    | decimal   | Annual grants      |
| vested_this_year    | decimal   | Annual vesting     |
| exercised_this_year | decimal   | Annual exercises   |
| forfeited_this_year | decimal   | Annual forfeitures |
| dividends_earned    | decimal   |                    |
| calculated_at       | timestamp |                    |
| notes               | text      |                    |
| **user_id**         | int       | FK → user          |
| **agent_id**        | int       | FK → agent         |

---

## 5. STRIPE / BILLING Domain

### stripe_product (Table ID: 718)

**Purpose**: Stripe product catalog.

| Field             | Type | Description  |
| ----------------- | ---- | ------------ |
| id                | int  | Primary key  |
| stripe_product_id | text | Stripe ID    |
| name              | text | Product name |
| description       | text |              |
| active            | bool |              |

---

### stripe_pricing (Table ID: 717)

**Purpose**: Stripe price configurations.

| Field                 | Type | Description         |
| --------------------- | ---- | ------------------- |
| id                    | int  | Primary key         |
| stripe_price_id       | text | Stripe ID           |
| amount                | int  | Price in cents      |
| currency              | text | USD/etc             |
| interval              | text | month/year          |
| interval_count        | int  |                     |
| **stripe_product_id** | int  | FK → stripe_product |

---

### stripe_subscriptions (Table ID: 716)

**Purpose**: Active Stripe subscriptions.

| Field                  | Type      | Description         |
| ---------------------- | --------- | ------------------- |
| id                     | int       | Primary key         |
| stripe_subscription_id | text      | Stripe ID           |
| status                 | text      | active/canceled/etc |
| current_period_start   | timestamp |                     |
| current_period_end     | timestamp |                     |
| cancel_at_period_end   | bool      |                     |
| **user_id**            | int       | FK → user           |
| **stripe_price_id**    | int       | FK → stripe_pricing |

---

### subscription_packages (Table ID: 719)

**Purpose**: Package definitions for subscriptions.

| Field         | Type    | Description          |
| ------------- | ------- | -------------------- |
| id            | int     | Primary key          |
| name          | text    | Package name         |
| description   | text    |                      |
| tier          | text    | Basic/Pro/Enterprise |
| price_monthly | decimal |                      |
| price_annual  | decimal |                      |
| features      | json    | Feature list         |
| active        | bool    |                      |

---

### commission_plan (Table ID: 418)

**Purpose**: Commission plan configurations.

| Field            | Type    | Description |
| ---------------- | ------- | ----------- |
| id               | int     | Primary key |
| name             | text    | Plan name   |
| description      | text    |             |
| split_percentage | decimal | Agent split |
| cap_amount       | decimal | Annual cap  |
| cap_type         | text    |             |
| active           | bool    |             |

---

### outgoing_payments (Table ID: 720)

**Purpose**: Payment disbursements to agents.

| Field              | Type      | Description             |
| ------------------ | --------- | ----------------------- |
| id                 | int       | Primary key             |
| amount             | decimal   | Payment amount          |
| payment_type       | text      | Commission/RevShare/etc |
| status             | text      |                         |
| payment_date       | timestamp |                         |
| payment_method     | text      |                         |
| reference          | text      |                         |
| **user_id**        | int       | FK → user               |
| **agent_id**       | int       | FK → agent              |
| **transaction_id** | int       | FK → transaction        |

---

## Data Flow Summary

```
TRANSACTION CLOSES
       │
       v
┌──────────────────────────────────────────────────────────────────┐
│ 1. CONTRIBUTION created (one per network tier in sponsor tree)   │
│    - Links transaction_id, contributing_agent_id, receiving_id   │
│    - May go to CONTRIBUTIONS_PENDING first if validation needed  │
└──────────────────────────────────────────────────────────────────┘
       │
       v
┌──────────────────────────────────────────────────────────────────┐
│ 2. INCOME record created (income_type = 'RevShare')              │
│    - Links back to contribution_id                               │
│    - Also created for GCI (income_type = 'GCI')                  │
└──────────────────────────────────────────────────────────────────┘
       │
       v
┌──────────────────────────────────────────────────────────────────┐
│ 3. REVSHARE_TOTALS updated (aggregated rollup)                   │
│    - ytd_amount, mtd_amount, total_amount                        │
└──────────────────────────────────────────────────────────────────┘
       │
       v
┌──────────────────────────────────────────────────────────────────┐
│ 4. REVSHARE_PAYMENT created when payout processed                │
│    - Links to agent_id, period dates                             │
└──────────────────────────────────────────────────────────────────┘
```

---

## Key Financial Relationships

| From                 | To                   | Relationship | Purpose                        |
| -------------------- | -------------------- | ------------ | ------------------------------ |
| transaction          | contribution         | 1:N          | One deal → multiple rev shares |
| contribution         | agent (contributing) | N:1          | Who closed the deal            |
| contribution         | agent (receiving)    | N:1          | Who gets rev share             |
| contribution         | income               | 1:1          | Contribution becomes income    |
| income               | agent                | N:1          | All income by agent            |
| revshare_totals      | agent                | 1:1          | Aggregated totals              |
| equity_transactions  | agent                | N:1          | Equity ledger                  |
| equity_monthly       | agent                | N:1          | Monthly rollup                 |
| stripe_subscriptions | user                 | N:1          | Billing                        |

---

_Generated: 2026-01-26_
_Task: fn-1-2cy.2_
