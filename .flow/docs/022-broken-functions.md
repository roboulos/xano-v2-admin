# Broken Functions Analysis

## Executive Summary

This document analyzes validation results from the V2 workspace to identify broken functions and data integrity issues. Analysis is based on validation runs from 2026-01-26.

### Validation Results Overview

| Category             | Total | Passed | Failed | Pass Rate |
| -------------------- | ----- | ------ | ------ | --------- |
| Tables               | 223   | 223    | 0      | 100%      |
| Functions (Workers/) | 194   | 22     | 1      | 95.7%\*   |
| References           | 33    | 27     | 6      | 82%       |

\*Pass rate is for testable functions only. 171 functions are internal (no public test endpoint).

---

## Critical (Client-Facing)

Functions that error when called and are used by client-facing features.

| Function                           | ID   | Error Type | Fix Approach                                                                                                   |
| ---------------------------------- | ---- | ---------- | -------------------------------------------------------------------------------------------------------------- |
| Workers/Syncing - Network Downline | 8074 | HTTP 404   | Test endpoint `/test-function-8074-sync-nw-downline` returns 404. Verify endpoint exists in WORKERS API group. |

### Details

#### Workers/Syncing - Network Downline (ID: 8074)

- **Tested via:** `/test-function-8074-sync-nw-downline`
- **API Group:** WORKERS
- **Error:** HTTP 404
- **Impact:** Network downline sync will fail for users
- **Fix Approach:**
  1. Check if endpoint exists in `api:4UsTtl3m` (WORKERS group)
  2. Verify function is published and active
  3. Check for routing issues or typos in endpoint path

---

## Medium (Background)

Background processes and data sync functions that have issues.

| Function          | ID  | Error Type | Fix Approach                     |
| ----------------- | --- | ---------- | -------------------------------- |
| _None identified_ | -   | -          | All 22 testable functions passed |

---

## Low (Internal/Deprecated)

Internal utility functions that cannot be directly tested.

### Untestable Functions (171 total)

These functions don't have direct test endpoints because they are:

- Internal helper functions called by other functions
- Part of larger orchestration flows
- Utility/transformation functions

#### By Domain

| Domain               | Count | Examples                                                         |
| -------------------- | ----- | ---------------------------------------------------------------- |
| FUB Integration      | 52    | FUB - Get Deals - Upsert, FUB - Get People - Transform           |
| reZEN Integration    | 38    | reZEN - Create Contribution Object, reZEN - Validate Credentials |
| SkySlope Integration | 18    | SkySlope - Get Listings, SkySlope - Upsert Transaction           |
| Network/Team         | 16    | Network - Get Downline, Team - Roster Counts                     |
| Metrics/Income       | 14    | Metrics - Create Snapshot, Income - Aggregate All Agents         |
| Utility              | 12    | Utility - Slack Webhook, Utility - Get Coordinates               |
| Title                | 8     | Title - Get Daily Orders, Title - Get Disbursements              |
| Other                | 13    | AD - Upload Images, Auth - Login                                 |

#### High-Priority Untestable (Should Add Test Endpoints)

Functions that are critical to client features but lack test coverage:

| Function                          | ID   | Reason                 | Recommendation         |
| --------------------------------- | ---- | ---------------------- | ---------------------- |
| Workers/Auth - Login              | 8300 | Core auth flow         | Add auth test endpoint |
| Workers/reZEN - Team Roster Sync  | 8032 | Critical for team data | Add team sync test     |
| Workers/FUB - Onboarding          | 8133 | User onboarding        | Add onboarding test    |
| Workers/Network - Get Downline    | 8034 | Network visualization  | Add network test       |
| Workers/Metrics - Create Snapshot | 8140 | Dashboard metrics      | Add metrics test       |

---

## Data Integrity Issues (Reference Validation)

Foreign key references with orphaned records.

### Critical Orphan Issues

| Table.Column               | References | Orphan Count | Sample IDs            | Fix Approach                                                 |
| -------------------------- | ---------- | ------------ | --------------------- | ------------------------------------------------------------ |
| agent.user_id              | user.id    | 500          | 59, 62, 63, 64, 65... | Clean up agents without valid users or migrate missing users |
| contribution.agent_id      | agent.id   | 500          | 1, 2, 3, 4, 5...      | Clean up contributions without valid agents                  |
| agent_cap_data.agent_id    | agent.id   | 12           | 62, 63, 64, 65...     | Delete orphaned cap_data records                             |
| agent_commission.agent_id  | agent.id   | 476          | 38, 39, 40, 41...     | Delete orphaned commission records                           |
| agent_hierarchy.agent_id   | agent.id   | 500          | 47, 48, 49, 50...     | Delete orphaned hierarchy records                            |
| agent_performance.agent_id | agent.id   | 500          | 38, 39, 40, 41...     | Delete orphaned performance records                          |

### Root Cause Analysis

The orphaned reference pattern suggests:

1. **Agent data was migrated without corresponding user records**
   - 500 agents reference user IDs that don't exist
   - This is the root cause cascading to other agent-related tables

2. **Cascade deletion not properly configured**
   - agent_cap_data, agent_commission, agent_hierarchy, agent_performance have cascade_delete: true
   - But orphans exist because the parent agents weren't properly cleaned up

3. **Contribution data has direct agent references**
   - 500 contributions reference non-existent agents
   - cascade_delete: false means these won't auto-clean

### Recommended Fix Order

1. **Step 1:** Identify which user IDs are missing (from agent.user_id orphans)
2. **Step 2:** Either:
   - a) Create stub user records for the 500 missing users, OR
   - b) Delete the 500 orphaned agent records
3. **Step 3:** Clean up contribution.agent_id orphans
4. **Step 4:** Let cascade deletion handle agent\_\* table cleanup

---

## Passing Functions (22)

Functions that passed validation and are confirmed working:

| Function                                                 | ID    | Duration | Status |
| -------------------------------------------------------- | ----- | -------- | ------ |
| Workers/FUB - Get Deals                                  | 10022 | 1245ms   | PASS   |
| Workers/FUB - Lambda Coordinator Worker Task             | 8118  | 404ms    | PASS   |
| Workers/reZEN - Onboarding Process Contributions         | 8073  | 319ms    | PASS   |
| Workers/reZEN - Onboarding Process Pending Contributions | 8072  | 833ms    | PASS   |
| Workers/reZEN - Onboarding Process RevShare Totals       | 8071  | 450ms    | PASS   |
| Workers/reZEN - Onboarding Process Agent Sponsor Tree    | 8070  | 494ms    | PASS   |
| Workers/reZEN - Onboarding Process Equity                | 8069  | 767ms    | PASS   |
| Workers/reZEN - Onboarding Process Cap Data              | 8068  | 442ms    | PASS   |
| Workers/FUB - Onboarding Appointments Worker             | 8067  | 605ms    | PASS   |
| Workers/FUB - Get Calls                                  | 8065  | 9506ms   | PASS   |
| Workers/reZEN - Onboarding Process Network Downline      | 8062  | 371ms    | PASS   |
| Workers/reZEN - Onboarding Process Contributors          | 8061  | 599ms    | PASS   |
| Workers/reZEN - Onboarding Load Contributions            | 8060  | 764ms    | PASS   |
| Workers/reZEN - Network Frontline                        | 8059  | 994ms    | PASS   |
| Workers/reZEN - Network Cap Data                         | 8058  | 870ms    | PASS   |
| Workers/reZEN - Onboarding Process Stage Contributions   | 8057  | 444ms    | PASS   |
| Workers/reZEN - Contributions                            | 8056  | 3518ms   | PASS   |
| Workers/reZEN - Equity                                   | 8055  | 5654ms   | PASS   |
| Workers/reZEN - Listings Update                          | 8054  | 880ms    | PASS   |
| Workers/reZEN - Listings Sync                            | 8053  | 902ms    | PASS   |
| Workers/reZEN - Transactions Sync                        | 8052  | 736ms    | PASS   |
| Workers/reZEN - Agent Data                               | 8051  | 655ms    | PASS   |

---

## Summary by Priority

### Immediate Action Required

- [ ] Fix HTTP 404 for Workers/Syncing - Network Downline (ID: 8074)
- [ ] Clean up 500 orphaned agent.user_id references
- [ ] Clean up 500 orphaned contribution.agent_id references

### Short-Term (Next Sprint)

- [ ] Add test endpoints for Auth - Login, Team Roster Sync, FUB - Onboarding
- [ ] Clean up agent\_\* orphaned records after fixing agent table
- [ ] Verify cascade deletion is working properly

### Long-Term (Technical Debt)

- [ ] Add test endpoints for remaining 166 untestable functions
- [ ] Implement data migration scripts to prevent future orphans
- [ ] Add pre-delete validation to prevent orphan creation

---

## Validation Commands

```bash
# Run function validation
npm run validate:functions

# Run reference validation
npm run validate:references

# Run all validators
npm run validate:all
```

---

_Generated: 2026-01-26_
_Source: validation-reports/function-validation-workers-2026-01-26T14-02-01-966Z.json_
_Source: validation-reports/reference-validation-2026-01-26T14-47-18-284Z.json_
