# Endpoint Usage Analysis: dashboards2.0 vs Frontend API v2

## Context

**dashboards2.0** (Client Frontend) uses:
- **Workspace 1** (V1 Production): `xmpx-swi5-tlvy.n7c.xano.io`
- Multiple API groups (AUTH, MAIN_V1_0, MAIN_V1_5, TRANSACTIONS_V2, etc.)

**Frontend API v2** (Test Endpoints) are:
- **Workspace 5** (V2 Refactored): `x2nu-xcjc-vhax.agentdashboards.xano.io`
- **API Group 515** (pe1wjL5I): Frontend API v2 with 174 endpoints

## Test Results Summary

- **Tested**: 192 endpoints (Frontend API v2, Workspace 5)
- **Passed**: 57/192 (30%)
- **Failed**: 135/192 (70%)

### Failure Breakdown
- ~80 endpoints: Missing required parameters
- ~15 endpoints: 404 Not Found
- ~10 endpoints: Invalid parameter references
- ~5 endpoints: Backend 500 errors

---

## dashboards2.0 Endpoint Usage (Extracted from services/)

### Core Services (services/xano/core.ts)

**TRANSACTIONS_V2 API Group (api:KPx5ivcP)**
```
GET  /transactions/all
GET  /transactions/by-participant
GET  /transactions/participants
GET  /transactions/manual_entry
GET  /transactions/lead_source_list
POST /transactions/lead_source
POST /transactions/lead_type
PATCH /transactions/update_effective_team
PATCH /transactions/{id}/coordinates
POST /transactions/manual_entry
PUT  /transactions/manual_entry
DELETE /transactions/manual_entry
```

**MAIN_V1_0 API Group (api:kaVkk3oM)**
```
POST /transactions/manual_entry
POST /transactions/lead_source
POST /transactions/lead_type
PUT  /transactions/manual_entry
DELETE /transactions/manual_entry
GET  /website/note
POST /network/favorite
POST /network/unfavorite
POST /network/last_contacted_date
POST /network/frequency
DELETE /website/note
POST /network/pipeline/status_changed
POST /network/pipeline/stage_update
```

**LISTINGS**
```
GET  /listings/all                           (TRANSACTIONS_V2)
GET  /listings/by-participant                (TRANSACTIONS_V2)
PATCH /listings/{id}/coordinates             (TRANSACTIONS_V2)
```

**NETWORK**
```
GET  /network/all                            (TRANSACTIONS_V2)
GET  /network/counts                         (TRANSACTIONS_V2)
GET  /network/pipeline                       (TRANSACTIONS_V2)
POST /network/pipeline/stage                 (TRANSACTIONS_V2)
POST /network/pipeline/edit_card             (TRANSACTIONS_V2)
POST /network/pipeline/new_card              (TRANSACTIONS_V2)
DELETE /network/pipeline/stage               (TRANSACTIONS_V2)
DELETE /network/pipeline/card                (TRANSACTIONS_V2)
```

**ROSTER**
```
GET  /team_management/roster                 (TRANSACTIONS_V2)
GET  /team_management/roster/count           (TRANSACTIONS_V2)
POST /team_roster/update                     (TRANSACTIONS_V2)
PATCH /team_roster/update_coordinates        (TRANSACTIONS_V2)
```

**REVENUE**
```
GET  /revenue/all                            (TRANSACTIONS_V2)
GET  /revenue/by-participant                 (TRANSACTIONS_V2)
```

**NOTIFICATIONS**
```
GET  /website/notifications                  (TRANSACTIONS_V2)
GET  /website/notifications_count            (TRANSACTIONS_V2)
GET  /nora/notifications_summary             (TRANSACTIONS_V2)
POST /website/notifications/{id}/read        (TRANSACTIONS_V2)
POST /website/notifications/read-all         (TRANSACTIONS_V2)
DELETE /website/notifications/{id}           (TRANSACTIONS_V2)
```

**CONTRIBUTIONS & REVSHARE**
```
GET  /contributions                          (TRANSACTIONS_V2)
GET  /revshare_totals                        (TRANSACTIONS_V2)
```

**LEADERBOARD**
```
POST /leaderboard/show_stats                 (TRANSACTIONS_V2)
```

---

### Settings Services (services/xano/settings.ts)

**TEAM MANAGEMENT**
```
GET  /team                                   (MAIN_V1_5)
POST /team                                   (MAIN_V1_5)
POST /team/update_logo                       (MAIN_V1_0)
POST /team/remove_logo                       (MAIN_V1_0)
GET  /team/owner                             (MAIN_V1_0)
```

**STAFF MANAGEMENT**
```
GET  /staff_management/agents_with_seats     (MAIN_V1_0)
POST /staff_management/invite                (MAIN_V1_0)
POST /staff_management/update                (MAIN_V1_0)
POST /staff_management/delete                (MAIN_V1_0)
```

**TEAM SETTINGS**
```
GET  /team_management/settings               (TRANSACTIONS_V2)
POST /team_management/seat                   (TRANSACTIONS_V2)
POST /team_management/details                (TRANSACTIONS_V2)
```

**USER PROFILE**
```
GET  /auth/me                                (AUTH)
POST /user/password                          (AUTH)
```

**SUBSCRIPTIONS**
```
GET  /stripe/user_subscription               (MAIN_V1_0)
POST /subscription/additional_seats          (SUBSCRIPTION)
```

---

### Integration Services (services/xano/integrations.ts)

**INTEGRATION MANAGEMENT**
```
GET  /integrations/url                       (Multiple API Groups)
POST /integrations/code                      (Multiple API Groups)
POST /integrations/disconnect                (Multiple API Groups)
```

**DOTLOOP**
```
GET  /dotloop/profiles                       (DOTLOOP)
GET  /dotloop/loops                          (DOTLOOP)
GET  /dotloop/contacts                       (DOTLOOP)
POST /dotloop/sync                           (DOTLOOP)
POST /dotloop/process-staging                (DOTLOOP)
POST /dotloop/subscribe                      (DOTLOOP)
```

**LOFTY**
```
POST /lofty/sync                             (LOFTY)
POST /lofty/oauth/callback                   (LOFTY)
POST /lofty/oauth/refresh                    (LOFTY)
```

**SIERRA**
```
POST /sierra/sync                            (SIERRA)
POST /sierra/oauth/callback                  (SIERRA)
POST /sierra/oauth/refresh                   (SIERRA)
```

---

### AI/Intelligence Services

**NORA/AI FEATURES**
```
GET  /nora/insights                          (INTELLIGENCE)
GET  /nora/actions                           (INTELLIGENCE)
GET  /nora/feedback                          (INTELLIGENCE)
POST /nora/feedback                          (INTELLIGENCE)
GET  /nora/feedback/stats                    (INTELLIGENCE)
POST /profile/personality                    (INTELLIGENCE)
```

---

### Page Builder / Dashboard Config

**PAGE BUILDER**
```
GET  /page_builder/pages                     (PAGE_BUILDER)
POST /page_builder/pages                     (PAGE_BUILDER)
PATCH /page_builder/pages/update             (PAGE_BUILDER)
DELETE /page_builder/pages/delete            (PAGE_BUILDER)

GET  /page_builder/sections                  (PAGE_BUILDER)
POST /page_builder/sections                  (PAGE_BUILDER)
PATCH /page_builder/sections/update          (PAGE_BUILDER)
DELETE /page_builder/sections/delete         (PAGE_BUILDER)

GET  /page_builder/tabs                      (PAGE_BUILDER)
POST /page_builder/tabs                      (PAGE_BUILDER)
PATCH /page_builder/tabs/update              (PAGE_BUILDER)
DELETE /page_builder/tabs/delete             (PAGE_BUILDER)

GET  /page_builder/widgets                   (PAGE_BUILDER)
POST /page_builder/widgets                   (PAGE_BUILDER)
PATCH /page_builder/widgets/update           (PAGE_BUILDER)
DELETE /page_builder/widgets/delete          (PAGE_BUILDER)

GET  /page_builder/filters                   (PAGE_BUILDER)
POST /page_builder/filters                   (PAGE_BUILDER)
PATCH /page_builder/filters/update           (PAGE_BUILDER)
DELETE /page_builder/filters/delete          (PAGE_BUILDER)
```

**DASHBOARD SECTIONS**
```
GET  /dashboard_sections                     (MAIN_V1_0)
POST /dashboard_sections                     (MAIN_V1_0)
PATCH /favorites_id                          (MAIN_V1_0)
```

**CHART CATALOG**
```
GET  /chart_catalog                          (CHART_FAVORITES)
POST /chart_catalog                          (CHART_FAVORITES)
PATCH /chart_catalog/{id}                    (CHART_FAVORITES)
```

---

### CSV Upload

```
GET  /csv/configure_mapping/list             (CSV_UPLOAD)
POST /csv/configure_mapping                  (CSV_UPLOAD)
POST /csv/validate                           (CSV_UPLOAD)
POST /csv/process_batch                      (CSV_UPLOAD)
```

---

### KPI Goals

```
GET  /kpi_goals/list                         (KPI_GOALS)
POST /kpi_goals_save                         (KPI_GOALS)
```

---

### Links

```
GET  /links                                  (MAIN_V1_0)
POST /links                                  (MAIN_V1_0)
POST /links/edit                             (MAIN_V1_0)
POST /links/reorder                          (MAIN_V1_0)
```

---

### Contact Log

```
GET  /contact_log                            (TRANSACTIONS_V2)
POST /contact_log                            (TRANSACTIONS_V2)
```

---

## Comparison: dashboards2.0 Needs vs Frontend API v2 Availability

### ✅ LIKELY AVAILABLE in Frontend API v2

Based on the OpenAPI spec generated (174 endpoints), these categories should be covered:
- Transactions (all, by-participant, participants, manual_entry, coordinates)
- Listings (all, by-participant, coordinates)
- Network (all, counts, pipeline operations)
- Revenue (all, by-participant)
- Roster/Team Management (roster, count, updates)
- Notifications (CRUD operations)
- Contact Log
- Dashboard Sections
- Chart Catalog
- KPI Goals
- CSV Operations
- Links
- Contributions/RevShare

### ❌ UNKNOWN - Need to Check Workspace 5 for These

These might NOT be in Frontend API v2 (Group 515):
- **Integration-specific endpoints**: DotLoop, Lofty, Sierra (likely separate API groups)
- **Auth endpoints**: /auth/login, /auth/me (likely different API group)
- **Staff management**: invite, delete, update (might be admin-only)
- **Subscription/Stripe**: billing endpoints (likely separate API group)
- **Page Builder**: Full CRUD for dynamic pages (might be in different workspace/group)

---

## Next Steps

1. ✅ Extract all endpoint paths from Frontend API v2 OpenAPI spec
2. ✅ Map dashboards2.0 required endpoints to available Frontend API v2 endpoints
3. 🔄 Identify CRITICAL GAPS (endpoints dashboards2.0 needs but Frontend API v2 doesn't have)
4. 🔄 Test critical endpoints manually with curl
5. 🔄 Fix 5 backend 500 errors
6. 🔄 Prioritize endpoint fixes based on dashboards2.0 production needs

---

## Test User Credentials

**User 60 (David Keener)** - PRIMARY test user
- Email: dave@premieregrp.com
- Password: Password123!
- Agent ID: 37208
- Team ID: 1

**Auth Endpoint (Workspace 5)**
```bash
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:i6a062_x/auth/test-login" \
  -H "Content-Type: application/json" \
  -d '{"email": "dave@premieregrp.com", "password": "Password123!"}'
```

Response format:
```json
{
  "result": {
    "data": {
      "authToken": "eyJhbGci..."
    }
  }
}
```
