# Background Tasks - V2 Backend

> Task 3.1: Map background task schedules and dependencies

## Background Task Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           BACKGROUND TASK SUMMARY                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  Total Tasks: 200+                                                                  │
│  Active V3: ~87 tasks (✅)                                                          │
│  Paused Legacy: ~113 tasks (⏸️)                                                     │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────┐    │
│  │  SCHEDULE FREQUENCY TIERS                                                  │    │
│  ├────────────────────────────────────────────────────────────────────────────┤    │
│  │  ⚡ Very Frequent  │ 180s (3 min)   │ Onboarding, webhooks             │    │
│  │  🔄 Frequent       │ 300s (5 min)   │ Webhook processing               │    │
│  │  📊 Standard       │ 900s (15 min)  │ Daily updates (FUB calls, etc.)  │    │
│  │  📅 Daily          │ 86400s (24 hr) │ Aggregations, reports            │    │
│  │  📆 Weekly         │ 604800s        │ Weekly emails                    │    │
│  └────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Task Categories

### 1. Aggregation Tasks (3 Active)

| ID   | Name                             | Frequency      | Function                               |
| ---- | -------------------------------- | -------------- | -------------------------------------- |
| 3132 | Aggregation - Daily Scheduler    | Daily (86400s) | Tasks/Aggregation - Daily Scheduler    |
| 3133 | Aggregation - Monthly Worker     | Daily (86400s) | Tasks/Aggregation - Monthly Worker     |
| 3134 | Aggregation - Leaderboard Worker | Daily (86400s) | Tasks/Aggregation - Leaderboard Worker |

### 2. reZEN Onboarding Tasks (18+ Active)

| ID        | Name                                                    | Frequency    | Purpose                      |
| --------- | ------------------------------------------------------- | ------------ | ---------------------------- |
| 2385      | reZEN - Onboarding - Start Onboarding Job V3            | 3 min (180s) | Poll for new onboarding jobs |
| 2386      | reZEN - Onboarding - Load Transactions V3               | On-demand    | Load transactions from API   |
| 2387      | reZEN - Onboarding - Load Listings V3                   | On-demand    | Load listings from API       |
| 2388      | reZEN - Onboarding - Load Network Downline V3           | On-demand    | Load network downline        |
| 2389      | reZEN - Onboarding - Process Transactions V3            | On-demand    | Process staged transactions  |
| 2390      | reZEN - Onboarding - Process Listings V3                | On-demand    | Process staged listings      |
| 2391      | reZEN - Onboarding - Process Network Downline V3        | On-demand    | Process network hierarchy    |
| 2392      | reZEN - Onboarding - Process Network Frontline V3       | On-demand    | Process frontline data       |
| 2393      | reZEN - Onboarding - Process Cap Data V3                | On-demand    | Process cap/limit data       |
| 2394      | reZEN - Onboarding - Process Equity V3                  | On-demand    | Process equity data          |
| 2395      | reZEN - Onboarding - Process Agent Sponsor Tree V3      | On-demand    | Build sponsor hierarchy      |
| 2396      | reZEN - Onboarding - Process Contributions V3           | On-demand    | Process contributions        |
| 2397      | reZEN - Onboarding - Process Contributors V3            | On-demand    | Process contributor records  |
| 2398      | reZEN - Onboarding - Process Pending RevShare Totals V3 | On-demand    | Calculate rev share          |
| 2445      | reZEN - Onboarding - Completion V3                      | On-demand    | Finalize onboarding          |
| 2448      | reZEN - Onboarding - Load Contributions V3              | On-demand    | Load contribution data       |
| 2473-2477 | reZEN - Onboarding - Process Stage\* V3                 | On-demand    | Process staging tables       |

### 3. reZEN Sync Tasks (15+ Active)

| ID        | Name                                                 | Frequency    | Purpose                    |
| --------- | ---------------------------------------------------- | ------------ | -------------------------- |
| 2405      | reZEN - process webhooks and delete V3               | 5 min (300s) | Process webhook queue      |
| 2401      | reZEN - Monitor Sync Locks and Recover V3            | 15 min       | Monitor for stuck syncs    |
| 2408      | rezen - Network Name Sync V3                         | 15 min       | Sync network names         |
| 2413      | reZEN - RevShare Totals V3                           | 15 min       | Update rev share totals    |
| 2415      | reZEN - Team Roster - Caps and Splits V3             | 15 min       | Update team caps           |
| 2419      | reZEN - Paid Participant - Incomplete Mapping V3     | 15 min       | Fix incomplete mappings    |
| 2420      | reZEN - Network - Missing Cap Data V3                | 15 min       | Backfill missing caps      |
| 2421      | reZEN - Network - Missing Frontline Data V3          | 15 min       | Backfill frontline         |
| 2435      | reZEN - Contributions - Full Update V3               | Daily        | Full contribution sync     |
| 2437      | rezen - Contributions - daily update - processing V3 | Daily        | Daily contribution delta   |
| 2439      | reZEN - daily - Load Pending Contributions V3        | Daily        | Load pending contributions |
| 2442      | reZEN - Process Pending Contributions V3             | 15 min       | Process pending queue      |
| 2466-2478 | reZEN - Network/Transaction Sync Workers V3          | Various      | Network/txn sync           |

### 4. FUB Onboarding Tasks (10+ Active)

| ID        | Name                                            | Frequency | Purpose                |
| --------- | ----------------------------------------------- | --------- | ---------------------- |
| 2455      | FUB - Onboarding Jobs V3                        | 3 min     | Poll for new FUB jobs  |
| 2422      | FUB - Onboarding - People - Worker 1 V3         | On-demand | Import contacts        |
| 2423      | FUB - Onboarding - Calls - Worker 1 V3          | On-demand | Import calls (batch 1) |
| 2424      | FUB - Onboarding - Events - Worker 1 V3         | On-demand | Import events          |
| 2425      | FUB - Onboarding - Appointments Worker V3       | On-demand | Import appointments    |
| 2426      | FUB - Onboarding - Text Messages from People V3 | On-demand | Import SMS             |
| 2427      | FUB - Onboarding - Deals from People V3         | On-demand | Import deals           |
| 2461-2464 | FUB - Onboarding - Calls - Worker 2-4 V3        | On-demand | Import calls (batches) |

### 5. FUB Daily Update Tasks (8 Active)

| ID        | Name                                     | Frequency     | Purpose                 |
| --------- | ---------------------------------------- | ------------- | ----------------------- |
| 2406      | FUB - Daily Update - Calls V2 V3         | 15 min (900s) | Delta sync calls        |
| 2409      | FUB - Daily Update - Appointments V2 V3  | 15 min        | Delta sync appointments |
| 2411      | FUB - Daily Update - Text Messages V2 V3 | 15 min        | Delta sync SMS          |
| 2414      | FUB - Daily Update - Deals V2 V3         | 15 min        | Delta sync deals        |
| 2416      | FUB - Daily Update - Events V2 V3        | 15 min        | Delta sync events       |
| 2418      | FUB - Daily Update - People V2 V3        | 15 min        | Delta sync contacts     |
| 2428      | FUB - Refresh Tokens V3                  | 15 min        | Refresh OAuth tokens    |
| 2429-2430 | FUB - Get Users/Stages V3                | 15 min        | Sync users/stages       |

### 6. SkySlope Tasks (6 Active)

| ID   | Name                                         | Frequency | Purpose            |
| ---- | -------------------------------------------- | --------- | ------------------ |
| 2436 | SkySlope - Transactions Sync - Worker 1 V3   | 15 min    | Sync transactions  |
| 2438 | SkySlope - Move Transactions from Staging V3 | 15 min    | Staging → core     |
| 2440 | SkySlope - Move Listings from Staging V3     | 15 min    | Staging → core     |
| 2443 | Skyslope - Listings Sync - Worker 1 V3       | 15 min    | Sync listings      |
| 2446 | SkySlope - Account Users Sync - Worker 1 V3  | 15 min    | Sync account users |

### 7. Title (Qualia) Tasks (2 Active)

| ID   | Name                                 | Frequency | Purpose            |
| ---- | ------------------------------------ | --------- | ------------------ |
| 2450 | Title - Orders V3                    | Daily     | Sync title orders  |
| 2452 | Title - Get Today's Qualia Orders V3 | Daily     | Daily order import |

### 8. AD (AgentDashboards) Tasks (8+ Active)

| ID   | Name                                     | Frequency | Purpose             |
| ---- | ---------------------------------------- | --------- | ------------------- |
| 3121 | AD - Run All Linking Functions           | Daily     | Run FK linking      |
| 3123 | Daily Commission Sync                    | Daily     | Sync commissions    |
| 2399 | AD - Email - Network News - Daily v2 V3  | Daily     | Daily email digest  |
| 2400 | AD - Email - Network News - Weekly v2 V3 | Weekly    | Weekly email digest |
| 2402 | AD - Missing Agent IDs Participants V3   | 15 min    | Backfill agent IDs  |
| 2404 | AD - Missing Team Roster Avatars V3      | 15 min    | Backfill avatars    |
| 2407 | AD - upload network images V3            | Daily     | Upload images       |
| 2453 | AD - upload team roster images V3        | Daily     | Upload team images  |

### 9. Reporting/Metrics Tasks (2 Active)

| ID   | Name                                            | Frequency | Purpose               |
| ---- | ----------------------------------------------- | --------- | --------------------- |
| 2433 | Metrics - Create Snapshot V3                    | Daily     | Create daily snapshot |
| 2434 | Reporting - Process Errors and Send to Slack V3 | 15 min    | Error alerting        |

---

## Schedule Frequency Reference

| Frequency | Seconds | Use Case                                        |
| --------- | ------- | ----------------------------------------------- |
| 3 min     | 180     | Onboarding job polling, high-priority webhooks  |
| 5 min     | 300     | Webhook processing                              |
| 15 min    | 900     | Standard delta syncs (FUB, SkySlope, backfills) |
| 1 hour    | 3600    | Hourly aggregations                             |
| Daily     | 86400   | Full syncs, aggregations, reports               |
| Weekly    | 604800  | Weekly emails                                   |

---

## Onboarding Flow (reZEN)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           reZEN ONBOARDING FLOW                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  1. TRIGGER: User starts onboarding                                                 │
│     └── Creates record in rezen_onboarding_jobs                                     │
│                                                                                      │
│  2. POLL: "reZEN - Onboarding - Start Onboarding Job V3" (every 3 min)             │
│     └── Finds jobs with status "Pending"                                            │
│     └── Calls Workers/reZEN - Onboarding Orchestrator                               │
│                                                                                      │
│  3. ORCHESTRATOR: Calls workers in sequence:                                        │
│     ┌─────────────────────────────────────────────────────────────────────────┐    │
│     │  a) Load Transactions → Stage → Process                                 │    │
│     │  b) Load Listings → Stage → Process                                     │    │
│     │  c) Load Network Downline → Process                                     │    │
│     │  d) Process Sponsor Tree                                                │    │
│     │  e) Load Contributions → Process                                        │    │
│     │  f) Process Cap Data                                                    │    │
│     │  g) Process Equity                                                      │    │
│     │  h) Process RevShare Payments                                           │    │
│     │  i) Completion                                                          │    │
│     └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  4. COMPLETION: Mark job as Complete/Partial                                        │
│     └── Send notification to user                                                   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Daily Sync Flow (FUB)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           FUB DAILY SYNC FLOW                                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  Every 15 minutes, these tasks run in parallel:                                     │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  FUB - Daily Update - People V2 V3                                          │   │
│  │  ├── Query for records updated since last_sync_at                           │   │
│  │  ├── Fetch from FUB API                                                     │   │
│  │  ├── Upsert to fub_people table                                             │   │
│  │  └── Update sync_state cursor                                               │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  FUB - Daily Update - Calls V2 V3                                           │   │
│  │  ├── Query for calls since last_sync_at                                     │   │
│  │  ├── Fetch from FUB API                                                     │   │
│  │  ├── Upsert to fub_calls table                                              │   │
│  │  └── Update sync_state cursor                                               │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  + Deals, Events, Appointments, Text Messages (same pattern)                        │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Task Status Reference

| Status    | Meaning                                 |
| --------- | --------------------------------------- |
| ✅ Active | Task is enabled and running on schedule |
| ⏸️ Paused | Task is disabled (legacy or deprecated) |

---

## V3 vs Legacy Tasks

| Pattern     | V3 Tasks       | Legacy Tasks |
| ----------- | -------------- | ------------ |
| Naming      | Ends with "V3" | No suffix    |
| Functions   | Tasks/ folder  | Various      |
| Result type | FP Result      | Various      |
| Status      | Active (✅)    | Paused (⏸️)  |

---

## Task Dependencies

### Onboarding Chain

```
Start Job → Load Transactions → Stage Transactions → Process Transactions
                              → Load Listings → Stage Listings → Process Listings
                              → Load Network → Process Network
                              → Sponsor Tree → Contributions → Cap Data
                              → Equity → RevShare → Completion
```

### Daily Sync Chain

```
Refresh Tokens → Get Users/Stages
              → People Sync
              → Calls Sync
              → Events Sync
              → Deals Sync
              → Appointments Sync
              → Text Messages Sync
```

---

_Generated: 2026-01-26_
_Task: fn-1-2cy.8_
