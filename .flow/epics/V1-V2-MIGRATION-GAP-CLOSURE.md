# EPIC: V1→V2 Migration Gap Closure

**Status:** Ready for Implementation
**Priority:** Critical
**Complexity:** High
**Timeline:** 4.5 weeks
**Owner:** Migration Team
**Reference:** See `000-MASTER-MIGRATION-EPIC.md` for detailed execution plan.

---

## 🎯 Objective

Close all remaining critical gaps in the V1→V2 migration to achieve 100% completion:

1. **Validate Frontend Compatibility (Phase 0) - CRITICAL BLOCKER**
2. Fix 26 foreign key integrity issues (orphaned references)
3. Migrate 47K+ missing records across 4 tables
4. Create 4 unmapped V2 endpoints
5. Document and validate 187 internal worker functions
6. Run comprehensive system validation & cutover

---

## 📊 Current State vs Target State

| Metric                  | Current         | Target         | Gap           |
| ----------------------- | --------------- | -------------- | ------------- |
| **Frontend Validation** | **0%**          | **100%**       | **CRITICAL**  |
| Foreign Key Integrity   | 6/32 (18.75%)   | 32/32 (100%)   | 26 issues     |
| Data Records            | ~249K migrated  | ~296K+         | 47K+ missing  |
| Endpoints               | 320/324 (98.7%) | 324/324 (100%) | 4 endpoints   |
| Function Coverage       | 140/376 (37.2%) | 95%+ pass rate | 19 failures   |
| Migration Score         | 52%             | 100%           | 48% remaining |

---

## 🔴 Critical Gaps Overview

### Gap 0: Frontend Validation (CRITICAL)

**Impact:** If dashboards2.0 doesn't work on V2, migration fails immediately.
**Status:** Not tested against V2 backend.
**Action:** Must be validated BEFORE any data migration begins.

### Gap 1: Foreign Key Integrity (26 Issues)

**Impact:** Data corruption risk, referential integrity violations
**Records Affected:** 1,022 total orphaned references

### Gap 2: Missing Records (47K+)

**Impact:** Historical data loss, incomplete audit trail
**Records Affected:** 47,121 total

### Gap 3: Unmapped Endpoints (4)

**Impact:** Legacy API support missing
**Endpoint Count:** 4 endpoints

### Gap 4: Worker Functions Documentation (187)

**Impact:** Maintenance risk, unknown dependencies
**Worker Count:** 187 functions

---

## 📋 Phase Breakdown

### PHASE 0: Frontend Validation (Week 1) - GATING PHASE ⚠️

**Goal:** Ensure dashboards2.0 works identically on V2 backend.
**Status:** BLOCKER.

#### Tasks:

- [ ] Task 0.1: Test all dashboard pages (Deploy dashboards2.0 to V2)
- [ ] Task 0.2: Compare output (V1 vs V2)
- [ ] Task 0.3: Performance baseline
- [ ] Task 0.4: Load testing
- [ ] Task 0.5: Sign-off document

**Success Criteria:**

- ✅ All pages load without errors
- ✅ Calculations match V1 exactly
- ✅ Performance acceptable
- ✅ **GATES Phase 1**

---

### PHASE 1: Foreign Key Integrity (Weeks 2-3)

**Goal:** Fix all 26 orphaned reference issues → 100% pass rate

#### Tasks:

- [ ] Task 1.1: Create orphan analysis script
- [ ] Task 1.2: Create cleanup function - User Orphans
- [ ] Task 1.3: Create cleanup function - Agent Orphans
- [ ] Task 1.4: Create cleanup function - Team Orphans
- [ ] Task 1.5: Create cleanup function - Transaction Orphans
- [ ] Task 1.6: Create cleanup function - Listing Orphans
- [ ] Task 1.7: Create cleanup function - Network Orphans
- [ ] Task 1.8: Execute all cleanup functions
- [ ] Task 1.9: Validate cleanup results

**Success Criteria:**

- ✅ All 26 FK issues resolved
- ✅ 0 orphaned references remaining

---

### PHASE 2: Data Migration (Weeks 2-3)

**Goal:** Migrate 47K+ missing records → Complete record coverage

#### Tasks:

- [ ] Task 2.1: audit_logs Migration (48,600 records)
- [ ] Task 2.2: customer_metadata Migration (1,200+ records)
- [ ] Task 2.3: transaction_logs Migration (25 records)
- [ ] Task 2.4: archived_users Migration (296 records)
- [ ] Task 2.5: Validate Phase 2 Results

**Success Criteria:**

- ✅ All 47K+ records migrated
- ✅ Checksums match V1

---

### PHASE 3: Endpoint Gaps (Week 3)

**Goal:** Create 4 unmapped endpoints → 324/324 (100%)

#### Tasks:

- [ ] Task 3.1: Identify 4 unmapped endpoints
- [ ] Task 3.2: Create 4 V2 workers
- [ ] Task 3.3: Wire up API endpoints
- [ ] Task 3.4: Update function-endpoint-mapping.json
- [ ] Task 3.5: Validate all 4 endpoints

**Success Criteria:**

- ✅ 4 new endpoints created
- ✅ 324/324 endpoints working

---

### PHASE 4: Worker Documentation (Week 3)

**Goal:** Document 187 internal workers → Maintenance ready

#### Tasks:

- [ ] Task 4.1: Categorize 187 workers
- [ ] Task 4.2: Create inspection checklist
- [ ] Task 4.3: Document critical 50 workers
- [ ] Task 4.4: Run internal validation
- [ ] Task 4.5: Create worker catalog

**Success Criteria:**

- ✅ 187 workers documented
- ✅ Worker catalog created

---

### PHASE 5: Comprehensive Validation (Week 4)

**Goal:** All systems passing → Production ready

#### Tasks:

- [ ] Task 5.1: Foreign Key Validation
- [ ] Task 5.2: Function Validation
- [ ] Task 5.3: Endpoint Validation
- [ ] Task 5.4: Table Validation
- [ ] Task 5.5: Create final migration report

**Success Criteria:**

- ✅ All validation scripts passing at target rates
- ✅ Production cutover approval

---

### PHASE 5.5: Integration Testing (Week 5)

**Goal:** Three-layer system test passing.

#### Tasks:

- [ ] Task 5.5.1: Three-Layer Integration Test
- [ ] Task 5.5.2: Real-World Workflow Simulation
- [ ] Task 5.5.3: Load Test at Production Scale

---

### PHASE 5.6: Cutover & Monitoring (Week 5)

**Goal:** Smooth migration to V2 with zero downtime.

#### Tasks:

- [ ] Task 5.6.1: Create Cutover Plan
- [ ] Task 5.6.2: Run Parallel V1/V2 (48 Hours)
- [ ] Task 5.6.3: Execute Cutover
- [ ] Task 5.6.4: Monitor & Support

---

## 🔗 Dependencies

```
PHASE 0 (Frontend Validation) - CRITICAL GATE
    ↓
    ├─→ Phase 1 (FK Integrity)
    ├─→ Phase 2 (Data Migration)
    ├─→ Phase 3 (Endpoints)
    └─→ Phase 4 (Documentation)

After ALL Phase 1-4 complete:
    ↓
    Phase 5 (Comprehensive Validation)
    ↓
    Phase 5.5 (Integration Testing)
    ↓
    Phase 5.6 (Cutover & Monitoring)
```

---

## 📅 Timeline

| Phase   | Duration  | Key Deliverable              | Blocker    |
| ------- | --------- | ---------------------------- | ---------- |
| **0**   | Week 1    | Frontend validation sign-off | CRITICAL   |
| **1**   | Weeks 2-3 | 0 orphaned references        | Phase 0    |
| **2**   | Weeks 2-3 | 47K+ records migrated        | Phase 0    |
| **3**   | Week 4    | 324/324 endpoints            | Phase 0    |
| **4**   | Week 4    | 187 workers documented       | None       |
| **5**   | Week 5    | All validation PASS          | Phases 1-4 |
| **5.5** | Week 6    | Integration test PASS        | Phase 5    |
| **5.6** | Week 6    | Cutover complete             | Phase 5.5  |

---

## 🔄 Status Tracking

**Phase 0:** ⬜ Not Started (BLOCKER)
**Phase 1:** ⬜ Not Started
**Phase 2:** ⬜ Not Started
**Phase 3:** ⬜ Not Started
**Phase 4:** ⬜ Not Started
**Phase 5:** ⬜ Not Started
**Phase 5.5:** ⬜ Not Started
**Phase 5.6:** ⬜ Not Started

**Overall Progress:** 0% → Target 100%
