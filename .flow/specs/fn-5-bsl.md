# fn-5-bsl: V2 Backend Gaps - 4 Remaining Endpoints

## Problem

4 backend endpoints block V2 launch readiness:

| #   | Endpoint                               | API Group | Issue                                      |
| --- | -------------------------------------- | --------- | ------------------------------------------ |
| 1   | `/clear-user-data`                     | SEEDING   | Returns HTTP 405                           |
| 2   | `/job-queue-status`                    | SYSTEM    | Returns HTTP 404                           |
| 3   | `/test-function-8066-team-roster`      | WORKERS   | Returns `success: false` with empty error  |
| 4   | `/test-function-8062-network-downline` | WORKERS   | Returns "No pending onboarding jobs found" |

## Prerequisites (Before Implementation)

1. **Verify V2 tables exist** - Query V2 workspace to confirm all referenced tables are present
2. **Inspect Xano functions** - Review function 8066 and 8062 stacks in Xano console before coding fixes
3. **Test with multiple user types** - Not just user 60, also test edge cases

## Acceptance Criteria

- [ ] `/clear-user-data` - POST clears all V2 data for given user_id, returns deletion counts
- [ ] `/job-queue-status` - GET returns queue depths for all job types
- [ ] `/test-function-8066-team-roster` - Returns `success: true` with team roster data for user 60
- [ ] `/test-function-8062-network-downline` - Returns `success: true` with network data for user 60
- [ ] All endpoints tested with edge case users (no team, no network, no FUB)
- [ ] `lib/mcp-endpoints.ts` updated if endpoint signatures change

## Task Dependencies

```
fn-5-bsl.1 (clear-user-data) ──┐
fn-5-bsl.2 (job-queue-status) ─┼─→ Can run in parallel
fn-5-bsl.3 (team-roster) ──────┘
         │
         ▼
fn-5-bsl.4 (network-downline) ──→ Depends on learnings from fn-5-bsl.3
```

## Key Context

### V2 Workspace

- Instance: `x2nu-xcjc-vhax.agentdashboards.xano.io`
- Workspace ID: 5
- Tables: 193 (verify referenced tables exist before implementation)

### API Base URLs (lib/mcp-endpoints.ts:18-23)

```typescript
SEEDING: 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:2kCRUYxG'
SYSTEM: 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN'
WORKERS: 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m'
```

### XanoScript Pattern for Arrays

```xanoscript
// WRONG - inline array with variable
var $headers { value = ["header", $var] }

// CORRECT - use |push filter
var $headers { value = []|push:"header"|push:$var }
```

### Test Users

| User         | ID  | Characteristics                  | Use Case                 |
| ------------ | --- | -------------------------------- | ------------------------ |
| David Keener | 60  | Team owner, has network, has FUB | Primary test             |
| Edge case 1  | TBD | No team (`team_id = null`)       | Test graceful skip       |
| Edge case 2  | TBD | No network downline              | Test empty results       |
| Edge case 3  | TBD | No FUB account                   | Test missing integration |

## Quick commands

```bash
# Test clear-user-data (requires confirm:true)
curl -s -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:2kCRUYxG/clear-user-data" \
  -H "Content-Type: application/json" -d '{"user_id": 60, "confirm": true}'

# Test job-queue-status
curl -s "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN/job-queue-status"

# Test team-roster
curl -s -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/test-function-8066-team-roster" \
  -H "Content-Type: application/json" -d '{"user_id": 60}'

# Test network-downline (requires skip_job_check for standalone testing)
curl -s -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/test-function-8062-network-downline" \
  -H "Content-Type: application/json" -d '{"user_id": 60, "skip_job_check": true}'
```

## Dependencies

- Depends on: fn-2 (Master Migration Epic)
- Parent epic: 001-V2-LAUNCH-CRITICAL-PATH
