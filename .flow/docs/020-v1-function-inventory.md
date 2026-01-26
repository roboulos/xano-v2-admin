# V1 Function Inventory - Active Functions Baseline

> Generated: 2026-01-26
> Task: fn-2-riv.1 - Map V1 Active Functions

## Overview

This document inventories the active functions in the V1/V2 Xano workspace. Since V2 is a normalized refactor of V1 (same codebase, workspace 5), this inventory represents both what V1 had and what V2 now supports.

**Important:** V1 and V2 share the same workspace (ID: 5 on x2nu-xcjc-vhax.agentdashboards.xano.io). V2 is the normalized, refactored version built on top of V1's foundation.

## Function Count Summary

| Folder                   | Active Count | Purpose                                                   |
| ------------------------ | ------------ | --------------------------------------------------------- |
| Workers/                 | ~102         | Core business logic - API calls, transformations, upserts |
| Tasks/                   | ~82          | Orchestrators called by background tasks                  |
| Utils/                   | ~55+         | Utility functions, backfills, one-time operations         |
| Archive/                 | ~700+        | Deprecated/backup functions (not active)                  |
| **Total Active**         | **~240**     | Non-Archive functions                                     |
| **Total (with Archive)** | **~971**     | All functions in workspace                                |

## Folder Organization

```
V1/V2 Function Structure:
.
+-- Workers/        [102 functions - Active]
|   +-- FUB - *            # Follow Up Boss integrations
|   +-- reZEN - *          # reZEN brokerage API
|   +-- SkySlope - *       # SkySlope transaction mgmt
|   +-- Network - *        # Network/downline processing
|   +-- Income - *         # Income/contribution calcs
|   +-- Title - *          # Qualia title integration
|   +-- Link *             # FK linking workers
|   +-- Metrics - *        # Metrics calculations
|
+-- Tasks/          [82 functions - Active]
|   +-- FUB - *            # FUB orchestrators
|   +-- reZEN - *          # reZEN orchestrators
|   +-- SkySlope - *       # SkySlope orchestrators
|   +-- Aggregation - *    # Aggregation jobs
|   +-- Title - *          # Title orchestrators
|   +-- AD - *             # Internal tasks
|
+-- Utils/          [55+ functions - Active/One-time]
|   +-- Backfill *         # Data migration scripts
|   +-- Link *             # FK linking utilities
|   +-- Job Status - *     # Job tracking
|
+-- Archive/        [700+ functions - Deprecated]
    +-- Backup/*           # Backup copies
    +-- V1 Legacy/*        # Old V1 functions
```

## Active Functions by Domain

### 1. FUB - Follow Up Boss (35 functions)

**Workers/** (12 functions)
| ID | Function | Purpose | Tags |
|----|----------|---------|------|
| 10990 | Workers/Sync Pipeline Prospects from FUB Deals | Deals to prospects | V3, pipeline |
| 10972 | Workers/FUB - Get Account Users - Paginated | Paginated user fetch | V3, fp-result-type |
| 10953 | Workers/Link FUB Calls to Users | Link calls to users | linking, fp-result-type |
| 10952 | Workers/Link FUB Calls to People | Link calls to contacts | linking, fp-result-type |
| 10941 | Workers/FUB - Get Groups | Fetch FUB groups | V3 |
| 10033 | Workers/FUB - Sync Stages from Deals | Sync pipeline stages | V3 |
| 10031 | Workers/FUB - Move Deals to Transaction | Deals to transactions | V3 |
| 10022 | Workers/FUB - Get Deals | Main deals fetch | V3, orchestrator |
| 10021 | Workers/FUB - Get Deals - Upsert | Upsert deal records | V3 |
| 10020 | Workers/FUB - Get Deals - Transform | Transform deal data | V3 |
| 9167 | Workers/FUB - Get Text Messages V3 | Fetch SMS | V3, working |
| 8295 | Workers/FUB - Lambda Coordinator Validate Input | Validate lambda input | V3, validation |

**Tasks/** (23 functions)

- Daily Updates: Appointments, Calls, Deals, Events, People, Text Messages
- Onboarding: Appointments, Calls Workers 1-4, Events, Jobs, People
- Fix Operations: Missing usernames, missing data
- Utilities: Import users, webhook check

### 2. reZEN - Brokerage API (61 functions)

**Workers/** (17 functions)
| ID | Function | Purpose | Tags |
|----|----------|---------|------|
| 11094 | Workers/reZEN - Listing Details By Object | Transform listing data | fp-pattern, V3 |
| 10991 | Workers/reZEN - Process Pending Contributions to Table | Move pending to table | V3 |
| 10983 | Workers/reZEN - Get Agent Commission | Fetch commission config | V3 |
| 10982 | Workers/reZEN - Get Cap Data for All Agents | Fetch all cap data | V3, fp-result-type |
| 10981 | Workers/reZEN - Populate RevShare Payments | Create payment records | V3, fp-result-type |
| 10962 | Workers/reZEN - Get Agent Sponsor Tree v2 | Build sponsor hierarchy | V3 |
| 10938 | Workers/reZEN - Get Equity Performance | Fetch equity data | V3 |
| 10038 | Workers/reZEN - Move Transactions from Staging | Staging to core | V3 |
| 10034 | Workers/reZEN - Validate Credentials | Verify API credentials | V3 |
| 10019 | Workers/reZEN - Create Contribution Object | Build contribution record | V3 |
| 8301 | Workers/reZEN - Transaction Details By Object | Transform transaction | fp-pattern, V3 |
| 8299 | Workers/reZEN - Create Onboarding Job | Initialize onboarding | V3 |
| 8298 | Workers/reZEN - Onboarding Load Listings | Load listing batch | V3 |
| 8297 | Workers/reZEN - Onboarding Orchestrator | Main onboarding flow | V3, orchestrator |
| 8296 | Workers/reZEN - Onboarding Load Transactions | Load transaction batch | V3 |
| 8278 | Workers/reZEN - Outgoing Payments By Agent | Payments per agent | V3, fp-refactored |
| 8277 | Workers/reZEN - Outgoing Payments By Tier | Payments per tier | V3, fp-result-type |

**Tasks/** (44 functions)

- Network: Downline Sync, Frontline (Brad/Tim), Missing Cap/Frontline Data
- Onboarding: 20+ process steps (Load, Process, Stage for transactions/listings/contributions/network)
- Contributions: Daily/Full updates, Pending processing
- Webhooks: Process, Register, Check

### 3. Network Domain (6 functions)

| ID    | Function                                  | Purpose                        |
| ----- | ----------------------------------------- | ------------------------------ |
| 11110 | Workers/backfill_team_from_network_member | Team backfill                  |
| 11109 | Workers/find_team_from_sponsor_chain      | Find team via sponsors         |
| 11108 | Workers/find_team_for_agent               | Resolve agent team             |
| 10968 | Workers/Network - Pull Temp Data Fixed    | Pull temp network data         |
| 10967 | Workers/Network - Get Downline Fixed      | Fetch downline                 |
| 8285  | Workers/Network - Downline Sync           | Sync downline (V3, fp-pattern) |

### 4. Income/Financial (3 functions)

| ID    | Function                                | Purpose                | Tags               |
| ----- | --------------------------------------- | ---------------------- | ------------------ |
| 10055 | Workers/Income - Aggregate All Agents   | Orchestrate income agg | V3, orchestrator   |
| 10054 | Workers/Income - Calculate Agent Totals | Per-agent totals       | V3, fp-result-type |
| 10051 | Workers/Income - Aggregate All Sources  | All income sources     | V3, fp-result-type |

### 5. SkySlope (5 functions)

**Workers/** (2 functions)

- Workers/SkySlope - Move Listings from Staging (V3, active)
- Workers/SkySlope - Main Worker (deprecated)

**Tasks/** (3 functions)

- Account Users Sync Worker
- Listings Sync Worker
- Transactions Sync Worker

### 6. Title/Qualia (6 functions)

**Workers/** (4 functions)
| ID | Function | Purpose |
|----|----------|---------|
| 10993 | Workers/Title - Get Settlement Agencies | Fetch agencies |
| 10988 | Workers/Title - Upsert Orders | Upsert title orders |
| 10987 | Workers/Title - Populate Closing Disclosures | CD population |
| 10985 | Workers/Title - Transform Orders | Transform order data |

**Tasks/** (2 functions)

- Get Todays Qualia Orders
- Title - Orders

### 7. Aggregation (5 functions)

**Tasks/** (3 functions)

- Daily Scheduler
- Leaderboard Worker
- Monthly Worker

**Workers/** (2 functions)

- Chart Transactions - Aggregate
- Metrics - Get Transaction Counts

### 8. Linking Domain (4 functions)

| ID    | Function                                        | Purpose                 |
| ----- | ----------------------------------------------- | ----------------------- |
| 10955 | Workers/Run All Linking Functions               | Orchestrate all linking |
| 10954 | Workers/Link Equity Transactions to Transaction | Equity to transaction   |
| 10953 | Workers/Link FUB Calls to Users                 | FUB calls to users      |
| 10952 | Workers/Link FUB Calls to People                | FUB calls to people     |

### 9. Utility/Infrastructure (~15 functions)

**Workers/**

- analyze_bug_report (AI bug analysis, Claude)
- create_github_issue
- Contributions - Duplicates
- Generate Audit Record
- Utility - Batch Process Contributions

**Tasks/**

- AD - Email Network News Daily/Weekly
- Reporting - Process Errors Slack

## Recently Updated Functions (Last 30 Days)

Based on function metadata, these functions were updated between 2025-12-18 and 2026-01-16:

| Date          | Function                                  | Change                         |
| ------------- | ----------------------------------------- | ------------------------------ |
| 2026-01-16    | Workers/Test-Roster-Minimal               | New test function              |
| 2026-01-16    | Workers/Contributions - Duplicates        | Updated                        |
| 2026-01-16    | Workers/Generate Audit Record             | Updated                        |
| 2026-01-16    | Tasks/Aggregation - Leaderboard Worker    | Updated                        |
| 2026-01-12    | Workers/analyze_bug_report                | AI analysis worker             |
| 2026-01-12    | Workers/create_github_issue               | GitHub integration             |
| 2025-12-30    | Workers/backfill_team_from_network_member | Team backfill                  |
| 2025-12-28    | Multiple FP pattern refactors             | fp-result-type standardization |
| 2025-12-27    | 20+ linking functions                     | FP refactoring                 |
| 2025-12-19-25 | 50+ functions                             | Initial V3 implementation      |

## Tag Conventions

| Tag            | Meaning                             | Count |
| -------------- | ----------------------------------- | ----- |
| v3 / V3        | V3 architecture pattern             | ~80   |
| fp-result-type | Returns FP Result type              | ~45   |
| fp-pattern     | Uses functional programming pattern | ~30   |
| worker         | Worker function                     | ~60   |
| orchestrator   | Coordinates multiple workers        | ~15   |
| linking        | FK linking function                 | ~10   |
| backfill       | One-time data backfill              | ~25   |

## Archive Folder (Deprecated)

The Archive/ folder contains ~700+ functions including:

- **Backup/** - Backup copies before refactoring (e.g., `Archive/Backup/SkySlope - Get Listings_0`)
- **V1 Legacy/** - Old V1 implementations replaced by V3
- Deprecated functions kept for reference

**Do NOT use Archive/ functions** - they are preserved for rollback reference only.

## V1 vs V2 Function Comparison

| Aspect           | V1 (Original)  | V2 (Refactored)                           |
| ---------------- | -------------- | ----------------------------------------- |
| Total Functions  | ~1000+         | ~971                                      |
| Active Functions | ~300           | ~240                                      |
| Architecture     | Mixed patterns | FP Result type (V3)                       |
| Error Handling   | Inconsistent   | Standardized {success, data, error, step} |
| Naming           | Various        | Domain/Action pattern                     |
| Testing          | Manual         | Structured (MCP endpoints)                |

## Key Observations

1. **V3 Architecture Migration**: Most Workers/ functions have been refactored to use the FP Result type pattern (`fp-result-type` tag)

2. **Domain Organization**: Functions are well-organized by integration domain (FUB, reZEN, SkySlope, Title)

3. **Orchestration Pattern**: Tasks/ functions orchestrate Workers/, with background tasks calling Tasks/

4. **Archive Preservation**: Old V1 functions are preserved in Archive/ for reference

5. **Active Development**: Recent updates (Jan 2026) focus on linking functions and FP pattern adoption

## References

- Source: `lib/workers-inventory.ts` - Workers function list
- Source: `lib/tasks-inventory.ts` - Tasks function list
- Related: `006-worker-functions-by-domain.md` - Detailed domain breakdown
- Epic: fn-2-riv - V2 System Verification & Gap Remediation
