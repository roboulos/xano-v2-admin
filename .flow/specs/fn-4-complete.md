# Complete V2 Migration - Fix All Remaining Issues

## Problem

The V2 System Logic Verification (fn-3-lv0) is complete, but several production issues remain that prevent V2 from being fully operational:

```
CRITICAL ISSUES:
├── 🔴 Metrics Create Snapshot failing hourly ("Missing param: field_value")
├── 🔴 FUB data gap at 87% (1.49M fub_people records missing)
├── 🟡 Daily sync: 9/11 steps pass (Lambda Coordinator 502, Network Downline skipped)
├── 🟡 192 Frontend API endpoints unverified (all "pending" status)
└── 🟢 SkySlope integration now working (fixed in fn-3-lv0.3)
```

## Scope

### In Scope

1. Fix Metrics Create Snapshot XanoScript error
2. Diagnose and process FUB data backlog
3. Fix remaining daily sync failures (Lambda Coordinator 502)
4. Verify frontend API endpoints work correctly
5. Run comprehensive validation suite
6. Document completion status

### Out of Scope

- Frontend UI changes (only backend/API work)
- New feature development
- V1 deprecation (separate decision)

## Tasks

### Task 1: Fix Metrics Create Snapshot (fn-4-complete.1)

**Size:** S | **Risk:** Low

**Problem:** Background task 2433 "Metrics - Create Snapshot V3" fails hourly with "Missing param: field_value"

**Approach:**

1. Use xano-mcp to get function 8140 (Workers/Metrics - Create Snapshot) code
2. Find the dbGet call with missing field_value parameter
3. Fix the XanoScript to include proper field_name/field_value syntax
4. Test via creating test endpoint or direct curl
5. Verify error logs stop showing this failure

**Key Context:**

- Function ID: 8140
- Background Task ID: 2433
- Schedule: Hourly (freq: 3600 seconds)
- Error discovered in `error logs` table during fn-3-lv0 testing

**Acceptance:**

- [ ] Function 8140 updated with correct dbGet syntax
- [ ] No new "Missing param: field_value" errors in logs
- [ ] Background task completes successfully

---

### Task 2: Diagnose FUB Data Gap (fn-4-complete.2)

**Size:** M | **Risk:** Medium

**Problem:** FUB tables have 87-90% less data than V1:

- fub_people: V1=1,718,427 → V2=226,839 (-87%)
- fub_calls: V1=5,461,026 → V2=571,383 (-90%)

**Approach:**

1. Check FUB sync configuration (is it syncing all accounts or just active?)
2. Review FUB Lambda Coordinator (function 8118) - currently returns 502
3. Check fub_onboarding_jobs table for pending/failed jobs
4. Determine if gap is intentional (active users only) or bug
5. If bug: create backfill strategy

**Key Context:**

- FUB Lambda uses `ad_user_id` not `user_id`
- Also requires `endpoint_type` param (people|events|calls|appointments|deals|textMessages)
- Test endpoint: `/test-function-8118-lambda-coordinator`

**Acceptance:**

- [ ] Root cause identified (intentional scope vs bug)
- [ ] If bug: fix applied or backfill plan documented
- [ ] FUB sync endpoints pass validation

---

### Task 3: Fix Daily Sync Failures (fn-4-complete.3)

**Size:** S | **Risk:** Low

**Problem:** 2/11 daily sync steps failing:

- FUB Lambda Coordinator: 502 Bad Gateway
- Network Downline: Skipped (no pending onboarding jobs)

**Approach:**

1. Debug Lambda Coordinator 502 - likely timeout or XanoScript error
2. For Network Downline: verify skip behavior is intentional when no pending jobs
3. Run full validate:daily-sync after fixes
4. Ensure all 11 steps pass or have documented skip reasons

**Key Context:**

- Validation script: `scripts/validation/validate-daily-sync.ts`
- Latest report: `validation-reports/daily-sync-2026-01-26T21-48-17-138Z.json`
- Current: 9 passed, 1 failed, 1 skipped

**Acceptance:**

- [ ] Lambda Coordinator returns 200 (not 502)
- [ ] Network Downline skip behavior documented/accepted
- [ ] Daily sync validation: 10/11 pass (or 11/11)

---

### Task 4: Verify Frontend API Endpoints (fn-4-complete.4)

**Size:** L | **Risk:** Medium

**Problem:** 192 frontend API endpoints defined but none verified as working

**Approach:**

1. Prioritize critical endpoints (auth, transactions, listings, agents)
2. Create curl test script for each category
3. Test with user 60 (verified test user)
4. Mark endpoints as verified/broken in tracking
5. Fix any critical broken endpoints

**Key Context:**

- Endpoints defined in: `lib/frontend-api-v2-endpoints.ts`
- Base URL: `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I`
- Categories: core, data, integrations, admin, page_builder, fub

**Priority Order:**

1. Core: user/profile, transactions, listings, team
2. Data: analytics, metrics
3. Integrations: reZEN, FUB, SkySlope
4. Admin: users, settings
5. Page Builder: charts, widgets

**Acceptance:**

- [ ] Critical endpoints (core) tested and working
- [ ] Data endpoints tested and working
- [ ] Integration endpoints tested and working
- [ ] Broken endpoints documented with error details

---

### Task 5: Run Comprehensive Validation (fn-4-complete.5)

**Size:** S | **Risk:** Low

**Problem:** Need final validation that all V2 systems are operational

**Approach:**

1. Run all validation scripts:
   - `npm run validate:tables` (193 tables)
   - `npm run validate:functions` (270 functions)
   - `npm run validate:endpoints` (801 endpoints)
   - `npm run validate:references` (156 foreign keys)
2. Run daily sync validation: `npm run validate:daily-sync`
3. Check pipeline health endpoint: `/pipeline-health-check`
4. Generate final status report

**Acceptance:**

- [ ] Tables: 100% pass
- [ ] Functions: 95%+ pass
- [ ] Endpoints: 96%+ pass
- [ ] References: 100% pass
- [ ] Daily sync: 90%+ pass
- [ ] Pipeline health: All green

---

### Task 6: Document Completion Status (fn-4-complete.6)

**Size:** S | **Risk:** Low

**Problem:** Need clear documentation of what's done and what remains

**Approach:**

1. Update V2 Operations Manual with final status
2. Document any known limitations or pending items
3. Create runbook for ongoing monitoring
4. Update PROJECT_HISTORY.md with completion milestone

**Acceptance:**

- [ ] Operations Manual updated
- [ ] Known limitations documented
- [ ] Monitoring runbook created
- [ ] Project marked complete (or remaining items clearly listed)

---

## Dependencies

```
Task 1 (Metrics) ──────────────────────────────────────────────┐
Task 2 (FUB Gap) ─────────────────────────────────────────────┤
Task 3 (Daily Sync) ──────────────────────────────────────────┼──> Task 5 (Validation) ──> Task 6 (Documentation)
Task 4 (Frontend API) ────────────────────────────────────────┘
```

Tasks 1-4 can run in parallel. Task 5 depends on 1-4. Task 6 depends on 5.

## Quick Commands

```bash
# Fix Metrics function
mcp__xano-mcp__execute --tool_id=get_function --arguments='{"function_id": 8140}'

# Test FUB Lambda Coordinator
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4psV7fp6/test-function-8118-lambda-coordinator" \
  -H "Content-Type: application/json" \
  -d '{"ad_user_id": 60, "endpoint_type": "people"}'

# Run daily sync validation
npm run validate:daily-sync

# Check pipeline health
curl -s "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:Lrekz_3S/pipeline-health-check" | jq

# Run all validators
npm run validate:all
```

## Success Criteria

**Project Complete When:**

1. ✅ No hourly Metrics errors in logs
2. ✅ FUB gap explained (intentional) or fixed (<10% gap)
3. ✅ Daily sync: 10/11+ steps passing
4. ✅ Frontend critical endpoints verified working
5. ✅ All validation scores at target thresholds
6. ✅ Documentation updated with final status

## References

- Epic fn-3-lv0: V2 System Logic Verification (completed)
- `.flow/docs/050-V2-OPERATIONS-MANUAL.md` - Operations Manual
- `.flow/docs/030-CORRECTED-v1-v2-gap-analysis.md` - Data gap analysis
- `lib/mcp-endpoints.ts` - All endpoint definitions
- `scripts/validation/` - Validation scripts
