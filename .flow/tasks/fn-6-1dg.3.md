# fn-6-1dg.3 Add skip_job_check to /test-function-8062-network-downline

## Description

Add skip_job_check and user_id parameters to enable direct testing of the network downline function without requiring a pending onboarding job.

## Acceptance

- [x] Function 8062 accepts skip_job_check and user_id parameters
- [x] When skip_job_check=true and user_id provided, bypasses job queue lookup
- [x] Endpoint 17477 passes skip_job_check through (defaults to true for testing)
- [x] Function returns proper FP Result Type response
- [x] Network downline processing actually works (creates network_member records)

## Done summary

FULLY WORKING - skip_job_check + replaced Archive function with new Worker.

### Changes Made:

1. **Function 8062** (Workers/reZEN - Onboarding Process Network Downline):
   - Added `user_id?` and `skip_job_check?` optional inputs
   - Now calls `Workers/Network - Update Downline From Staging` (NEW)
   - Was calling `Archive/[FN]-[REZEN]-[DOWNLINE]-Update_data_from_nw_downline_dump_table` (broken)

2. **Function 11253** (Workers/Network - Update Downline From Staging) - NEW:
   - Replaces broken Archive function 5530
   - Uses V2 schema: `network_member` table (not V1 "network" table)
   - Fixed JOIN syntax issue: removed `table: ""` that caused "missing bind parameter - dbo"
   - Separate lookups for user → agent → agent_id_raw
   - Properly creates/updates network_member records

3. **Endpoint 17477** (test-function-8062-network-downline):
   - Added `skip_job_check?` optional input (defaults to true)

### Root Causes Fixed:

1. **Archive function 5530 issues**:
   - Empty table names (`db.get ""` instead of `db.get network`)
   - V1 "network" table doesn't exist in V2 (now `network_member`)
   - JOIN syntax with `table: ""` causes "missing bind parameter - dbo" error

2. **Schema differences V1 → V2**:
   - V1: `network` table with `network_id` field
   - V2: `network_member` table with `network_id_raw` field
   - `agent_id_raw` is on `agent` table, not `user` table

### Final Test Result:

```json
{
  "input_user_id": 60,
  "skip_job_check": true,
  "function_result": {
    "success": true,
    "error": null,
    "step": "count_remaining",
    "data": {
      "job_id": "direct_test",
      "user_id": 60,
      "remaining_items": 1349,
      "downline_update": {
        "success": true,
        "processed": 100,
        "total_staged": 100
      }
    }
  }
}
```

## Evidence

- Commits: Functions 8062, 11253 (new), endpoint 17477 updated in Xano V2
- Tests: curl POST test-function-8062-network-downline user_id=60 - processes 100 records per call
- PRs: N/A (Xano backend changes)
