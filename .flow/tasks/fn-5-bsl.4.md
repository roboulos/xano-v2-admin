# fn-5-bsl.4 Fix /test-function-8062-network-downline (WORKERS)

## Description

Function returns `"No pending onboarding jobs found"` - it currently requires an existing onboarding job to run.

**Design Decision:** Add `skip_job_check` parameter for standalone testing flexibility.

This allows:

- Direct testing without prerequisite job creation
- Easier debugging during development
- Backward compatibility (default behavior unchanged)

## Implementation Steps

### Step 1: Verify function ID and inspect in Xano console (REQUIRED)

**First, verify function ID is correct:**

```bash
# Search for network downline function by name to confirm ID
mcp__xano-mcp__execute list_functions { workspace_id: 5, search: "network downline" }
```

If function ID differs from 8062, use the correct ID.

**Then inspect the function stack:**

```bash
# Get function details (replace 8062 if different)
mcp__xano-mcp__execute get_function { function_id: 8062 }
```

Look for:

- The job check logic - where does it query for pending jobs?
- Duplicate variable declarations - change `var` to `var.update` where redeclared
- The "Archive function" dependency mentioned in EXECUTION_TRACKER

### Step 2: Add `skip_job_check` parameter

**New input parameter:**

```xanoscript
input {
  integer user_id { required = true }
  boolean skip_job_check { required = false, default = false }
}
```

**Modified logic:**

```xanoscript
if ($input.skip_job_check == false) {
  // Existing job check logic
  db.query "fub_onboarding_jobs" { ... } as $job
  if ($job|is_empty) {
    response = { success: false, error: "No pending onboarding jobs found", skipped: true }
    return
  }
} else {
  // Skip job check, proceed directly
}
```

### Step 3: Fix duplicate variable declarations

Find all instances of variables being redeclared and change:

```xanoscript
// WRONG - redeclaring existing variable
var $result { value = $new_value }

// CORRECT - updating existing variable
var.update $result { value = $new_value }
```

### Step 4: Identify and verify Archive function dependency

The EXECUTION_TRACKER mentions this function depends on an Archive function. Find it and verify it exists in V2.

### Step 5: Test with multiple scenarios

| Test Case           | Input                                        | Expected Result                                                      |
| ------------------- | -------------------------------------------- | -------------------------------------------------------------------- |
| Default (no skip)   | `{"user_id": 60}`                            | `success: false, skipped: true, error: "No pending onboarding jobs"` |
| With skip_job_check | `{"user_id": 60, "skip_job_check": true}`    | `success: true` with network data                                    |
| Empty network       | `{"user_id": X, "skip_job_check": true}`     | `success: true, data: [], message: "No downline found"`              |
| Invalid user        | `{"user_id": 99999, "skip_job_check": true}` | `success: false, error: "User not found"`                            |

## Acceptance

- [ ] **Prerequisite:** Function ID verified (search by name, may not be 8062)
- [ ] **Prerequisite:** Function stack inspected in Xano
- [ ] **Prerequisite:** Duplicate variable declarations identified and fixed
- [ ] **Prerequisite:** Archive function dependency verified
- [ ] POST with `{"user_id": 60, "skip_job_check": true}` returns `success: true`
- [ ] Network hierarchy data populated in V2 tables
- [ ] Default behavior unchanged (still checks for job if `skip_job_check` not passed)
- [ ] Empty network returns `success: true` with empty data array
- [ ] Learnings from fn-5-bsl.3 (team-roster fix) applied if relevant

## Context

<!-- Updated by plan-sync: fn-5-bsl.1 documented /clear-user-data endpoint but Xano function only clears 6 tables currently (not the full 20+ tables in spec). If testing with fresh data after clearing, network data (network_member, network_hierarchy) may not be fully cleared. -->

**Function ID:** 8062
**URL:** `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/test-function-8062-network-downline`
**Depends on:** fn-5-bsl.3 (apply XanoScript learnings)

```bash
# Test with skip_job_check
curl -s -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/test-function-8062-network-downline" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 60,
    "skip_job_check": true
  }'

# Test default behavior (should fail without job)
curl -s -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/test-function-8062-network-downline" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 60}'
```

**Test user:**

- User ID: 60, Agent ID: 37208

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
