# Onboarding Sequence - V2 Backend

> Task 5.1: Map complete onboarding sequence

## Onboarding Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           ONBOARDING SUMMARY                                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  Purpose: Sync all user data from reZEN API into AgentDashboards                    │
│  Trigger: Background task polls for pending jobs every 3 minutes                    │
│  Duration: 1-5 minutes depending on data volume                                     │
│  Pattern: Continue-on-failure (collects errors but doesn't short-circuit)          │
│                                                                                      │
│  Main Orchestrator: Workers/reZEN - Onboarding Orchestrator (ID: 8297)             │
│  Job Table: rezen_onboarding_jobs                                                   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Complete Onboarding Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           reZEN ONBOARDING SEQUENCE                                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  USER TRIGGERS ONBOARDING                                                           │
│       │                                                                              │
│       ▼                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  STEP 0: INITIALIZATION                                                      │   │
│  │  ├── Get user record with agent_id                                          │   │
│  │  ├── Validate user exists and has agent_id                                  │   │
│  │  ├── Get credentials (API key) from credentials table                       │   │
│  │  ├── Get or create rezen_onboarding_jobs record                             │   │
│  │  ├── Send "ONBOARDING_STARTED" notification                                 │   │
│  │  └── Notify Slack                                                           │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│       │                                                                              │
│       ▼                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  STEP 1: AGENT DATA                                                          │   │
│  │  Function: Workers/reZEN - Agent Data                                        │   │
│  │  ├── Fetch agent profile from reZEN API                                     │   │
│  │  ├── Update agent table                                                     │   │
│  │  └── Update job: agent_data_started → agent_data_ended                      │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│       │                                                                              │
│       ▼                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  STEP 2: TEAM ROSTER (if Team account)                                       │   │
│  │  Function: Workers/reZEN - Team Roster Sync                                  │   │
│  │  ├── Condition: user_roles.account_type == "Team"                           │   │
│  │  ├── Fetch team members from reZEN API                                      │   │
│  │  ├── Upsert team_members table                                              │   │
│  │  └── Update job: team_members_started → team_members_ended                  │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│       │                                                                              │
│       ▼                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  STEP 3: LISTINGS                                                            │   │
│  │  Function: Workers/reZEN - Onboarding Load Listings (8298)                   │   │
│  │  ├── Fetch all listings from reZEN API                                      │   │
│  │  ├── Stage in rezen_listing_staging                                         │   │
│  │  ├── Process staging → listing table                                        │   │
│  │  └── Update job: listing_data_started → listing_data_ended                  │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│       │                                                                              │
│       ▼                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  STEP 4: TRANSACTIONS                                                        │   │
│  │  Function: Workers/reZEN - Onboarding Load Transactions (8296)               │   │
│  │  ├── Fetch all transactions from reZEN API                                  │   │
│  │  ├── Stage in rezen_transaction_staging                                     │   │
│  │  ├── Process staging → transaction, participant, paid_participant           │   │
│  │  └── Update job: transaction_data_started → transaction_data_ended          │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│       │                                                                              │
│       ▼                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  STEP 5: SPONSOR TREE                                                        │   │
│  │  Function: Workers/reZEN - Get Agent Sponsor Tree                            │   │
│  │  ├── Fetch sponsor/upline data from reZEN API                               │   │
│  │  ├── Build hierarchy in network_hierarchy table                             │   │
│  │  └── Update job: sponsor_tree_started → sponsor_tree_ended                  │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│       │                                                                              │
│       ▼                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  STEP 6: CONTRIBUTIONS                                                       │   │
│  │  Function: Workers/reZEN - Onboarding Load Contributions (8060)              │   │
│  │  ├── Fetch contribution data from reZEN API                                 │   │
│  │  ├── Process and upsert to contribution table                               │   │
│  │  └── Update job: contributions_started → contributions_ended                │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│       │                                                                              │
│       ▼                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  STEP 7: CAP DATA                                                            │   │
│  │  Function: Workers/reZEN - Get Cap Data for All Agents                       │   │
│  │  ├── Fetch cap/commission limits from reZEN API                             │   │
│  │  ├── Update agent_cap_data table                                            │   │
│  │  └── Update job: network_cap_data_started → network_cap_data_ended          │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│       │                                                                              │
│       ▼                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  STEP 8: EQUITY                                                              │   │
│  │  Function: Workers/reZEN - Get Equity Performance                            │   │
│  │  ├── Fetch equity/stock data from reZEN API                                 │   │
│  │  ├── Update equity_monthly, equity_annual tables                            │   │
│  │  └── Update job: equity_started → equity_ended                              │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│       │                                                                              │
│       ▼                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  STEP 9: REVSHARE PAYMENTS                                                   │   │
│  │  Function: Workers/reZEN - Populate RevShare Payments                        │   │
│  │  ├── Fetch pending/completed revshare from reZEN API                        │   │
│  │  ├── Update revshare_payment table                                          │   │
│  │  └── Update job: pending_revshare_payments_started → _ended                 │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│       │                                                                              │
│       ▼                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  COMPLETION                                                                  │   │
│  │  ├── Count errors                                                           │   │
│  │  ├── Set status: "Complete" (0 errors) or "Partial" (1+ errors)             │   │
│  │  ├── Send "ONBOARDING_COMPLETE" notification                                │   │
│  │  └── Return FP Result with all step details                                 │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Step Details

### Step 0: Initialization

| Action          | Detail                                                             |
| --------------- | ------------------------------------------------------------------ |
| Get user        | `db.get user { field_name = "id", field_value = $user_id }`        |
| Validate        | `precondition ($user.agent_id != null)`                            |
| Get credentials | Query `credentials` table for REZEN platform                       |
| Get agent       | `db.get agent { field_name = "id", field_value = $user.agent_id }` |
| Get/create job  | Upsert `rezen_onboarding_jobs` record                              |
| Notify          | Add `notification_items` record with code "ONBOARDING_STARTED"     |
| Slack           | Call `Archive/slack_webhook` with start message                    |

### Step 1: Agent Data

| Worker         | `Workers/reZEN - Agent Data`                           |
| -------------- | ------------------------------------------------------ |
| API Call       | `GET /api/v1/agents/{agent_id}`                        |
| Tables Updated | `agent`, `user`                                        |
| Job Fields     | `agent_data_started`, `agent_data`, `agent_data_ended` |

### Step 2: Team Roster (Conditional)

| Condition      | `user_roles.account_type == "Team"`                          |
| -------------- | ------------------------------------------------------------ |
| Worker         | `Workers/reZEN - Team Roster Sync`                           |
| API Call       | `GET /api/v1/teams/{team_id}/members`                        |
| Tables Updated | `team_members`, `team`                                       |
| Job Fields     | `team_members_started`, `team_members`, `team_members_ended` |

### Step 3: Listings

| Worker         | `Workers/reZEN - Onboarding Load Listings` (ID: 8298)        |
| -------------- | ------------------------------------------------------------ |
| API Call       | `GET /api/v1/listings?agentId={agent_id}`                    |
| Tables Updated | `rezen_listing_staging` → `listing`                          |
| Job Fields     | `listing_data_started`, `listing_data`, `listing_data_ended` |

### Step 4: Transactions

| Worker         | `Workers/reZEN - Onboarding Load Transactions` (ID: 8296)                                           |
| -------------- | --------------------------------------------------------------------------------------------------- |
| API Call       | `GET /api/v1/transactions?agentId={agent_id}`                                                       |
| Tables Updated | `rezen_transaction_staging` → `transaction`, `participant`, `paid_participant`                      |
| Job Fields     | `transaction_data_started`, `transaction_data`, `transaction_data_loaded`, `transaction_data_ended` |

### Step 5: Sponsor Tree

| Worker         | `Workers/reZEN - Get Agent Sponsor Tree`                     |
| -------------- | ------------------------------------------------------------ |
| API Call       | `GET /api/v1/agents/{agent_id}/sponsor-tree`                 |
| Tables Updated | `network_hierarchy`, `sponsor_tree`                          |
| Job Fields     | `sponsor_tree_started`, `sponsor_tree`, `sponsor_tree_ended` |

### Step 6: Contributions

| Worker         | `Workers/reZEN - Onboarding Load Contributions` (ID: 8060)      |
| -------------- | --------------------------------------------------------------- |
| API Call       | `GET /api/v1/contributions?agentId={agent_id}&tier=1`           |
| Tables Updated | `contribution`, `contributors`                                  |
| Job Fields     | `contributions_started`, `contributions`, `contributions_ended` |

### Step 7: Cap Data

| Worker         | `Workers/reZEN - Get Cap Data for All Agents`                            |
| -------------- | ------------------------------------------------------------------------ |
| API Call       | `GET /api/v1/agents/{agent_id}/cap-data`                                 |
| Tables Updated | `agent_cap_data`                                                         |
| Job Fields     | `network_cap_data_started`, `network_cap_data`, `network_cap_data_ended` |

### Step 8: Equity

| Worker         | `Workers/reZEN - Get Equity Performance`                 |
| -------------- | -------------------------------------------------------- |
| API Call       | `GET /api/v1/equity/{agent_id}`                          |
| Tables Updated | `equity_monthly`, `equity_annual`, `equity_transactions` |
| Job Fields     | `equity_started`, `equity`, `equity_ended`               |

### Step 9: RevShare Payments

| Worker         | `Workers/reZEN - Populate RevShare Payments`                                                        |
| -------------- | --------------------------------------------------------------------------------------------------- |
| API Call       | `GET /api/v1/revshare/payments/{agent_id}`                                                          |
| Tables Updated | `revshare_payment`                                                                                  |
| Job Fields     | `pending_revshare_payments_started`, `pending_revshare_payments`, `pending_revshare_payments_ended` |

---

## Job Status Tracking

### rezen_onboarding_jobs Table Structure

| Field       | Type      | Purpose                        |
| ----------- | --------- | ------------------------------ |
| id          | int       | Primary key                    |
| user_id     | int       | FK → user                      |
| status      | text      | Started/Partial/Complete/Error |
| started     | timestamp | When job started               |
| ended       | timestamp | When job ended                 |
| lastupdated | timestamp | Last progress update           |

### Per-Step Fields

Each step has three fields:

- `{step}_started` - Timestamp when step began
- `{step}` - Boolean flag (true when complete)
- `{step}_ended` - Timestamp when step finished

| Step             | Started Field                     | Flag Field                | Ended Field                     |
| ---------------- | --------------------------------- | ------------------------- | ------------------------------- |
| Agent Data       | agent_data_started                | agent_data                | agent_data_ended                |
| Team Members     | team_members_started              | team_members              | team_members_ended              |
| Listing Data     | listing_data_started              | listing_data              | listing_data_ended              |
| Transaction Data | transaction_data_started          | transaction_data          | transaction_data_ended          |
| Sponsor Tree     | sponsor_tree_started              | sponsor_tree              | sponsor_tree_ended              |
| Contributions    | contributions_started             | contributions             | contributions_ended             |
| Cap Data         | network_cap_data_started          | network_cap_data          | network_cap_data_ended          |
| Equity           | equity_started                    | equity                    | equity_ended                    |
| RevShare         | pending_revshare_payments_started | pending_revshare_payments | pending_revshare_payments_ended |

---

## Error Handling (Continue-on-Failure)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           ERROR HANDLING PATTERN                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  // Initialize error tracking                                                       │
│  var $errors { value = [] }                                                         │
│  var $failed_steps { value = [] }                                                   │
│  var $steps_completed { value = [] }                                                │
│                                                                                      │
│  // After each step:                                                                │
│  if ($step_result.success == false) {                                               │
│    $errors|push:({step: "step_name", error: $step_result.error})                   │
│    $failed_steps|push:"step_name"                                                  │
│  } else {                                                                           │
│    $steps_completed|push:"step_name"                                               │
│  }                                                                                  │
│                                                                                      │
│  // At completion:                                                                  │
│  if ($errors|count > 0) {                                                           │
│    status = "Partial"                                                               │
│    message = "Onboarding completed with N error(s)"                                │
│  } else {                                                                           │
│    status = "Complete"                                                              │
│  }                                                                                  │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Background Task Trigger

| Task ID | Name                                         | Frequency    | Function               |
| ------- | -------------------------------------------- | ------------ | ---------------------- |
| 2385    | reZEN - Onboarding - Start Onboarding Job V3 | 3 min (180s) | Polls for pending jobs |

**Poll Logic:**

1. Query `rezen_onboarding_jobs` for status = "Pending"
2. For each pending job, call `Workers/reZEN - Onboarding Orchestrator`

---

## Notifications

| Code                | Type | When       | Message                                 |
| ------------------- | ---- | ---------- | --------------------------------------- |
| ONBOARDING_STARTED  | INFO | Step 0     | "We've started syncing data from ReZEN" |
| ONBOARDING_COMPLETE | INFO | Completion | "We've synced all your data from ReZEN" |
| ONBOARDING_ERROR    | INFO | Exception  | "We've run into an error..."            |

---

## FP Result Type

The orchestrator returns a comprehensive result:

```json
{
  "success": true|false,
  "data": {
    "user_id": 60,
    "steps_completed": ["agent_data", "team_roster", ...],
    "failed_steps": [],
    "error_count": 0,
    "worker_results": {
      "agent_data": {...},
      "team_roster": {...},
      "listings": {...},
      "transactions": {...},
      "sponsor_tree": {...},
      "contributions": {...},
      "cap_data": {...},
      "equity": {...},
      "revshare": {...}
    }
  },
  "error": null,
  "meta": {
    "function_name": "Workers/reZEN - Onboarding Orchestrator",
    "errors": [],
    "timestamp": "2026-01-26T12:00:00Z"
  }
}
```

---

## Testing

### Trigger Onboarding for User 60

```bash
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/test-fp-onboarding-orchestrator" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 60
  }'
```

### Check Onboarding Status

```bash
curl -X GET "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN/onboarding-status"
```

---

## Tables Updated by Onboarding

| Step          | Tables                                                                |
| ------------- | --------------------------------------------------------------------- |
| Agent Data    | agent, user                                                           |
| Team Roster   | team, team_members                                                    |
| Listings      | rezen_listing_staging, listing                                        |
| Transactions  | rezen_transaction_staging, transaction, participant, paid_participant |
| Sponsor Tree  | network_hierarchy, sponsor_tree                                       |
| Contributions | contribution, contributors                                            |
| Cap Data      | agent_cap_data                                                        |
| Equity        | equity_monthly, equity_annual, equity_transactions                    |
| RevShare      | revshare_payment                                                      |

---

_Generated: 2026-01-26_
_Task: fn-1-2cy.12_
