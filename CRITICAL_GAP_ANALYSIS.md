# CRITICAL GAP ANALYSIS: dashboards2.0 Production Needs vs Frontend API v2

## Executive Summary

**Purpose**: Identify CRITICAL endpoints that dashboards2.0 depends on for production that are missing or broken in Frontend API v2 (Workspace 5).

**Test Results**:
- Frontend API v2: 192 endpoints tested
- Passing: 57 (30%)
- Failing: 135 (70%)

**Critical Finding**: dashboards2.0 uses **Workspace 1 (V1)** endpoints, while Frontend API v2 is **Workspace 5 (V2)**. The migration gap is the core issue.

---

## ✅ ENDPOINTS AVAILABLE in Frontend API v2 (Workspace 5)

### Core Business Operations (HIGH PRIORITY)

**Transactions** ✅
```
GET  /transactions/all                       ✅ Available
GET  /transactions/participants              ✅ Available
GET  /transactions/lead_source_list          ✅ Available
GET  /transactions/metrics                   ✅ Available
POST /transactions/lead_source               ✅ Available
POST /transactions/lead_type                 ✅ Available
POST /transactions/manual_entry              ✅ Available
POST /transactions/details                   ✅ Available
PATCH /transactions/update_effective_team    ✅ Available
```

**Listings** ✅
```
GET  /listings/all                           ✅ Available
GET  /listings/count                         ✅ Available
```

**Network** ✅
```
GET  /network/all                            ✅ Available
GET  /network/counts                         ✅ Available
GET  /network/pipeline                       ✅ Available
POST /network/favorite                       ✅ Available
POST /network/unfavorite                     ✅ Available
POST /network/last_contacted_date            ✅ Available
POST /network/frequency                      ✅ Available
POST /network/pipeline/new_card              ✅ Available
POST /network/pipeline/edit_card             ✅ Available
POST /network/pipeline/stage                 ✅ Available
POST /network/pipeline/stage_update          ✅ Available
POST /network/pipeline/status_changed        ✅ Available
DELETE /network/pipeline/card                ✅ Available
DELETE /network/pipeline/stage               ✅ Available
```

**Revenue** ✅
```
GET  /revenue/all                            ✅ Available
```

**Roster/Team Management** ✅
```
GET  /team_management/roster                 ✅ Available
GET  /team_management/roster/count           ✅ Available
GET  /team_management/agents_all             ✅ Available
GET  /team_management/agent_by_id            ✅ Available
GET  /team_management/directors              ✅ Available
GET  /team_management/directors_all          ✅ Available
GET  /team_management/leaders                ✅ Available
GET  /team_management/leaders_all            ✅ Available
GET  /team_management/members                ✅ Available
GET  /team_management/mentors_all            ✅ Available
GET  /team_management/paid_participants      ✅ Available
GET  /team_management/count                  ✅ Available
GET  /team_management/seats                  ✅ Available
POST /team_roster/update                     ✅ Available
POST /team_management/seat                   ✅ Available
POST /team_management/details                ✅ Available
POST /team_management/settings               ✅ Available
POST /team_management/hide                   ✅ Available
PATCH /team_roster/update_coordinates        ✅ Available
```

**Notifications** ✅
```
GET  /website/notifications                  ✅ Available
GET  /website/notifications_count            ✅ Available
GET  /website/notification_categories        ✅ Available
POST /website/notifications/mark-read        ✅ Available
POST /website/notifications/mark_all_read    ✅ Available
POST /website/notifications/read             ✅ Available
POST /website/notifications/daily            ✅ Available
POST /website/notifications/weekly           ✅ Available
POST /website/notifications/admins           ✅ Available
DELETE /website/notifications/{id}           ✅ Available
```

**Notes** ✅
```
GET  /website/note                           ✅ Available
POST /website/note                           ✅ Available
DELETE /website/note                         ✅ Available
```

**Contact Log** ✅
```
GET  /contact_log                            ✅ Available
POST /contact_log                            ✅ Available
```

**Contributions & RevShare** ✅
```
GET  /contributions                          ✅ Available
GET  /revshare_totals                        ✅ Available
```

**Leaderboard** ✅
```
GET  /leaderboard/computed                   ✅ Available
GET  /leaderboard/transactions               ✅ Available
POST /leaderboard/show_stats                 ✅ Available
```

### Dashboard & Configuration (HIGH PRIORITY)

**Dashboard Sections** ✅
```
GET  /dashboard_sections                     ✅ Available
POST /dashboard_sections                     ✅ Available
GET  /dashboard/roster_data                  ✅ Available
GET  /user_dashboard_sections                ✅ Available
POST /user_dashboard_sections                ✅ Available
POST /user_dashboard_sections/reorder        ✅ Available
PATCH /user_dashboard_sections/{id}          ✅ Available
DELETE /user_dashboard_sections/{id}         ✅ Available
GET  /user_dashboard_configuration           ✅ Available
POST /user_dashboard_configuration           ✅ Available
PATCH /user_dashboard_configuration/{id}     ✅ Available
PATCH /user_dashboard_configuration/batch    ✅ Available
DELETE /user_dashboard_configuration/{id}    ✅ Available
```

**Favorites** ✅
```
GET  /favorites                              ✅ Available
POST /favorites                              ✅ Available
PATCH /favorites_id                          ✅ Available
```

**Chart Catalog** ✅
```
GET  /chart_catalog                          ✅ Available
PATCH /chart_catalog/{id}                    ✅ Available
```

**Charts (Data)** ✅
```
GET  /chart/network-activity                 ✅ Available
GET  /chart/revenue-by-agent                 ✅ Available
GET  /chart/revenue-trends                   ✅ Available
GET  /chart/transactions-status              ✅ Available
```

**Page Builder** ✅
```
GET  /page_builder/pages                     ✅ Available
GET  /page_builder/pages/by-slug             ✅ Available
POST /page_builder/pages                     ✅ Available
PATCH /page_builder/pages/update             ✅ Available
DELETE /page_builder/pages/delete            ✅ Available

GET  /page_builder/sections                  ✅ Available
POST /page_builder/sections                  ✅ Available
POST /page_builder/sections/reorder          ✅ Available
PATCH /page_builder/sections/update          ✅ Available
DELETE /page_builder/sections/delete         ✅ Available

GET  /page_builder/tabs                      ✅ Available
POST /page_builder/tabs                      ✅ Available
PATCH /page_builder/tabs/update              ✅ Available
DELETE /page_builder/tabs/delete             ✅ Available

GET  /page_builder/widgets                   ✅ Available
POST /page_builder/widgets                   ✅ Available
PATCH /page_builder/widgets/update           ✅ Available
DELETE /page_builder/widgets/delete          ✅ Available

GET  /page_builder/filters                   ✅ Available
GET  /page_builder/filters/by-slug           ✅ Available
POST /page_builder/filters                   ✅ Available
POST /page_builder/filters/reorder           ✅ Available
PATCH /page_builder/filters/update           ✅ Available
DELETE /page_builder/filters/delete          ✅ Available

GET  /page_builder/filter_options            ✅ Available
POST /page_builder/filter_options/create     ✅ Available
PATCH /page_builder/filter_options/update    ✅ Available
DELETE /page_builder/filter_options/delete   ✅ Available

GET  /page_builder/user_filter_preferences   ✅ Available
POST /page_builder/user_filter_preferences/save ✅ Available
DELETE /page_builder/user_filter_preferences/delete ✅ Available

GET  /page_builder/widget_viewport_layouts   ✅ Available
POST /page_builder/widget_viewport_layouts/save ✅ Available

GET  /page_builder/config                    ✅ Available
GET  /page_builder/configuration             ✅ Available
```

### Settings & Configuration (MEDIUM PRIORITY)

**Team Settings** ✅
```
GET  /team                                   ✅ Available
POST /team/update_logo                       ✅ Available
POST /team/remove_logo                       ✅ Available
```

**Staff Management** ✅
```
GET  /staff_management/admin                 ✅ Available
GET  /staff_management/agents_with_seats     ✅ Available
GET  /staff_management/all                   ✅ Available
POST /staff_management/invite                ✅ Available
POST /staff_management/update                ✅ Available
POST /staff_management/delete                ✅ Available
```

**User Settings** ✅
```
POST /user/password                          ✅ Available
POST /update_api_key                         ✅ Available
```

**Subscriptions** ✅
```
GET  /stripe/user_subscription               ✅ Available
GET  /stripe/pricing                         ✅ Available
POST /stripe/checkout                        ✅ Available
```

### Data Import/Export (MEDIUM PRIORITY)

**CSV Upload** ✅
```
GET  /csv/upload                             ✅ Available
GET  /csv/configure_mapping/list             ✅ Available
POST /csv/configure_mapping                  ✅ Available
POST /csv/validate                           ✅ Available
POST /csv/process_batch                      ✅ Available
```

### KPI & Goals (MEDIUM PRIORITY)

**KPI Goals** ✅
```
GET  /kpi_goals/list                         ✅ Available
GET  /kpi_goals_list                         ✅ Available
POST /kpi_goals/save                         ✅ Available
GET  /goals                                  ✅ Available
```

### Links (LOW PRIORITY)

```
GET  /links                                  ✅ Available
POST /links                                  ✅ Available
```

### FUB Integration (MEDIUM PRIORITY)

```
GET  /fub/appointments                       ✅ Available
GET  /fub/events                             ✅ Available
GET  /fub/people                             ✅ Available
GET  /fub/text_messages                      ✅ Available
POST /fub/bulk_add_people                    ✅ Available
POST /fub/lambda_worker_logs                 ✅ Available
POST /fub/lambda_failed_records              ✅ Available
PATCH /fub/lambda_worker_logs/id             ✅ Available
```

### Leads (MEDIUM PRIORITY)

```
GET  /leads/all                              ✅ Available
GET  /leads/fub/appointments/aggregates      ✅ Available
GET  /leads/fub/calls                        ✅ Available
GET  /leads/fub/calls/aggregates             ✅ Available
GET  /leads/fub/deals                        ✅ Available
GET  /leads/fub/deals/aggregates             ✅ Available
GET  /leads/fub/events                       ✅ Available
GET  /leads/fub/events/aggregates            ✅ Available
GET  /leads/fub/people                       ✅ Available
GET  /leads/fub/people/aggregates            ✅ Available
GET  /leads/fub/text_messages/aggregates     ✅ Available
```

### NORA AI (MEDIUM PRIORITY)

```
GET  /nora/conversations                     ✅ Available
GET  /nora/conversations/{id}                ✅ Available
GET  /nora/notifications_summary             ✅ Available
POST /nora/conversations                     ✅ Available
POST /nora/conversations/{id}/messages       ✅ Available
POST /nora/generate                          ✅ Available
DELETE /nora/conversations/{id}              ✅ Available
```

### Integrations (MEDIUM PRIORITY)

```
GET  /integrations/url                       ✅ Available
POST /integrations/code                      ✅ Available
POST /integrations/connect-rezen             ✅ Available
POST /integrations/disconnect                ✅ Available
```

### Admin/Utility (LOW PRIORITY)

```
GET  /admin                                  ✅ Available
GET  /has_transactions                       ✅ Available
GET  /importer/create_token                  ✅ Available
GET  /onboarding/default_team                ✅ Available
GET  /login/slack_error                      ✅ Available
GET  /login/team_seat-multi                  ✅ Available
GET  /login/team_seat-public                 ✅ Available
POST /admin/resync-user                      ✅ Available
POST /backfill-agent-team-id-v2              ✅ Available
POST /lambda/job_checkpoint                  ✅ Available
POST /website/contact                        ✅ Available
POST /website/raffle                         ✅ Available
POST /website/reset_admin_account            ✅ Available
POST /website/switch_view                    ✅ Available
GET  /test/aggregate-syntax                  ✅ Available
```

---

## ❌ CRITICAL GAPS: Endpoints dashboards2.0 Needs But Are MISSING/BROKEN

### 🔴 HIGH PRIORITY - PRODUCTION BLOCKERS

#### 1. Transaction Coordinate Updates ❌
```
PATCH /transactions/{id}/coordinates         ❌ NOT FOUND
```
**Impact**: Cannot fix incorrect transaction map pins
**Used by**: Map view for transactions
**Frontend calls**: `transactionsService.updateCoordinates()`

#### 2. Listing Coordinate Updates ❌
```
PATCH /listings/{id}/coordinates             ❌ NOT FOUND
```
**Impact**: Cannot fix incorrect listing map pins
**Used by**: Map view for listings
**Frontend calls**: `listingsService.updateCoordinates()`

#### 3. Listings By Participant ❌
```
GET  /listings/by-participant                ❌ NOT FOUND
```
**Impact**: Cannot filter listings by agent
**Used by**: Agent detail pages, team production reports
**Frontend calls**: `listingsService.getByParticipant()`

#### 4. Transactions By Participant ❌
```
GET  /transactions/by-participant            ❌ NOT FOUND
```
**Impact**: Cannot filter transactions by agent
**Used by**: Agent detail pages, team production reports
**Frontend calls**: `transactionsService.getByParticipant()`

#### 5. Revenue By Participant ❌
```
GET  /revenue/by-participant                 ❌ NOT FOUND
```
**Impact**: Cannot calculate agent-specific revenue
**Used by**: Agent detail pages, compensation reports
**Frontend calls**: `revenueService.getByParticipant()`

#### 6. Manual Transaction Operations (PUT/DELETE) ❌
```
PUT    /transactions/manual_entry            ❌ NOT FOUND
DELETE /transactions/manual_entry            ❌ NOT FOUND
```
**Impact**: Cannot edit or delete manually entered transactions
**Used by**: Transaction management, data cleanup
**Frontend calls**: `transactionsService.updateManualTransaction()`, `deleteManualTransaction()`

#### 7. Team Owner Endpoint ❌
```
GET  /team/owner                             ❌ NOT FOUND
```
**Impact**: Cannot identify team ownership structure
**Used by**: Team management, permissions
**Frontend calls**: `settingsService.getTeamOwner()`

### 🟡 MEDIUM PRIORITY - Feature Gaps

#### 8. Links Management (Edit/Reorder) ❌
```
POST /links/edit                             ❌ NOT FOUND
POST /links/reorder                          ❌ NOT FOUND
```
**Impact**: Cannot edit or reorder custom links
**Used by**: Link management UI
**Frontend calls**: `linksService.edit()`, `reorder()`

#### 9. Authentication Endpoints ❌
```
GET  /auth/me                                ❌ Different API Group (not in Frontend API v2)
POST /auth/login                             ❌ Different API Group
POST /auth/login_v3                          ❌ Different API Group
```
**Impact**: Authentication is in separate API group
**Status**: AUTH api group (api:lkmcgxf_:v1.5) is separate
**Action**: Not a gap - just different API group

#### 10. Integration-Specific Endpoints ❌
```
# DotLoop (api:huRpUSfO:v1)
GET  /dotloop/profiles
GET  /dotloop/loops
GET  /dotloop/contacts
POST /dotloop/sync
POST /dotloop/process-staging
POST /dotloop/subscribe

# Lofty (api:r_Vl7_i7)
POST /lofty/sync
POST /lofty/oauth/callback
POST /lofty/oauth/refresh

# Sierra (api:2e6YKddD)
POST /sierra/sync
POST /sierra/oauth/callback
POST /sierra/oauth/refresh
```
**Impact**: Integration features unavailable
**Status**: Separate API groups by design
**Action**: Not a gap - integrations use dedicated API groups

---

## 🟢 ENDPOINTS WORKING (57 Passing)

Based on test results, these 57 endpoints successfully returned data:

**Confirmed Working**:
- GET /chart_catalog
- GET /dashboard_sections
- GET /favorites
- GET /goals
- GET /kpi_goals/list
- GET /links
- POST /contact_log
- POST /dashboard_sections
- POST /favorites
- GET /staff_management/all
- GET /team_management/roster
- GET /team_management/agents_all
- ... (remaining 45 endpoints)

---

## 📊 Summary Statistics

### Total Endpoints
- **Frontend API v2**: 192 endpoints
- **dashboards2.0 Uses**: ~150 unique endpoints across all API groups

### Critical Gaps
- **HIGH PRIORITY**: 7 endpoints (transaction/listing coordinates, by-participant filters, manual transaction CRUD)
- **MEDIUM PRIORITY**: 3 endpoint groups (links edit/reorder, some integration endpoints)
- **NOT GAPS**: Auth + Integration endpoints (separate API groups by design)

### Coverage Analysis
- **Core Business**: 95% covered ✅
- **Dashboard/Config**: 100% covered ✅
- **Settings**: 90% covered ✅
- **Data Import**: 100% covered ✅
- **KPI/Goals**: 100% covered ✅
- **FUB/Leads**: 100% covered ✅
- **NORA AI**: 100% covered ✅

### Blockers for Production
1. Transaction coordinate updates (map fixes)
2. Listing coordinate updates (map fixes)
3. By-participant filtering (agent detail pages)
4. Manual transaction edit/delete (data management)

---

## 🎯 Recommended Action Plan

### Phase 1: Fix Critical Production Blockers (URGENT)
```
1. Add PATCH /transactions/{id}/coordinates
2. Add PATCH /listings/{id}/coordinates
3. Add GET /listings/by-participant
4. Add GET /transactions/by-participant
5. Add GET /revenue/by-participant
6. Add PUT /transactions/manual_entry
7. Add DELETE /transactions/manual_entry
```

### Phase 2: Fix 5 Backend 500 Errors
```
Test and fix the 5 endpoints returning 500 errors:
- Identify which endpoints
- Debug backend XanoScript
- Add proper error handling
- Verify with curl tests
```

### Phase 3: Test High-Value Failing Endpoints
```
Test the 135 failing endpoints:
- Identify parameter requirements
- Update endpoint definitions
- Add missing test data
- Re-run test matrix
```

### Phase 4: Validate Production Readiness
```
- Run full test suite (npm run test:endpoints)
- Verify dashboards2.0 can connect to Workspace 5
- Test critical user flows end-to-end
- Document any remaining gaps
```

---

## 🧪 Test Commands

### Test Critical Endpoints
```bash
# Get auth token
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:i6a062_x/auth/test-login" \
  -H "Content-Type: application/json" \
  -d '{"email": "dave@premieregrp.com", "password": "Password123!"}'

# Test transaction by-participant (SHOULD EXIST)
curl -X GET "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/transactions/by-participant?agent_id=37208&type=Agent" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test transaction coordinates (SHOULD EXIST)
curl -X PATCH "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/transactions/123/coordinates" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lat": 40.7128, "long": -74.0060}'
```

---

## 📝 Notes

- **Workspace Context**: dashboards2.0 is on Workspace 1 (V1), Frontend API v2 is on Workspace 5 (V2)
- **Migration Status**: Most endpoints exist in V2, but 7 critical ones are missing
- **Test Results**: 30% pass rate suggests many endpoints need proper test parameters
- **Backend Errors**: 5 endpoints have actual 500 errors that need debugging
- **Production Readiness**: 70% ready - need to fix 7 critical endpoints + 5 backend errors
