# fn-2-riv.3.1 Test Onboarding Flow

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

## Test Steps

### Step 1: Team Data

```bash
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/test-function-8066-team-roster" \
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

## Acceptance

- [ ] All 6 onboarding steps return success
- [ ] Data appears in correct tables
- [ ] No orphaned records created
- [ ] Flow completes in < 30 seconds

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
