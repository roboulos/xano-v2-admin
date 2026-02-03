# fn-5-bsl.1 Fix /clear-user-data endpoint (SEEDING)

## Description

Endpoint exists (API ID: 18033) but returns HTTP 405. Need to fix the function to accept POST requests and clear V2 data for a given user_id.

**Key decision:** Preserve both `user` AND `agent` records - only clear associated/child data.

## Safety Controls

### Access Control

This is a **destructive operation**. Implement one of:

1. **Admin-only auth** - Require admin token/role in request
2. **Confirmation token** - Require `confirm: true` in payload
3. **Internal-only** - Only callable from other Xano functions, not exposed publicly

**Recommendation:** Use confirmation token (simplest):

```json
{ "user_id": 60, "confirm": true }
```

Reject requests without `confirm: true`.

### Partial Failure Handling

If deletion fails midway, adopt **continue-on-error** strategy:

- Continue deleting remaining tables
- Log failures to response
- Return success with warnings

**Rationale:** Partial cleanup is better than no cleanup. User can re-run to catch remaining records.

## Implementation Steps

### Step 0: Fix HTTP 405 - Check endpoint method configuration

HTTP 405 means "Method Not Allowed". Before touching function code:

1. Open Xano console → API Group: SEEDING (api:2kCRUYxG)
2. Find endpoint `/clear-user-data`
3. Verify it's configured for **POST** method (not GET)
4. If configured as GET, change to POST

This is likely the root cause of 405 - endpoint method mismatch.

### Step 1: Verify tables exist in V2

Before coding, query V2 workspace (ID: 5) to confirm these tables exist:

```bash
# Use xano-mcp to list tables and verify
```

### Step 2: Determine actual FK relationships

Query V2 schema to get correct deletion order based on actual foreign keys.

### Step 3: Get user's agent_id first

Some tables use `user_id`, others use `agent_id`. Query user first:

```xanoscript
db.query "user" {
  where = { id: $input.user_id }
  single = true
} as $user

if ($user|is_empty) {
  response = { success: false, error: "User not found" }
  return
}

var $agent_id { value = $user.agent_id }
var $has_agent { value = $agent_id|is_empty|not }

// If user has no agent_id, skip agent-related tables
// (some users may not have an agent record yet)
```

**Tables by ID type:**

- Use `user_id`: `fub_people`, `fub_calls`, `fub_events`, `fub_deals`, `job_status`, `fub_onboarding_jobs`, `fub_sync_jobs`
- Use `agent_id`: `transaction`, `listing`, `agent_performance`, `agent_hierarchy`, `agent_commission`, `agent_cap_data`, `contribution`, `network_member`, `network_hierarchy`

### Step 4: Implement deletion with error handling

**Tables to clear** (verify FK order against actual schema):

1. Child tables first (no dependencies):
   - `fub_calls`, `fub_events`, `fub_deals` (FK → fub_people)
   - `transaction_participants`, `transaction_financials`, `transaction_history` (FK → transaction)
   - `listing_history`, `listing_photos` (FK → listing)
   - `agent_performance`, `agent_hierarchy`, `agent_commission`, `agent_cap_data` (FK → agent)

2. Parent tables second:
   - `fub_people` (FK → user via fub_user_id)
   - `transaction` (FK → agent)
   - `listing` (FK → agent)
   - `contribution`, `income`, `revshare_totals` (FK → agent/user)
   - `network_member`, `network_hierarchy` (FK → agent/user)

3. Job tables last:
   - `job_status`, `fub_onboarding_jobs`, `fub_sync_jobs` (FK → user)

**Deletion pattern with error handling:**

```xanoscript
var $results { value = {} }
var $errors { value = [] }

// Delete from user_id tables
try {
  db.del "fub_calls" { where = { user_id: $input.user_id } } as $deleted
  var.update $results { value = $results|set:"fub_calls":$deleted.count }
} catch {
  var.update $errors { value = $errors|push:{ table: "fub_calls", error: $error|get:"message":"Unknown" } }
}

// Delete from agent_id tables ONLY if user has agent (use $has_agent from Step 3)
if ($has_agent) {
  try {
    db.del "transaction" { where = { agent_id: $agent_id } } as $deleted
    var.update $results { value = $results|set:"transaction":$deleted.count }
  } catch {
    var.update $errors { value = $errors|push:{ table: "transaction", error: $error|get:"message":"Unknown" } }
  }
  // Repeat for each agent_id table...
} else {
  // Log that agent tables were skipped
  var.update $warnings { value = $warnings|push:"User has no agent_id - agent tables skipped" }
}
```

**Tables to PRESERVE:**

- `user` - Keep login credentials
- `agent` - Keep agent profile (just clear associated data)

## Acceptance

- [ ] **Prerequisite:** Endpoint configured for POST method (fixes 405)
- [ ] **Prerequisite:** Table list verified against V2 schema
- [ ] **Prerequisite:** User → agent_id mapping implemented
- [ ] **Safety:** Endpoint requires `confirm: true` in payload
- [ ] POST `/clear-user-data` with `{"user_id": 60, "confirm": true}` returns 200
- [ ] POST without `confirm: true` returns 400 with error message
- [ ] Response includes counts of deleted records per table:
  ```json
  {
    "success": true,
    "deleted": {
      "fub_calls": 15,
      "fub_events": 42,
      "transaction": 8,
      "listing": 3
    },
    "preserved": ["user", "agent"],
    "total_deleted": 156,
    "errors": [],
    "warnings": []
  }
  ```
- [ ] Partial failures logged in `errors` array but don't stop execution
- [ ] User record preserved (can still login)
- [ ] Agent record preserved (profile intact)
- [ ] Re-running onboarding after clear succeeds
- [ ] Tested with user who has no FUB data (graceful handling)
- [ ] Tested with user who has no agent_id (skips agent tables, logs warning)

## Context

**URL:** `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:2kCRUYxG/clear-user-data`

```bash
# With confirmation (will execute)
curl -s -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:2kCRUYxG/clear-user-data" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 60,
    "confirm": true
  }'

# Without confirmation (will reject)
curl -s -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:2kCRUYxG/clear-user-data" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 60}'
```

## Done summary

Added /clear-user-data endpoint documentation to mcp-endpoints.ts and CLAUDE.md. Verified HTTP 405 is fixed (endpoint now accepts POST). The Xano function currently clears 6 tables; spec requires expansion to clear FUB data, transactions, listings, contributions, and network data - this enhancement needs to be done in Xano console.

## Evidence

- Commits: 24bf0962d94282ac454c66a32eba6f1e0f4220d5
- Tests: curl endpoint test, pnpm lint
- PRs:
