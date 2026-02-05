# CLAUDE.md - V1 to V2 Migration Admin Interface

> **[PROJECT_HISTORY.md](./PROJECT_HISTORY.md)** - Complete 61-day timeline from Dec 5, 2025 to Feb 3, 2026. Covers all workstreams: Frontend (dashboards2.0), V2 Backend Refactor, Demo Sync Admin, and this Migration Admin. Includes what's been built, what remains, and detailed checklists.

---

## Purpose

This is a **"Frontend Reveals Backend"** admin interface that compares the V1 Xano workspace (production) against the V2 workspace (normalized, refactored). The frontend serves as a diagnostic tool - migration gaps become immediately visible.

## The Core Comparison

```
┌─────────────────────────────────────────────────────────────────────────┐
│  V1 Workspace (Workspace 1)     vs    V2 Workspace (Workspace 5)        │
│  ─────────────────────────────       ──────────────────────────────     │
│  251 tables (production)             193 tables (normalized V2)         │
│  xmpx-swi5-tlvy.n7c.xano.io         x2nu-xcjc-vhax.xano.io             │
│  Live production data                Refactored schema                  │
└─────────────────────────────────────────────────────────────────────────┘
```

### What This Reveals

1. **Table Mapping**: Which V1 tables map to which V2 tables?
2. **Record Counts**: Do the records match after migration?
3. **Missing Data**: What V1 data hasn't been migrated yet?
4. **New Tables**: What new V2 tables don't exist in V1?
5. **Schema Evolution**: How did the schema evolve between versions?

---

## Xano Workspaces

### V1 Workspace (Production)

- **Instance:** `xmpx-swi5-tlvy.n7c.xano.io`
- **Workspace ID:** 1
- **Tables:** 251 tables
- **Status:** Production, live data

### V2 Workspace (Refactored - Normalized)

- **Instance:** `x2nu-xcjc-vhax.agentdashboards.xano.io`
- **Workspace ID:** 5
- **Tables:** 193 tables (normalized)
- **Status:** Development, migration target

---

## V1 Tables (251 Tables) - Complete Breakdown

### Core Tables (48)

Core business entities including users, agents, teams, transactions, listings, participants, network, contributions, and related junction/assignment tables.

| Category          | Tables | Examples                                                                   |
| ----------------- | ------ | -------------------------------------------------------------------------- |
| Users/Agents      | 5      | user, agent, user - 2FA, agent_task_history                                |
| Teams             | 7      | team, team - roster, team - owners, team - admins, team_admins_permissions |
| Transactions      | 6      | transaction, participant, paid participant, closing disclosure             |
| Listings          | 1      | listing                                                                    |
| Network           | 2      | network, network - change log                                              |
| Contributions     | 4      | contributions, contributors, contributions - pending, revShare totals      |
| Directors/Leaders | 8      | directors, leaders, mentors + assignment tables                            |
| Pipeline          | 2      | pipeline - prospects, pipeline - stages                                    |
| Equity            | 3      | equity - annual, equity - monthly, equity - transactions                   |
| Title             | 6      | title - orders, disbursements, events, users                               |

### Aggregation Tables (48)

Pre-computed aggregations for dashboards and analytics.

| Domain       | Tables | Examples                                                                               |
| ------------ | ------ | -------------------------------------------------------------------------------------- |
| Transactions | 7      | agg_transactions_by_month, by_agent, by_stage, by_type, by_geo, by_week, yoy           |
| Revenue      | 6      | agg_revenue_by_month, by_agent, by_week, ytd, waterfall, by_deduction_type             |
| Listings     | 5      | agg_listings_by_month, by_agent, by_stage, by_property_type, by_dom_bucket             |
| Network      | 7      | agg_network_by_month, by_tier, by_status, by_geo, by_week, revshare_by_month           |
| Leads        | 5      | agg_leads_by_month, by_agent, by_source, by_stage, conversion_funnel                   |
| FUB Activity | 7      | agg_fub_activity_by_month, by_agent, calls_by_direction/outcome, events_by_type/source |
| AI/NORA      | 8      | agg_anomalies_detected, benchmarks, funnel_conversion, pacing_daily, risk_flags        |
| Jobs         | 3      | aggregation_jobs, leaderboard_jobs, agg_team_leaderboard                               |

### FUB - Follow Up Boss (16)

CRM integration tables for Follow Up Boss.

| Type     | Tables                                                       |
| -------- | ------------------------------------------------------------ |
| Core     | FUB - accounts, people, deals, stages, events, users, groups |
| Activity | FUB - calls, text messages, appointments                     |
| Jobs     | FUB - sync jobs, onboarding jobs, aggregation_jobs           |
| Staging  | appointments staging, text messages staging                  |

### Integration Tables

| Integration  | Tables | Notes                                                          |
| ------------ | ------ | -------------------------------------------------------------- |
| **Rezen**    | 7      | sync jobs, onboarding jobs, webhooks, referral codes + staging |
| **SkySlope** | 3      | sync jobs, listing staging, transaction staging                |
| **DotLoop**  | 6      | accounts, contacts, loops, profiles, staging, sync_state       |
| **Lofty**    | 4      | accounts, leads, staging, sync_state                           |

### Stripe / Billing (8)

Payment and subscription management.

- stripe - pricing, product, subscriptions, subscription packages
- commission payment, commission plan
- plan_features, outgoing_payments

### Page Builder (12)

Dynamic page/dashboard building system.

- pages, page_tabs, page_sections, page_widgets
- page_filters, filter_options, page_layouts
- page_chart_assignments, widget_viewport_layouts
- user_filter_preferences, user_page_layouts, user_dashboard_sections

### Charts (11)

Visualization configuration.

- chart_catalog, chart_types, chart_libraries, charts, code_chart_catalog
- chart - transactions, my_dashboard_configuration, kpi_goals
- luzmo - charts, collections, dashboards

### AI / NORA (10)

AI-powered analytics features.

- ai_chart_conversations, nora_conversations
- ai_features_agent_period, ai_features_lead_current, ai_features_pipeline_current
- user_insights, user_actions, snap_metrics_daily
- dim_status_mapping, dim_time_periods

### Lambda Jobs (5)

Background job processing.

- lambda jobs - log, lambda jobs - status, lambda_worker_log
- lambda_failed_record, api workers

### Logs & Audit (15)

Logging and audit trails.

- audits, system audit, error logs, event log
- email - logs, email - master
- log - contributions, log - network, log - api keys
- demo_sync_log, contact_log
- transaction_stage_log, transaction_price_log, transaction_effective_close_date_log
- deleted_records_audit

### Configuration (22)

System configuration and reference data.

- api_keys, brokerage, office, global variables
- permissions, modules, integration
- state or province, calendar, tags
- revshare plan, rev share payments, sponsor tree
- lead source defaults/user, real - lifecycle group
- dashboard_templates, report_templates, onboarding_progress
- pipeline defaults (prospects, stages)
- notification categories (default, user)

### Staging / Import (16)

Data import and staging tables.

- CSV_Imports, csv_mapping_templates, manual_csv_upload, temp_csv_data
- FUB staging: appointments, text messages
- Rezen staging: contributions (daily, onboarding), listings, network, transactions, pending
- SkySlope staging: listings, transactions
- DotLoop staging, Lofty staging
- temp_table, transaction_temp

### Other / Misc (25+)

Various other tables including links, leads, notes, checklists, invitations, mortgages, etc.

---

## Table Mapping Philosophy

### Mapping Types

| Type           | Description                   | Example                                          |
| -------------- | ----------------------------- | ------------------------------------------------ |
| **direct**     | 1:1 mapping, same name        | user → user                                      |
| **renamed**    | 1:1 but different name        | roster → team_members                            |
| **split**      | V1 table → multiple V2 tables | transaction → transaction + financials + history |
| **merged**     | Multiple V1 → single V2       | contributors merged into contribution            |
| **deprecated** | V1 table has no V2 equivalent | fub_notes (merged into contact_log)              |
| **new**        | V2 table has no V1 source     | agent_cap_data (new feature)                     |

### Key Split Mappings

| V1 Table    | V2 Tables                                                                                            | Notes               |
| ----------- | ---------------------------------------------------------------------------------------------------- | ------------------- |
| user        | user, user_credentials, user_settings, user_roles, user_subscriptions                                | Identity decomposed |
| agent       | agent, agent_cap_data, agent_commission, agent_hierarchy, agent_performance                          | Profile normalized  |
| transaction | transaction, transaction_financials, transaction_history, transaction_participants, transaction_tags | Fully normalized    |
| listing     | listing, listing_history, listing_photos                                                             | Media separated     |
| network     | network_hierarchy, network_member, network_user_prefs                                                | Decomposed          |

---

## Commands

```bash
pnpm dev          # Start dev server (port 3000)
pnpm build        # Production build
pnpm lint         # Run ESLint
```

---

## Architecture

### Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4, ShadCN UI
- **Data Sources:**
  - V1: `xmpx-swi5-tlvy.n7c.xano.io` (Workspace 1)
  - V2: `x2nu-xcjc-vhax.agentdashboards.xano.io` (Workspace 5)
- **MCP:** Xano MCP for live data fetching

### File Structure

```
app/
├── page.tsx                    # Main dashboard with tabs
├── layout.tsx                  # Root layout
├── providers.tsx               # React Query provider
├── globals.css                 # Tailwind styles
├── inventory/                  # Inventory pages
│   ├── page.tsx                # Main inventory
│   ├── frontend-api/           # Frontend API browser
│   ├── workers/                # Workers inventory
│   ├── tasks/                  # Tasks inventory
│   ├── background-tasks/       # Background tasks
│   └── test-endpoints/         # Endpoint testing
├── api/                        # API routes
│   ├── v1/                     # V1 workspace routes
│   │   ├── tables/             # V1 table operations
│   │   └── functions/          # V1 function operations
│   ├── v2/                     # V2 workspace routes
│   │   ├── tables/             # V2 tables + counts + integrity
│   │   ├── functions/          # V2 functions + testing
│   │   ├── endpoints/          # Endpoint health checks
│   │   └── background-tasks/   # Background task management
│   ├── users/                  # User-scoped routes (Proof System)
│   │   ├── list/route.ts       # GET /api/users/list - search users
│   │   └── [id]/comparison/route.ts  # GET /api/users/:id/comparison
│   ├── staging/                # Staging pipeline routes
│   │   ├── status/route.ts     # GET /api/staging/status?user_id=X
│   │   └── unprocessed/route.ts # GET /api/staging/unprocessed?user_id=X
│   └── validation/             # Validation pipeline routes
│       ├── pipeline/           # Pipeline status
│       ├── run/                # Run validation
│       ├── reports/            # Report retrieval
│       └── status/             # Current status
contexts/
└── UserContext.tsx              # Split context: SelectedUserId + UserDataQuery
components/
├── ui/                         # ShadCN components (15 components)
├── machine-2/                  # Machine 2.0 components
│   ├── backend-validation-tab.tsx
│   └── schema-tab.tsx
├── story-tabs/                 # Interactive Proof System story tabs
│   ├── onboarding-story-tab.tsx      # 6-step onboarding progress
│   ├── background-tasks-story-tab.tsx # Job queue status
│   ├── sync-pipelines-story-tab.tsx   # V1->Staging->V2 pipeline
│   └── schema-mapping-story-tab.tsx   # V1->V2 table mapping viz
├── user-picker.tsx             # Searchable user combobox
├── comparison-panel.tsx        # V1/V2 side-by-side data comparison
├── diff-highlight.tsx          # Diff rendering components
├── comparison-modal.tsx        # V1/V2 comparison modal
├── endpoint-tester-modal.tsx   # Endpoint testing modal
├── functions-tab.tsx           # Functions management
├── background-tasks-tab.tsx    # Background tasks UI
├── live-migration-status.tsx   # Migration status (65KB)
├── validation-pipeline-view.tsx # Validation pipeline UI
├── function-code-modal.tsx     # Function code viewer
└── export-dropdown.tsx         # Export functionality
lib/
├── api/                        # API client layer
│   ├── client.ts               # Axios client with auth
│   ├── generated-types.ts      # Auto-generated types (21,361 lines)
│   ├── generated-hooks.ts      # Auto-generated React Query hooks (3,298 lines)
│   ├── generated-schemas.ts    # Auto-generated Zod schemas (3,915 lines)
│   └── endpoint-tester.ts      # Endpoint testing utilities
├── diff-utils.ts               # Pure diff computation (no React deps)
├── table-mappings-detailed.ts  # Field-level V1->V2 mapping definitions
├── v1-data.ts                  # V1 workspace data (251 tables)
├── v2-data.ts                  # V2 workspace data (193 tables)
├── table-mappings.ts           # V1 → V2 table mappings
├── mcp-endpoints.ts            # MCP endpoint configuration
├── frontend-api-v2-endpoints.ts # Frontend API endpoint mappings
├── snappy-client.ts            # MCP tool wrapper
├── validation-executor.ts      # Validation execution
├── utils.ts                    # Utility functions
└── *.json                      # Generated data files
    ├── frontend-api-v2-openapi.json (889KB)
    └── function-endpoint-mapping.json (217KB)
scripts/
├── validation/                 # Validation scripts
│   ├── validate-tables.ts      # 193 V2 tables
│   ├── validate-functions.ts   # 270 active functions
│   ├── validate-endpoints.ts   # 801 API endpoints
│   ├── validate-references.ts  # 156 foreign keys
│   └── utils.ts                # Shared utilities
├── generate-types.ts           # TypeScript type generation
├── generate-hooks.ts           # React Query hook generation
├── generate-schemas.ts         # Zod schema generation
├── run-endpoint-tests.ts       # CLI endpoint tester
└── compare-response-structures.ts # V1/V2 comparison
test/
└── v2-integration.test.ts      # 280+ test cases
validation-reports/             # Generated validation JSON
.github/
└── workflows/
    └── ci.yml                  # GitHub Actions CI
```

---

## API Automation Pipeline

Auto-generated code from OpenAPI spec (28,574 lines total):

| Command               | Output                         | Lines  |
| --------------------- | ------------------------------ | ------ |
| `npm run types:gen`   | `lib/api/generated-types.ts`   | 21,361 |
| `npm run hooks:gen`   | `lib/api/generated-hooks.ts`   | 3,298  |
| `npm run schemas:gen` | `lib/api/generated-schemas.ts` | 3,915  |
| `npm run api:gen`     | All three                      | 28,574 |

**When to regenerate:** After any Xano backend changes, run `npm run api:gen`.

---

## Validation Commands

```bash
npm run validate:tables      # 193 V2 tables - schema integrity
npm run validate:functions   # 270 functions - business logic
npm run validate:endpoints   # 801 endpoints - API contracts
npm run validate:references  # 156 foreign keys - data integrity
npm run validate:all         # Run all 4 validators
```

**Minimum scores:** Tables 100%, Functions 95%, Endpoints 96%, References 100%

---

## Key Differences from Demo Sync

| Demo Sync Admin    | V1→V2 Migration Admin |
| ------------------ | --------------------- |
| Same workspace     | Different workspaces  |
| live vs demo_data  | V1 vs V2 schemas      |
| Exact record match | Structural comparison |
| Sync action        | No sync (read-only)   |
| 33 synced tables   | 251 vs 193 tables     |

---

## Philosophy: Frontend Reveals Migration Gaps

**Traditional:** Migration docs say it's "mostly done"
**This Project:** See exactly which tables are migrated, which aren't, and what the record deltas are

The frontend makes migration status undeniable. Every table, every count, every gap - visible at a glance.

---

## Table Count Summary

| Category     | V1 Count |
| ------------ | -------- |
| Core         | 48       |
| Aggregation  | 48       |
| FUB          | 16       |
| Rezen        | 7        |
| SkySlope     | 3        |
| DotLoop      | 6        |
| Lofty        | 4        |
| Stripe       | 8        |
| Page Builder | 12       |
| Charts       | 11       |
| AI/NORA      | 10       |
| Lambda       | 5        |
| Logs         | 15       |
| Config       | 22       |
| Staging      | 16       |
| Other        | 20+      |
| **TOTAL**    | **251**  |

---

## Machine 2.0 Frontend Structure

### Tab Components (components/machine-2/)

| Tab                    | File                         | Purpose                   |
| ---------------------- | ---------------------------- | ------------------------- |
| **Schema**             | `schema-tab.tsx`             | V1 vs V2 field comparison |
| **Backend Validation** | `backend-validation-tab.tsx` | Backend validation checks |

### Onboarding Steps (6 Steps)

| Step | Name          | Endpoints                                                                     | Tables                                              |
| ---- | ------------- | ----------------------------------------------------------------------------- | --------------------------------------------------- |
| 1    | Team Data     | `/test-function-8066-team-roster`                                             | team, team_roster, team_owners, team_admins         |
| 2    | Agent Data    | `/test-function-8051-agent-data`                                              | agent, user                                         |
| 3    | Transactions  | `/test-function-8052-txn-sync`                                                | transaction, participant, paid_participant          |
| 4    | Listings      | `/test-function-8053-listings-sync`, `/test-function-8054-listings-update`    | listing                                             |
| 5    | Contributions | `/test-function-8056-contributions`, `/test-function-8060-load-contributions` | contribution, income, revshare_totals, contributors |
| 6    | Network       | `/test-function-8062-network-downline`, `/test-function-8070-sponsor-tree`    | network, connections                                |

### MCP Endpoint Mapping (lib/mcp-endpoints.ts)

**Base URLs:**

```typescript
MCP_BASES = {
  TASKS: 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4psV7fp6',
  WORKERS: 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m',
  SYSTEM: 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN',
  SEEDING: 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:2kCRUYxG',
}
```

**Helper Functions:**

- `getEndpointsByGroup(group)` - Filter endpoints by API group
- `getEndpointsNeedingUserId()` - Get endpoints requiring user_id param
- `getStandaloneEndpoints()` - Get endpoints that run without user_id

### SEEDING Endpoints (api:2kCRUYxG)

| Endpoint                  | Method | Params                     | Description                                                                                                                                                                                                       |
| ------------------------- | ------ | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/clear-user-data`        | POST   | `user_id`, `confirm: true` | Clear all V2 data for a user (for fresh onboarding). Preserves `user` and `agent` records. Clears: FUB data, job records, transactions, listings, contributions, network data. Returns deletion counts per table. |
| `/seed/demo-dataset`      | POST   | none                       | Seed demo data for testing                                                                                                                                                                                        |
| `/seed/user/count`        | GET    | none                       | Get seeded user counts                                                                                                                                                                                            |
| `/seed/agent/count`       | GET    | none                       | Get seeded agent counts                                                                                                                                                                                           |
| `/seed/transaction/count` | GET    | none                       | Get seeded transaction counts                                                                                                                                                                                     |
| `/seed/team/count`        | GET    | none                       | Get seeded team counts                                                                                                                                                                                            |
| `/seed/network/count`     | GET    | none                       | Get seeded network counts                                                                                                                                                                                         |
| `/seed/listing/count`     | GET    | none                       | Get seeded listing counts                                                                                                                                                                                         |
| `/clear/all`              | POST   | none                       | Clear all seeded data (DANGEROUS)                                                                                                                                                                                 |

**Clear User Data - Usage:**

```bash
# Clear all data for user 60 (requires confirm: true for safety)
curl -s -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:2kCRUYxG/clear-user-data" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 60,
    "confirm": true
  }'

# Expected response:
# {
#   "success": true,
#   "user_id": 60,
#   "deleted": {
#     "rezen_sync_jobs": 1,
#     "fub_sync_jobs": 2,
#     "job_status": 8838,
#     ...
#   },
#   "message": "User data cleared for fresh onboarding"
# }
```

### SYSTEM Endpoints (api:LIdBL1AN)

| Endpoint                    | Method | Params               | Description                                                                                        |
| --------------------------- | ------ | -------------------- | -------------------------------------------------------------------------------------------------- |
| `/table-counts`             | GET    | none                 | Get counts for core tables                                                                         |
| `/staging-status`           | GET    | `user_id`            | Check staging table status for a user                                                              |
| `/onboarding-status`        | GET    | `user_id`            | Check onboarding job status for a user                                                             |
| `/staging-unprocessed`      | GET    | `user_id`            | Get unprocessed staging records                                                                    |
| `/reset-transaction-errors` | POST   | `user_id`            | Reset transaction error flags                                                                      |
| `/trigger-sponsor-tree`     | POST   | `user_id`            | Trigger sponsor tree rebuild                                                                       |
| `/backfill-all-updated-at`  | POST   | none                 | Backfill updated_at timestamps                                                                     |
| `/job-queue-status`         | GET    | `user_id` (optional) | Get job queue depths for all job types. **NOTE: Xano function needs to be created - returns 404.** |

**Job Queue Status - Expected Response (when implemented):**

```json
{
  "success": true,
  "queues": {
    "onboarding": { "pending": 5, "processing": 2, "complete": 100, "error": 3 },
    "fub_sync": { "pending": 10, "processing": 1 },
    "general": { "pending": 0, "processing": 0 }
  },
  "total_pending": 15,
  "oldest_pending_minutes": 45,
  "tables_checked": ["job_status", "fub_onboarding_jobs", "fub_sync_jobs"],
  "tables_missing": ["fub_worker_queue", "lambda_job_status"]
}
```

**Job Queue Status - Usage (when Xano function is created):**

```bash
# Get all queue status
curl -s "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN/job-queue-status"

# Filter to specific user
curl -s "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN/job-queue-status?user_id=60"
```

**Implementation TODO:** Create Xano function in SYSTEM API group (api:LIdBL1AN) that:

1. Queries `job_status`, `fub_onboarding_jobs`, `fub_sync_jobs` tables
2. Aggregates counts by status field
3. Calculates oldest pending job age
4. Handles missing tables gracefully (some may not exist in V2)

### WORKERS Endpoints (api:4UsTtl3m)

| Endpoint                               | Method | Params                      | Status | Description                                                    |
| -------------------------------------- | ------ | --------------------------- | ------ | -------------------------------------------------------------- |
| `/test-function-8066-team-roster`      | POST   | `user_id`                   | ✅ OK  | Sync team roster data. Fixed Feb 2026. Returns teams_processed |
| `/test-function-8062-network-downline` | POST   | `user_id`, `skip_job_check` | ✅ OK  | Sync network downline. Fixed Feb 2026. 100 records/call        |
| `/test-rezen-team-roster-sync`         | POST   | `user_id`                   | ✅ OK  | Sync team roster (function #8032). Fixed Jan 2026              |
| `/test-function-8051-agent-data`       | POST   | `user_id`                   | ✅ OK  | Get agent profile data from reZEN                              |
| `/test-function-8052-txn-sync`         | POST   | `user_id`                   | ✅ OK  | Sync transactions from reZEN API                               |

**Team Roster Endpoint (Function 8066) - FIXED Feb 2026:**

```bash
# Test with user 60
curl -s -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/test-function-8066-team-roster" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 60}'

# Returns:
# {
#   "success": true,
#   "function_result": {
#     "success": true,
#     "data": {
#       "message": "Team roster sync completed",
#       "teams_processed": 4,
#       "new_agents": 0,
#       "inactive_agents": 0
#     }
#   }
# }
```

**What Was Fixed (Function 8066):**

1. **Function 8097** (Roster Lambda Comparison) - Safe accessor for lambda error field
   - `$lambda_result.error` → `$lambda_result|get:"error":null`
2. **Function 8066** (Team Roster Sync) - Multiple issues:
   - Wrong credentials table (`user_credentials` → `credentials`)
   - Wrong agent_id source (user.agent_id=1 → credentials.agent_id=37208)
   - Missing user.agent_id_raw
   - Wrong lambda result path
3. **Function 8094** (Roster Counts) - Fixed table name and API domain
   - `user_credentials` → `credentials` table
   - `yoda.therealbrokerage.com` → `yenta.therealbrokerage.com`

**Network Downline Endpoint (Function 8062) - FIXED Feb 2026:**

```bash
# Test with skip_job_check for standalone testing
curl -s -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/test-function-8062-network-downline" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 60,
    "skip_job_check": true
  }'

# Returns:
# {
#   "input_user_id": 60,
#   "skip_job_check": true,
#   "function_result": {
#     "success": true,
#     "data": {
#       "processed": 100,
#       "remaining_items": 1349
#     }
#   }
# }
```

**What Was Fixed (Function 8062):**

1. Added `skip_job_check` and `user_id` parameters for standalone testing
2. Created **Function 11253** (Workers/Network - Update Downline From Staging) - NEW
   - Replaced broken Archive function 5530
   - Uses V2 schema: `network_member` table (not V1 "network" table)
   - Fixed JOIN syntax issue: removed `table: ""` that caused "missing bind parameter - dbo"
3. Endpoint 17477 passes skip_job_check (defaults to true for testing)

---

## Interactive Proof System

The Proof System transforms static migration documentation into a live verification tool. Select any user and instantly see their data from both V1 and V2 workspaces side by side, with diff highlighting that proves migration accuracy at the field level.

### User Picker

A searchable combobox (`components/user-picker.tsx`) that queries `/api/users/list` to find users by name, email, or ID. Features:

- **Type-ahead search** with debounced API calls
- **Recently selected users** shown at top (max 5, persisted to localStorage)
- **Verified test users highlighted** (user 60 = David Keener shown with badge)
- **Keyboard navigation** (arrow keys, enter, escape)
- Selection updates `UserContext`, which triggers data loading for all tabs

### UserContext (`contexts/UserContext.tsx`)

Split context architecture to minimize re-renders:

| Context                 | Weight | Purpose                                             |
| ----------------------- | ------ | --------------------------------------------------- |
| `SelectedUserIdContext` | Tiny   | Holds selected user ID + setter                     |
| `UserDataQueryContext`  | Heavy  | V1/V2 comparison data via React Query (10s polling) |

**Hooks:**

- `useSelectedUserId()` -- lightweight, for components that only read/write the selection (User Picker)
- `useUserData()` -- heavy, for components that display V1/V2 comparison data (Story tabs, Comparison Panel)

**Features:** localStorage persistence, AbortController for rapid user switching, React Query caching with 10s polling interval.

### Story Tabs (`components/story-tabs/`)

Each tab tells a different "story" about the selected user's migration state:

| Tab                  | File                             | Description                                                                                                                                                                               |
| -------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Onboarding Story** | `onboarding-story-tab.tsx`       | 6-step progress tracker: Team Data, Agent Data, Transactions, Listings, Contributions, Network. Each step shows endpoint status and record counts.                                        |
| **Background Tasks** | `background-tasks-story-tab.tsx` | Job queue status across 4 queue types (fub_onboarding, fub_sync, rezen_sync, job_status). Handles `/job-queue-status` 404 gracefully with fallback UI.                                    |
| **Sync Pipelines**   | `sync-pipelines-story-tab.tsx`   | 4-stage pipeline flow (Source -> Staging -> Processing -> V2 Target) for 5 integrations: FUB, reZEN, SkySlope, DotLoop, Lofty. Uses `/api/staging/status` and `/api/staging/unprocessed`. |
| **Schema Mapping**   | `schema-mapping-story-tab.tsx`   | V1->V2 table mapping visualization from `lib/table-mappings.ts`. Shows mapping types (direct, renamed, split, merged, deprecated, new) with color coding and expand/collapse.             |

### Comparison Panel (`components/comparison-panel.tsx`)

Side-by-side V1/V2 data display for the selected user. Shows:

- **Record counts with delta** (V2 - V1) per entity (user, agent, transactions, listings, network, contributions)
- **Field-level diff highlighting** via `DiffHighlight` component using semantic status tokens
- **Expandable sections** for scalar records (user profile, agent profile) and array records (transactions list)
- **Copy to clipboard** for raw JSON data

### Diff System

Two files work together:

- **`lib/diff-utils.ts`** -- Pure functions (no React imports, unit-testable). Exports `compareFields()`, `summarizeDiffs()`, `formatValue()`. Diff statuses: `match`, `modified`, `added`, `removed`, `type_mismatch`.
- **`components/diff-highlight.tsx`** -- React rendering. Exports `DiffHighlight`, `DiffStatusBadge`, `DiffSummaryBar`. Uses semantic CSS tokens (`var(--status-success)`, `var(--status-error)`).

### Proof System API Endpoints

**`GET /api/users/list`** -- Search and list users from V2 workspace.

```bash
# List users with search
curl -s "http://localhost:3000/api/users/list?search=david&limit=10" | jq '.users[:3]'

# Paginate results
curl -s "http://localhost:3000/api/users/list?limit=50&offset=100" | jq '.total, .hasMore'
```

| Param    | Type   | Default | Description                  |
| -------- | ------ | ------- | ---------------------------- |
| `search` | string | --      | Filter by name, email, or ID |
| `limit`  | number | 50      | Max results to return        |
| `offset` | number | 0       | Pagination offset            |

**`GET /api/users/[id]/comparison`** -- V1/V2 side-by-side comparison for a specific user.

```bash
# Full comparison for user 60
curl -s "http://localhost:3000/api/users/60/comparison" | jq '.comparison'

# Specific sections only (faster)
curl -s "http://localhost:3000/api/users/60/comparison?sections=user,agent" | jq

# Paginate array sections
curl -s "http://localhost:3000/api/users/60/comparison?sections=transactions&limit=20&offset=0" | jq
```

| Param      | Type   | Default | Description                                                                        |
| ---------- | ------ | ------- | ---------------------------------------------------------------------------------- |
| `sections` | string | all     | Comma-separated: user, agent, transactions, listings, network, contributions, team |
| `limit`    | number | 100     | Max records per array section                                                      |
| `offset`   | number | 0       | Pagination offset for array sections                                               |

**`GET /api/staging/status`** -- Staging table counts for a user (proxies V2 SYSTEM endpoint).

```bash
curl -s "http://localhost:3000/api/staging/status?user_id=60" | jq
```

**`GET /api/staging/unprocessed`** -- Unprocessed staging records for a user.

```bash
curl -s "http://localhost:3000/api/staging/unprocessed?user_id=60" | jq
```

---

## 🔥 XanoScript Hard-Won Lessons (January 2026)

### The Team Roster Sync Fix

**Error:** `"Text filter requires an integer, float, string or boolean value" on input.2.value`

**Root Cause:** Inline arrays with variables don't interpolate correctly in XanoScript.

**❌ WRONG - Inline array with variable:**

```xanoscript
var $headers {
  value = ["Content-Type: application/json", $api_key_header]
}
```

**✅ CORRECT - Build array with |push filter:**

```xanoscript
var $headers_arr {
  value = []
    |push:"Content-Type: application/json"
    |push:("X-API-KEY: "|concat:$the_api_key)
}
```

### Key XanoScript Patterns

#### 1. Header Array Construction

```xanoscript
// Build headers dynamically
var $auth_header {
  value = "Authorization: Bearer "|concat:$env.API_KEY
}
var $headers {
  value = []
    |push:"Content-Type: application/json"
    |push:$auth_header
}
```

#### 2. Safe Property Access with Defaults

```xanoscript
// Use |get filter with default value
var $agent_id {
  value = $input.user|get:"agent_id":0
}
```

#### 3. Timestamp Formatting

```xanoscript
// format_timestamp filter (NOT format_date)
var $date_str {
  value = $timestamp|format_timestamp:"Y-m-d"
}
```

#### 4. FP Result Type Pattern

```xanoscript
response = {
  success: true
  data   : { team_id: $team_id, members_count: $count }
  error  : ""
  step   : "team_roster_sync"
}
```

### Common XanoScript Gotchas

| Issue                   | Wrong                | Correct                           |
| ----------------------- | -------------------- | --------------------------------- | ----------------------- | ---------- |
| Inline arrays with vars | `["header", $var]`   | `[]                               | push:"header"           | push:$var` |
| String concatenation    | `$a + $b`            | `$a                               | concat:$b` or `$a ~ $b` |
| Date formatting         | `format_date`        | `format_timestamp`                |
| Optional inputs         | `text name?`         | Derive internally, avoid optional |
| Property access         | `$obj.field` on null | `$obj                             | get:"field":default`    |

### Debugging XanoScript

1. **Reduce inputs** - Match what the caller actually passes
2. **Build incrementally** - Add one operation at a time
3. **Test with curl** - Verify each change works
4. **Check null values** - API responses can be null/false on timeout
5. **Use |get with defaults** - Safe property access

---

## 🚨 V2 API Critical Patterns (February 2026)

### Auth/me Must Return FUB User Account

The V2 `/auth/me` endpoint MUST include `_fub_users_account` in the response for FUB data to work in the frontend.

**Required XanoScript in auth/me:**

```xanoscript
// Get FUB user account for this user (owner record) - for FUB data access
db.query fub_users {
  where = $db.fub_users.user_id == $user.id && $db.fub_users.is_owner == true
  return = {type: "single"}
} as $fub_users_account

// Add to user_data response
$user_data|set:"_fub_users_account":$fub_users_account
```

**Why it matters:** Frontend SWR hooks check `fubAccountInfo?.fubAccountId` before fetching. Without this data, `shouldFetch = false` and NO FUB API calls are made.

### V2 Aggregate Endpoints Require `view` Parameter

All V2 FUB aggregate endpoints require a `view` parameter:

| Endpoint                        | Required Params                               |
| ------------------------------- | --------------------------------------------- |
| `/fub/aggregates/people`        | `fub_account_id`, `view` ("agent" or "admin") |
| `/fub/aggregates/calls`         | `fub_account_id`, `view`                      |
| `/fub/aggregates/text-messages` | `fub_account_id`, `view`                      |
| `/fub/aggregates/email`         | `fub_account_id`, `view`                      |
| `/fub/aggregates/events`        | `fub_account_id`, `view`                      |
| `/fub/aggregates/appointments`  | `fub_account_id`, `view`                      |

**Frontend service pattern:**

```typescript
const params = new URLSearchParams()
params.append('fub_account_id', String(fubAccountId))
params.append('view', view) // "agent" or "admin"
if (fubUserId && fubUserId > 0) {
  params.append('fub_user_id', String(fubUserId))
}
```

### V2 Auth API Group

| Endpoint      | ID    | Purpose                                     |
| ------------- | ----- | ------------------------------------------- |
| `/auth/login` | -     | Returns user + `_fub_users_account`         |
| `/auth/me`    | 12687 | Returns current user + `_fub_users_account` |

**Base URL:** `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:i6a062_x`

---

## V1/V2 Sync Monitoring

> See [V2_SYNC_PIPELINE_GUIDE.md](./V2_SYNC_PIPELINE_GUIDE.md) for detailed documentation.

### Quick Status Check

```bash
curl -s -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:20LTQtIX/sync-v1-to-v2-direct" \
  -H "Content-Type: application/json" | python3 -m json.tool
```

### Current Sync Status (2026-02-04)

| Entity       | V1 Count | V2 Count | Status   |
| ------------ | -------- | -------- | -------- |
| Users        | 335      | 335      | ✅ 100%  |
| Agents       | 37,041   | 37,041   | ✅ 100%  |
| Transactions | 55,023   | 55,038   | ✅ 100%  |
| Participants | 702,072  | 701,551  | ✅ 99.9% |
| Network      | 86,618   | 86,628   | ✅ 100%  |

### Key Files

- **Field Mapping**: `.flow/V1_V2_FIELD_MAPPING.json`
- **Sync Endpoint**: ID 18569 `api:20LTQtIX/sync-v1-to-v2-direct`

---

## Quick Reference: Verified Test User

**IMPORTANT:** User 60 (David Keener) is the VERIFIED test user with extensive testing history.

| User         | ID  | Agent ID | Team ID | Notes                                              |
| ------------ | --- | -------- | ------- | -------------------------------------------------- |
| David Keener | 60  | 37208    | 1       | PRIMARY test user - see TRIGGER_ENDPOINTS_AUDIT.md |

**For Demo Users (v0-demo-sync-admin-interface):**

| User            | ID  | Email                            | Type               |
| --------------- | --- | -------------------------------- | ------------------ |
| Michael Johnson | 7   | michael@demo.agentdashboards.com | Team Owner (Admin) |
| Sarah Williams  | 256 | sarah@demo.agentdashboards.com   | Team Member        |
| James Anderson  | 133 | james@demo.agentdashboards.com   | Network Builder    |

**Password:** `AgentDashboards143!`

### Testing Audit Reference

Full testing documentation is in the agent_dashboards_2 project:

- **File:** `/Users/sboulos/Desktop/ai_projects/agent_dashboards_2/TRIGGER_ENDPOINTS_AUDIT.md`
- **Pass Rate:** 32/38 endpoints (84%) with user 60
- **Working Groups:** FUB (9/9), Metrics (5/5), Network (4/4), Utility (3/3)

### curl Test Template

```bash
# Test any WORKERS endpoint with verified user 60
curl -s -X POST "https://xmpx-swi5-tlvy.n7c.xano.io/api:4UsTtl3m/ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 60}'
```

---

## File Navigation

### Main Entry Point

- `app/page.tsx` - Main dashboard with tabs

### Interactive Proof System

- `contexts/UserContext.tsx` - Split context provider (SelectedUserId + UserDataQuery)
- `components/user-picker.tsx` - Searchable user combobox
- `components/comparison-panel.tsx` - V1/V2 side-by-side data comparison
- `components/diff-highlight.tsx` - Diff rendering components (DiffHighlight, DiffStatusBadge, DiffSummaryBar)
- `components/story-tabs/onboarding-story-tab.tsx` - 6-step onboarding progress
- `components/story-tabs/background-tasks-story-tab.tsx` - Job queue status
- `components/story-tabs/sync-pipelines-story-tab.tsx` - V1->Staging->V2 pipeline visualization
- `components/story-tabs/schema-mapping-story-tab.tsx` - Table mapping visualization
- `lib/diff-utils.ts` - Pure diff computation functions
- `lib/table-mappings-detailed.ts` - Field-level V1->V2 mapping definitions
- `app/api/users/list/route.ts` - User search endpoint
- `app/api/users/[id]/comparison/route.ts` - V1/V2 comparison endpoint
- `app/api/staging/status/route.ts` - Staging table status proxy
- `app/api/staging/unprocessed/route.ts` - Unprocessed records proxy

### Machine 2.0 Components

- `components/machine-2/schema-tab.tsx` - V1 vs V2 field comparison
- `components/machine-2/backend-validation-tab.tsx` - Backend validation checks

### Data Configuration

- `lib/mcp-endpoints.ts` - **All endpoint mappings and base URLs**
- `lib/v1-data.ts` - V1 workspace tables (251)
- `lib/v2-data.ts` - V2 workspace tables (193)
- `lib/table-mappings.ts` - V1 → V2 mappings

---

## Related Projects (Agent Dashboards Ecosystem)

- **xano-v2-admin**: V1→V2 Migration tracking, validation, schema comparison (this repo)
- **v0-demo-sync-admin-interface**: Demo data generation, storytelling cards, live→demo sync
- **dashboards2.0**: Production frontend BI platform, 22+ dashboard pages

<!-- BEGIN FLOW-NEXT -->

## Flow-Next

This project uses Flow-Next for task tracking. Use `.flow/bin/flowctl` instead of markdown TODOs or TodoWrite.

**Quick commands:**

```bash
.flow/bin/flowctl list                # List all epics + tasks
.flow/bin/flowctl epics               # List all epics
.flow/bin/flowctl tasks --epic fn-N   # List tasks for epic
.flow/bin/flowctl ready --epic fn-N   # What's ready
.flow/bin/flowctl show fn-N.M         # View task
.flow/bin/flowctl start fn-N.M        # Claim task
.flow/bin/flowctl done fn-N.M --summary-file s.md --evidence-json e.json
```

**Rules:**

- Use `.flow/bin/flowctl` for ALL task tracking
- Do NOT create markdown TODOs or use TodoWrite
- Re-anchor (re-read spec + status) before every task

**More info:** `.flow/bin/flowctl --help` or read `.flow/usage.md`

<!-- END FLOW-NEXT -->
