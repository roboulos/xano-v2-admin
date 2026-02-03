# EPIC: V2 Launch - Critical Path (System Integration Verified)

**Status:** UPDATED WITH CARMACK REVIEW - Ready for Implementation
**Priority:** CRITICAL - Launch Blocking
**Timeline:** 11-19 hours (Pre-Launch w/ Risk Mitigations) + 2-4 hours (Launch Day) + 3-5 days (Post-Launch)
**Owner:** Migration Team
**Created:** February 2, 2026
**Updated:** February 2, 2026 (Incorporated Carmack-level architectural review)
**Based On:** System Integration Deep Dive (4-layer verification) + Architectural Risk Assessment
**Launch Readiness:** 62% (Technical solid, operationally fragile) → Target 75% with recommendations

---

## 📊 EXECUTIVE SUMMARY

System Integration Deep Dive verified that V2 is **95%+ technically sound** but **62% operationally ready** (Carmack review). The plan correctly identifies critical blockers but underestimates timeline and missing contingencies.

**3 Critical Recommendations Implemented:**

1. ✅ **Pre-Launch Aggregation Dry-Run** (NEW Task 1.0: 30-60 min) - Catch timeout issues early
2. ✅ **Degraded Mode Fallback** (NEW Task 1.1.5) - Allow launch if webhook fix fails
3. ✅ **Production Load Testing** (NEW Task 2.5: 1-2 hours) - Prevent surprise failures

| Issue                                  | Severity    | Impact                                      | Original Est    | Realistic |
| -------------------------------------- | ----------- | ------------------------------------------- | --------------- | --------- |
| Aggregation timeout (unknown at start) | 🔴 CRITICAL | V2 goes live with empty dashboards          | (dry-run added) | 30-60 min |
| reZEN webhook handler broken           | 🔴 CRITICAL | Real-time sync blocked; batch mode fallback | 1-2 hours       | 2-4 hours |
| 10 weekly aggregation tables empty     | 🔴 CRITICAL | Dashboards missing analytics                | 4-6 hours       | 6-9 hours |
| Income aggregation times out           | 🟡 HIGH     | Revenue leaderboard incomplete              | 1-2 hours       | 1-3 hours |
| 4 endpoints broken                     | 🟡 HIGH     | Feature gaps in admin tools                 | (Phase 4)       | (Phase 4) |

**Pre-Launch Work:** 11-19 hours (with risk mitigations)
**Launch Window:** 2-4 hours (V1→V2 cutover)
**Post-Launch:** 3-5 days (complete remaining work)
**Total to 75% Readiness:** +4-5 hours additional prep

---

## ✅ SYSTEM INTEGRATION VERIFICATION RESULTS

### Layer 1: Frontend API Contract ✅ VERIFIED

- All 8 dashboard pages mapped (Dashboard, Transactions, Revenue, Network, Listings, Pipeline, Directory, Settings)
- 60+ endpoints documented and wired in V2
- All pages load successfully with HTTP 200
- Status: **READY FOR PRODUCTION**

### Layer 2: Aggregation Pipeline ⚠️ PARTIALLY WORKING

- Background tasks 3132-3134 active and running every 5-60 min
- Chart aggregation producing 487 records successfully
- Leaderboard rendering correctly
- **ISSUE:** 10 weekly aggregation tables created but empty (never backfilled)
- **ISSUE:** Income aggregation times out after 60s
- Status: **NEEDS P0/P1 BACKFILL BEFORE LAUNCH**

### Layer 3: Webhook Routing ⚠️ BROKEN

- FUB webhooks: ✅ Working, +6,978 new events synced (Jan 27)
- reZEN webhooks: ❌ **BROKEN** - Function reference error (mvpw5:0) in functions 8124/8122
- SkySlope webhooks: ⚠️ Partial (staging only, no real-time)
- Status: **CRITICAL FIX REQUIRED - reZEN webhook handler**

### Layer 4: Integration Data Flow ✅ ACTIVELY SYNCING

- FUB: 226,839 people, 571K calls, 158K events (live syncing)
- reZEN: 51,835 transactions, 16,784 listings, 515K contributions (live syncing)
- SkySlope: 58 records (active processing)
- Staging Queue: 148K records (all being processed)
- Status: **LIVE DATA FLOWING TO V2 RIGHT NOW**

---

## 🎯 PHASE 0.5: PRE-LAUNCH RISK MITIGATION (30-90 min)

### Task 1.0: Pre-Launch Aggregation Dry-Run [30-60 min]

**Why This Matters:** Aggregation backfill is the actual critical path (not webhook fix). If query times out on 52-week dataset during Phase 1, entire launch slips 4+ hours. Test small dataset first.

**Current Risk:** 35% probability that P0 aggregation backfill times out on first attempt

**Actions:**

1. [ ] Select one aggregation table (e.g., `agg_transactions_by_week`)
2. [ ] Run aggregation query on **4-week subset** only (not 52 weeks)
3. [ ] Measure execution time
4. [ ] If <5 min: Proceed to Phase 1 with confidence for 52-week run
5. [ ] If times out or >10 min: STOP and optimize before Phase 1
   - Investigate bottleneck (table size? join complexity? calculation?)
   - Consider chunking strategy (52 weeks → 4 chunks of 13 weeks each)
   - Modify aggregation approach if needed
6. [ ] Document result: "Dry-run passed in X seconds, ready for full backfill"

**Success Criteria:**

- 4-week aggregation completes in <5 minutes
- Query is stable (no memory spikes)
- No timeout errors
- Go decision: "Ready for 52-week backfill in Phase 1"

**If Fails:**

- Optimize query before proceeding
- Estimate impact on Phase 1 timeline
- Consider chunked backfill approach

**Estimated Time:** 30-60 minutes

**Effort:** Xano expert, 1 person

---

## 🎯 PHASE 1: CRITICAL FIXES (8-15 hours REALISTIC - was 5-9 hours optimistic)

### Task 1.1: Fix reZEN Webhook Handler [2-4 hours REALISTIC - was 1-2 hours optimistic]

**Blocker:** reZEN real-time transaction/listing sync not working

**Current State:**

- Functions 8124 (Process Webhook Events) and 8122 (Process Listing Webhooks) have corrupted function reference
- Error: `"Invalid name: mvpw5:0"` when webhooks arrive
- Workaround: 15-min batch sync still works, but real-time broken
- Risk: 25% probability fix takes 4+ hours due to iteration loops

**Actions:**

1. [ ] Inspect `Workers/reZEN - Process Webhook Events` function (8124)
2. [ ] Fix function reference error (mvpw5:0 → correct function ID)
3. [ ] Inspect `Workers/reZEN - Process Listing Webhooks` function (8122)
4. [ ] Fix function reference error
5. [ ] Test with curl: `POST /api:4psV7fp6/test-orchestrator-user-60`
6. [ ] Verify webhook logs show successful processing
7. [ ] Run webhook registration task (7999) to confirm V2 registration with reZEN
8. [ ] IF still broken after 1 hour: Escalate, prepare to proceed with Task 1.1.5 fallback

**Success Criteria:**

- Both functions reference valid function IDs
- Webhook test endpoint returns 200 with success: true
- Webhook processing logs show processed events
- reZEN webhook queue clears successfully

**Rollback:** Revert function stack to last known working version (if available)

**Realistic Time:** 2-4 hours (includes iteration/testing loops)

---

### Task 1.1.5: Validate Batch Sync Fallback [1 hour] ⭐ NEW - Risk Mitigation

**Why This Matters:** If webhook fix fails after 3 hours, we have a fallback. Don't block launch on webhook fix if we can proceed with batch-mode sync.

**Contingency Plan:** "If Task 1.1 not fixed within 3 hours, use this fallback"

**Actions:**

1. [ ] Confirm 15-min batch sync jobs are active (Tasks/reZEN sync tasks)
2. [ ] Test: Disable webhook processing, wait 15 minutes
3. [ ] Verify: Batch sync catches up within 15-min window
4. [ ] Measure: How many transactions sync in 15 min (should be most recent)
5. [ ] Document: "Batch sync provides X transactions/listing per batch"
6. [ ] Decision Protocol: If webhook not fixed by hour 3, use batch-only and proceed to launch

**Success Criteria:**

- 15-min batch sync confirmed working
- Sync catches up within 15-min window
- No data loss with batch-only mode (slight delay OK)
- Team understands fallback is available

**Decision Point:**

- If Task 1.1 fixed: Disable this task, use real-time
- If Task 1.1 not fixed by hour 3: Activate fallback, proceed to Phase 2

**Go/No-Go Decision for Launch:**

- Real-time webhooks: Optimal path
- Batch-only mode: Acceptable path (slight latency, all data flows)
- Both broken: Block launch, investigate

**Estimated Time:** 1 hour (mostly validation, low risk)

**Impact:** Converts Task 1.1 from "CRITICAL BLOCKER" to "HIGH PRIORITY" (workaround exists)

---

### Task 1.2: Create & Backfill P0 Aggregation Tables [4-6 hours REALISTIC - was 2-3 hours optimistic]

**Blocker:** Dashboards show incomplete analytics

**P0 Tables (MUST HAVE) - CRITICAL PATH:**

- `agg_transactions_by_week` - Weekly performance view (empty table exists, needs backfill)
- `agg_fub_activity_by_agent` - Agent productivity leaderboard (empty table exists, needs backfill)

**Current State:**

- Tables created but never backfilled with historical data
- Background tasks run daily but only process new data from previous day
- Dashboards missing weekly trend analysis
- Risk: 35% probability that 52-week backfill times out (MITIGATED by Task 1.0 dry-run)

**Prerequisites:**

- Task 1.0 (Aggregation Dry-Run) MUST complete successfully before this task
- Dry-run validates that aggregation query works on subset
- If dry-run times out: STOP, optimize query, retry

**Actions:**

1. [ ] Create backfill job for `agg_transactions_by_week`
   - Based on Task 1.0 dry-run approach (proven to work)
   - If dry-run used 13-week chunks: apply same chunking here
   - Run aggregation across all historical transaction data
   - Group by week, calculate metrics (count, volume, GCI)
   - Populate for last 52 weeks (or retry with chunks if needed)
2. [ ] Create backfill job for `agg_fub_activity_by_agent`
   - Run aggregation across all FUB activity
   - Group by agent, calculate metrics (calls, appointments, deals)
   - Populate for last 52 weeks
3. [ ] Test: Verify tables populated with non-zero data
4. [ ] Test: Dashboard leaderboard shows data for historical weeks
5. [ ] Schedule: Set up daily aggregation job to maintain these tables
6. [ ] Monitor: Check execution time during testing

**Success Criteria:**

- `agg_transactions_by_week`: 52+ records populated with transaction data (or 13-week chunks if chunked)
- `agg_fub_activity_by_agent`: 52+ records populated with activity data
- Dashboard weekly leaderboard shows historical data
- Both tables update daily via background tasks
- Backfill completes within 60-90 min timeout window

**Realistic Estimated Time:** 4-6 hours

- Dry-run: 30-60 min (Task 1.0)
- Full backfill: 2-4 hours
- Testing + troubleshooting: 1-2 hours

**Critical Success Factor:** If this takes >6 hours, Phase 1 timeline slips and Phase 2 testing gets compressed

---

### Task 1.3: Backfill P1 Aggregation Tables [3-5 hours REALISTIC - was 2-3 hours]

**Priority:** Should have before launch (impacts dashboards)

**Dependencies:**

- Task 1.2 approach validated (lessons from P0 backfill apply here)
- Parallel execution: Can run while Task 1.2 testing happens, but uses same aggregation resources

**P1 Tables:**

- `agg_fub_activity_by_month` - Monthly FUB rollups
- `agg_revenue_by_week` - Weekly revenue views
- `agg_network_by_week` - Weekly network metrics
- `agg_calls_by_direction` - Call analytics (inbound/outbound)
- `agg_calls_by_outcome` - Call outcome tracking (answered/missed/etc)

**Actions:**

1. [ ] Apply lessons from Task 1.2 (chunking strategy if needed)
2. [ ] Create backfill jobs for all 5 tables (same pattern as P0)
3. [ ] Run backfills for last 52 weeks (or chunked if that's what worked for P0)
4. [ ] Verify tables populated with non-zero data
5. [ ] Test: Dashboard sections using these tables render correctly
6. [ ] Schedule: Set up daily/weekly aggregation jobs
7. [ ] Monitor: Check for timeout issues, resource contention

**Success Criteria:**

- All 5 tables populated with historical data (or expected subset if chunked)
- Relevant dashboard sections render without errors
- Background jobs scheduled and active
- No timeout errors during backfill

**Realistic Estimated Time:** 3-5 hours

- Based on P0 lessons learned
- Parallelizable while Task 1.2 testing runs

**Risk:** If P0 backfill takes >6 hours, this cascades into Phase 2

---

### Task 1.4: MOVED TO PHASE 4.2 (Post-Launch Optimization)

**Reason:** Income aggregation is non-blocking with workarounds. Reduces Phase 1 from 8-15 hours to critical path only. Can be optimized post-launch as quick win.

---

## 🎯 PHASE 2: PRE-LAUNCH VERIFICATION (4-6 hours REALISTIC - was 2-4 hours)

### Task 2.1: End-to-End Integration Testing [3-5 hours REALISTIC - was 2-4 hours]

**Verify:** Frontend works with V2 backend using real data

**Reality Check:** 8 complex dashboards × 20 min per dashboard minimum = 160 min (2.7 hours) + validation loops = 3-5 hours realistic

**Test Cases:**

**Dashboard Tests (with test user 60):**

1. [ ] Dashboard loads all widgets without errors
   - Verify: 8+ cards render with data
   - Verify: Charts display correctly
   - Verify: No console errors
2. [ ] Transactions page shows recent transactions
   - Verify: Filter by status works (Pending/Closed/Terminated)
   - Verify: Record counts match V1
   - Verify: Map coordinates update
3. [ ] Revenue page shows income breakdown
   - Verify: Leaderboard shows 3+ agents
   - Verify: Revenue totals match V1 calculations
   - Verify: Weekly/monthly breakdown shows data
4. [ ] Network page shows team structure
   - Verify: Sponsor tree renders
   - Verify: RevShare calculations display
   - Verify: Network size matches V1
5. [ ] Listings page shows active listings
   - Verify: List shows 5+ listings
   - Verify: Map coordinates update
   - Verify: DOM bucket calculations correct
6. [ ] Pipeline shows prospects
   - Verify: Stages display with prospects
   - Verify: Card counts match expected
   - Verify: Can move cards between stages
7. [ ] Directory shows team members
   - Verify: Roster displays 3+ agents
   - Verify: Leaderboard shows stats
   - Verify: Coordinates update
8. [ ] Settings show integration status
   - Verify: FUB integration shows as connected
   - Verify: Sync status displays
   - Verify: Can trigger manual sync

**Data Verification:**

1. [ ] Revenue calculations match V1 (±1% tolerance)
2. [ ] Transaction counts match V1 (exact match)
3. [ ] Network structure matches V1 (exact match)
4. [ ] Commission calculations match V1 (±1%)
5. [ ] Agent leaderboards match V1 rankings

**Performance Verification:**

1. [ ] Dashboard loads in <5 seconds
2. [ ] Page transitions <2 seconds
3. [ ] No timeout errors in logs
4. [ ] No memory leaks (browser dev tools)

**Success Criteria:**

- All 8 dashboard pages render without errors
- All data matches V1 (within tolerance)
- No console errors or warnings
- Performance metrics acceptable

**Realistic Time:** 3-5 hours

---

### Task 2.5: Production Load Testing [1-2 hours] ⭐ NEW - Critical Risk Mitigation

**Why This Matters:** Phase 2.1 tests with user 60 (single user, subset of data). Production has 100+ concurrent users. Load test prevents hour 2 of launch discovering performance issue.

**Current Risk:** 30% probability launch shows >0.5% error rate at hour 2 due to performance issues not caught in single-user testing

**Objectives:**

- Simulate production load and identify bottlenecks
- Verify database connection pooling is correct
- Check cache layer behavior under concurrent load
- Ensure aggregation queries don't block API calls

**Actions:**

1. [ ] Set up load test environment (simulates 50 concurrent users hitting dashboards)
2. [ ] Run dashboard page load stress test
   - Measure: Page load time under load
   - Measure: Error rate
   - Measure: Database connection pool saturation
3. [ ] Run aggregation during load test
   - Verify: Aggregation doesn't block user queries
   - Measure: Resource contention
4. [ ] Check transaction throughput under load
   - Measure: Requests/second
   - Measure: P95 latency
5. [ ] Analyze results against V1 baseline

**Success Criteria:**

- Page load time <2 seconds under 50 concurrent users
- Error rate <0.1% under load
- Database connections not exhausted
- Aggregation jobs don't block user queries
- Results compare favorably to V1

**If Fails:**

- Identify bottleneck (queries? connections? cache?)
- Optimize affected component
- Re-run load test to verify fix
- Document findings

**Realistic Time:** 1-2 hours (includes analysis + iteration)

**Impact:** High confidence going into launch (prevents surprise failures)

---

## 🚀 PHASE 3: LAUNCH DAY (2-4 hours)

### Task 3.1: Execute V2 Cutover

**Preparation:**

1. [ ] V1 data snapshot taken (backup)
2. [ ] V2 final validation completed
3. [ ] Rollback procedure documented and tested
4. [ ] Support team briefed on issue reporting
5. [ ] Monitoring dashboard active

**Execution (in production):**

1. [ ] Route traffic from V1 → V2 (at DNS/load balancer level)
2. [ ] Monitor error rates (target: <0.1%)
3. [ ] Monitor response times (target: <500ms)
4. [ ] Verify webhook processing continues
5. [ ] Verify integration sync continues
6. [ ] Check aggregation jobs complete

**Verification (First Hour):**

1. [ ] All 8 dashboards load with HTTP 200
2. [ ] Revenue calculations working
3. [ ] New transactions syncing from integrations
4. [ ] No critical errors in logs

**Decision Point at 1 Hour:**

- **Continue:** If error rate <0.1%, response time <500ms, no critical errors → proceed
- **Rollback:** If error rate >0.5%, response time >2s, critical errors → revert to V1

**Monitoring (Hours 1-4):**

1. [ ] Monitor every 15 minutes
2. [ ] Alert on: >1% error rate, >1s response time, >3 critical errors
3. [ ] Check aggregation job completion
4. [ ] Verify webhook queue processing
5. [ ] Monitor FUB sync status

**Success Criteria:**

- V2 live for 4+ hours with <0.1% error rate
- All dashboards accessible
- Data syncing from integrations
- No user-facing issues reported

---

## 📋 PHASE 4: POST-LAUNCH OPTIMIZATION (3-5 days)

### Task 4.1: Complete P2 Aggregation Tables [1-2 days]

**P2 Tables (Nice to have, can wait):**

- `agg_events_by_type` - Event breakdown
- `agg_events_by_source` - Event source tracking
- `agg_texts_by_direction` - SMS analytics

**Timeline:** Day 1-2 post-launch

**Actions:**

1. [ ] Create backfill jobs for all 3 tables
2. [ ] Run backfills
3. [ ] Verify tables populated
4. [ ] Update dashboard sections to use data

---

### Task 4.2: Optimize Income Aggregation [4 hours] ⭐ MOVED FROM PHASE 1

**Moved Here:** Non-blocking pre-launch. Optimize post-launch as quick win (Day 1).

**Current State:**

- Income aggregation task times out after 60 seconds
- Dashboard has workarounds, so not launch-blocking
- Leaderboard shows incomplete income data

**Actions:**

1. [ ] Investigate income aggregation function (11080)
2. [ ] Identify bottleneck (query too large? table join issue? calculation complexity?)
3. [ ] Optimize query or break into smaller batches
4. [ ] Test: Verify aggregation completes within 30s
5. [ ] Monitor: Check for memory/CPU spikes during aggregation

**Success Criteria:**

- Income aggregation completes within 30 seconds
- All income records processed without timeout
- Dashboard income data refreshes daily

**Timeline:** Day 1 post-launch (4-hour quick win)

---

### Task 4.3: Fix Remaining 4 Endpoints [1-2 days]

**Issues from Audit:**

1. `8074-sync-nw-downline` - Endpoint doesn't exist (needs creation)
2. `7977-backfill-updated-at` - Timeout on large datasets (needs optimization)
3. `seeding-*` endpoints - 500 errors (needs debugging)
4. `test-function-8051` - Timeout under load (needs optimization)

**Timeline:** Day 2-3 post-launch

**Actions per endpoint:**

1. [ ] Investigate root cause
2. [ ] Implement fix
3. [ ] Test with curl
4. [ ] Verify performance acceptable
5. [ ] Document workaround if applicable

---

### Task 4.4: Performance Optimization [1-2 days]

**Objective:** Make V2 faster than V1 (target: 18%+ improvement)

**Areas to Profile:**

1. [ ] Function execution times (compare V1 vs V2)
2. [ ] Database query performance
3. [ ] Aggregation job execution time
4. [ ] API response times
5. [ ] Frontend page load times

**Optimization Actions:**

1. [ ] Identify slow functions (>5s execution time)
2. [ ] Optimize queries (add indexes, rewrite filters)
3. [ ] Cache frequently accessed data
4. [ ] Parallelize independent operations
5. [ ] Benchmark improvements

**Success Criteria:**

- V2 measurably faster than V1 on same data
- No function takes >5 seconds
- Aggregation jobs complete within timeout windows

**Timeline:** Day 3-5 post-launch

---

## 📊 DEPENDENCIES & SEQUENCING (WITH RISK MITIGATIONS)

```
PHASE 0.5: RISK MITIGATION
└── Task 1.0: Aggregation Dry-Run [30-60 min]
    └── Prerequisite: None
    └── Gate: MUST pass before Phase 1 starts

PHASE 1: CRITICAL FIXES [8-15 hours realistic, was 5-9 hours]
├── Task 1.1: Fix reZEN Webhook [2-4 hours]
│   ├── Prerequisite: None (independent)
│   └── Gate: If not fixed in 3h, proceed with Task 1.1.5 fallback
│
├── Task 1.1.5: Batch Sync Fallback [1 hour] ⭐ NEW
│   ├── Prerequisite: None (preparation)
│   └── Gate: Ready if Task 1.1 fails
│
├── Task 1.2: P0 Aggregations [4-6 hours]
│   ├── Prerequisite: Task 1.0 dry-run passed
│   └── Gate: CRITICAL PATH - if >6 hours, Phase 2 compressed
│
└── Task 1.3: P1 Aggregations [3-5 hours, parallel with 1.2 testing]
    ├── Prerequisite: Task 1.2 approach proven
    └── Gate: Parallel OK if resources allow

PHASE 2: PRE-LAUNCH VERIFICATION [4-6 hours realistic, was 2-4 hours]
├── Task 2.1: E2E Testing [3-5 hours]
│   ├── Prerequisite: All Phase 1 tasks complete
│   ├── Gate: ALL tests must pass
│   └── Decision: Go/No-Go for launch
│
└── Task 2.5: Load Testing [1-2 hours] ⭐ NEW
    ├── Prerequisite: Task 2.1 passed
    └── Gate: Performance acceptable before launch

PHASE 3: LAUNCH DAY [2-4 hours]
└── Task 3.1: V2 Cutover
    ├── Prerequisite: Phase 2 testing successful
    ├── Gate: Rollback ready if error rate >0.5%
    └── Decision: Stay on V2 or rollback to V1

PHASE 4: POST-LAUNCH OPTIMIZATION [3-5 days]
├── Task 4.1: P2 Aggregations [1-2 days]
│   └── Prerequisite: Launch successful
│
├── Task 4.2: Income Optimization [4 hours, Day 1] ⭐ MOVED FROM PHASE 1
│   └── Prerequisite: Launch successful
│
├── Task 4.3: Fix 4 Endpoints [1-2 days]
│   └── Prerequisite: Launch successful
│
└── Task 4.4: Performance Optimization [1-2 days]
    └── Prerequisite: Launch successful (can parallel with 4.1, 4.2, 4.3)
```

**Critical Path Analysis:**

```
START
  ↓
Task 1.0: Dry-run [0.5-1h]
  ↓ (Gate: must pass)
Task 1.2: P0 Agg [4-6h] ← THIS IS CRITICAL PATH
  ↓
Task 2.1: E2E Test [3-5h]
  ↓
Task 2.5: Load Test [1-2h]
  ↓
Task 3.1: Launch [2-4h]
  ↓
LIVE

Total critical path: 11-18 hours
```

**Parallelization Strategy:**

- Phase 0.5: Sequential (must pass gate)
- Phase 1: Tasks 1.1 + 1.3 can run in parallel while 1.2 processes; Tasks 1.1.5 is wait-and-ready
- Phase 2: Sequential (must pass gates for launch)
- Phase 3: Sequential (launch is sequential)
- Phase 4: All tasks can run in parallel post-launch

**Realistic Timeline:**

- Optimistic: 10 hours pre-launch + 2 hours cutover = 12 hours total
- Realistic: 14 hours pre-launch + 3 hours cutover = 17 hours total
- Pessimistic: 18 hours pre-launch + 4 hours cutover = 22 hours total

---

## ✅ LAUNCH READINESS CHECKLIST (WITH RISK MITIGATIONS)

### Pre-Phase 0.5:

- [ ] System Integration Deep Dive completed and reviewed
- [ ] Carmack-level architectural review completed and recommendations implemented
- [ ] All 4 critical issues identified and scoped
- [ ] Team aligned on fix approach
- [ ] Resources assigned (Xano expert for 1.1 + 1.2, QA for 2.1, DevOps for 3.1)
- [ ] Monitoring dashboards configured for Phase 3

### End of Phase 0.5 (Task 1.0):

- [ ] Aggregation dry-run passed (<5 min on 4-week subset)
- [ ] Decision made: Proceed with full 52-week backfill OR use chunked approach
- [ ] Go decision: Ready for Phase 1

### End of Phase 1:

- [ ] Task 1.0: Dry-run validation complete ✓
- [ ] Task 1.1: reZEN webhook handler fixed AND tested (or 1.1.5 fallback validated)
- [ ] Task 1.1.5: Batch sync fallback confirmed working (if 1.1 not fixed)
- [ ] Task 1.2: P0 aggregation tables backfilled and verified (non-zero data in tables)
- [ ] Task 1.3: P1 aggregation tables backfilled and verified
- [ ] Pre-launch risk mitigations in place

### End of Phase 2:

- [ ] Task 2.1: All 8 dashboards tested with real data ✓
  - [ ] Data accuracy verified (matches V1 within tolerance)
  - [ ] No console errors or critical issues
  - [ ] Integration sync verified working
  - [ ] Performance <5s page load
- [ ] Task 2.5: Load testing passed ✓
  - [ ] <2s page load under 50 concurrent users
  - [ ] <0.1% error rate under load
  - [ ] Database connections not exhausted
  - [ ] Aggregations don't block user queries
- [ ] 148K staging queue verified empty (checked during Phase 2)
- [ ] Webhook registration confirmed with external services
- [ ] Rollback tested and ready

### Launch Go/No-Go Decision:

- **GO if:**
  - All Phase 0.5, 1.0, 1, 2.1, 2.5 checks pass ✓
  - Fallback for webhook failure validated (1.1.5) ✓
  - No critical blockers remain
  - Error rate during load test <0.1% ✓
- **NO-GO if:**
  - Any Phase 2 test fails
  - Aggregation dry-run times out (cannot backfill safely)
  - Load test shows >0.5% error rate
  - Webhook AND batch sync both broken
  - Any critical issue unresolved

### Launch Decision Made: ✅ GO or ❌ NO-GO

### End of Phase 3 (First 4 Hours Live):

- [ ] V2 live for 4+ hours with <0.1% error rate
- [ ] All dashboards accessible (200 responses)
- [ ] Revenue calculations working (spot-check 3 agents)
- [ ] New transactions syncing from integrations
- [ ] Webhook processing queue <100 items
- [ ] Aggregation jobs completing on schedule
- [ ] No user-facing critical errors reported
- [ ] Error rate <0.1%, response time <500ms

### Post-Launch (Days 1-5):

- [ ] Task 4.2: Income aggregation optimized (Day 1)
- [ ] Task 4.1: P2 aggregation tables complete
- [ ] Task 4.3: 4 remaining endpoints fixed
- [ ] Task 4.4: Performance optimization benchmarked
- [ ] System stable and performant
- [ ] V2 measurably faster than V1 (18%+ target)

---

## 🎯 CRITICAL SUCCESS FACTORS

1. **reZEN Webhook Fix** - Foundation for real-time data flow
   - If not fixed: Real-time sync blocked (but 15-min batches work)
   - Risk: Medium (workaround exists)

2. **P0 Aggregation Tables** - Foundation for dashboards
   - If not fixed: Weekly analytics unavailable
   - Risk: High (impacts user experience)

3. **Pre-Launch Testing** - Confidence in V2 stability
   - If skipped: Launch with unknown issues
   - Risk: Very High (could fail in production)

4. **Rollback Plan Ready** - Safety net for launch
   - If not ready: Can't recover from critical issues
   - Risk: High (operational necessity)

---

## 📈 METRICS TO MONITOR

### During Phases 1-2:

- Task completion rate
- Test pass rate
- Issues discovered vs issues resolved

### During Phase 3:

- Error rate (target: <0.1%)
- Response time (target: <500ms)
- Webhook processing queue length
- Integration sync status

### During Phase 4:

- Page load times (benchmark vs V1)
- Function execution times
- Database query performance
- User feedback and bug reports

---

## 💬 COMMUNICATION PLAN

- **Daily standup:** Report progress on each task
- **Phase completions:** Announce when each phase is done
- **Go/No-Go decision:** Team alignment before launch
- **Launch day:** Hourly status updates during cutover
- **Post-launch:** Weekly optimization reports

---

## 🔄 ROLLBACK PROCEDURE

**If Launch Fails (Phase 3):**

1. Immediately revert DNS/load balancer to V1
2. Monitor V1 error rates (should drop within 5 min)
3. Post-mortem: Identify what failed
4. Fix in V2 (1-2 day iteration)
5. Re-plan launch attempt

**If Phase 2 Testing Fails:**

1. Pause launch planning
2. Investigate and fix issues
3. Re-run Phase 2 testing
4. Reschedule launch

**Rollback Time:** <10 minutes (DNS revert)

---

## 📎 SUPPORTING DOCUMENTS

- System Integration Deep Dive Report (4-layer verification)
- Audit Index (AUDIT-INDEX.md)
- System Audit (SYSTEM-AUDIT-V1-VS-V2.md)
- Endpoint Inventory (ENDPOINT-INVENTORY-COMPLETE.md)
- Function Catalog (FUNCTION-CATALOG-303-FUNCTIONS.md)
- Schema Comparison (SCHEMA-COMPARISON-V1-VS-V2.md)

---

## 🎯 RISK MITIGATION SUMMARY (Carmack Review Implemented)

### Top 5 Risks & Mitigations

| #   | Risk                                | Mitigation                                         | Owner       | Timeline     |
| --- | ----------------------------------- | -------------------------------------------------- | ----------- | ------------ |
| 1   | Aggregation backfill times out      | Task 1.0 dry-run tests on 4-week subset            | Xano expert | 30-60 min    |
| 2   | Webhook fix takes 4+ hours          | Task 1.1.5 batch-sync fallback ready               | Dev team    | 1 hour prep  |
| 3   | Phase 2 discovers >5% data mismatch | Load test (Task 2.5) identifies performance issues | QA          | 1-2 hours    |
| 4   | Phase 3 launch: >0.5% error rate    | 5-min decision threshold + rollback ready          | DevOps      | Pre-planned  |
| 5   | 148K staging queue blocks cutover   | Verify queue empty during Phase 2                  | Backend eng | 15 min check |

### Mitigations Implemented in Updated Plan

✅ **Task 1.0** - Pre-launch aggregation dry-run (30-60 min)

- Catches timeout issues before Phase 1
- Saves 4-6 hours if problem found early
- Low cost, high impact

✅ **Task 1.1.5** - Batch sync fallback validation (1 hour)

- Allows launch with degraded real-time sync
- Converts "CRITICAL BLOCKER" → "HIGH PRIORITY"
- Falls back gracefully if webhook fix fails

✅ **Task 2.5** - Production load testing (1-2 hours)

- Catches performance issues before production
- Prevents surprise failures at hour 2 of launch
- Validates infrastructure under realistic load

✅ **Updated Timeline Estimates**

- Phase 1: 5-9 hours (optimistic) → 8-15 hours (realistic)
- Phase 2: 2-4 hours (optimistic) → 4-6 hours (realistic)
- Total: 7-13 hours → 12-21 hours → **12-18 hours after optimizations**

✅ **Extended Checklist**

- Added prerequisite checks
- Added gate criteria
- Added specific measurement criteria

---

## 📊 CONFIDENCE LEVEL UPDATE

**Before Carmack Review:** 95%+ (technical foundation solid)
**After Carmack Review:** 62% (technical solid, operationally fragile)

**With Recommendations Implemented:** 75% (acceptable for production)

### Readiness Breakdown

| Aspect               | Score   | Why                                    |
| -------------------- | ------- | -------------------------------------- |
| Technical Foundation | 95%     | 4-layer integration verified           |
| Pre-Launch Testing   | 65%     | Extended to 4-6 hours, load test added |
| Contingency Planning | 75%     | Dry-run + fallback + load test         |
| Operations Readiness | 70%     | Monitoring + rollback ready            |
| Time Estimates       | 70%     | Realistic estimates now; still tight   |
| Risk Documentation   | 90%     | Top 5 risks + mitigations clear        |
| Resource Planning    | 60%     | Team assignments needed                |
| **OVERALL**          | **75%** | **Ready with recommended prep**        |

### Path to 80%+ Readiness

- [ ] Assign resources to each task (1 hour)
- [ ] Complete resource planning (0.5 hour)
- [ ] Configure monitoring dashboards (2 hours)
- [ ] Test rollback procedure (1 hour)
- [ ] Document V1 shutdown SOP (1 hour)
- **Total:** 5.5 hours → 80%+ readiness

---

**Status:** READY FOR EXECUTION (WITH RISK MITIGATIONS)
**Target Launch Date:** February 4-6, 2026 (was 3-5, extended 1 day for testing)
**Launch Readiness:** 75% (was 62% before recommendations)
**Confidence Level:** High (technical + operational checks in place)
**Critical Success Factor:** Complete Task 1.0 dry-run before starting Phase 1
