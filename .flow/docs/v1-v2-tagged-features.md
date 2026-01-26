# V1 [v2] Tagged Features - Gap Analysis

> Generated: 2026-01-26
> Task: fn-2-riv.2 - Identify V1 [v2] Tagged Features

## Overview

This document identifies all V1 workspace tables and functions tagged with `[v2]`. These are features the client specifically requested AFTER the initial V1 build and represent **HIGH PRIORITY** items for V2 migration.

## Summary

| Category  | V1 Count | V2 Equivalent | Missing |
| --------- | -------- | ------------- | ------- |
| Tables    | 12       | 2             | 10      |
| Functions | TBD      | TBD           | TBD     |

## V1 Tables with [v2] Tag (12 Tables)

### Pattern Analysis

The [v2] tagged tables fall into two clear patterns:

1. **Weekly Aggregations** - Breaking down metrics by week (vs existing monthly views)
2. **FUB Activity Analytics** - Detailed Follow Up Boss activity tracking

### Tables - Full List

| V1 Table                  | V1 ID | Tags                 | V2 Equivalent              | Status  |
| ------------------------- | ----- | -------------------- | -------------------------- | ------- |
| agg_transactions_by_week  | 972   | transaction, v2      | None                       | Missing |
| agg_revenue_by_week       | 973   | revenue, v2          | None                       | Missing |
| agg_network_by_week       | 974   | network, v2          | None                       | Missing |
| agg_fub_activity_by_month | 1003  | fub, v2              | None                       | Missing |
| agg_fub_activity_by_agent | 1004  | fub, leaderboard, v2 | None                       | Missing |
| agg_events_by_type        | 1006  | fub, v2              | None                       | Missing |
| agg_events_by_source      | 1007  | fub, v2              | None                       | Missing |
| agg_calls_by_direction    | 1008  | fub, v2              | None                       | Missing |
| agg_calls_by_outcome      | 1009  | fub, v2              | None                       | Missing |
| agg_texts_by_direction    | 1010  | fub, v2              | None                       | Missing |
| aggregation_jobs          | 971   | queue, v2            | job_status (partial)       | Partial |
| fub_aggregation_jobs      | 1011  | queue, v2            | fub_worker_queue (partial) | Partial |

### Status Legend

- **Missing** - No V2 equivalent exists, needs to be created
- **Partial** - V2 has a related table but not identical functionality

## Gap Analysis by Feature Group

### 1. Weekly Aggregations (3 Tables) - HIGH PRIORITY

V1 has weekly breakdowns that V2 lacks:

```
V1 Weekly Tables:
├── agg_transactions_by_week (972)
├── agg_revenue_by_week (973)
└── agg_network_by_week (974)

V2 Status:
├── agg_agent_monthly (983) - Only monthly granularity
└── agg_leaderboard (984) - No weekly view
```

**Gap:** V2 only has `agg_agent_monthly` and `agg_leaderboard`. The client specifically requested weekly granularity for transactions, revenue, and network metrics.

**Recommendation:** Create weekly aggregation tables in V2 or extend existing tables to support weekly grouping.

### 2. FUB Activity Analytics (7 Tables) - HIGH PRIORITY

V1 has comprehensive FUB activity tracking that V2 lacks:

```
V1 FUB Analytics Tables:
├── agg_fub_activity_by_month (1003)
├── agg_fub_activity_by_agent (1004) - leaderboard
├── agg_events_by_type (1006)
├── agg_events_by_source (1007)
├── agg_calls_by_direction (1008)
├── agg_calls_by_outcome (1009)
└── agg_texts_by_direction (1010)
```

**V2 Has:**

- `fub_accounts`, `fub_calls`, `fub_appointments`, etc. - Raw sync tables
- `fub_worker_queue` (709) - Worker job queue
- `fub_sync_state` (685) - Sync tracking

**Gap:** V2 has the raw FUB data but no aggregation layer. The client uses these aggregated views for:

- Agent productivity tracking (calls, texts, appointments)
- Activity leaderboards
- Source/type breakdowns for lead analytics

**Recommendation:** Create FUB aggregation workers in V2 that populate equivalent tables.

### 3. Aggregation Job Queues (2 Tables) - PARTIAL

```
V1 Queue Tables:
├── aggregation_jobs (971) - General aggregation queue
└── fub_aggregation_jobs (1011) - FUB-specific aggregation

V2 Queue Tables:
├── job_status (693) - Unified job status tracking
└── fub_worker_queue (709) - FUB worker queue
```

**Status:** V2 has job queue infrastructure but may need specific aggregation job types.

## V2 Tables with [v2] Tag (New Features)

These are NEW V2-only tables, not V1 ports:

| V2 Table        | V2 ID | Tags                  | Purpose                  |
| --------------- | ----- | --------------------- | ------------------------ |
| agent_rezen     | 930   | v2, agent, rezen, cap | Rezen cap data per agent |
| user_onboarding | 929   | v2, user, onboarding  | User onboarding progress |
| user_rezen      | 928   | v2, user, rezen       | User-level Rezen data    |

These represent V2 enhancements that don't exist in V1.

## V1 Functions with [v2] Tag

**Status:** Unable to query V1 workspace directly (MCP authorization expired).

The function search would require:

1. List all V1 functions
2. Filter for those with "v2" in tags
3. Map to V2 equivalents

**Workaround:** Based on table patterns, likely V1 [v2] functions include:

- `agg_transactions_weekly` - Worker for weekly transaction aggregation
- `agg_revenue_weekly` - Worker for weekly revenue aggregation
- `agg_network_weekly` - Worker for weekly network aggregation
- `agg_fub_activity_*` - Workers for FUB activity aggregation

These would be in the `Workers/` folder in V1.

## Priority Remediation List

### P0 - Critical (Block Dashboard Features)

1. **FUB Activity by Agent** (1004) - Used for agent productivity leaderboard
2. **Weekly Transaction Views** (972) - Used for weekly performance tracking

### P1 - High (Required for Feature Parity)

3. **FUB Activity by Month** (1003)
4. **Revenue by Week** (973)
5. **Network by Week** (974)
6. **Calls by Direction/Outcome** (1008, 1009)

### P2 - Medium (Nice to Have)

7. **Events by Type/Source** (1006, 1007)
8. **Texts by Direction** (1010)

## Implementation Notes

### Option 1: Create Equivalent Tables

Create V2 tables that mirror V1 structure:

- `v2_agg_transactions_by_week`
- `v2_agg_fub_activity_by_agent`
- etc.

### Option 2: Extend Existing Aggregation

Extend `agg_agent_monthly` to include:

- Weekly grouping option
- FUB activity columns

### Option 3: View-Based Approach

Create V2 functions that compute weekly/FUB views on-demand from raw data.

## References

- Source: `lib/v1-data.ts` - V1 table inventory with tags
- Source: `lib/v2-data.ts` - V2 table inventory
- Epic: fn-2-riv - V2 System Verification & Gap Remediation
- Task: fn-2-riv.2 - Identify V1 [v2] Tagged Features
