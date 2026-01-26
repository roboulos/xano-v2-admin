# CLAUDE.md - V1 to V2 Migration Admin Interface

> **[PROJECT_HISTORY.md](./PROJECT_HISTORY.md)** - Complete 43-day timeline from Dec 5, 2025 to Jan 16, 2026. Covers all workstreams: Frontend (dashboards2.0), V2 Backend Refactor, Demo Sync Admin, and this Migration Admin. Includes what's been built, what remains, and detailed checklists.

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
│   └── validation/             # Validation pipeline routes
│       ├── pipeline/           # Pipeline status
│       ├── run/                # Run validation
│       ├── reports/            # Report retrieval
│       └── status/             # Current status
components/
├── ui/                         # ShadCN components (15 components)
├── machine-2/                  # Machine 2.0 components
│   ├── backend-validation-tab.tsx
│   └── schema-tab.tsx
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

### Machine 2.0 Components

- `components/machine-2/schema-tab.tsx` - V1 vs V2 field comparison
- `components/machine-2/backend-validation-tab.tsx` - Backend validation checks

### Data Configuration

- `lib/mcp-endpoints.ts` - **All endpoint mappings and base URLs**
- `lib/v1-data.ts` - V1 workspace tables (251)
- `lib/v2-data.ts` - V2 workspace tables (193)
- `lib/table-mappings.ts` - V1 → V2 mappings
