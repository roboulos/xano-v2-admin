# /team_management/roster Endpoint Timeout Fix

**Status**: ⚠️ CRITICAL - Endpoint times out after 30 seconds
**Root Cause**: Missing database index causing full table scan
**Solution**: Add index on `transaction.transaction_owner_agent_id`

---

## Problem Analysis

### Current Behavior
- Endpoint URL: `GET /team_management/roster?team_id=1`
- Timeout: 30+ seconds
- HTTP Status: 000 (timeout)

### Root Cause
The endpoint executes this query:

```xanoscript
db.query transaction {
  where = $db.transaction.transaction_owner_agent_id in $agent_ids
  sort = {closing_date: "desc"}
  return = {type: "list"}
}
```

**Problem**: The `transaction` table has **NO INDEX** on `transaction_owner_agent_id`, causing a **full table scan** of potentially thousands of transaction records for every roster query.

---

## The Fix: Add Database Index

### Step 1: Add Index via Xano UI

1. Open Xano workspace: `x2nu-xcjc-vhax.agentdashboards.xano.io`
2. Navigate to: **Database** → **transaction** table (ID: 675)
3. Click **Indexes** tab
4. Add new B-Tree index:
   - **Field**: `transaction_owner_agent_id`
   - **Index Name**: `idx_transaction_owner_agent_id`
   - **Type**: B-Tree (standard)

### Step 2: Verify Index Creation

After creating the index, verify it exists:
- Check the Indexes tab shows the new index
- Status should be "Active"

### Expected Impact

**Before Index:**
- Full table scan: O(N) where N = total transaction count
- Query time: 30+ seconds (timeout)
- Database load: HIGH

**After Index:**
- Indexed lookup: O(log N + M) where M = transactions per agent
- Query time: < 2 seconds
- Database load: MINIMAL

---

## Why This Happens

### The Query Pattern
```
FOR each team_member:
  1. Get agent_id
  2. Find ALL transactions WHERE transaction_owner_agent_id = agent_id
  3. For each transaction, find address
  4. Build enriched roster record
```

### Without Index
- Step 2 scans the **entire transaction table** for each agent
- With 100 team members and 10,000 transactions, this is **1 million comparisons**
- Result: 30+ second timeout

### With Index
- Step 2 uses B-Tree index for instant lookup
- With 100 team members and 10,000 transactions, this is **~800 comparisons** (log N lookups)
- Result: < 2 second response

---

## Alternative Approaches Considered

### ❌ Approach 1: Limit Transaction Query
**Tried**: Adding `limit = 200` to transaction query
**Issue**: XanoScript doesn't support `limit` in `db.query` block
**Verdict**: Not possible with current XanoScript syntax

### ❌ Approach 2: Use Pagination
**Tried**: `return = {type: "paginated", page: 1, per_page: 200}`
**Issue**: XanoScript parser error "Invalid return type"
**Verdict**: Syntax not supported

### ❌ Approach 3: Build Lookup Maps
**Tried**: Convert arrays to objects using `|set:($id|string):$value`
**Issue**: XanoScript doesn't support `|string` filter
**Verdict**: Filter not available

### ✅ Approach 4: Add Database Index (RECOMMENDED)
**Implementation**: Add B-Tree index on `transaction_owner_agent_id`
**Advantages**:
- Fixes root cause (missing index)
- No code changes needed
- Benefits ALL queries using this field
- Industry standard solution

**Verdict**: This is the correct fix

---

## Testing After Index Creation

```bash
# Get auth token
TOKEN=$(curl -s -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:i6a062_x/auth/test-login" \
  -H "Content-Type: application/json" \
  -d '{"email":"dave@premieregrp.com","password":"Password123!"}' \
  | jq -r '.result.data.authToken')

# Test roster endpoint with timing
time curl -X GET "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/team_management/roster?team_id=1" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '. | length'
```

**Expected Result After Index:**
- Response time: < 5 seconds
- HTTP Status: 200
- Returns array of roster members

---

## Other Fields That May Need Indexes

While fixing this, consider adding indexes to these frequently queried fields:

### transaction table
- [x] `transaction_owner_agent_id` (THIS FIX)
- [ ] `team_id` (if queries filter by team)
- [ ] `closing_date` (used in ORDER BY)

### team_members table
- [ ] `team_id` (already has WHERE clause)
- [ ] `agent_id` (used in JOINs)

### agent table
- [ ] `team_id` (if frequently filtered)

### address table
- [ ] Primary key `id` (auto-indexed)

---

## Summary

**Current Status**: Endpoint times out (30+ seconds)
**Root Cause**: Missing index on `transaction.transaction_owner_agent_id`
**Solution**: Add B-Tree index via Xano UI
**Expected Result**: < 5 second response time
**Action Required**: Manual index creation in Xano (cannot be done via MCP)

**Next Steps**:
1. Add the index in Xano UI
2. Test the endpoint
3. Confirm response time < 5 seconds
4. Mark as RESOLVED ✅
