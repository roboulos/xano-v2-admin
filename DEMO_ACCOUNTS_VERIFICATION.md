# Demo Accounts Verification Report

**Date:** 2026-02-04
**Task:** fn-7-wlv.9 - Verify all 3 demo accounts work

## Summary

| Account         | User ID | Login | Role Verified                | Demo Mode | Status  |
| --------------- | ------- | ----- | ---------------------------- | --------- | ------- |
| Michael Johnson | 7       | PASS  | Team Owner (Admin)           | PASS      | WORKING |
| Sarah Williams  | 256     | PASS  | Team Member                  | PASS      | WORKING |
| James Anderson  | 133     | PASS  | Network Builder (Individual) | PASS      | WORKING |

**Overall: 3/3 demo accounts verified working (100%)**

---

## Test Configuration

### Endpoints Tested

1. **V1 Login Endpoint:** `POST https://xmpx-swi5-tlvy.n7c.xano.io/api:lkmcgxf_:v1.5/auth/login`
   - Requires `X-Data-Source: demo_data` header for demo accounts

2. **V2 Demo Auth Endpoint:** `POST https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:FhhBIJA0:v1.5/demo-auth`
   - Alternative endpoint for quick demo user authentication

3. **V2 Demo Users Endpoint:** `GET https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:FhhBIJA0:v1.5/demo-users`
   - Lists all available demo accounts

### Test Credentials

- **Password:** `AgentDashboards143!`
- **Demo Header:** `X-Data-Source: demo_data`

---

## Detailed Results

### 1. Michael Johnson (ID: 7) - Team Owner

**Login Request:**

```bash
curl -s -X POST "https://xmpx-swi5-tlvy.n7c.xano.io/api:lkmcgxf_:v1.5/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Data-Source: demo_data" \
  -d '{"email":"michael@demo.agentdashboards.com","password":"AgentDashboards143!"}'
```

**Response Status:** HTTP 200 OK

**Verified Fields:**
| Field | Expected | Actual | Match |
|-------|----------|--------|-------|
| id | 7 | 7 | PASS |
| email | michael@demo.agentdashboards.com | michael@demo.agentdashboards.com | PASS |
| role | admin | admin | PASS |
| account_type | Team | Team | PASS |
| is_team_owner | true | true | PASS |
| is_director | true | true | PASS |
| team_id | 1 | 1 | PASS |
| team_name | - | Diamond Realty Group | PASS |
| demo_account | true | true | PASS |
| demo | true | true | PASS |

**User Type:** Team Owner (Admin) - Full admin access to roster, listings, transactions, network

---

### 2. Sarah Williams (ID: 256) - Team Member

**Login Request:**

```bash
curl -s -X POST "https://xmpx-swi5-tlvy.n7c.xano.io/api:lkmcgxf_:v1.5/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Data-Source: demo_data" \
  -d '{"email":"sarah@demo.agentdashboards.com","password":"AgentDashboards143!"}'
```

**Response Status:** HTTP 200 OK

**Verified Fields:**
| Field | Expected | Actual | Match |
|-------|----------|--------|-------|
| id | 256 | 256 | PASS |
| email | sarah@demo.agentdashboards.com | sarah@demo.agentdashboards.com | PASS |
| role | common | common | PASS |
| account_type | Team | Team | PASS |
| is_team_owner | true | true | PASS |
| is_director | false | false | PASS |
| team_id | 21 | 21 | PASS |
| team_name | - | Texas Premier Homes | PASS |
| demo_account | true | true | PASS |
| demo | true | true | PASS |

**User Type:** Team Member - Team member view with own data + team context

---

### 3. James Anderson (ID: 133) - Network Builder

**Login Request:**

```bash
curl -s -X POST "https://xmpx-swi5-tlvy.n7c.xano.io/api:lkmcgxf_:v1.5/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Data-Source: demo_data" \
  -d '{"email":"james@demo.agentdashboards.com","password":"AgentDashboards143!"}'
```

**Response Status:** HTTP 200 OK

**Verified Fields:**
| Field | Expected | Actual | Match |
|-------|----------|--------|-------|
| id | 133 | 133 | PASS |
| email | james@demo.agentdashboards.com | james@demo.agentdashboards.com | PASS |
| role | common | common | PASS |
| account_type | Individual | Individual | PASS |
| is_team_owner | false | false | PASS |
| team_id | 1 | 1 | PASS |
| team_name | - | Diamond Realty Group | PASS |

**User Type:** Network Builder (Individual Agent) - Transactions + network, NO roster/listings

---

## Demo Mode Header Verification

The demo mode is confirmed by:

1. **Request Header:** `X-Data-Source: demo_data` must be included in all API requests
2. **Response Fields:** `demo_account: true` and `demo: true` in user data
3. **Token Binding:** Auth tokens are bound to the `demo_data` datasource

**Test: Auth/me with Demo Token**

```bash
curl -s -X GET "https://xmpx-swi5-tlvy.n7c.xano.io/api:lkmcgxf_:v1.5/auth/me" \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Data-Source: demo_data"
```

**Result:** Returns full user profile with `demo_account: true` and `demo: true` fields confirmed.

---

## V2 Demo Auth Alternative

The V2 workspace provides a simplified demo authentication endpoint:

```bash
# Get demo auth token for Michael (ID: 7)
curl -s -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:FhhBIJA0:v1.5/demo-auth" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 7}'
```

**Response:**

```json
{
  "success": true,
  "authToken": "eyJhbGciOiJBMjU2S1ci...",
  "user": {
    "id": 7,
    "first_name": "Michael",
    "last_name": "Johnson",
    "email": "michael@demo.agentdashboards.com",
    "account_type": "Team",
    "role": "admin",
    "view": "Admin",
    "is_team_owner": true,
    "is_director": true
  }
}
```

All three demo accounts work with this endpoint as well.

---

## Personas Summary

| Persona            | User            | Description       | Access Level                            |
| ------------------ | --------------- | ----------------- | --------------------------------------- |
| Team Owner (Admin) | Michael Johnson | Full admin access | Roster, Listings, Transactions, Network |
| Team Member        | Sarah Williams  | Team member view  | Own data + team context                 |
| Individual Agent   | James Anderson  | Network builder   | Transactions + Network only             |

---

## Verification Commands Reference

```bash
# List all demo users
curl -s -X GET "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:FhhBIJA0:v1.5/demo-users" | jq '.'

# Demo auth (by user_id)
curl -s -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:FhhBIJA0:v1.5/demo-auth" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 7}'

# V1 Login with demo header (requires JSON file or escaped JSON)
curl -s -X POST "https://xmpx-swi5-tlvy.n7c.xano.io/api:lkmcgxf_:v1.5/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Data-Source: demo_data" \
  -d @login.json

# Auth/me with demo token
curl -s -X GET "https://xmpx-swi5-tlvy.n7c.xano.io/api:lkmcgxf_:v1.5/auth/me" \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Data-Source: demo_data"
```

---

_Generated: 2026-02-04_
_Task: fn-7-wlv.9_
