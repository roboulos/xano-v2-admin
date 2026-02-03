# fn-5-bsl.3 Fix /test-function-8066-team-roster (WORKERS)

## Description

Function returns `success: false` with empty error message. Root cause needs to be verified before implementing fix.

## Acceptance

- [x] **Prerequisite:** Function ID verified (8066)
- [x] **Prerequisite:** Function stack inspected in Xano
- [x] **Prerequisite:** Actual error source identified and documented
- [x] POST with `{"user_id": 60}` returns `success: true`
- [x] Response includes team roster data (teams_processed: 4)
- [x] Error messages properly captured if failure occurs
- [x] Graceful handling for users without teams

## Done summary

**COMPLETED in task fn-6-1dg.2** - Same work, different epic tracking.

### Root Causes Fixed:

1. **Function 8097** (Roster Lambda Comparison) - Safe accessor for lambda error field
   - `$lambda_result.error` → `$lambda_result|get:"error":null`

2. **Function 8066** (Team Roster Sync) - Multiple issues:
   - Wrong credentials table (`user_credentials` → `credentials`)
   - Wrong agent_id source (user.agent_id=1 → credentials.agent_id=37208)
   - Missing user.agent_id_raw
   - Wrong lambda result path

3. **Function 8094** (Roster Counts) - Fixed table name and API domain
   - `user_credentials` → `credentials` table
   - `yoda.therealbrokerage.com` → `yenta.therealbrokerage.com`

### Test Result:

```json
{
  "success": true,
  "function_result": {
    "success": true,
    "data": {
      "message": "Team roster sync completed",
      "teams_processed": 4,
      "new_agents": 0,
      "inactive_agents": 0
    }
  }
}
```

## Evidence

- Commits: e4a9312 (xano-v2-admin fn-6-1dg epic)
- Tests: curl POST test-function-8066-team-roster user_id=60 - returns success:true
- PRs: N/A (Xano backend changes)
