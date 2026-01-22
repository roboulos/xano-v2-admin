# Backend 500 Errors - Fix List

## Summary

**Total 500 Errors Found**: 11 endpoints
**Pattern**: Most errors are related to authentication context and missing variables in XanoScript

---

## 🔴 Critical 500 Errors (HIGH PRIORITY)

### 1. Notifications System (3 endpoints) - USER ROLES ISSUE

#### GET /website/notifications
```
Status: 500
Error: Unable to locate var: user_roles.admin_user_id

curl -X GET "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/website/notifications" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"user_id":60}'
```
**Impact**: Users cannot view notifications
**Root Cause**: XanoScript trying to access `user_roles.admin_user_id` which doesn't exist
**Priority**: CRITICAL - core feature
**Fix**: Update XanoScript to handle missing `user_roles` or get role info differently

#### GET /website/notifications_count
```
Status: 500
Error: Unable to locate var: user_roles.admin_user_id

curl -X GET "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/website/notifications_count" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"user_id":60}'
```
**Impact**: Notification badge count broken
**Root Cause**: Same as above - `user_roles.admin_user_id` missing
**Priority**: CRITICAL - affects UI
**Fix**: Same fix as /website/notifications

#### GET /website/notification_categories
```
Status: 500
Error: Unable to locate var: user_roles.admin_user_id

curl -X GET "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/website/notification_categories" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"user_id":60}'
```
**Impact**: Cannot configure notification preferences
**Root Cause**: Same as above - `user_roles.admin_user_id` missing
**Priority**: HIGH - settings feature
**Fix**: Same fix as /website/notifications

---

### 2. Auth Token Errors (2 endpoints) - MISSING AUTHTOKEN

#### POST /update_api_key
```
Status: 500
Error: Missing var entry: authToken

curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/update_api_key" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"user_id":60}'
```
**Impact**: Cannot update API keys for integrations
**Root Cause**: XanoScript expects `authToken` variable but it's not defined
**Priority**: MEDIUM - settings feature
**Fix**: Add authToken extraction from auth context or remove dependency

#### POST /website/notifications/mark_all_read
```
Status: 500
Error: Missing var entry: authToken

curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/website/notifications/mark_all_read" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"user_id":60}'
```
**Impact**: Cannot mark all notifications as read
**Root Cause**: XanoScript expects `authToken` variable
**Priority**: MEDIUM - convenience feature
**Fix**: Extract authToken from auth context or use alternative approach

---

### 3. NORA AI Endpoint - AUTHTOKEN MISSING

#### GET /nora/notifications_summary
```
Status: 500
Error: Missing var entry: authToken

curl -X GET "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/nora/notifications_summary" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"user_id":60}'
```
**Impact**: NORA AI notification summary broken
**Root Cause**: XanoScript expects `authToken` variable
**Priority**: MEDIUM - AI feature
**Fix**: Extract authToken from auth context

---

## 🟡 Medium Priority 500 Errors

### 4. GET /listings/count - ACCOUNT TYPE MISSING

```
Status: 500
Error: Unable to locate var: user1.account_type

curl -X GET "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/listings/count" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"user_id":60}'
```
**Impact**: Cannot get listing counts
**Root Cause**: XanoScript trying to access `user1.account_type` which doesn't exist
**Priority**: MEDIUM - dashboard stat
**Fix**: Update XanoScript to get account_type from correct source or provide default

---

### 5. POST /lambda/job_checkpoint - PROGRESS STATE MISSING

```
Status: 500
Error: Unable to locate input: progress_state.status

curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/lambda/job_checkpoint" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"user_id":60}'
```
**Impact**: Lambda job checkpointing broken
**Root Cause**: Missing `progress_state.status` input parameter
**Priority**: MEDIUM - background jobs
**Fix**: Add `progress_state` parameter or make it optional

---

### 6. POST /team_management/hide - TEAM1 VARIABLE MISSING

```
Status: 500
Error: Missing var entry: team1

curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/team_management/hide" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"user_id":60}'
```
**Impact**: Cannot hide team members
**Root Cause**: XanoScript expects `team1` variable that doesn't exist
**Priority**: LOW - admin feature
**Fix**: Update XanoScript to get team info from input or auth context

---

## 🔵 Low Priority 500 Errors

### 7. POST /stripe/checkout - AUTH EMAIL MISSING

```
Status: 500
Error: Unable to locate auth: email

curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/stripe/checkout" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"user_id":60}'
```
**Impact**: Stripe checkout broken
**Root Cause**: XanoScript expects authenticated user's email from auth context
**Priority**: LOW - billing feature (low usage)
**Fix**: Ensure auth context includes email or get from user record

---

### 8. POST /website/reset_admin_account - STAFF1 MISSING

```
Status: 500
Error: Unable to locate var: staff1.user_id

curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/website/reset_admin_account" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"user_id":60}'
```
**Impact**: Cannot reset admin accounts
**Root Cause**: XanoScript expects `staff1` variable
**Priority**: LOW - admin utility
**Fix**: Update XanoScript to get staff info from input

---

## 📊 Error Pattern Analysis

### By Error Type

| Error Type | Count | Endpoints |
|------------|-------|-----------|
| Unable to locate var: user_roles.admin_user_id | 3 | notifications, notifications_count, notification_categories |
| Missing var entry: authToken | 3 | update_api_key, mark_all_read, nora/notifications_summary |
| Other variable issues | 5 | listings/count, lambda/job_checkpoint, team_management/hide, stripe/checkout, reset_admin_account |

### Root Cause Categories

1. **Auth Context Issues (6 endpoints)**
   - Missing `user_roles.admin_user_id`
   - Missing `authToken`
   - Missing `auth: email`

2. **Variable Scoping Issues (3 endpoints)**
   - Missing `user1.account_type`
   - Missing `team1`
   - Missing `staff1.user_id`

3. **Input Parameter Issues (2 endpoints)**
   - Missing `progress_state.status` input

---

## 🎯 Fix Priority Order

### Phase 1: Critical Fixes (Fix First)
1. **Notifications System** (3 endpoints) - Most user-facing
   - GET /website/notifications
   - GET /website/notifications_count
   - GET /website/notification_categories
   - **Fix**: Get admin_user_id from auth context or user table lookup

### Phase 2: Auth Token Fixes
2. **Auth Token Endpoints** (3 endpoints)
   - POST /update_api_key
   - POST /website/notifications/mark_all_read
   - GET /nora/notifications_summary
   - **Fix**: Extract authToken from authorization header or auth context

### Phase 3: Variable Fixes
3. **Variable Scoping** (3 endpoints)
   - GET /listings/count
   - POST /team_management/hide
   - POST /website/reset_admin_account
   - **Fix**: Get variables from correct source (input, auth, db query)

### Phase 4: Input Parameters
4. **Input Parameters** (2 endpoints)
   - POST /lambda/job_checkpoint
   - POST /stripe/checkout
   - **Fix**: Add required input parameters or make optional with defaults

---

## 🧪 Testing Strategy

### Step 1: Get Auth Token
```bash
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:i6a062_x/auth/test-login" \
  -H "Content-Type: application/json" \
  -d '{"email": "dave@premieregrp.com", "password": "Password123!"}'
```

### Step 2: Test Each Fixed Endpoint
```bash
# Test notification endpoints
TOKEN="your_token_here"

curl -X GET "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/website/notifications" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 60}'

curl -X GET "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/website/notifications_count" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 60}'
```

### Step 3: Verify Success
- Status code should be 200
- Response should contain expected data structure
- No 500 errors in response

---

## 🛠️ XanoScript Fix Patterns

### Pattern 1: Missing user_roles.admin_user_id
```xanoscript
// BEFORE (BROKEN)
var $admin_id {
  value = $user_roles.admin_user_id
}

// AFTER (FIXED)
var $admin_id {
  value = $auth.user.id
}

// OR with fallback
var $admin_id {
  value = $input.user_id
}
```

### Pattern 2: Missing authToken
```xanoscript
// BEFORE (BROKEN)
var $token {
  value = $authToken
}

// AFTER (FIXED)
var $token {
  value = $auth.authToken
}

// OR extract from header
var $token {
  value = $request.headers.authorization|replace:"Bearer ":""
}
```

### Pattern 3: Missing Variable (team1, staff1, user1)
```xanoscript
// BEFORE (BROKEN)
var $team_id {
  value = $team1.id
}

// AFTER (FIXED) - Query from DB
var $team {
  value = db.team.getItem($input.team_id)
}
var $team_id {
  value = $team.id
}

// OR use auth context
var $team_id {
  value = $auth.user.team_id
}
```

---

## 📝 Notes

- All 11 endpoints need XanoScript fixes
- Most errors are NOT parameter issues - they're variable scoping/auth context issues
- User 60 (David Keener) has proper auth, so these are backend logic bugs
- Fixing notifications (3 endpoints) will have biggest user impact
- Test with actual auth token after each fix to verify

---

## Next Steps

1. ✅ Document all 500 errors (DONE)
2. 🔄 Fix Phase 1: Notifications system (3 endpoints)
3. 🔄 Fix Phase 2: Auth token endpoints (3 endpoints)
4. 🔄 Fix Phase 3: Variable scoping (3 endpoints)
5. 🔄 Fix Phase 4: Input parameters (2 endpoints)
6. 🔄 Re-run test matrix to verify fixes
7. 🔄 Update CRITICAL_GAP_ANALYSIS.md with results
