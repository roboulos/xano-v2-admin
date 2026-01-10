# CLAUDE.md - V1 to V2 Migration Admin Interface

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

| Category | Tables | Examples |
|----------|--------|----------|
| Users/Agents | 5 | user, agent, user - 2FA, agent_task_history |
| Teams | 7 | team, team - roster, team - owners, team - admins, team_admins_permissions |
| Transactions | 6 | transaction, participant, paid participant, closing disclosure |
| Listings | 1 | listing |
| Network | 2 | network, network - change log |
| Contributions | 4 | contributions, contributors, contributions - pending, revShare totals |
| Directors/Leaders | 8 | directors, leaders, mentors + assignment tables |
| Pipeline | 2 | pipeline - prospects, pipeline - stages |
| Equity | 3 | equity - annual, equity - monthly, equity - transactions |
| Title | 6 | title - orders, disbursements, events, users |

### Aggregation Tables (48)
Pre-computed aggregations for dashboards and analytics.

| Domain | Tables | Examples |
|--------|--------|----------|
| Transactions | 7 | agg_transactions_by_month, by_agent, by_stage, by_type, by_geo, by_week, yoy |
| Revenue | 6 | agg_revenue_by_month, by_agent, by_week, ytd, waterfall, by_deduction_type |
| Listings | 5 | agg_listings_by_month, by_agent, by_stage, by_property_type, by_dom_bucket |
| Network | 7 | agg_network_by_month, by_tier, by_status, by_geo, by_week, revshare_by_month |
| Leads | 5 | agg_leads_by_month, by_agent, by_source, by_stage, conversion_funnel |
| FUB Activity | 7 | agg_fub_activity_by_month, by_agent, calls_by_direction/outcome, events_by_type/source |
| AI/NORA | 8 | agg_anomalies_detected, benchmarks, funnel_conversion, pacing_daily, risk_flags |
| Jobs | 3 | aggregation_jobs, leaderboard_jobs, agg_team_leaderboard |

### FUB - Follow Up Boss (16)
CRM integration tables for Follow Up Boss.

| Type | Tables |
|------|--------|
| Core | FUB - accounts, people, deals, stages, events, users, groups |
| Activity | FUB - calls, text messages, appointments |
| Jobs | FUB - sync jobs, onboarding jobs, aggregation_jobs |
| Staging | appointments staging, text messages staging |

### Integration Tables

| Integration | Tables | Notes |
|-------------|--------|-------|
| **Rezen** | 7 | sync jobs, onboarding jobs, webhooks, referral codes + staging |
| **SkySlope** | 3 | sync jobs, listing staging, transaction staging |
| **DotLoop** | 6 | accounts, contacts, loops, profiles, staging, sync_state |
| **Lofty** | 4 | accounts, leads, staging, sync_state |

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

| Type | Description | Example |
|------|-------------|---------|
| **direct** | 1:1 mapping, same name | user → user |
| **renamed** | 1:1 but different name | roster → team_members |
| **split** | V1 table → multiple V2 tables | transaction → transaction + financials + history |
| **merged** | Multiple V1 → single V2 | contributors merged into contribution |
| **deprecated** | V1 table has no V2 equivalent | fub_notes (merged into contact_log) |
| **new** | V2 table has no V1 source | agent_cap_data (new feature) |

### Key Split Mappings
| V1 Table | V2 Tables | Notes |
|----------|-----------|-------|
| user | user, user_credentials, user_settings, user_roles, user_subscriptions | Identity decomposed |
| agent | agent, agent_cap_data, agent_commission, agent_hierarchy, agent_performance | Profile normalized |
| transaction | transaction, transaction_financials, transaction_history, transaction_participants, transaction_tags | Fully normalized |
| listing | listing, listing_history, listing_photos | Media separated |
| network | network_hierarchy, network_member, network_user_prefs | Decomposed |

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
├── page.tsx              # Main comparison dashboard
├── layout.tsx            # Root layout
├── globals.css           # Tailwind styles
lib/
├── v1-data.ts            # V1 workspace data (251 tables)
├── v2-data.ts            # V2 workspace data (193 tables)
├── table-mappings.ts     # V1 → V2 table mappings
├── utils.ts              # Utility functions
types/
├── migration.ts          # Migration-specific types
├── xano.ts               # Xano data types
components/
├── ui/                   # ShadCN components
├── migration-overview.tsx
├── table-comparison.tsx
├── v2-only-tables.tsx
```

---

## Key Differences from Demo Sync

| Demo Sync Admin | V1→V2 Migration Admin |
|-----------------|------------------------|
| Same workspace | Different workspaces |
| live vs demo_data | V1 vs V2 schemas |
| Exact record match | Structural comparison |
| Sync action | No sync (read-only) |
| 33 synced tables | 251 vs 193 tables |

---

## Philosophy: Frontend Reveals Migration Gaps

**Traditional:** Migration docs say it's "mostly done"
**This Project:** See exactly which tables are migrated, which aren't, and what the record deltas are

The frontend makes migration status undeniable. Every table, every count, every gap - visible at a glance.

---

## Table Count Summary

| Category | V1 Count |
|----------|----------|
| Core | 48 |
| Aggregation | 48 |
| FUB | 16 |
| Rezen | 7 |
| SkySlope | 3 |
| DotLoop | 6 |
| Lofty | 4 |
| Stripe | 8 |
| Page Builder | 12 |
| Charts | 11 |
| AI/NORA | 10 |
| Lambda | 5 |
| Logs | 15 |
| Config | 22 |
| Staging | 16 |
| Other | 20+ |
| **TOTAL** | **251** |
