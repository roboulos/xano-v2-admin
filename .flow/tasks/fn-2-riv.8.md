# fn-2-riv.8 Test Onboarding Flow

## Description

Test the complete user onboarding flow end-to-end to verify all components work together.

**Size:** M
**Phase:** 3 - End-to-End Flow Testing
**Depends on:** Phase 2 complete

## Onboarding Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  ONBOARDING FLOW                                                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  User Signup ──► Agent Creation ──► Team Assignment ──► Initial Data Sync          │
│       │               │                   │                    │                    │
│       ▼               ▼                   ▼                    ▼                    │
│   [user table]   [agent table]      [team_roster]       [FUB/reZEN sync]           │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Test Steps (CORRECTED ENDPOINTS)

### Step 1: Team Data

```bash
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/test-rezen-team-roster-sync" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 60}'
```

**Tables:** team, team_roster, team_owners, team_admins

### Step 2: Agent Data

```bash
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/test-function-8051-agent-data" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 60}'
```

**Tables:** agent, user

### Step 3: Transactions

```bash
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/test-function-8052-txn-sync" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 60}'
```

**Tables:** transaction, participant, paid_participant

### Step 4: Listings

```bash
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/test-function-8053-listings-sync" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 60}'
```

**Tables:** listing

### Step 5: Contributions

```bash
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/test-function-8056-contributions" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 60}'
```

**Tables:** contribution, income, revshare_totals, contributors

### Step 6: Network

```bash
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/test-function-8062-network-downline" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 60}'
```

**Tables:** network, connections

## Expected Results

Each step should return FP Result format:

```json
{
  "success": true,
  "data": { ... },
  "error": "",
  "step": "step_name"
}
```

## Test Results (2026-01-26)

| Step | Endpoint      | Result | Duration | Notes                                                                            |
| ---- | ------------- | ------ | -------- | -------------------------------------------------------------------------------- |
| 1    | Team Data     | FAIL   | 1090ms   | XanoScript error: Unable to locate var: api_response.response.result.teamMembers |
| 2    | Agent Data    | FAIL   | 1238ms   | Failed to sync agent data (generic error)                                        |
| 3    | Transactions  | PASS   | 991ms    | success:true, returns transaction counts                                         |
| 4    | Listings      | PASS   | 820ms    | success:true, returns listing counts                                             |
| 5    | Contributions | PASS   | 4141ms   | success:true, returns contribution data                                          |
| 6    | Network       | SKIP   | 690ms    | No pending onboarding jobs found                                                 |

**Summary:** 3 PASS, 2 FAIL, 1 SKIP in 9.68 seconds

**Table Counts (V2 System):**

- agent: 36,200
- listing: 16,784
- transaction: 51,835
- user: 324
- network_member: 82,688
- contribution: 515,369

## Acceptance

- [ ] All 6 onboarding steps return success (2 failing)
- [x] Data appears in correct tables (verified via table counts)
- [x] No orphaned records created
- [x] Flow completes in < 30 seconds (9.68s)

## Backend Issues Identified

### Step 1: Team Roster Sync (Function 8032)

- **Error:** `Unable to locate var: api_response.response.result.teamMembers`
- **Root Cause:** XanoScript variable path doesn't match actual reZEN API response structure
- **Fix Needed:** Inspect actual reZEN API response and update variable path

### Step 2: Agent Data Sync (Function 8051)

- **Error:** `Failed to sync agent data`
- **Root Cause:** Generic error - needs deeper investigation
- **Fix Needed:** Add detailed error logging to identify specific failure point

## Done summary

Created automated onboarding flow validation script that tests all 6 onboarding steps end-to-end. Results: 3/6 PASS (Transactions, Listings, Contributions), 2/6 FAIL (Team Data, Agent Data with XanoScript errors), 1/6 SKIP (Network - no pending jobs). Flow completes in 9.68 seconds. Backend fixes documented for fn-2-riv.12.

## Evidence

- Commits: d6371d9
- Tests: npm run validate:onboarding
- PRs:
