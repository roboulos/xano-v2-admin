# V2 System Verification & Gap Remediation

## Overview

**Core Question: Is V2 complete and working? Where are the gaps?**

V2 is a comprehensive system with:

- 193 tables
- 971 functions (Workers/, Tasks/, Utils/, Archive/)
- 801+ API endpoints
- Background tasks
- Webhooks
- Integration sync flows (FUB, reZEN, SkySlope)

V1 is the production reference - what the client actually uses, including [v2] tagged features they specifically requested.

This epic systematically verifies V2 works, compares to V1, and surgically fixes gaps.

## Current Validation Status

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  EXISTING INFRASTRUCTURE                                                             │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  scripts/validation/                                                                │
│  ├─ validate-tables.ts      ✓ Exists                                                │
│  ├─ validate-functions.ts   ✓ Exists (needs work)                                   │
│  ├─ validate-endpoints.ts   ✓ Exists (needs auth)                                   │
│  ├─ validate-references.ts  ✓ Exists                                                │
│  └─ utils.ts               ✓ Exists                                                 │
│                                                                                      │
│  PROBLEM: Workers report 0% pass (no test endpoints mapped)                         │
│  PROBLEM: Endpoints report 0% pass (404s - need auth/params)                        │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Phase 1: V1 vs V2 Comparison

**Goal:** Map what V1 does so we know what V2 must support.

### Tasks

1.1 **Map V1 active functions** - Which functions does client actually use?

- Query V1 for functions by folder (Workers/, Tasks/, etc.)
- Identify non-Archive functions
- Document call patterns

  1.2 **Identify V1 [v2] tagged features** - What did client specifically request?

- Search V1 tables/functions for [v2] tags
- These are HIGH PRIORITY for V2
- Already found: agg\_\*\_by_week, FUB activity tables

  1.3 **Compare V1 vs V2 function coverage**

- Match V1 functions to V2 equivalents
- Document gaps (V1 has, V2 doesn't)
- Document new (V2 has, V1 doesn't)

## Phase 2: V2 Validation

**Goal:** Verify V2 functions and endpoints actually work.

### Tasks

2.1 **Fix function validation**

- Workers/ don't have direct endpoints
- Use MCP Workers API group (4UsTtl3m) for testing
- Map functions to their test endpoints

  2.2 **Fix endpoint validation**

- 404s likely due to missing auth/params
- Add test user credentials (user_id: 60)
- Group by auth requirement

  2.3 **Run comprehensive validation**

- Tables: verify schema integrity
- Functions: verify callable and return expected format
- Endpoints: verify 200 response with valid data
- References: verify FK integrity

  2.4 **Identify broken functions**

- Functions with empty stacks
- Functions that error on call
- Functions that return unexpected format

## Phase 3: End-to-End Flow Testing

**Goal:** Verify complete system flows work.

### Tasks

3.1 **Test onboarding flow**

```
User signup → Agent creation → Team assignment → Initial data sync
```

3.2 **Test daily sync cycles**

```
FUB sync → reZEN sync → SkySlope sync → Aggregation
```

3.3 **Test webhook handlers**

```
FUB webhook → reZEN webhook → Stripe webhook
```

3.4 **Test aggregation pipeline**

```
Source data → Workers → agg_agent_monthly → agg_leaderboard
```

## Phase 4: Surgical Gap Fixes

**Goal:** Fix specific gaps identified in Phases 1-3.

### Tasks

4.1 **Fix identified function gaps**

- Create missing Workers/ functions
- Fix broken functions

  4.2 **Fix identified schema gaps**

- Brokerage: office→brokerage FK
- Any other FK gaps found

  4.3 **Fix identified endpoint gaps**

- Missing endpoints
- Broken endpoints

## Quick Commands

```bash
# Run all validators
npm run validate:all

# Run specific validators
npm run validate:tables
npm run validate:functions
npm run validate:endpoints
npm run validate:references

# Test with MCP Workers endpoint
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/test-worker" \
  -H "Content-Type: application/json" \
  -d '{"function_id": 8300, "user_id": 60}'
```

## Acceptance Criteria

### Phase 1

- [ ] V1 function inventory documented
- [ ] V1 [v2] tagged features identified
- [ ] V1 vs V2 gap analysis complete

### Phase 2

- [ ] Function validation passing > 80%
- [ ] Endpoint validation passing > 90%
- [ ] Broken functions documented

### Phase 3

- [ ] Onboarding flow tested end-to-end
- [ ] Daily sync cycle tested
- [ ] Webhook handlers verified
- [ ] Aggregation pipeline verified

### Phase 4

- [ ] Critical function gaps fixed
- [ ] Schema gaps fixed
- [ ] Endpoint gaps fixed

## Task Summary

| Phase | Task | Size | Description                  |
| ----- | ---- | ---- | ---------------------------- |
| 1     | 1.1  | M    | Map V1 active functions      |
| 1     | 1.2  | S    | Identify V1 [v2] features    |
| 1     | 1.3  | M    | V1 vs V2 coverage comparison |
| 2     | 2.1  | M    | Fix function validation      |
| 2     | 2.2  | M    | Fix endpoint validation      |
| 2     | 2.3  | S    | Run comprehensive validation |
| 2     | 2.4  | S    | Identify broken functions    |
| 3     | 3.1  | M    | Test onboarding flow         |
| 3     | 3.2  | M    | Test daily sync cycles       |
| 3     | 3.3  | S    | Test webhook handlers        |
| 3     | 3.4  | S    | Test aggregation pipeline    |
| 4     | 4.1  | L    | Fix function gaps            |
| 4     | 4.2  | M    | Fix schema gaps              |
| 4     | 4.3  | M    | Fix endpoint gaps            |

**Totals:** 14 tasks (2L, 7M, 5S)

## References

- `.flow/docs/` - V2 backend documentation (17 docs)
- `lib/v1-data.ts` - V1 table inventory
- `lib/workers-inventory.ts` - V2 Workers inventory
- `scripts/validation/` - Existing validation scripts
- `validation-reports/` - Historical validation runs
