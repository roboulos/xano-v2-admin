# fn-5-bsl.2 Create /job-queue-status endpoint (SYSTEM)

## Description

Endpoint returns 404 - needs to be created. Should provide visibility into job queue depths across all job types for operations monitoring.

## Implementation Steps

### Step 1: Verify job tables exist in V2

Before coding, query V2 workspace (ID: 5) to confirm these tables exist:

```bash
# Use xano-mcp to list tables and verify
```

**Expected tables:**

- `job_status` - General job tracking
- `fub_onboarding_jobs` - FUB onboarding queue
- `fub_sync_jobs` - FUB sync queue
- `fub_worker_queue` - FUB worker queue (may not exist)
- `lambda_job_status` - Lambda jobs (may not exist)

### Step 2: Discover actual status values

Query each table to find what status values are actually used:

```bash
# Example: Get distinct statuses from job_status
SELECT DISTINCT status FROM job_status
```

**Common status patterns:**

- `New`, `Processing`, `Complete`, `Error`
- `pending`, `in_progress`, `done`, `failed`
- Numeric: `0`, `1`, `2`, `3`

Map discovered values to canonical names in response.

### Step 3: Create endpoint in SYSTEM API group

**API Group:** SYSTEM (api:LIdBL1AN)
**Method:** GET
**Path:** `/job-queue-status`

**Input parameters:**

```xanoscript
input {
  integer user_id { required = false }  // Optional filter
}
```

### Step 4: Implement aggregation queries

For each existing job table, query counts by status:

```xanoscript
db.query "fub_onboarding_jobs" {
  aggregate = {
    group_by = ["status"]
    count = true
  }
  // Optional user filter
  where = $input.user_id ? { user_id: $input.user_id } : {}
} as $onboarding_counts
```

### Step 5: Calculate oldest pending job

```xanoscript
db.query "fub_onboarding_jobs" {
  where = { status: "New" }
  order_by = { created_at: "asc" }
  limit = 1
} as $oldest_job

var $oldest_minutes {
  value = $oldest_job|is_empty ? 0 : (now|subtract:$oldest_job.created_at)|divide:60000
}
```

### Step 6: Build response

Handle missing tables gracefully - if a table doesn't exist, omit from response or show `null`.

## Acceptance

- [ ] **Prerequisite:** Job tables verified against V2 schema
- [ ] **Prerequisite:** Status values discovered and mapped
- [ ] GET `/job-queue-status` returns 200
- [ ] Response format:

```json
{
  "success": true,
  "queues": {
    "onboarding": { "pending": 5, "processing": 2, "complete": 100, "error": 3 },
    "fub_sync": { "pending": 10, "processing": 1 },
    "general": { "pending": 0, "processing": 0 }
  },
  "total_pending": 15,
  "oldest_pending_minutes": 45,
  "tables_checked": ["job_status", "fub_onboarding_jobs", "fub_sync_jobs"],
  "tables_missing": ["fub_worker_queue", "lambda_job_status"]
}
```

- [ ] Optional `user_id` param filters to that user's jobs
- [ ] Missing tables handled gracefully (not errors)
- [ ] Works with zero jobs in queue

## Context

<!-- Updated by plan-sync: fn-5-bsl.1 documented /clear-user-data endpoint but Xano function only clears 6 tables currently (not the full 20+ tables in spec). Job tables (job_status, fub_onboarding_jobs, fub_sync_jobs) may not be fully cleared. Enhancement needed in Xano console. -->

**URL:** `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN/job-queue-status`

```bash
# Get all queue status
curl -s "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN/job-queue-status"

# Filter to specific user
curl -s "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN/job-queue-status?user_id=60"
```

## Done summary

Documented /job-queue-status endpoint in mcp-endpoints.ts and added SYSTEM Endpoints section to CLAUDE.md with expected response format and usage. Noted that Xano function needs to be created.

## Evidence

- Commits: 97ab389
- Tests: pnpm lint
- PRs:
