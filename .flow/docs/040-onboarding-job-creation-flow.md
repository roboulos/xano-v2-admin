# Onboarding Job Creation Flow

> Task fn-3-lv0.5: Document how onboarding jobs are created

## Overview

This document explains how onboarding jobs are created in V2, which is the critical first step before any onboarding processing can occur. Currently there is only 1 job in `rezen_onboarding_jobs` (user_id: 72, status: Complete).

---

## The Problem: Network Downline Sync SKIPS

When running the daily sync cycle:

```
Network Downline: SKIPPED - "No pending onboarding jobs"
```

This happens because:

1. The `Tasks/reZEN - Onboarding Start Job` function polls for jobs with status = "New"
2. Only 1 job exists, and it has status = "Complete"
3. No new jobs have been created for other users

---

## Job State Machine

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           ONBOARDING JOB STATES                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   [No Record]  ─────create────►  [New]  ─────start────►  [Started]                  │
│                                                              │                       │
│                                                              │                       │
│                                                    success   │   errors              │
│                                                              ▼                       │
│                                          [Complete] ◄────────┼────────► [Partial]   │
│                                                              │                       │
│                                                              │                       │
│                                                         exception                    │
│                                                              │                       │
│                                                              ▼                       │
│                                                          [Error]                     │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

**Status Values:**

- `New` - Job created, waiting to be processed
- `Started` - Orchestrator has picked up the job and is processing
- `Complete` - All steps succeeded (0 errors)
- `Partial` - Some steps failed (1+ errors)
- `Error` - Exception during processing

---

## How to Create an Onboarding Job

### Method 1: Direct Worker Call (Recommended for Testing)

**Endpoint:** `POST /api:4UsTtl3m/trigger-rezen-create-onboarding-job`

**Function:** `Workers/reZEN - Create Onboarding Job` (ID: 8299)

```bash
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/trigger-rezen-create-onboarding-job" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 60
  }'
```

**Response (new job created):**

```json
{
  "success": true,
  "worker_id": 8299,
  "worker_name": "Workers/reZEN - Create Onboarding Job",
  "result": {
    "success": true,
    "data": {
      "job_id": 7,
      "status": "New",
      "created_new": true,
      "message": "Onboarding job created"
    },
    "error": null,
    "meta": {
      "function_name": "Workers/reZEN - Create Onboarding Job",
      "timestamp": 1737900000000
    }
  }
}
```

**Response (job already complete):**

```json
{
  "success": true,
  "data": {
    "job_id": 6,
    "status": "Complete",
    "created_new": false,
    "message": "Onboarding already completed"
  }
}
```

### Method 2: Via Admin Trigger

**Endpoint:** `POST /api:4UsTtl3m/admin/trigger-onboarding`

This endpoint runs `Tasks/reZEN - Onboarding Start Job` which polls for existing "New" jobs and processes them.

```bash
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/admin/trigger-onboarding" \
  -H "Content-Type: application/json"
```

**Note:** This does NOT create a job - it only processes existing jobs with status = "New".

### Method 3: Background Task (Automatic)

**Task ID:** 2385 - `reZEN - Onboarding - Start Onboarding Job V3`

This background task polls every 3 minutes for jobs with status = "New" and processes them.

---

## Worker Function: Create Onboarding Job (8299)

**Inputs:**
| Parameter | Type | Required | Description |
|------------|------|----------|-----------------------|
| user_id | int | Yes | User to onboard |
| agent_name | text | No | Optional display name |

**Logic:**

1. Validate user_id is provided
2. Check if job already exists for this user
3. If job exists with status "Complete", return early (already done)
4. Use `db.add_or_edit` to create or update job with status = "New"

**XanoScript (simplified):**

```xanoscript
// Check for existing job
db.get rezen_onboarding_jobs {
  field_name = "user_id"
  field_value = $input.user_id
} as $existing_job

// Early return if already complete
if ($existing_job != null && $existing_job.status == "Complete") {
  return { success: true, created_new: false, message: "Onboarding already completed" }
}

// Create or update job
db.add_or_edit rezen_onboarding_jobs {
  field_name = "user_id"
  field_value = $input.user_id
  data = {
    user_id: $input.user_id,
    status: "New",
    transaction_data_loaded: false,
    listing_data_loaded: false,
    network_loaded: false
  }
} as $job

return { success: true, job_id: $job.id, created_new: true }
```

---

## Task Function: Start Onboarding Job (7981)

**Endpoint:** `POST /api:4psV7fp6/onboarding-start-job`

**Logic:**

1. Query for jobs with status = "New" (limit 1)
2. If no jobs found, return `{ status: "no_jobs" }`
3. If job found, call `Workers/reZEN - Onboarding Orchestrator` with user_id
4. Orchestrator processes all 9 steps and updates job status

**XanoScript (simplified):**

```xanoscript
db.query rezen_onboarding_jobs {
  where = $db.rezen_onboarding_jobs.status == "New"
  sort = { id: "asc" }
  return = { type: "list", paging: { page: 1, per_page: 1 } }
} as $new_jobs

if ($new_jobs|count > 0) {
  $job = $new_jobs|first
  function.run "Workers/reZEN - Onboarding Orchestrator" {
    input = { user_id: $job.user_id }
  }
}
```

---

## rezen_onboarding_jobs Table Schema (86 fields)

### Core Fields

| Field       | Type      | Description                  |
| ----------- | --------- | ---------------------------- |
| id          | int       | Primary key                  |
| created_at  | timestamp | When job was created         |
| user_id     | int       | FK to user table             |
| status      | text      | New/Started/Complete/Partial |
| name        | text      | Agent name (optional)        |
| lastupdated | timestamp | Last progress update         |
| started     | timestamp | When processing started      |
| ended       | timestamp | When processing ended        |

### Step Tracking Fields (per step)

Each onboarding step has 3 fields:

- `{step}_started` - Timestamp when step began
- `{step}` - Boolean flag (true when complete)
- `{step}_ended` - Timestamp when step finished

| Step                    | Started Field                     | Flag                      | Ended Field                     |
| ----------------------- | --------------------------------- | ------------------------- | ------------------------------- |
| Team Members            | team_members_started              | team_members              | team_members_ended              |
| Transaction Data        | transaction_data_started          | transaction_data          | transaction_data_ended          |
| Transaction Data Loaded | -                                 | transaction_data_loaded   | -                               |
| Open Transactions       | -                                 | open_transactions         | -                               |
| Closed Transactions     | -                                 | closed_transactions       | -                               |
| Terminated Transactions | -                                 | terminated_transactions   | -                               |
| Listing Data            | listing_data_started              | listing_data              | listing_data_ended              |
| Listing Data Loaded     | -                                 | listing_data_loaded       | -                               |
| Open Listings           | -                                 | open_listings             | -                               |
| Closed Listings         | -                                 | closed_listings           | -                               |
| Terminated Listings     | -                                 | terminated_listings       | -                               |
| Network                 | network_started                   | network                   | network_ended                   |
| Network Loaded          | -                                 | network_loaded            | -                               |
| Network Cap Data        | network_cap_data_started          | network_cap_data          | network_cap_data_ended          |
| Network Frontline       | network_frontline_started         | network_frontline         | network_frontline_ended         |
| Sponsor Tree            | sponsor_tree_started              | sponsor_tree              | sponsor_tree_ended              |
| Equity                  | equity_started                    | equity                    | equity_ended                    |
| RevShare Payments       | pending_revshare_payments_started | pending_revshare_payments | pending_revshare_payments_ended |
| Contributions           | contributions_started             | contributions             | contributions_ended             |
| Contributions Loaded    | -                                 | contributions_loaded      | -                               |
| Pending Contributions   | pending_contributions_started     | pending_contributions     | pending_contributions_ended     |
| Contributors            | contributors_started              | contributors              | contributors_ended              |

### Error Tracking Fields

| Field              | Type | Description                  |
| ------------------ | ---- | ---------------------------- |
| error_members      | bool | Team members step had error  |
| error_transactions | bool | Transactions step had error  |
| error_listings     | bool | Listings step had error      |
| error_keydata      | bool | Key data step had error      |
| error_counts       | bool | Counts step had error        |
| error_email        | bool | Email notification had error |
| code               | text | Error code                   |
| message            | text | Error message                |
| result             | json | Full result object           |

---

## Current State (January 2026)

```sql
-- Query: SELECT id, user_id, status, created_at FROM rezen_onboarding_jobs
```

| id  | user_id | status   | created_at              |
| --- | ------- | -------- | ----------------------- |
| 6   | 72      | Complete | 2025-12-26 17:55:05.302 |

**Only 1 job exists** - for user 72, already completed.

---

## How to Onboard a New User (Full Flow)

### Step 1: Create the Job

```bash
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/trigger-rezen-create-onboarding-job" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 60
  }'
```

### Step 2: Trigger Processing (or wait for background task)

```bash
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/admin/trigger-onboarding" \
  -H "Content-Type: application/json"
```

Or wait ~3 minutes for background task 2385 to pick it up.

### Step 3: Check Status

```bash
curl -X GET "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN/onboarding-status?user_id=60"
```

---

## Background Tasks (V3 - Active)

| Task ID                            | Name                                          | Function                           | Frequency |
| ---------------------------------- | --------------------------------------------- | ---------------------------------- | --------- |
| 2385                               | reZEN - Onboarding - Start Onboarding Job V3  | Tasks/reZEN - Onboarding Start Job | 3 min     |
| 2386                               | reZEN - Onboarding - Load Transactions V3     | Individual step                    | On demand |
| 2387                               | reZEN - Onboarding - Load Listings V3         | Individual step                    | On demand |
| 2388                               | reZEN - Onboarding - Load Network Downline V3 | Individual step                    | On demand |
| ... (30+ onboarding-related tasks) |

---

## Key Functions Summary

| ID   | Function Name                           | Purpose                       |
| ---- | --------------------------------------- | ----------------------------- |
| 8299 | Workers/reZEN - Create Onboarding Job   | Creates job with status="New" |
| 7981 | Tasks/reZEN - Onboarding Start Job      | Polls for New jobs, triggers  |
| 8297 | Workers/reZEN - Onboarding Orchestrator | Main 9-step processing engine |

---

## Why Network Downline Sync SKIPS

The daily sync logic for network downline checks for pending onboarding jobs:

```xanoscript
db.query rezen_onboarding_jobs {
  where = $db.rezen_onboarding_jobs.status == "New"
} as $pending_jobs

if ($pending_jobs|count == 0) {
  return { status: "skipped", message: "No pending onboarding jobs" }
}
```

**Resolution:** Create onboarding jobs for users who need network data synced.

---

## Testing: Create Job for User 60 (Verified Test User)

```bash
# Step 1: Create the job
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/trigger-rezen-create-onboarding-job" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 60
  }'

# Step 2: Trigger processing
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/admin/trigger-onboarding" \
  -H "Content-Type: application/json"

# Step 3: Check onboarding-start-job (should find the new job)
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4psV7fp6/onboarding-start-job" \
  -H "Content-Type: application/json"
```

---

## Endpoint Quick Reference

| Endpoint                               | Group   | Purpose                   |
| -------------------------------------- | ------- | ------------------------- |
| `/trigger-rezen-create-onboarding-job` | WORKERS | Create job for user       |
| `/admin/trigger-onboarding`            | WORKERS | Process pending jobs      |
| `/onboarding-start-job`                | TASKS   | Poll and process new jobs |
| `/onboarding-status`                   | SYSTEM  | Check job status          |
| `/test-fp-onboarding-orchestrator`     | WORKERS | Direct orchestrator test  |

---

_Generated: 2026-01-26_
_Task: fn-3-lv0.5_
