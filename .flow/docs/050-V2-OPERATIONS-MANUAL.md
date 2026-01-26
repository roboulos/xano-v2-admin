# V2 Operations Manual

> **Version**: 1.0
> **Generated**: 2026-01-26
> **Epic**: fn-3-lv0 - V2 System Logic Verification

---

## Executive Summary

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  V2 WORKSPACE OVERVIEW                                                       ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  Instance: x2nu-xcjc-vhax.agentdashboards.xano.io                           ║
║  Workspace ID: 5                                                             ║
║                                                                              ║
║  ┌────────────────────────────────────────────────────────────────────────┐ ║
║  │  COMPONENTS                                                             │ ║
║  ├────────────────────────────────────────────────────────────────────────┤ ║
║  │  Tables:           194                                                  │ ║
║  │  Functions:        971                                                  │ ║
║  │  Background Tasks: 100                                                  │ ║
║  │  API Groups:       27                                                   │ ║
║  └────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
║  ┌────────────────────────────────────────────────────────────────────────┐ ║
║  │  INTEGRATIONS                                                           │ ║
║  ├────────────────────────────────────────────────────────────────────────┤ ║
║  │  ✓ Follow Up Boss (FUB)  - CRM contacts, calls, events                 │ ║
║  │  ✓ reZEN                 - Transactions, listings, network             │ ║
║  │  ✓ SkySlope              - Transaction/listing staging                 │ ║
║  │  ○ DotLoop               - Configured but inactive                     │ ║
║  │  ○ Lofty                 - Configured but inactive                     │ ║
║  └────────────────────────────────────────────────────────────────────────┘ ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Pipeline Flow](#data-pipeline-flow)
3. [API Groups & Endpoints](#api-groups--endpoints)
4. [Background Tasks](#background-tasks)
5. [Onboarding Flow](#onboarding-flow)
6. [Daily Sync Cycles](#daily-sync-cycles)
7. [Health Monitoring](#health-monitoring)
8. [Alerting System](#alerting-system)
9. [Common Operations](#common-operations)
10. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Function Organization

```
V2 Function Structure:
├── Tasks/           ~82 functions   - Orchestrators (call Workers/)
├── Workers/         ~102 functions  - Business logic (data operations)
├── Utils/           ~55 functions   - Shared utilities
└── Archive/         ~700+ functions - Deprecated (not active)

Function Naming Convention:
├── Tasks/{Domain} - {Action}          e.g., "Tasks/reZEN - Onboarding Start Job"
├── Workers/{Domain} - {Action}        e.g., "Workers/FUB - Sync People"
└── Utils/{Category}                   e.g., "Utils/Date Formatters"
```

### FP (Functional Programming) Pattern

**ALL functions return consistent structure:**

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "step": "Workers/Function Name"
}
```

**Error format:**

```json
{
  "success": false,
  "data": null,
  "error": "Error message describing what went wrong",
  "step": "Workers/Function Name"
}
```

### MCP Test Endpoint Groups

| Group     | Canonical ID | Base URL                                                      | Purpose               |
| --------- | ------------ | ------------------------------------------------------------- | --------------------- |
| TASKS     | 4psV7fp6     | `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4psV7fp6` | Task orchestrators    |
| WORKERS   | 4UsTtl3m     | `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m` | Data operations       |
| SYSTEM    | LIdBL1AN     | `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN` | System operations     |
| SEEDING   | 2kCRUYxG     | `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:2kCRUYxG` | Data seeding          |
| MIGRATION | Lrekz_3S     | `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:Lrekz_3S` | V1/V2 migration tools |

---

## Data Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         V2 DATA PIPELINE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  External APIs                                                               │
│       │                                                                      │
│       ▼                                                                      │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐       │
│  │  Workers/       │────▶│  stage_*        │────▶│  Tasks/         │       │
│  │  (Data Fetch)   │     │  (Staging)      │     │  (Processing)   │       │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘       │
│                                │                        │                    │
│                                │                        ▼                    │
│                                │                 ┌─────────────────┐        │
│                                │                 │  Final Tables   │        │
│                                │                 │  (listing,      │        │
│                                │                 │   transaction,  │        │
│                                │                 │   fub_people)   │        │
│                                │                 └─────────────────┘        │
│                                │                                             │
│                          Scheduler                                           │
│                       (every 60 sec)                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Staging Tables

| Staging Table                           | Final Table       | Processing Task |
| --------------------------------------- | ----------------- | --------------- |
| stage_listing_skyslope                  | listing           | Task 2440       |
| stage_transactions_skyslope             | transaction       | Task 2438       |
| stage_listings_rezen_onboarding         | listing           | Task 2475       |
| stage_transactions_rezen_onboarding     | transaction       | Task 2473/2474  |
| stage_contributions_rezen_onboarding    | contribution      | Task 2476/2477  |
| stage_network_downline_rezen_onboarding | network           | Task 2391       |
| stage_appointments_fub_onboarding       | fub_appointments  | Task 2425       |
| stage_text_messages_fub_onboarding      | fub_text_messages | Task 2441       |

**Key Insight:** Staging tables retain ALL historical records (even processed ones with `is_processed=true`). The staging→final gap is NOT a backlog - records are deduplicated and transformed.

---

## API Groups & Endpoints

### Frontend API v2 (Production)

**Canonical ID:** pe1wjL5I
**Base URL:** `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I`

This is the primary API for frontend applications.

### Key Endpoints by Domain

#### FUB Sync Endpoints

| Endpoint                      | Method | Parameters                                      | Purpose         |
| ----------------------------- | ------ | ----------------------------------------------- | --------------- |
| `/test-task-fub-daily-deals`  | POST   | `{"ad_user_id": 60, "endpoint_type": "deals"}`  | Sync FUB deals  |
| `/test-task-fub-daily-people` | POST   | `{"ad_user_id": 60, "endpoint_type": "people"}` | Sync FUB people |
| `/test-task-fub-daily-events` | POST   | `{"ad_user_id": 60, "endpoint_type": "events"}` | Sync FUB events |
| `/test-task-fub-daily-calls`  | POST   | `{"ad_user_id": 60, "endpoint_type": "calls"}`  | Sync FUB calls  |

**IMPORTANT:** FUB Lambda Coordinator expects `ad_user_id` (NOT `user_id`) and requires `endpoint_type`.

#### reZEN Sync Endpoints

| Endpoint                           | Method | Parameters        | Purpose               |
| ---------------------------------- | ------ | ----------------- | --------------------- |
| `/test-task-8066-team-roster`      | POST   | `{"user_id": 60}` | Sync team roster      |
| `/test-task-8051-agent-data`       | POST   | `{"user_id": 60}` | Sync agent data       |
| `/test-task-8052-txn-sync`         | POST   | `{"user_id": 60}` | Sync transactions     |
| `/test-task-8053-listings-sync`    | POST   | `{"user_id": 60}` | Sync listings         |
| `/test-task-8062-network-downline` | POST   | `{"user_id": 60}` | Sync network downline |

#### SkySlope Sync Endpoints

| Endpoint                            | Method | Parameters | Purpose             |
| ----------------------------------- | ------ | ---------- | ------------------- |
| `/test-skyslope-account-users-sync` | POST   | `{}`       | Sync SkySlope users |

**NOTE:** SkySlope endpoint was fixed (ID 17495) - now calls function 7966.

---

## Background Tasks

### Task Distribution by Domain

```
Background Tasks (100 total):
├── reZEN Onboarding     32 tasks   - Initial user setup
├── reZEN Daily Sync      8 tasks   - Daily data refresh
├── FUB Sync             12 tasks   - CRM data sync
├── SkySlope Sync         4 tasks   - Transaction/listing staging
├── Aggregation          15 tasks   - Analytics computation
├── Cleanup               8 tasks   - Data maintenance
└── Other                21 tasks   - Misc operations
```

### Critical Background Tasks

| Task ID | Name                                         | Frequency | Purpose                       |
| ------- | -------------------------------------------- | --------- | ----------------------------- |
| 2385    | reZEN - Onboarding - Start Onboarding Job V3 | 3 min     | Poll for new onboarding jobs  |
| 2473    | reZEN - Onboarding Stage Transactions Large  | 60 sec    | Process staged transactions   |
| 2474    | reZEN - Onboarding Stage Transactions Small  | 60 sec    | Process staged transactions   |
| 2475    | reZEN - Onboarding Stage Listings            | 60 sec    | Process staged listings       |
| 2437    | reZEN - Daily Sync - Contributions           | Daily     | Sync daily contributions      |
| 2440    | SkySlope - Process Listing Staging           | 60 sec    | Process SkySlope listings     |
| 2438    | SkySlope - Process Transaction Staging       | 60 sec    | Process SkySlope transactions |

### Schedule Format (in XanoScript)

Schedules are defined in XanoScript code, NOT via the API's `schedule` field (which returns empty).

```xanoscript
// Example: Every 60 seconds
schedule = { freq: 60, start: "2025-12-03 04:00:00" }

// Example: Daily at midnight UTC
schedule = { freq: 86400, start: "2025-12-03 00:00:00" }
```

---

## Onboarding Flow

### Job State Machine

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ONBOARDING JOB STATES                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [No Record] ──create──▶ [New] ──start──▶ [Started]                         │
│                                              │                               │
│                                   success    │    errors                     │
│                                              ▼                               │
│                           [Complete] ◀───────┼───────▶ [Partial]            │
│                                              │                               │
│                                         exception                            │
│                                              │                               │
│                                              ▼                               │
│                                          [Error]                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Onboarding Steps (9 Steps)

| Step | Function             | Tables Affected                            |
| ---- | -------------------- | ------------------------------------------ |
| 1    | Team Members         | team, team_roster, team_owners             |
| 2    | Load Transactions    | stage_transactions_rezen_onboarding        |
| 3    | Process Transactions | transaction, participant, paid_participant |
| 4    | Load Listings        | stage_listings_rezen_onboarding            |
| 5    | Process Listings     | listing                                    |
| 6    | Network Downline     | network, connections                       |
| 7    | Cap Data             | agent_cap_data                             |
| 8    | Contributions        | contribution, income                       |
| 9    | Sponsor Tree         | agent_hierarchy                            |

### Create Onboarding Job

```bash
# Step 1: Create job for user
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/trigger-rezen-create-onboarding-job" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 60
  }'

# Step 2: Wait for background task (3 min) or trigger manually
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4psV7fp6/onboarding-start-job" \
  -H "Content-Type: application/json"

# Step 3: Check status
curl -X GET "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN/onboarding-status?user_id=60"
```

---

## Daily Sync Cycles

### FUB Daily Sync

```bash
# Sync all FUB data types for user 60
for type in people deals events calls appointments; do
  curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4psV7fp6/test-task-fub-daily-$type" \
    -H "Content-Type: application/json" \
    -d "{\"ad_user_id\": 60, \"endpoint_type\": \"$type\"}"
done
```

### reZEN Daily Sync

```bash
# Daily sync endpoints
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4psV7fp6/test-task-8052-txn-sync" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 60}'

curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4psV7fp6/test-task-8053-listings-sync" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 60}'
```

---

## Health Monitoring

### Pipeline Health Check Endpoint

**Endpoint:** `GET /api:Lrekz_3S/pipeline-health-check`
**ID:** 18367

```bash
curl -s "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:Lrekz_3S/pipeline-health-check" | jq
```

**Response:**

```json
{
  "success": true,
  "checked_at": 1769463795779,
  "staging": {
    "skyslope_listings": 34,
    "skyslope_transactions": 24,
    "rezen_transactions": 102843,
    "rezen_listings": 44688
  },
  "final_tables": {
    "listing": 16784,
    "transaction": 51835,
    "fub_people": 226839
  },
  "sync_state": {
    "fub": [{ "entity_type": "people", "status": "ready", ... }],
    "rezen": [{ "entity_type": "transactions", "status": "ready", ... }],
    "skyslope": [{ "entity_type": "transactions", "status": "ready", ... }]
  }
}
```

### Comprehensive V1/V2 Comparison

```bash
curl -s "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:Lrekz_3S/comprehensive-v1-v2-comparison" | jq '.summary'
```

---

## Alerting System

### Pipeline Alerting Script

**Location:** `scripts/validation/pipeline-alerting.ts`

```bash
# Run alerting check
pnpm tsx scripts/validation/pipeline-alerting.ts

# Dry run (no Slack notifications)
pnpm tsx scripts/validation/pipeline-alerting.ts --dry-run

# Generate JSON report only
pnpm tsx scripts/validation/pipeline-alerting.ts --report
```

### Alert Thresholds

| Metric               | Warning | Critical |
| -------------------- | ------- | -------- |
| Staging Backlog      | > 1,000 | > 5,000  |
| Sync Age (hours)     | > 24h   | > 72h    |
| Onboarding Job Stuck | > 4h    | > 24h    |

### Slack Notifications

Alerts are sent via: `POST /api:XOwEm4wm/slack/notification`

---

## Common Operations

### Test User

| User         | ID  | Agent ID | Team ID | Notes             |
| ------------ | --- | -------- | ------- | ----------------- |
| David Keener | 60  | 37208    | 1       | PRIMARY test user |

### Quick Health Check

```bash
# 1. Check pipeline health
curl -s "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:Lrekz_3S/pipeline-health-check" | jq '.staging'

# 2. Check onboarding jobs
curl -s "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN/onboarding-status" | jq

# 3. Run daily sync validation
pnpm tsx scripts/validation/validate-daily-sync.ts
```

### Validate All Systems

```bash
# Run all validation scripts
npm run validate:all

# Individual validators
npm run validate:tables      # 193 V2 tables
npm run validate:functions   # 270 active functions
npm run validate:endpoints   # 801 API endpoints
npm run validate:references  # 156 foreign keys
```

---

## Troubleshooting

### Issue: "No ad_user_id provided"

**Cause:** FUB Lambda Coordinator expects `ad_user_id` parameter, not `user_id`.

**Fix:** Use correct parameter name:

```bash
# Wrong
curl -d '{"user_id": 60}'

# Correct
curl -d '{"ad_user_id": 60, "endpoint_type": "people"}'
```

### Issue: SkySlope returns null

**Cause:** Endpoint 17495 had empty stack (never wired to function).

**Status:** FIXED - Now calls function 7966 (Tasks/SkySlope - Account Users Sync Worker 1).

### Issue: Network Downline sync SKIPS

**Cause:** No pending onboarding jobs exist.

**Fix:** Create an onboarding job for the user first:

```bash
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/trigger-rezen-create-onboarding-job" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 60}'
```

### Issue: Background task schedules appear empty

**Cause:** The `list_tasks` API returns empty `schedule` field, but schedules ARE defined in XanoScript code.

**Status:** NOT A BUG - Schedules work correctly at runtime.

### Issue: Staging "backlog" appears large

**Cause:** Staging tables retain ALL historical records. The gap between staging counts and final table counts is expected (deduplication, validation filtering).

**Fix:** Check `is_processed=false` count, not total count:

```sql
SELECT COUNT(*) FROM stage_transactions_rezen_onboarding WHERE is_processed = false
-- Should be 0 if processing is working
```

---

## Reference Documents

| Document                                                   | Purpose                             |
| ---------------------------------------------------------- | ----------------------------------- |
| `.flow/docs/030-CORRECTED-v1-v2-gap-analysis.md`           | Accurate V1/V2 comparison data      |
| `.flow/docs/031-staging-table-processing-investigation.md` | Staging processing details          |
| `.flow/docs/040-onboarding-job-creation-flow.md`           | Full onboarding documentation       |
| `lib/mcp-endpoints.ts`                                     | All MCP endpoint configurations     |
| `lib/background-tasks-cache.json`                          | 100 background tasks with schedules |

---

## Version History

| Version | Date       | Changes                            |
| ------- | ---------- | ---------------------------------- |
| 1.0     | 2026-01-26 | Initial release from fn-3-lv0 epic |

---

_Generated as part of Epic fn-3-lv0: V2 System Logic Verification_
