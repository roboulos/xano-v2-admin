# Dogfood Testing Report - xano-v2-admin

**Date:** 2026-02-05
**Tester:** Truffle Dog (Adversarial Testing Mode)

## Executive Summary

Systematic testing of the xano-v2-admin application - a V1→V2 Migration Admin Interface built with Next.js 16, React 19, and Tailwind CSS 4.

## Issues Found & Fixed

### ✅ FIXED: Contributions Table Name Mismatch

**Issue:** `/api/users/[id]/comparison` was querying wrong V1 table name

- **Symptom:** `SyntaxError: Unexpected non-whitespace character after JSON` for contributions
- **Root Cause:** Code used `'contribution'` (singular) but V1 table is `'contributions'` (plural)
- **Fix:** Changed line 546 in `app/api/users/[id]/comparison/route.ts`
- **Verification:** `curl http://localhost:3001/api/users/7/comparison` now returns no errors
- **Commit:** `ce030bc`

### ✅ FIXED: Endpoint Health Check - GET Query Params

**Issue:** Health check sending GET requests with body instead of query params

- **Symptom:** 400 errors on `/staging-status`, `/onboarding-status`, `/staging-unprocessed`
- **Root Cause:** Health check code was passing `user_id` in body for GET requests, but Xano expects query params
- **Fix:** Updated `testEndpoint()` to build query string for GET requests
- **Verification:** Health check now passes 26/28 tests (was 22/28)
- **Commit:** `6b538e4`

### ✅ FIXED: Reset Transaction Errors - Missing Param

**Issue:** `/reset-transaction-errors` endpoint returning 400

- **Symptom:** HTTP 400 error during health check
- **Root Cause:** Endpoint requires `batch_size` parameter in addition to `user_id`
- **Fix:** Added `additionalParams: { batch_size: 100 }` to mcp-endpoints config, updated health check to merge additional params
- **Verification:** Endpoint now passes health check
- **Commit:** `6b538e4`

## API Route Status

### ✅ Working Endpoints

| Endpoint                         | Status  | Notes                                           |
| -------------------------------- | ------- | ----------------------------------------------- |
| `GET /api/users/list`            | ✅ PASS | User search working correctly                   |
| `GET /api/users/[id]/comparison` | ✅ PASS | V1/V2 comparison (after fix)                    |
| `GET /api/staging/status`        | ✅ PASS | Staging table counts                            |
| `GET /api/v1/tables`             | ✅ PASS | V1 table listing                                |
| `GET /api/v2/tables`             | ✅ PASS | V2 table listing                                |
| `GET /api/v2/functions`          | ✅ PASS | V2 functions listing                            |
| `GET /api/v2/endpoints/health`   | ✅ PASS | Endpoint health check (26/28 passing after fix) |
| `GET /api/v2/background-tasks`   | ✅ PASS | Background tasks listing                        |
| `GET /api/staging/unprocessed`   | ✅ PASS | Unprocessed staging records (after fix)         |

### ⚠️ Known Limitations

#### V1 User Data Access

**Status:** EXPECTED LIMITATION (documented)

- **Issue:** `/api/users/[id]/comparison` returns `null` for V1 user/agent data
- **Root Cause:** Snappy CLI (`lib/snappy-client.ts`) cannot query auth-enabled tables (user, agent, etc.)
- **Workaround:** V2 has dedicated Xano endpoint at `api:g79A_W7O/user-comparison-data`
- **Future:** Need V1 equivalent endpoint to bypass CLI limitation
- **Impact:** V1 vs V2 user comparison shows V2 data only, but this is known per CLAUDE.md

#### Test Script Endpoint Path

**Status:** TEST SCRIPT ERROR (not production bug)

- **Issue:** Test tried to call `/api/v2/endpoints` which returns 404
- **Actual Path:** `/api/v2/endpoints/health`
- **Impact:** None - just a test script bug, not a real application bug

## Frontend Testing Status

### Browser Session Issues

**Problem:** Agent-browser daemon repeatedly crashes during interactive testing

- Multiple `Daemon failed to start` errors
- Prevents systematic UI tab testing

**Mitigation:** Switched to API-first testing approach

- All backend routes verified via curl
- UI testing deferred until browser stability improves

### Tabs to Test (Pending Stable Browser)

From `app/page.tsx` ViewMode types:

1. ⏳ **Transformation Story** - Default view, tables transformation
2. ⏳ **V1 vs V2** - Table comparison view
3. ⏳ **Proof System** - Interactive comparison panel
4. ⏳ **Onboarding Steps** - 6-step progress (requires user selection)
5. ⏳ **Job Queues** - Background tasks status (requires user)
6. ⏳ **Sync Pipelines** - V1→Staging→V2 flow (requires user)
7. ⏳ **Schema Map** - V1→V2 table mapping visualization
8. ⏳ **Webhooks** - Webhook configuration and events
9. ⏳ **Function Health** - V2 function inventory

## Test Data

### Verified Test User

- **User ID:** 7
- **Name:** David Keener
- **Email:** dave@premieregrp.com
- **Agent ID:** 492
- **Status:** Working in V2, limited in V1 (expected)

## Next Steps

1. **Browser Stability** - Resolve agent-browser daemon crashes before continuing UI testing
2. **V1 Meta API** - Create V1 comparison endpoint similar to V2's `api:g79A_W7O`
3. **Systematic UI Testing** - Once browser stable, go through all 9 tabs with user 7 selected
4. **Flow Testing** - Test complete user journeys:
   - User selection → comparison panel → data refresh
   - Onboarding steps → job queue → sync pipeline
   - Schema mapping → validation → function health

## Grading (Backend Only - UI Pending)

**Backend API Routes: B+**

- ✅ All core routes functional
- ✅ Error handling works correctly
- ✅ V1 limitation is documented
- ⚠️ One table name bug fixed
- ⚠️ V1 user data access needs work

**Overall Status:** Backend solid with 3 bugs fixed. UI testing blocked by browser daemon instability.

## Summary of Fixes

1. **Contributions table name** - Fixed V1 table query
2. **GET query params** - Fixed health check to use query strings for GET requests (fixed 3 endpoints)
3. **Additional params** - Added support for endpoints requiring extra parameters beyond user_id (fixed 1 endpoint)

**Impact:** Improved endpoint health from 78.6% (22/28) to 92.9% (26/28) passing.
