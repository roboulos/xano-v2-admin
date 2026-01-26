# V1 vs V2 Gap Analysis

> Generated: 2026-01-26
> Task: fn-2-riv.3 - V1 vs V2 Coverage Comparison
> Dependencies: fn-2-riv.1 (V1 Function Inventory), fn-2-riv.2 (V1 [v2] Tagged Features)

## Executive Summary

| Metric                 | V1   | V2   | Coverage          |
| ---------------------- | ---- | ---- | ----------------- |
| **Active Functions**   | ~240 | ~240 | ~100%             |
| **Tables**             | 251  | 193  | ~77% (normalized) |
| **[v2] Tagged Tables** | 12   | 2    | 17%               |
| **Domain Coverage**    | 9    | 9    | 100%              |

**Overall Status:** V2 has equivalent function coverage to V1 but is missing **10 client-requested [v2] tables** (weekly aggregations and FUB activity analytics).

---

## Coverage by Domain

### Function Coverage Summary

| Domain                   | V1 Active | V2 Active | Match %  | Gap Status        |
| ------------------------ | --------- | --------- | -------- | ----------------- |
| **FUB (Follow Up Boss)** | 35        | 35        | 100%     | Match             |
| **reZEN (Brokerage)**    | 61        | 61        | 100%     | Match             |
| **Network**              | 6         | 6         | 100%     | Match             |
| **Income/Financial**     | 3         | 3         | 100%     | Match             |
| **SkySlope**             | 5         | 5         | 100%     | Match             |
| **Title/Qualia**         | 6         | 6         | 100%     | Match             |
| **Aggregation**          | 5         | 5         | 100%     | Match             |
| **Linking**              | 4         | 4         | 100%     | Match             |
| **Utility**              | ~15       | ~15       | 100%     | Match             |
| **TOTAL**                | ~240      | ~240      | **100%** | **Full Coverage** |

**Note:** V1 and V2 share the same Xano workspace (ID: 5). V2 is a normalized refactor of V1, so function coverage is identical. The gap is in **tables** and **aggregation features**.

---

## Function Coverage by Type

| Type     | V1 Count | V2 Count | Match Rate       |
| -------- | -------- | -------- | ---------------- |
| Workers/ | 102      | 102      | 100%             |
| Tasks/   | 82       | 82       | 100%             |
| Utils/   | 55+      | 55+      | 100%             |
| Archive/ | 700+     | 700+     | N/A (deprecated) |

---

## Detailed Domain Mapping

### 1. FUB - Follow Up Boss (35 functions)

| Function Type                                   | V1    | V2    | Status |
| ----------------------------------------------- | ----- | ----- | ------ |
| Workers/FUB - Get Deals                         | 10022 | 10022 | Match  |
| Workers/FUB - Get Deals - Transform             | 10020 | 10020 | Match  |
| Workers/FUB - Get Deals - Upsert                | 10021 | 10021 | Match  |
| Workers/FUB - Move Deals to Transaction         | 10031 | 10031 | Match  |
| Workers/FUB - Get Text Messages V3              | 9167  | 9167  | Match  |
| Workers/FUB - Get Account Users - Paginated     | 10972 | 10972 | Match  |
| Workers/FUB - Get Groups                        | 10941 | 10941 | Match  |
| Workers/FUB - Sync Stages from Deals            | 10033 | 10033 | Match  |
| Workers/Link FUB Calls to Users                 | 10953 | 10953 | Match  |
| Workers/Link FUB Calls to People                | 10952 | 10952 | Match  |
| Workers/Sync Pipeline Prospects from FUB Deals  | 10990 | 10990 | Match  |
| Workers/FUB - Lambda Coordinator Validate Input | 8295  | 8295  | Match  |
| Tasks/FUB - Onboarding \* (8 functions)         | -     | -     | Match  |

### 2. reZEN - Brokerage API (61 functions)

| Function Type                                  | V1    | V2    | Status |
| ---------------------------------------------- | ----- | ----- | ------ |
| Workers/reZEN - Transaction Details By Object  | 8301  | 8301  | Match  |
| Workers/reZEN - Listing Details By Object      | 11094 | 11094 | Match  |
| Workers/reZEN - Get Agent Sponsor Tree v2      | 10962 | 10962 | Match  |
| Workers/reZEN - Get Cap Data for All Agents    | 10982 | 10982 | Match  |
| Workers/reZEN - Get Agent Commission           | 10983 | 10983 | Match  |
| Workers/reZEN - Populate RevShare Payments     | 10981 | 10981 | Match  |
| Workers/reZEN - Get Equity Performance         | 10938 | 10938 | Match  |
| Workers/reZEN - Move Transactions from Staging | 10038 | 10038 | Match  |
| Workers/reZEN - Validate Credentials           | 10034 | 10034 | Match  |
| Workers/reZEN - Onboarding Orchestrator        | 8297  | 8297  | Match  |
| Workers/reZEN - Outgoing Payments By Agent     | 8278  | 8278  | Match  |
| Workers/reZEN - Outgoing Payments By Tier      | 8277  | 8277  | Match  |
| Tasks/reZEN - \* (44 functions)                | -     | -     | Match  |

### 3. Network Domain (6 functions)

| Function                                  | V1 ID | V2 ID | Status |
| ----------------------------------------- | ----- | ----- | ------ |
| Workers/Network - Downline Sync           | 8285  | 8285  | Match  |
| Workers/Network - Get Downline Fixed      | 10967 | 10967 | Match  |
| Workers/Network - Pull Temp Data Fixed    | 10968 | 10968 | Match  |
| Workers/backfill_team_from_network_member | 11110 | 11110 | Match  |
| Workers/find_team_from_sponsor_chain      | 11109 | 11109 | Match  |
| Workers/find_team_for_agent               | 11108 | 11108 | Match  |

### 4. Income/Financial (3 functions)

| Function                                | V1 ID | V2 ID | Status |
| --------------------------------------- | ----- | ----- | ------ |
| Workers/Income - Aggregate All Agents   | 10055 | 10055 | Match  |
| Workers/Income - Calculate Agent Totals | 10054 | 10054 | Match  |
| Workers/Income - Aggregate All Sources  | 10051 | 10051 | Match  |

### 5. SkySlope (5 functions)

| Function                                      | V1 ID | V2 ID | Status |
| --------------------------------------------- | ----- | ----- | ------ |
| Workers/SkySlope - Move Listings from Staging | 10027 | 10027 | Match  |
| Tasks/SkySlope - Account Users Sync Worker    | -     | -     | Match  |
| Tasks/SkySlope - Listings Sync Worker         | -     | -     | Match  |
| Tasks/SkySlope - Transactions Sync Worker     | -     | -     | Match  |

### 6. Title/Qualia (6 functions)

| Function                                     | V1 ID | V2 ID | Status |
| -------------------------------------------- | ----- | ----- | ------ |
| Workers/Title - Get Settlement Agencies      | 10993 | 10993 | Match  |
| Workers/Title - Upsert Orders                | 10988 | 10988 | Match  |
| Workers/Title - Populate Closing Disclosures | 10987 | 10987 | Match  |
| Workers/Title - Transform Orders             | 10985 | 10985 | Match  |
| Tasks/Title - Get Todays Qualia Orders       | -     | -     | Match  |
| Tasks/Title - Orders                         | -     | -     | Match  |

### 7. Aggregation (5 functions)

| Function                                 | V1 ID | V2 ID | Status |
| ---------------------------------------- | ----- | ----- | ------ |
| Tasks/Aggregation - Daily Scheduler      | 11076 | 11076 | Match  |
| Tasks/Aggregation - Monthly Worker       | 11080 | 11080 | Match  |
| Tasks/Aggregation - Leaderboard Worker   | 11081 | 11081 | Match  |
| Workers/Chart Transactions - Aggregate   | 10989 | 10989 | Match  |
| Workers/Metrics - Get Transaction Counts | 8279  | 8279  | Match  |

### 8. Linking (4 functions)

| Function                                        | V1 ID | V2 ID | Status |
| ----------------------------------------------- | ----- | ----- | ------ |
| Workers/Run All Linking Functions               | 10955 | 10955 | Match  |
| Workers/Link Equity Transactions to Transaction | 10954 | 10954 | Match  |
| Workers/Link FUB Calls to Users                 | 10953 | 10953 | Match  |
| Workers/Link FUB Calls to People                | 10952 | 10952 | Match  |

---

## Table Gaps (Critical)

### V1 [v2] Tagged Tables Missing in V2

These are tables the client specifically requested post-V1 that do not exist in V2:

| Priority | V1 Table                  | V1 ID | V2 Status              | Impact                         |
| -------- | ------------------------- | ----- | ---------------------- | ------------------------------ |
| **P0**   | agg_fub_activity_by_agent | 1004  | Missing                | Agent productivity leaderboard |
| **P0**   | agg_transactions_by_week  | 972   | Missing                | Weekly performance tracking    |
| **P1**   | agg_fub_activity_by_month | 1003  | Missing                | Monthly FUB rollups            |
| **P1**   | agg_revenue_by_week       | 973   | Missing                | Weekly revenue views           |
| **P1**   | agg_network_by_week       | 974   | Missing                | Weekly network metrics         |
| **P1**   | agg_calls_by_direction    | 1008  | Missing                | Call analytics                 |
| **P1**   | agg_calls_by_outcome      | 1009  | Missing                | Call outcome tracking          |
| **P2**   | agg_events_by_type        | 1006  | Missing                | Event type breakdown           |
| **P2**   | agg_events_by_source      | 1007  | Missing                | Event source tracking          |
| **P2**   | agg_texts_by_direction    | 1010  | Missing                | SMS analytics                  |
| Partial  | aggregation_jobs          | 971   | job_status (693)       | Job queue                      |
| Partial  | fub_aggregation_jobs      | 1011  | fub_worker_queue (709) | FUB job queue                  |

**Summary:** 10 missing, 2 partial

---

## New V2 Features (Not in V1)

V2 introduced these new tables that V1 does not have:

| V2 Table        | V2 ID | Purpose                  | Tags                  |
| --------------- | ----- | ------------------------ | --------------------- |
| agent_rezen     | 930   | Rezen cap data per agent | v2, agent, rezen, cap |
| user_onboarding | 929   | User onboarding progress | v2, user, onboarding  |
| user_rezen      | 928   | User-level Rezen data    | v2, user, rezen       |

These represent V2 enhancements for better data normalization.

---

## Gap Analysis Summary

### Critical Gaps (P0) - Block Dashboard Features

1. **FUB Activity by Agent** (1004)
   - Used for: Agent productivity leaderboard
   - Impact: Cannot show agent-level FUB activity comparisons
   - Recommendation: Create `agg_fub_activity_by_agent` table + aggregation worker

2. **Transactions by Week** (972)
   - Used for: Weekly performance dashboards
   - Impact: Cannot show week-over-week trends
   - Recommendation: Create `agg_transactions_by_week` table + weekly aggregation

### High Priority Gaps (P1) - Required for Feature Parity

3-7. Weekly aggregations and FUB analytics tables needed for full V1 feature parity

### Medium Priority Gaps (P2) - Nice to Have

8-10. Event and SMS analytics - secondary features

---

## Coverage Percentage Calculation

### Functions

```
V1 Active Functions: ~240
V2 Active Functions: ~240
Function Coverage: 240/240 = 100%
```

### Tables

```
V1 Tables: 251
V2 Tables: 193 (normalized, less duplication)
Table Structural Coverage: 193/251 = 77%
(Note: V2 is intentionally normalized - fewer tables is better)
```

### [v2] Tagged Features

```
V1 [v2] Tables: 12
V2 Equivalent: 2 (partial)
[v2] Feature Coverage: 2/12 = 17%
```

---

## Remediation Plan

### Phase 1: Create Missing Weekly Aggregation Tables

| Task | Table                                  | Effort |
| ---- | -------------------------------------- | ------ |
| 1.1  | Create agg_transactions_by_week schema | S      |
| 1.2  | Create agg_revenue_by_week schema      | S      |
| 1.3  | Create agg_network_by_week schema      | S      |
| 1.4  | Create weekly aggregation worker       | M      |
| 1.5  | Add to Aggregation - Daily Scheduler   | S      |

### Phase 2: Create Missing FUB Analytics Tables

| Task | Table                                   | Effort |
| ---- | --------------------------------------- | ------ |
| 2.1  | Create agg_fub_activity_by_month schema | S      |
| 2.2  | Create agg_fub_activity_by_agent schema | S      |
| 2.3  | Create agg_calls_by_direction schema    | S      |
| 2.4  | Create agg_calls_by_outcome schema      | S      |
| 2.5  | Create agg_events_by_type schema        | S      |
| 2.6  | Create agg_events_by_source schema      | S      |
| 2.7  | Create agg_texts_by_direction schema    | S      |
| 2.8  | Create FUB aggregation worker           | M      |
| 2.9  | Add to daily aggregation schedule       | S      |

### Estimated Total Effort

- Phase 1: ~2-3 days
- Phase 2: ~3-4 days
- **Total: 5-7 days**

---

## Recommendations

### Immediate Actions

1. **Create P0 tables** - agg_fub_activity_by_agent and agg_transactions_by_week are blocking dashboard features

2. **Extend existing aggregation workers** - Add weekly grouping support to `Tasks/Aggregation - Daily Scheduler`

3. **Create FUB aggregation worker** - New worker to populate FUB analytics tables

### Architecture Decision

**Recommended approach:** Create equivalent tables in V2 rather than trying to extend existing ones. This maintains backward compatibility with V1 queries while supporting V2's normalized structure.

---

## References

- Source: `020-v1-function-inventory.md` - V1 function baseline
- Source: `v1-v2-tagged-features.md` - V1 [v2] tagged features
- Source: `006-worker-functions-by-domain.md` - V2 worker documentation
- Epic: fn-2-riv - V2 System Verification & Gap Remediation
