# CLAUDE.md - V1 to V2 Migration Admin Interface

## Purpose

This is a **"Frontend Reveals Backend"** admin interface that compares the V1 Xano workspace (denormalized, production) against the V2 workspace (normalized, refactored). The frontend serves as a diagnostic tool - migration gaps become immediately visible.

## The Core Comparison

```
┌─────────────────────────────────────────────────────────────────────────┐
│  V1 Workspace (Workspace 1)     vs    V2 Workspace (Workspace 5)        │
│  ─────────────────────────────       ──────────────────────────────     │
│  33 tables (denormalized)            193 tables (normalized)            │
│  xmpx-swi5-tlvy.n7c.xano.io         x2nu-xcjc-vhax.xano.io             │
│  Production data                     Refactored schema                  │
└─────────────────────────────────────────────────────────────────────────┘
```

### What This Reveals

1. **Table Mapping**: Which V1 tables map to which V2 tables?
2. **Record Counts**: Do the records match after migration?
3. **Missing Data**: What V1 data hasn't been migrated yet?
4. **New Tables**: What new V2 tables don't exist in V1?
5. **Schema Evolution**: How did denormalized → normalized happen?

---

## Xano Workspaces

### V1 Workspace (Production - Denormalized)
- **Instance:** `xmpx-swi5-tlvy.n7c.xano.io`
- **Workspace ID:** 1
- **Tables:** 33 core tables
- **Status:** Production, live data

### V2 Workspace (Refactored - Normalized)
- **Instance:** `x2nu-xcjc-vhax.agentdashboards.xano.io`
- **Workspace ID:** 5
- **Tables:** 193 tables (normalized)
- **Status:** Development, migration target

---

## V1 Tables (33 Tables)

### Core Tables (8)
| Table | Description |
|-------|-------------|
| user | Login accounts |
| agent | Agent profiles |
| team | Team entities |
| roster | Team membership (team_roster) |
| network | Downline/sponsorship |
| transaction | All transactions |
| listing | Property listings |
| participant | Transaction participants |

### Financial Tables (4)
| Table | Description |
|-------|-------------|
| contribution | Rev share contributions |
| income | Income records |
| revshare_totals | Aggregated rev share |
| contributors | Contributor records |

### Business Tables (8)
| Table | Description |
|-------|-------------|
| subscription | Stripe subscriptions |
| notifications | User notifications |
| pipeline_prospects | CRM prospects |
| pipeline_stages | Pipeline stages |
| leaders | Leader roles |
| directors | Director roles |
| team_owners | Team ownership |
| paid_participant | Paid participants |

### FUB Tables (9)
| Table | Description |
|-------|-------------|
| fub_accounts | FUB account connections |
| fub_appointments | FUB appointments |
| fub_deal_stages | FUB deal stages |
| fub_deals | FUB deals |
| fub_notes | FUB notes |
| fub_people | FUB contacts |
| fub_tasks | FUB tasks |
| fub_calls | FUB calls |
| fub_texts | FUB text messages |

### Other Tables (4)
| Table | Description |
|-------|-------------|
| links | User links |
| leads | Lead records |
| team_admins | Team admin roles |
| connections | User connections |

---

## V2 Table Categories (193 Tables)

| Category | Count | Examples |
|----------|-------|----------|
| Core Identity | 5 | user, agent, team, brokerage, office |
| Agent Data | 7 | agent_cap_data, agent_commission, agent_hierarchy... |
| Team Structure | 10 | team_members, director, leader, mentor... |
| Transactions | 8 | transaction, transaction_financials, participant... |
| Listings | 3 | listing, listing_history, listing_photos |
| Network/Rev Share | 8 | network_member, contribution, revshare_payment... |
| Financial | 6 | equity_annual, equity_monthly, income... |
| Follow Up Boss | 14 | fub_accounts, fub_people, fub_deals... |
| Rezen Integration | 7 | rezen_sync_state, rezen_sync_jobs... |
| SkySlope | 3 | skyslope_connection, skyslope_sync_state... |
| DotLoop | 6 | dotloop_accounts, dotloop_loops... |
| Lofty | 4 | lofty_accounts, lofty_leads... |
| Stripe/Billing | 8 | stripe_subscriptions, stripe_events... |
| Page Builder | 9 | pages, page_tabs, chart_catalog... |
| Staging/Import | 12 | stage_csv_import, stage_transactions_*... |
| Notifications | 4 | notification, notification_items... |
| Logs & Audit | 10 | audit_log, error logs, email_logs... |
| Configuration | 6 | credentials, permissions, job_status... |
| Other | ~70 | Various lookup/reference tables |

---

## Table Mapping: V1 → V2

### Direct Mappings (Same Name)
| V1 Table | V2 Table | Notes |
|----------|----------|-------|
| user | user | Core identity |
| agent | agent | Core profile |
| team | team | Normalized in V2 |
| transaction | transaction | Split into multiple tables in V2 |
| listing | listing | Normalized with history/photos |
| contribution | contribution | Same concept |
| income | income | Same concept |

### Split/Normalized Tables
| V1 Table | V2 Tables | Notes |
|----------|-----------|-------|
| transaction | transaction, transaction_financials, transaction_history, transaction_participants, transaction_tags | Fully normalized |
| listing | listing, listing_history, listing_photos | Media separated |
| network | network_hierarchy, network_member, network_user_prefs | Decomposed |
| roster | team_members | Renamed + normalized |

### New in V2 (No V1 Equivalent)
- agent_cap_data, agent_commission, agent_performance
- equity_annual, equity_monthly
- All DotLoop tables (new integration)
- All Lofty tables (new integration)
- Page Builder tables
- Lambda job tables

### Deprecated in V2
- revshare_totals (replaced by aggregations)
- contributors (merged into contribution)

---

## What This Interface Shows

### 1. Migration Overview Card
- Total tables: V1 (33) vs V2 (193)
- Mapped tables: X of 33
- Unmapped: Y tables need mapping
- New in V2: Z tables

### 2. Table Comparison View
Side-by-side comparison:
```
┌─────────────────────────────────────────────────────────────────┐
│ V1 Table    │ V1 Records │ V2 Table(s)       │ V2 Records │ Δ  │
├─────────────────────────────────────────────────────────────────┤
│ user        │ 339        │ user              │ 350        │ +11│
│ agent       │ 36,123     │ agent             │ 35,500     │-623│
│ transaction │ 50,000     │ transaction       │ 50,000     │  ✓ │
│             │            │ + financials      │ 48,500     │    │
│             │            │ + participants    │ 125,000    │    │
│ roster      │ 270        │ team_members      │ 270        │  ✓ │
│ network     │ 398        │ network_member    │ 450        │ +52│
└─────────────────────────────────────────────────────────────────┘
```

### 3. Migration Status Indicators
- ✅ Green: Records match (within threshold)
- ⚠️ Amber: Records differ (needs investigation)
- 🔴 Red: No mapping defined
- ❓ Gray: V2-only table (no V1 source)

### 4. New V2 Tables View
Tables that exist in V2 but have no V1 equivalent - new functionality.

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
├── v1-data.ts            # V1 workspace data (33 tables)
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
| 33 tables | 33 vs 193 tables |

---

## Philosophy: Frontend Reveals Migration Gaps

**Traditional:** Migration docs say it's "mostly done"
**This Project:** See exactly which tables are migrated, which aren't, and what the record deltas are

The frontend makes migration status undeniable. Every table, every count, every gap - visible at a glance.
