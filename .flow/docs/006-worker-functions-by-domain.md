# Worker Functions by Domain - V2 Backend

> Task 2.1: Document key worker functions by domain

## Function Organization Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           FUNCTION HIERARCHY                                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │  TASKS/ (Orchestrators)                                                       │  │
│  │  High-level orchestration functions called by background tasks                │  │
│  │  • Schedule and coordinate Workers                                            │  │
│  │  • Handle retries and error aggregation                                       │  │
│  │  • Report overall job status                                                  │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
│                           │                                                          │
│                           │ calls                                                    │
│                           v                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │  WORKERS/ (Business Logic)                                                    │  │
│  │  Core business logic functions that do the actual work                        │  │
│  │  • API calls to external systems                                              │  │
│  │  • Data transformation                                                        │  │
│  │  • Database operations                                                        │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
│                           │                                                          │
│                           │ uses                                                     │
│                           v                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │  UTILS/ (Helpers & Backfills)                                                 │  │
│  │  Utility functions for one-time operations and helpers                        │  │
│  │  • Backfill scripts                                                           │  │
│  │  • Data repair                                                                │  │
│  │  • Linking operations                                                         │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │  ARCHIVE/ (Deprecated/Backup)                                                 │  │
│  │  Old versions and backups of functions                                        │  │
│  │  • Backup copies before refactoring                                           │  │
│  │  • Deprecated functions kept for reference                                    │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. reZEN Domain (Brokerage Data)

### Task Orchestrators

| ID   | Function                                            | Purpose                         | Status           |
| ---- | --------------------------------------------------- | ------------------------------- | ---------------- |
| 8030 | Tasks/reZEN - Network Downline Sync v2              | Sync network downline hierarchy | ✓ Active         |
| 8029 | Tasks/reZEN - Transactions Sync Worker 2            | Transaction sync (batch 2)      | ✓ Active         |
| 8028 | Tasks/reZEN - Transactions Sync Worker 1            | Transaction sync (batch 1)      | ✓ Active         |
| 8027 | Tasks/reZEN - Network Update Frontline Brad         | Frontline network update        | ✓ Active         |
| 8026 | Tasks/reZEN - Network Update Frontline Tim          | Frontline network update        | ✓ Active         |
| 8025 | Tasks/reZEN - Onboarding Load Listings              | Initial listing import          | ✓ Active         |
| 8024 | Tasks/reZEN - Network Frontline Tim                 | Frontline processing            | ✓ Active         |
| 8023 | Tasks/reZEN - Network Frontline Brad                | Frontline processing            | ✓ Active         |
| 8022 | Tasks/reZEN - Remove Duplicates                     | Cleanup duplicates              | ✓ Active         |
| 8021 | Tasks/reZEN - Onboarding Pending Contributions      | Process pending                 | ✓ Active         |
| 8020 | Tasks/reZEN - Onboarding Load Contributions         | Initial contribution import     | ✓ Active         |
| 8019 | Tasks/reZEN - Onboarding Stage Contributions        | Stage for processing            | ✓ Active         |
| 8018 | Tasks/reZEN - Network Missing Frontline Data        | Fix missing data                | ✓ Active         |
| 8017 | Tasks/reZEN - Onboarding Completion                 | Finalize onboarding             | ✓ Active         |
| 8016 | Tasks/reZEN - Onboarding Stage Listings             | Stage listings                  | ✓ Active         |
| 8015 | Tasks/reZEN - Network Missing Cap Data              | Fix missing caps                | ⚠️ Worker broken |
| 8014 | Tasks/reZEN - Onboarding Process RevShare Totals    | Calculate totals                | ✓ Active         |
| 8013 | Tasks/reZEN - Onboarding Stage Transactions Small   | Stage small batch               | ✓ Active         |
| 8012 | Tasks/reZEN - Paid Participant Incomplete Mapping   | Fix mappings                    | ✓ Active         |
| 8011 | Tasks/reZEN - Onboarding Process Contributors       | Process contributors            | ✓ Active         |
| 8010 | Tasks/reZEN - Onboarding Stage Transactions Large   | Stage large batch               | ✓ Active         |
| 8009 | Tasks/reZEN - Paid Participant Missing Addresses    | Fix addresses                   | ✓ Active         |
| 8008 | Tasks/reZEN - Onboarding Process Contributions      | Process contributions           | ✓ Active         |
| 8006 | Tasks/reZEN - Team Roster Caps Splits               | Team cap/split data             | ✓ Active         |
| 8004 | Tasks/reZEN - Onboarding Process Agent Sponsor Tree | Build sponsor tree              | ✓ Active         |
| 8003 | Tasks/reZEN - RevShare Totals                       | Calculate rev share             | ✓ Active         |
| 8002 | Tasks/reZEN - Onboarding Process Equity             | Process equity                  | ✓ Active         |
| 8000 | Tasks/reZEN - Monitor Sync Locks                    | Monitor sync state              | ✓ Active         |
| 7999 | Tasks/reZEN - Webhooks Register Check               | Verify webhooks                 | ✓ Active         |
| 7998 | Tasks/reZEN - Onboarding Process Cap Data           | Process cap data                | ✓ Active         |
| 7996 | Tasks/reZEN - Onboarding Process Network Frontline  | Process frontline               | ✓ Active         |
| 7995 | Tasks/reZEN - Process Webhooks                      | Handle webhooks                 | ✓ Active         |
| 7993 | Tasks/reZEN - Onboarding Process Network Downline   | Process downline                | ✓ Active         |
| 7992 | Tasks/reZEN - Network Name Sync                     | Sync names                      | ✓ Active         |
| 7990 | Tasks/reZEN - Onboarding Process Listings           | Process listings                | ✓ Active         |
| 7989 | Tasks/reZEN - Generate Referral Code                | Create referral codes           | ⚠️ Worker broken |
| 7987 | Tasks/reZEN - Onboarding Process Transactions       | Process transactions            | ✓ Active         |

### Workers

| ID    | Function                                               | Purpose                   | Tags               |
| ----- | ------------------------------------------------------ | ------------------------- | ------------------ |
| 11094 | Workers/reZEN - Listing Details By Object              | Transform listing data    | fp-pattern, V3     |
| 10991 | Workers/reZEN - Process Pending Contributions to Table | Move pending to table     | V3                 |
| 10983 | Workers/reZEN - Get Agent Commission                   | Fetch commission config   | V3                 |
| 10982 | Workers/reZEN - Get Cap Data for All Agents            | Fetch all cap data        | V3, fp-result-type |
| 10981 | Workers/reZEN - Populate RevShare Payments             | Create payment records    | V3, fp-result-type |
| 10962 | Workers/reZEN - Get Agent Sponsor Tree v2              | Build sponsor hierarchy   | V3                 |
| 10938 | Workers/reZEN - Get Equity Performance                 | Fetch equity data         | V3                 |
| 10038 | Workers/reZEN - Move Transactions from Staging         | Staging → core tables     | V3                 |
| 10034 | Workers/reZEN - Validate Credentials                   | Verify API credentials    | V3                 |
| 10019 | Workers/reZEN - Create Contribution Object             | Build contribution record | V3                 |
| 8301  | Workers/reZEN - Transaction Details By Object          | Transform transaction     | fp-pattern, V3     |
| 8299  | Workers/reZEN - Create Onboarding Job                  | Initialize onboarding     | V3                 |
| 8298  | Workers/reZEN - Onboarding Load Listings               | Load listing batch        | V3                 |
| 8297  | Workers/reZEN - Onboarding Orchestrator                | Main onboarding flow      | V3, orchestrator   |
| 8296  | Workers/reZEN - Onboarding Load Transactions           | Load transaction batch    | V3                 |
| 8278  | Workers/reZEN - Outgoing Payments By Agent             | Payments per agent        | V3, fp-refactored  |
| 8277  | Workers/reZEN - Outgoing Payments By Tier              | Payments per tier         | V3, fp-result-type |

---

## 2. FUB Domain (CRM Integration)

### Task Orchestrators

| ID   | Function                                       | Purpose                  | Status   |
| ---- | ---------------------------------------------- | ------------------------ | -------- |
| 8007 | Tasks/FUB - Get Appointments Missing Data      | Fix missing appointments | ✓ Active |
| 8005 | Tasks/FUB - Fix Calls Missing Username         | Fix missing usernames    | ✓ Active |
| 8001 | Tasks/FUB - Onboarding Calls Worker 4          | Call import batch 4      | ✓ Active |
| 7997 | Tasks/FUB - Onboarding Calls Worker 3          | Call import batch 3      | ✓ Active |
| 7994 | Tasks/FUB - Onboarding Calls Worker 2          | Call import batch 2      | ✓ Active |
| 7991 | Tasks/FUB - Onboarding Appointments from Users | Import appointments      | ✓ Active |
| 7988 | Tasks/FUB - Onboarding Deals                   | Import deals             | ✓ Active |
| 7986 | Tasks/FUB - Onboarding Text Messages           | Import SMS               | ✓ Active |

### Workers

| ID    | Function                                        | Purpose                | Tags                    |
| ----- | ----------------------------------------------- | ---------------------- | ----------------------- |
| 10990 | Workers/Sync Pipeline Prospects from FUB Deals  | Deals → prospects      | V3, pipeline            |
| 10972 | Workers/FUB - Get Account Users - Paginated     | Paginated user fetch   | V3, fp-result-type      |
| 10953 | Workers/Link FUB Calls to Users                 | Link calls to users    | linking, fp-result-type |
| 10952 | Workers/Link FUB Calls to People                | Link calls to contacts | linking, fp-result-type |
| 10941 | Workers/FUB - Get Groups                        | Fetch FUB groups       | V3                      |
| 10033 | Workers/FUB - Sync Stages from Deals            | Sync pipeline stages   | V3                      |
| 10031 | Workers/FUB - Move Deals to Transaction         | Deals → transactions   | V3, transaction         |
| 10022 | Workers/FUB - Get Deals                         | Main deals fetch       | V3, orchestrator        |
| 10021 | Workers/FUB - Get Deals - Upsert                | Upsert deal records    | V3                      |
| 10020 | Workers/FUB - Get Deals - Transform             | Transform deal data    | V3                      |
| 9167  | Workers/FUB - Get Text Messages V3              | Fetch SMS              | V3, working             |
| 8295  | Workers/FUB - Lambda Coordinator Validate Input | Validate lambda input  | V3, validation          |

---

## 3. SkySlope Domain (Transaction Management)

### Workers

| ID    | Function                                      | Purpose            | Tags          |
| ----- | --------------------------------------------- | ------------------ | ------------- |
| 10027 | Workers/SkySlope - Move Listings from Staging | Staging → listings | V3, active    |
| 8281  | Workers/SkySlope - Main Worker                | Main processing    | ⚠️ Deprecated |

### Archived (Reference)

| ID   | Function                                              | Original Purpose   |
| ---- | ----------------------------------------------------- | ------------------ |
| 8268 | Archive/Backup/SkySlope - Move Listing from Staging_0 | Backup of 10027    |
| 8245 | Archive/Backup/SkySlope - Get Account Users_0         | Fetch users        |
| 8223 | Archive/Backup/SkySlope - Get User Transactions_0     | Fetch transactions |
| 8187 | Archive/Backup/SkySlope - Upsert Transaction_0        | Upsert transaction |
| 8182 | Archive/Backup/SkySlope - Get Listings_0              | Fetch listings     |
| 8221 | Archive/Backup/SkySlope - Create Authentication_0     | OAuth flow         |

---

## 4. Network Domain

### Workers

| ID    | Function                                  | Purpose                | Tags           |
| ----- | ----------------------------------------- | ---------------------- | -------------- |
| 11110 | Workers/backfill_team_from_network_member | Team backfill          | -              |
| 11109 | Workers/find_team_from_sponsor_chain      | Find team via sponsors | -              |
| 11108 | Workers/find_team_for_agent               | Resolve agent team     | -              |
| 10968 | Workers/Network - Pull Temp Data Fixed    | Pull temp network data | fixed          |
| 10967 | Workers/Network - Get Downline Fixed      | Fetch downline         | fixed          |
| 8285  | Workers/Network - Downline Sync           | Sync downline          | V3, fp-pattern |

---

## 5. Income/Financial Domain

### Workers

| ID    | Function                                | Purpose                | Tags               |
| ----- | --------------------------------------- | ---------------------- | ------------------ |
| 10055 | Workers/Income - Aggregate All Agents   | Orchestrate income agg | V3, orchestrator   |
| 10054 | Workers/Income - Calculate Agent Totals | Per-agent totals       | V3, fp-result-type |
| 10051 | Workers/Income - Aggregate All Sources  | All income sources     | V3, fp-result-type |

---

## 6. Aggregation Domain

### Task Orchestrators

| ID    | Function                               | Purpose              | Tags |
| ----- | -------------------------------------- | -------------------- | ---- |
| 11081 | Tasks/Aggregation - Leaderboard Worker | Build leaderboards   | -    |
| 11080 | Tasks/Aggregation - Monthly Worker     | Monthly aggregations | V3   |
| 11076 | Tasks/Aggregation - Daily Scheduler    | Schedule daily jobs  | V3   |

### Workers

| ID    | Function                                 | Purpose             | Tags                   |
| ----- | ---------------------------------------- | ------------------- | ---------------------- |
| 10989 | Workers/Chart Transactions - Aggregate   | Transaction charts  | transaction, analytics |
| 8279  | Workers/Metrics - Get Transaction Counts | Transaction metrics | V3, fp-refactored      |

---

## 7. Linking Domain

### Workers

| ID    | Function                                        | Purpose                 | Tags                    |
| ----- | ----------------------------------------------- | ----------------------- | ----------------------- |
| 10955 | Workers/Run All Linking Functions               | Orchestrate all linking | orchestrator            |
| 10954 | Workers/Link Equity Transactions to Transaction | Equity ↔ transaction    | linking, fp-result-type |
| 10953 | Workers/Link FUB Calls to Users                 | FUB calls ↔ users       | linking, fp-result-type |
| 10952 | Workers/Link FUB Calls to People                | FUB calls ↔ people      | linking, fp-result-type |

---

## 8. Team/Agent Domain

### Workers

| ID    | Function                                      | Purpose                | Tags           |
| ----- | --------------------------------------------- | ---------------------- | -------------- |
| 11168 | Workers/Test-Roster-Minimal                   | Minimal team test      | -              |
| 11025 | Workers/Agent - Sync Commission Configuration | Sync commission config | V3             |
| 10986 | Workers/User Roles - Populate from User Data  | User role population   | V3             |
| 10959 | Workers/Enrich Team Members from Agent Data   | Enrich team data       | V3, enrichment |

---

## 9. Title Domain

### Workers

| ID    | Function                                     | Purpose              | Tags          |
| ----- | -------------------------------------------- | -------------------- | ------------- |
| 10993 | Workers/Title - Get Settlement Agencies      | Fetch agencies       | V3, qualia    |
| 10988 | Workers/Title - Upsert Orders                | Upsert title orders  | V3, upsert    |
| 10987 | Workers/Title - Populate Closing Disclosures | CD population        | V3            |
| 10985 | Workers/Title - Transform Orders             | Transform order data | V3, transform |

---

## 10. Utility/Infrastructure

### Workers

| ID    | Function                                      | Purpose              | Tags           |
| ----- | --------------------------------------------- | -------------------- | -------------- |
| 11162 | Workers/analyze_bug_report                    | AI bug analysis      | V3, claude     |
| 11155 | Workers/create_github_issue                   | Create GitHub issues | -              |
| 11093 | Workers/Contributions - Duplicates            | Find duplicates      | -              |
| 10995 | Workers/Generate Audit Record                 | Create audit entries | -              |
| 10969 | Workers/Utility - Batch Process Contributions | Batch processing     | -              |
| 8314  | Tasks/AD - Email Network News Daily - Worker  | Daily email          | fp-result-type |
| 8294  | Tasks/AD - Upload Agent Images to Cloud       | Image upload         | V3, storage    |

---

## Function Naming Convention

```
┌─────────────────────────────────────────────────────────────────┐
│                    NAMING PATTERNS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Tasks/{Integration} - {Action} {Object}                       │
│  Example: Tasks/reZEN - Onboarding Process Transactions        │
│                                                                 │
│  Workers/{Integration} - {Action} {Object}                     │
│  Example: Workers/FUB - Get Deals - Transform                  │
│                                                                 │
│  Workers/{Domain} - {Action}                                   │
│  Example: Workers/Income - Calculate Agent Totals              │
│                                                                 │
│  Workers/Link {Source} to {Target}                             │
│  Example: Workers/Link FUB Calls to Users                      │
│                                                                 │
│  Utils/Backfill {Object} {Field}                               │
│  Example: Utils/Backfill FUB People Names                      │
│                                                                 │
│  Archive/Backup/{Original Name}_0                              │
│  Example: Archive/Backup/SkySlope - Get Listings_0             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tag Convention

| Tag                  | Meaning                             |
| -------------------- | ----------------------------------- |
| `v3` / `V3`          | V3 architecture pattern             |
| `fp-result-type`     | Returns FP Result type              |
| `fp-pattern`         | Uses functional programming pattern |
| `orchestrator`       | Coordinates multiple workers        |
| `fixed-YYYY-MM-DD`   | Bug fix on date                     |
| `created-YYYY-MM-DD` | Created on date                     |
| `working`            | Verified working                    |
| `⚠️ deprecated`      | Should not be used                  |
| `linking`            | FK linking function                 |
| `backfill`           | One-time data backfill              |

---

## Function Count Summary

| Domain      | Tasks | Workers | Utils | Archive |
| ----------- | ----- | ------- | ----- | ------- |
| reZEN       | 37    | 17      | 2     | 10+     |
| FUB         | 8     | 12      | 10    | 5+      |
| SkySlope    | 0     | 2       | 1     | 15+     |
| Network     | 0     | 6       | 0     | 0       |
| Income      | 0     | 3       | 0     | 0       |
| Aggregation | 3     | 2       | 0     | 0       |
| Linking     | 0     | 4       | 0     | 0       |
| Team/Agent  | 0     | 4       | 0     | 0       |
| Title       | 0     | 4       | 0     | 0       |
| Utility     | 2     | 4       | 0     | 0       |
| **TOTAL**   | ~50   | ~58     | ~13   | ~30+    |

---

_Generated: 2026-01-26_
_Task: fn-1-2cy.6_
