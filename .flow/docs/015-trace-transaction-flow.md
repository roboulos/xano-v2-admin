# Trace: Transaction Flow - reZEN API to Dashboard Display

> Task 6.1: Trace transaction: reZEN API → dashboard display

## Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                    TRANSACTION: reZEN API → DASHBOARD                                │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  STEP 1: SOURCE - reZEN API                                                         │
│  ═══════════════════════════════════════════════════════════════════════════════   │
│                                                                                      │
│  GET https://arrakis.therealbrokerage.com/api/v1/transactions/{id}                 │
│  Headers: X-API-KEY: {user_api_key}                                                │
│                                                                                      │
│  Response:                                                                          │
│  {                                                                                   │
│    "id": "abc-123",                                                                 │
│    "type": "RESIDENTIAL_SALE",                                                      │
│    "status": "CLOSED",                                                              │
│    "address": {                                                                     │
│      "oneLine": "123 Main St, Denver, CO 80202",                                   │
│      "street": "123 Main St",                                                       │
│      "city": "Denver",                                                              │
│      "state": "CO",                                                                 │
│      "zipcode": "80202"                                                             │
│    },                                                                               │
│    "price": { "amount": 450000 },                                                   │
│    "closeDate": "2026-01-15",                                                       │
│    "participants": [...],                                                           │
│    "listing": false                                                                 │
│  }                                                                                   │
│       │                                                                              │
│       ▼                                                                              │
│  STEP 2: INGEST - Webhook or Onboarding                                             │
│  ═══════════════════════════════════════════════════════════════════════════════   │
│                                                                                      │
│  PATH A: Webhook                                     PATH B: Onboarding             │
│  ┌─────────────────────────────────┐               ┌─────────────────────────────┐ │
│  │ POST /rezen/webhook/create      │               │ Workers/reZEN - Onboarding  │ │
│  │         │                       │               │ Load Transactions (8296)    │ │
│  │         ▼                       │               │         │                   │ │
│  │ rezen_process_webhook (queue)   │               │         ▼                   │ │
│  │         │                       │               │ rezen_transaction_staging   │ │
│  │         ▼ (5 min poll)          │               │         │                   │ │
│  │ Workers/reZEN - Process         │               │         ▼                   │ │
│  │ Webhook Events (8124)           │               │ Workers/reZEN - Onboarding  │ │
│  └─────────────────────────────────┘               │ Process Transaction Staging │ │
│                                                     └─────────────────────────────┘ │
│       │                                                       │                     │
│       └───────────────────────┬───────────────────────────────┘                     │
│                               ▼                                                      │
│  STEP 3: TRANSFORM - Workers/reZEN - Transaction Details By Object                  │
│  ═══════════════════════════════════════════════════════════════════════════════   │
│                                                                                      │
│  Input: Raw reZEN API response                                                      │
│  Output: Normalized data for multiple tables                                        │
│                                                                                      │
│  Transformations:                                                                   │
│  ├── Extract address → address table lookup/create                                  │
│  ├── Map status → internal status codes                                             │
│  ├── Parse participants → participant records                                       │
│  ├── Calculate financials → transaction_financials                                  │
│  └── Normalize dates → ISO format                                                   │
│                                                                                      │
│       │                                                                              │
│       ▼                                                                              │
│  STEP 4: STORE - Database Tables                                                    │
│  ═══════════════════════════════════════════════════════════════════════════════   │
│                                                                                      │
│  ┌───────────────────┐                                                              │
│  │ transaction (891) │◄────────────── Core transaction record                       │
│  │ Fields:           │                                                              │
│  │ • id (PK)         │                                                              │
│  │ • transaction_id  │ ← reZEN transaction ID                                       │
│  │ • type            │                                                              │
│  │ • status          │                                                              │
│  │ • address_id      │ ← FK to address                                              │
│  │ • close_date      │                                                              │
│  │ • user_id         │ ← FK to user                                                 │
│  │ • agent_id        │ ← FK to agent                                                │
│  │ • team_id         │ ← FK to team                                                 │
│  └─────────┬─────────┘                                                              │
│            │                                                                         │
│            │ FK                                                                      │
│            ▼                                                                         │
│  ┌───────────────────────────┐  ┌────────────────────────┐                         │
│  │ transaction_financials    │  │ participant (892)      │                         │
│  │ (894)                     │  │                        │                         │
│  │ • transaction_id (FK)     │  │ • transaction_id (FK)  │                         │
│  │ • sale_price              │  │ • role                 │                         │
│  │ • commission_amount       │  │ • agent_id             │                         │
│  │ • net_payout              │  │ • agent_name           │                         │
│  │ • gross_commission        │  │ • side                 │                         │
│  └───────────────────────────┘  └────────────────────────┘                         │
│                                          │                                          │
│                                          │ FK                                       │
│                                          ▼                                          │
│                                 ┌────────────────────────┐                         │
│                                 │ paid_participant (893) │                         │
│                                 │ • participant_id (FK)  │                         │
│                                 │ • payment_type         │                         │
│                                 │ • amount               │                         │
│                                 └────────────────────────┘                         │
│                                                                                      │
│       │                                                                              │
│       ▼                                                                              │
│  STEP 5: API - Frontend API v2 Endpoints                                            │
│  ═══════════════════════════════════════════════════════════════════════════════   │
│                                                                                      │
│  GET /transactions/all                                                              │
│  ├── Query transaction table with filters                                           │
│  ├── Join transaction_financials                                                    │
│  ├── Join participants                                                              │
│  ├── Apply user permissions                                                         │
│  └── Return paginated results                                                       │
│                                                                                      │
│  GET /transactions/metrics                                                          │
│  ├── Aggregate transaction data                                                     │
│  └── Return totals, counts, averages                                                │
│                                                                                      │
│       │                                                                              │
│       ▼                                                                              │
│  STEP 6: DISPLAY - Frontend Dashboard                                               │
│  ═══════════════════════════════════════════════════════════════════════════════   │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  TRANSACTIONS PAGE                                                           │   │
│  │  ╔═══════════════════════════════════════════════════════════════════════╗  │   │
│  │  ║ 123 Main St, Denver │ CLOSED │ $450,000 │ Jan 15, 2026 │ [View]       ║  │   │
│  │  ╚═══════════════════════════════════════════════════════════════════════╝  │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Table Schema Summary

### transaction (ID: 891)

| Field                | Type      | Source           |
| -------------------- | --------- | ---------------- |
| id                   | int       | Auto-increment   |
| transaction_id       | text      | reZEN: id        |
| type                 | text      | reZEN: type      |
| status               | text      | reZEN: status    |
| address_id           | int       | FK → address     |
| close_date           | timestamp | reZEN: closeDate |
| effective_close_date | timestamp | Calculated       |
| user_id              | int       | FK → user        |
| agent_id             | int       | FK → agent       |
| team_id              | int       | FK → team        |
| created_at           | timestamp | System           |
| updated_at           | timestamp | System           |

### transaction_financials (ID: 894)

| Field             | Type    | Source                  |
| ----------------- | ------- | ----------------------- |
| id                | int     | Auto-increment          |
| transaction_id    | int     | FK → transaction        |
| sale_price        | decimal | reZEN: price.amount     |
| list_price        | decimal | reZEN: listPrice.amount |
| commission_amount | decimal | Calculated              |
| gross_commission  | decimal | reZEN: commission       |
| net_payout        | decimal | Calculated              |

### participant (ID: 892)

| Field          | Type | Source                  |
| -------------- | ---- | ----------------------- |
| id             | int  | Auto-increment          |
| transaction_id | int  | FK → transaction        |
| role           | text | reZEN: participant.role |
| agent_id       | int  | FK → agent              |
| agent_name     | text | reZEN: participant.name |
| side           | text | BUY/SELL                |

---

## API Endpoints for Transactions

| Endpoint                   | Method | Purpose                            |
| -------------------------- | ------ | ---------------------------------- |
| /transactions/all          | GET    | List all transactions with filters |
| /transactions/metrics      | GET    | Aggregated metrics                 |
| /transactions/participants | GET    | Participant details                |
| /transactions/details      | POST   | Single transaction details         |
| /transactions/manual_entry | POST   | Create manual transaction          |
| /transactions/lead_source  | POST   | Update lead source                 |

---

## Data Transformations

### Status Mapping

| reZEN Status | Internal Status |
| ------------ | --------------- |
| PENDING      | Pending         |
| APPROVED     | Active          |
| CLOSED       | Closed          |
| TERMINATED   | Terminated      |
| CANCELED     | Canceled        |

### Type Mapping

| reZEN Type        | Internal Type    |
| ----------------- | ---------------- |
| RESIDENTIAL_SALE  | Sale             |
| RESIDENTIAL_LEASE | Lease            |
| COMMERCIAL_SALE   | Commercial Sale  |
| COMMERCIAL_LEASE  | Commercial Lease |

---

## Timing

| Stage                    | Latency |
| ------------------------ | ------- |
| Webhook received → Queue | < 1 sec |
| Queue → Processing       | 0-5 min |
| Processing → Database    | < 2 sec |
| API request → Response   | < 500ms |

---

_Generated: 2026-01-26_
_Task: fn-1-2cy.15_
