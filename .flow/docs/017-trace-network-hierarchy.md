# Trace: Network Hierarchy Calculation

> Task 6.3: Trace network hierarchy calculation

## Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                    NETWORK HIERARCHY: reZEN API → DISPLAY                           │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  STEP 1: SOURCE - reZEN Yenta API                                                   │
│  ═══════════════════════════════════════════════════════════════════════════════   │
│                                                                                      │
│  TWO COMPLEMENTARY APIs:                                                            │
│                                                                                      │
│  API A: Downline (Tiers 1-5)          API B: Sponsor Tree (Upline)                 │
│  GET /agents/{id}/down-line/{tier}    GET /agents/{id}/sponsor-tree                │
│                                                                                      │
│  Downline Response:                   Sponsor Tree Response:                        │
│  {                                    {                                             │
│    "downLineAgents": [                  "flattenedSponsors": [                      │
│      {                                    {                                         │
│        "id": "agent-uuid",                  "id": "sponsor-uuid",                   │
│        "firstName": "John",                 "firstName": "Sarah",                   │
│        "lastName": "Doe",                   "lastName": "Smith",                    │
│        "status": "ACTIVE",                  "level": 1,                             │
│        "joinDate": "2025-01-15",            "status": "ACTIVE"                      │
│        "sizeOfNetwork": 25                }                                         │
│      }                                  ]                                           │
│    ],                                 }                                             │
│    "hasNext": false                                                                │
│  }                                                                                  │
│       │                                       │                                     │
│       ▼                                       ▼                                     │
│  STEP 2: SYNC ORCHESTRATORS                                                         │
│  ═══════════════════════════════════════════════════════════════════════════════   │
│                                                                                      │
│  PATH A: Daily Sync                   PATH B: Onboarding                            │
│  ┌─────────────────────────────┐     ┌─────────────────────────────┐              │
│  │ Tasks/reZEN - Network       │     │ Workers/reZEN - Onboarding  │              │
│  │ Downline Sync v2 (8030)     │     │ Process Network Data (8121) │              │
│  │        │                    │     │        │                    │              │
│  │        ▼                    │     │        ▼                    │              │
│  │ Query rezen_sync_jobs       │     │ Part of 9-step sequence     │              │
│  │ Mark IN_PROGRESS            │     │ After contributions step    │              │
│  │ Call worker                 │     │ Calls same workers          │              │
│  │ Mark COMPLETED              │     │                             │              │
│  └─────────────────────────────┘     └─────────────────────────────┘              │
│                                                                                      │
│       │                                       │                                     │
│       └───────────────────┬───────────────────┘                                     │
│                           ▼                                                         │
│  STEP 3: WORKERS - Data Fetching & Processing                                       │
│  ═══════════════════════════════════════════════════════════════════════════════   │
│                                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────┐     │
│  │ Workers/Network - Get Downline (ID: 8034)                                  │     │
│  │ ─────────────────────────────────────────────────────────────────────────  │     │
│  │ • Loops through 5 tiers                                                    │     │
│  │ • For each tier: paginated API calls (pageSize=1000)                       │     │
│  │ • Fetches by status: ACTIVE, INACTIVE, CANDIDATE, REJECTED, RESURRECTING  │     │
│  │ • Creates network_id_raw: "AGENT-DOWNLINE-TIER"                            │     │
│  │ • Upserts to network_member table                                          │     │
│  │ • Tracks changes in network_change_log                                     │     │
│  │ • Sends Slack notifications on changes                                     │     │
│  └───────────────────────────────────────────────────────────────────────────┘     │
│                                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────┐     │
│  │ Workers/reZEN - Get Agent Sponsor Tree (ID: 8107)                          │     │
│  │ ─────────────────────────────────────────────────────────────────────────  │     │
│  │ • Gets credentials from credentials table                                  │     │
│  │ • Calls sponsor-tree API endpoint                                          │     │
│  │ • Processes flattenedSponsors array                                        │     │
│  │ • Inserts into agent_hierarchy table                                       │     │
│  │ • Sets role flags: is_director (level 1), is_leader (level ≤2)             │     │
│  └───────────────────────────────────────────────────────────────────────────┘     │
│                                                                                      │
│       │                                                                              │
│       ▼                                                                              │
│  STEP 4: TRANSFORM - Data Normalization                                             │
│  ═══════════════════════════════════════════════════════════════════════════════   │
│                                                                                      │
│  Input (reZEN API):                      Output (Normalized):                       │
│  ┌─────────────────────────────┐        ┌─────────────────────────────┐            │
│  │ id: "abc-123-uuid"          │        │ network_id_raw: composite   │            │
│  │ firstName: "John"           │        │ status: "Active"            │            │
│  │ lastName: "DOE"             │    ──► │ tier: 1-5                   │            │
│  │ status: "ACTIVE"            │        │ downline_agent_id: FK       │            │
│  │ joinDate: "2025-01-15"      │        │ broker_join_date: date      │            │
│  │ sizeOfNetwork: 25           │        │ network_size: 25            │            │
│  └─────────────────────────────┘        └─────────────────────────────┘            │
│                                                                                      │
│  network_id_raw Formula:                                                            │
│  "{agent_id_raw}-{downline_id}-{tier}"                                              │
│                                                                                      │
│       │                                                                              │
│       ▼                                                                              │
│  STEP 5: STORE - Database Tables                                                    │
│  ═══════════════════════════════════════════════════════════════════════════════   │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                           NETWORK TABLES                                     │   │
│  ├─────────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                              │   │
│  │  ┌──────────────────────┐      ┌──────────────────────┐                     │   │
│  │  │ network_member (698) │      │ agent_hierarchy (674)│                     │   │
│  │  │ ──────────────────── │      │ ──────────────────── │                     │   │
│  │  │ • network_id_raw     │      │ • agent_id           │                     │   │
│  │  │ • user_id            │      │ • sponsor_agent_id   │                     │   │
│  │  │ • agent_id           │      │ • is_director        │                     │   │
│  │  │ • downline_agent_id  │      │ • is_leader          │                     │   │
│  │  │ • sponsoring_agent_id│      │ • is_mentor          │                     │   │
│  │  │ • tier (1-5)         │      │ • needs_mentorship   │                     │   │
│  │  │ • status             │      │ • director_id        │                     │   │
│  │  │ • network_size       │      │ • leader_id          │                     │   │
│  │  │ • broker_join_date   │      │ • mentor_id          │                     │   │
│  │  │ • cap_amount         │      └──────────────────────┘                     │   │
│  │  │ • total_contribution │              ▲                                    │   │
│  │  └──────────────────────┘              │                                    │   │
│  │           │                            │                                    │   │
│  │           │ FK                         │ FK                                 │   │
│  │           ▼                            │                                    │   │
│  │  ┌──────────────────────┐      ┌──────────────────────┐                     │   │
│  │  │ network_change_log   │      │ agent (core)         │                     │   │
│  │  │ (440)                │      │                      │                     │   │
│  │  │ ──────────────────── │      │ • agent_id_raw       │                     │   │
│  │  │ • network_id         │      │ • full_name          │                     │   │
│  │  │ • type (Status,      │      │ • user_id            │                     │   │
│  │  │   Network Size, etc.)│      └──────────────────────┘                     │   │
│  │  │ • value_old          │                                                   │   │
│  │  │ • value_new          │                                                   │   │
│  │  └──────────────────────┘                                                   │   │
│  │                                                                              │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│       │                                                                              │
│       ▼                                                                              │
│  STEP 6: API - Frontend Endpoints                                                   │
│  ═══════════════════════════════════════════════════════════════════════════════   │
│                                                                                      │
│  GET /network/downline                                                              │
│  ├── Query network_member by user_id                                               │
│  ├── Join agent for names                                                          │
│  ├── Filter by tier, status                                                        │
│  └── Return hierarchical data                                                      │
│                                                                                      │
│  GET /network/sponsors                                                              │
│  ├── Query agent_hierarchy by agent_id                                             │
│  ├── Join agent for sponsor details                                                │
│  └── Return upline chain                                                           │
│                                                                                      │
│  GET /network/metrics                                                               │
│  └── Aggregate counts by tier and status                                           │
│                                                                                      │
│       │                                                                              │
│       ▼                                                                              │
│  STEP 7: DISPLAY - Network Page                                                     │
│  ═══════════════════════════════════════════════════════════════════════════════   │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  MY NETWORK                                                                  │   │
│  │  ╔═══════════════════════════════════════════════════════════════════════╗  │   │
│  │  ║  UPLINE (Sponsors)                                                     ║  │   │
│  │  ║  └── Sarah Smith (Director) → Mike Johnson (Leader) → [You]           ║  │   │
│  │  ╠═══════════════════════════════════════════════════════════════════════╣  │   │
│  │  ║  DOWNLINE (5 Tiers)                    │ Network Size: 127            ║  │   │
│  │  ║  ├── Tier 1 (Direct): 12 agents       │ Active: 98                   ║  │   │
│  │  ║  ├── Tier 2: 35 agents                │ Inactive: 29                 ║  │   │
│  │  ║  ├── Tier 3: 48 agents                │                              ║  │   │
│  │  ║  ├── Tier 4: 22 agents                │ Total Contributions: $45K    ║  │   │
│  │  ║  └── Tier 5: 10 agents                │                              ║  │   │
│  │  ╚═══════════════════════════════════════════════════════════════════════╝  │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Table Schemas

### network_member (ID: 698)

| Field                  | Type      | Source              | Notes                       |
| ---------------------- | --------- | ------------------- | --------------------------- |
| id                     | int       | Auto                | PK                          |
| network_id_raw         | text      | Computed            | "{agent}-{downline}-{tier}" |
| user_id                | int       | Context             | FK to user                  |
| agent_id               | int       | Context             | FK to agent (sponsor)       |
| downline_agent_id      | int       | Lookup              | FK to agent (downline)      |
| sponsoring_agent_id    | int       | Context             | Same as agent_id            |
| tier                   | text      | API                 | 1-5                         |
| status                 | text      | API: status         | Active, Inactive, etc.      |
| network_size           | int       | API: sizeOfNetwork  | Downline's network          |
| broker_join_date       | date      | API: joinDate       |                             |
| broker_terminated_date | date      | API: terminatedAsOf |                             |
| cap_amount             | decimal   | Calculated          |                             |
| cap_amount_paid        | decimal   | Calculated          |                             |
| total_contribution     | decimal   | Calculated          |                             |
| sponsor_split          | decimal   | Config              | Rev share %                 |
| unlocking              | bool      | State               | Unlock status               |
| left_network           | bool      | State               | Termination flag            |
| capped                 | bool      | State               | Cap status                  |
| last_updated           | timestamp | System              |                             |

### agent_hierarchy (ID: 674)

| Field            | Type | Source   | Notes                 |
| ---------------- | ---- | -------- | --------------------- |
| id               | int  | Auto     | PK                    |
| agent_id         | int  | Context  | FK to agent (user)    |
| sponsor_agent_id | int  | API      | FK to agent (sponsor) |
| is_director      | bool | Computed | Level 1 sponsor       |
| is_leader        | bool | Computed | Level 1-2 sponsor     |
| is_mentor        | bool | Computed | Level 1 sponsor       |
| needs_mentorship | bool | Config   |                       |
| director_id      | int  | Lookup   | FK to agent           |
| leader_id        | int  | Lookup   | FK to agent           |
| mentor_id        | int  | Lookup   | FK to agent           |

### network_change_log (ID: 440)

| Field                 | Type | Notes                                           |
| --------------------- | ---- | ----------------------------------------------- |
| network_id            | text | Reference to network_id_raw                     |
| user_id               | int  | FK to user                                      |
| agent_id              | int  | FK to agent                                     |
| tier                  | int  | Tier level                                      |
| downline_agent_id_raw | text | reZEN agent ID                                  |
| type                  | text | Status, Network Size, Join Date, New to Network |
| value_old             | text | Previous value                                  |
| value_new             | text | New value                                       |

---

## Key Functions

| ID   | Name                                                  | Purpose                              |
| ---- | ----------------------------------------------------- | ------------------------------------ |
| 8034 | Workers/Network - Get Downline                        | Fetch all 5 tiers of downline agents |
| 8107 | Workers/reZEN - Get Agent Sponsor Tree                | Fetch upline sponsor chain           |
| 8030 | Tasks/reZEN - Network Downline Sync v2                | Orchestrator for daily sync          |
| 8285 | Workers/Network - Downline Sync                       | Simplified downline sync             |
| 8121 | Workers/reZEN - Onboarding Process Network Data       | Onboarding network step              |
| 8062 | Workers/reZEN - Onboarding Process Network Downline   | Onboarding downline                  |
| 8070 | Workers/reZEN - Onboarding Process Agent Sponsor Tree | Onboarding sponsors                  |
| 8102 | Workers/Network - Get Network Counts                  | Metrics calculation                  |

---

## Sync Scheduling

| Sync Type            | Frequency          | Trigger                  |
| -------------------- | ------------------ | ------------------------ |
| Daily Downline       | Configurable (env) | rezen_sync_jobs polling  |
| Onboarding           | One-time           | User onboarding flow     |
| Delta (type="Daily") | With daily sync    | Only updated last 3 days |

---

## Change Detection

The system tracks 4 types of changes:

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           CHANGE DETECTION TYPES                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  1. NEW TO NETWORK                                                                  │
│     ─────────────────────────────────────────────────────────────────              │
│     Trigger: network_id_raw not found in network_member                             │
│     Action:  Insert new record, log "New to Network"                                │
│                                                                                      │
│  2. STATUS CHANGE                                                                   │
│     ─────────────────────────────────────────────────────────────────              │
│     Trigger: status differs from existing record                                    │
│     Action:  Update record, log "Status" change, Slack notification                 │
│     Example: Candidate → Active (special handling)                                  │
│                                                                                      │
│  3. NETWORK SIZE CHANGE                                                             │
│     ─────────────────────────────────────────────────────────────────              │
│     Trigger: sizeOfNetwork differs from network_size                                │
│     Action:  Update record, log "Network Size" change, Slack notification           │
│                                                                                      │
│  4. JOIN DATE CHANGE                                                                │
│     ─────────────────────────────────────────────────────────────────              │
│     Trigger: joinDate differs from broker_join_date                                 │
│     Action:  Update record, log "Join Date" change, Slack notification              │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Hierarchy Relationships

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           NETWORK HIERARCHY STRUCTURE                               │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  UPLINE (sponsor-tree API → agent_hierarchy table)                                  │
│  ═══════════════════════════════════════════════════════════════════════════════   │
│                                                                                      │
│                    ┌──────────────┐                                                 │
│                    │   Level 3    │  (Great-grand-sponsor)                          │
│                    └──────┬───────┘                                                 │
│                           │                                                         │
│                    ┌──────▼───────┐                                                 │
│                    │   Level 2    │  is_leader = true                               │
│                    └──────┬───────┘                                                 │
│                           │                                                         │
│                    ┌──────▼───────┐                                                 │
│                    │   Level 1    │  is_director = true, is_leader = true,          │
│                    │  (Director)  │  is_mentor = true                               │
│                    └──────┬───────┘                                                 │
│                           │                                                         │
│                    ┌──────▼───────┐                                                 │
│                    │     YOU      │  agent_id                                       │
│                    └──────────────┘                                                 │
│                                                                                      │
│  DOWNLINE (down-line API → network_member table)                                    │
│  ═══════════════════════════════════════════════════════════════════════════════   │
│                                                                                      │
│                    ┌──────────────┐                                                 │
│                    │     YOU      │  agent_id / sponsoring_agent_id                 │
│                    └──────┬───────┘                                                 │
│              ┌───────────┬┴──────────┬───────────┐                                  │
│              │           │           │           │                                  │
│        ┌─────▼────┐ ┌────▼────┐ ┌────▼────┐ ┌────▼────┐                            │
│        │  Tier 1  │ │  Tier 1 │ │  Tier 1 │ │  Tier 1 │  Direct recruits           │
│        └─────┬────┘ └─────────┘ └─────────┘ └────┬────┘                            │
│              │                                    │                                 │
│        ┌─────▼────┐                         ┌────▼────┐                            │
│        │  Tier 2  │                         │  Tier 2 │  Recruits' recruits        │
│        └─────┬────┘                         └─────────┘                            │
│              │                                                                      │
│        ┌─────▼────┐                                                                │
│        │  Tier 3  │  ... and so on to Tier 5                                       │
│        └──────────┘                                                                │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Rev Share Connection

Network hierarchy directly impacts revenue sharing:

| Tier   | Typical Split | Source                          |
| ------ | ------------- | ------------------------------- |
| Tier 1 | 4-6%          | sponsor_split in network_member |
| Tier 2 | 2-4%          | Decreasing with tier            |
| Tier 3 | 1-2%          |                                 |
| Tier 4 | 0.5-1%        |                                 |
| Tier 5 | 0.25-0.5%     |                                 |

When downline agents close transactions, the contribution flows up through the hierarchy based on these splits.

---

## API Endpoints

| Endpoint            | Method | Purpose                      |
| ------------------- | ------ | ---------------------------- |
| /network/downline   | GET    | List downline by tier        |
| /network/sponsors   | GET    | Get upline chain             |
| /network/metrics    | GET    | Network statistics           |
| /network/change-log | GET    | Recent changes               |
| /network/tree       | GET    | Full hierarchy visualization |

---

## Timing

| Stage               | Latency   |
| ------------------- | --------- |
| API call (per tier) | 2-5 sec   |
| Full 5-tier sync    | 30-60 sec |
| Sponsor tree fetch  | 1-2 sec   |
| Database upsert     | < 100ms   |
| Total daily sync    | 1-2 min   |

---

_Generated: 2026-01-26_
_Task: fn-1-2cy.17_
