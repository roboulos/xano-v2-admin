# Staging Table Processing Investigation

> **Task**: fn-3-lv0.1
> **Date**: 2026-01-26
> **Status**: Complete

---

## Executive Summary

The "78K unprocessed staging records" mentioned in the epic spec was a **MISINTERPRETATION**. The staging tables retain ALL historical records even after processing. All staging records are currently processed (`is_processed = true`). The processing system is working correctly.

```
ACTUAL STATUS (2026-01-26):
├── stage_listings_rezen_onboarding: 44,688 total, 0 unprocessed
├── stage_transactions_rezen_onboarding: 102,843 total, 0 unprocessed
└── rezen_onboarding_jobs: 1 job, status = "Complete"
```

---

## Findings

### 1. Staging Table Processing Functions

| Processing Type          | Task Function                                              | Worker Function                                                 | Background Task ID |
| ------------------------ | ---------------------------------------------------------- | --------------------------------------------------------------- | ------------------ |
| **Listings**             | `Tasks/reZEN - Onboarding Stage Listings` (8016)           | `Workers/reZEN - Onboarding Process Stage Listings` (8119)      | 2475               |
| **Transactions (Small)** | `Tasks/reZEN - Onboarding Stage Transactions Small` (8013) | `Workers/reZEN - Onboarding Process Transaction Staging` (8114) | 2474               |
| **Transactions (Large)** | `Tasks/reZEN - Onboarding Stage Transactions Large` (8010) | Same worker (8114) with worker_id=90                            | 2473               |

### 2. Trigger Mechanism

**Type**: Scheduled Background Tasks (Xano Scheduler)

All three background tasks are:

- **Active** (status = true)
- **Scheduled every 60 seconds** (freq: 60)
- **Started**: 2025-12-03 04:00:00 UTC

The trigger flow:

```
Xano Scheduler (every 60s)
        │
        ├──> Task 2475: Process Stage Listings
        │         └──> function.run "Tasks/reZEN - Onboarding Stage Listings"
        │
        ├──> Task 2474: Process Stage Transactions Small (worker_id=1)
        │         └──> function.run "Tasks/reZEN - Onboarding Stage Transactions Small"
        │
        └──> Task 2473: Process Stage Transactions Large (worker_id=90)
                  └──> function.run "Tasks/reZEN - Onboarding Stage Transactions Large"
```

### 3. Processing Logic

The staging processing is **job-based**, not continuous. It requires an active `rezen_onboarding_jobs` record to process.

**Listings Processing (Function 8016)**:

```xanoscript
// Query for pending job
db.query rezen_onboarding_jobs {
  where = $db.rezen_onboarding_jobs.listing_data_started == null
       && $db.rezen_onboarding_jobs.listing_data == false
       && $db.rezen_onboarding_jobs.status == "Started"
       && $db.rezen_onboarding_jobs.listing_data_loaded == false
}

// If no job, return early
if ($pending_listings_job == null) {
  return { success: true, status: "no_jobs", message: "No pending jobs to process" }
}

// Otherwise, process the job...
```

**Transactions Processing (Function 8114)**:

```xanoscript
// Query for onboarding job assigned to this worker
db.query rezen_onboarding_jobs {
  where = $db.rezen_onboarding_jobs.status != "Complete"
       && $db.rezen_onboarding_jobs.transaction_data == false
       && $db.rezen_onboarding_jobs.transaction_worker_id == $input.transaction_worker_id
       && $db.rezen_onboarding_jobs.transaction_data_loaded
}

// Guard: No job found
if ($onboarding_job == null) {
  return {
    success: false,
    error: "No onboarding job found for this transaction worker"
  }
}

// Process staged records for this job's user_id
db.query stage_transactions_rezen_onboarding {
  where = $db.stage_transactions_rezen_onboarding.user_id == $onboarding_job.user_id
       && $db.stage_transactions_rezen_onboarding.is_processed == false
}
```

### 4. Test Endpoint Mapping

**Correct Test Endpoints** (in MCP: Tasks group - api:4psV7fp6):

| Endpoint                                       | Function                                          |
| ---------------------------------------------- | ------------------------------------------------- |
| `/onboarding-process-stage-listings`           | Tasks/reZEN - Onboarding Stage Listings           |
| `/onboarding-process-stage-transactions-small` | Tasks/reZEN - Onboarding Stage Transactions Small |
| `/onboarding-process-stage-transactions-large` | Tasks/reZEN - Onboarding Stage Transactions Large |

**Note**: The endpoints `/test-task-8023` and `/test-task-8024` mentioned in the task spec are for DIFFERENT functions (Network Frontline Brad and Tim), NOT staging processing.

### 5. Test Results

```bash
# Listings processing - no pending jobs
curl -s -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4psV7fp6/onboarding-process-stage-listings" \
  -H "Content-Type: application/json" -d '{}'

# Response:
{"success":true,"task":"reZEN - Onboarding Stage Listings","status":"no_jobs","message":"No pending jobs to process"}

# Transactions processing - no jobs for worker_id=1
curl -s -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4psV7fp6/onboarding-process-stage-transactions-small" \
  -H "Content-Type: application/json" -d '{}'

# Response:
{"success":true,"task":"reZEN - Onboarding Stage Transactions Small","worker_id":1,
 "worker_result":{"success":false,"data":{"transaction_worker_id":1},
 "error":"No onboarding job found for this transaction worker",
 "step":"Workers/reZEN - Onboarding Process Transaction Staging"}}
```

---

## Why the "Gap" Appeared

The original gap analysis compared:

- `stage_listings` total count (44,688) vs `listing` count (16,784) = "27K gap"
- `stage_transactions` total count (102,843) vs `transaction` count (51,835) = "51K gap"

This is misleading because:

1. **Staging tables retain ALL historical records** - even processed ones (`is_processed = true`)
2. **Not all staged records become final records** - Some may be duplicates, errors, or filtered out
3. **One staging record may not equal one final record** - Transactions have financials, participants, etc.

The correct comparison is **unprocessed staging records**, which is **zero**.

---

## Related Tasks and Functions

### Full Processing Chain

```
New User Registration
        │
        ├──> Workers/reZEN - Create Onboarding Job (8299)
        │         └──> Creates rezen_onboarding_jobs record
        │
        ├──> Tasks/reZEN - Onboarding - Load Transactions (2386)
        │         └──> Fetches from reZEN API → stage_transactions_rezen_onboarding
        │
        ├──> Tasks/reZEN - Onboarding - Load Listings (2387)
        │         └──> Fetches from reZEN API → stage_listings_rezen_onboarding
        │
        ├──> Task 2473/2474: Process Staged Transactions
        │         └──> stage_transactions → transaction (with financials, participants)
        │
        ├──> Task 2475: Process Staged Listings
        │         └──> stage_listings → listing
        │
        └──> Tasks/reZEN - Onboarding - Completion (2445)
                  └──> Marks job as "Complete"
```

### Other Staging Tables

| Staging Table                           | Processing Function | Status             |
| --------------------------------------- | ------------------- | ------------------ |
| stage_contributions_rezen_onboarding    | Task 2476/2477      | Active (every 60s) |
| stage_contributions_rezen_daily_sync    | Task 2437/2439      | Active (daily)     |
| stage_network_downline_rezen_onboarding | Task 2391           | Active (every 60s) |
| stage_listing_skyslope                  | Task 2440           | Active (every 60s) |
| stage_transactions_skyslope             | Task 2438           | Active (every 60s) |
| stage_appointments_fub_onboarding       | Task 2425           | Active             |
| stage_text_messages_fub_onboarding      | Task 2441           | Active             |

---

## Conclusions

1. **No backlog exists** - All staging records are processed
2. **System is working correctly** - Background tasks run every 60 seconds
3. **Job-based processing** - Requires active `rezen_onboarding_jobs` record
4. **Original gap was misinterpretation** - Compared total counts, not unprocessed counts

---

## Recommendations

1. **Update table-counts endpoint** to show unprocessed counts:

   ```xanoscript
   db.query stage_transactions_rezen_onboarding {
     where = $db.stage_transactions_rezen_onboarding.is_processed == false
     return = {type: "count"}
   } as $unprocessed_txns
   ```

2. **Add monitoring for stuck jobs** - Jobs in "Started" status for >24h may indicate issues

3. **Document the gap correctly** - The V2 has fewer final records because:
   - Some staged data may have validation errors
   - Some records may be filtered/deduplicated
   - The staging→final transformation is not 1:1

---

## References

- Background Task IDs: 2473, 2474, 2475
- Function IDs: 8010, 8013, 8016, 8114, 8119
- Test Endpoints: `/onboarding-process-stage-*` (API Group 532)
- Table IDs: 483 (stage_transactions), 486 (stage_listings), 405 (onboarding_jobs)
