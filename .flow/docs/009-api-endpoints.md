# API Endpoints - V2 Backend

> Task 4.1: Map Frontend API v2 endpoints by domain

## API Group Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           API GROUPS SUMMARY                                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  Total API Groups: 27                                                               │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────┐    │
│  │  ACTIVE (V2)                                                               │    │
│  ├────────────────────────────────────────────────────────────────────────────┤    │
│  │  515  │ 🚀 Frontend API v2     │ 200 endpoints │ Main frontend API        │    │
│  │  519  │ 🔐 Auth                │  12 endpoints │ Authentication           │    │
│  │  646  │ 📥 Webhooks            │  22 endpoints │ Inbound webhooks         │    │
│  └────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────┐    │
│  │  MCP TESTING                                                               │    │
│  ├────────────────────────────────────────────────────────────────────────────┤    │
│  │  532  │ 🔧 MCP: Tasks          │ Task triggers                             │    │
│  │  535  │ 🔧 MCP: System         │ System oversight                          │    │
│  │  536  │ 🔧 MCP: Workers        │ Worker testing                            │    │
│  │  531  │ 🔧 MCP: Seeding        │ Data seeding                              │    │
│  │  574  │ 🔧 MCP: SkySlope Tests │ SkySlope integration tests                │    │
│  └────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────┐    │
│  │  ADMIN/MIGRATION                                                           │    │
│  ├────────────────────────────────────────────────────────────────────────────┤    │
│  │  650  │ 🔄 Migration: V1 to V2 │ Migration utilities                       │    │
│  │  654  │ 🔍 Workspace Intro     │ Schema comparison                         │    │
│  │  659  │ Machine 2.0 Tests      │ Machine 2.0 testing                       │    │
│  │  657  │ BugFeedback            │ Bug reporting                             │    │
│  └────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────┐    │
│  │  WEBHOOKS (Inbound)                                                        │    │
│  ├────────────────────────────────────────────────────────────────────────────┤    │
│  │  340  │ 📥 Webhook: Stripe     │ Stripe payment webhooks                   │    │
│  │  348  │ 📥 Webhook: FUB        │ Follow Up Boss webhooks                   │    │
│  └────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────┐    │
│  │  LEGACY (📦)                                                               │    │
│  ├────────────────────────────────────────────────────────────────────────────┤    │
│  │  337  │ Auto CRUD              │ 🗑️ Delete                                 │    │
│  │  339  │ Legacy: Team           │ Team data (legacy)                        │    │
│  │  341  │ Legacy: Auth           │ Authentication (legacy)                   │    │
│  │  342  │ Legacy: Dashboard      │ Dashboard (legacy)                        │    │
│  │  343  │ Legacy: Individual     │ User data (legacy)                        │    │
│  │  344  │ Legacy: Charts         │ Analytics (legacy)                        │    │
│  │  345  │ Legacy: Onboarding     │ Onboarding (legacy)                       │    │
│  │  346  │ Legacy: Workers        │ Workers (legacy)                          │    │
│  │  349  │ Legacy: CSV Import     │ CSV import (legacy)                       │    │
│  │  355  │ Legacy: Luzmo          │ Luzmo analytics (legacy)                  │    │
│  │  361  │ Legacy: Notifications  │ Notifications (legacy)                    │    │
│  │  364  │ Legacy: Auth 2FA       │ 2FA (legacy)                              │    │
│  │  533  │ Legacy: Preferences    │ User preferences (legacy)                 │    │
│  └────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Frontend API v2 (515) - 200 Endpoints

Base URL: `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I`

### Transactions Domain

| Method | Endpoint                                        | Auth | Tags                                 |
| ------ | ----------------------------------------------- | ---- | ------------------------------------ |
| GET    | `/transactions/all`                             | 🔐   | dashboard, v2, transactions          |
| GET    | `/transactions/metrics`                         | 🔐   | dashboard, v2, transactions, metrics |
| GET    | `/transactions/participants`                    | 🔐   | dashboard, v2                        |
| POST   | `/transactions/manual_entry`                    | 🔐   | dashboard, v2                        |
| POST   | `/transactions/details`                         | -    | dashboard, transaction, v2           |
| POST   | `/transactions/lead_type`                       | 🔐   | dashboard, transaction, v2           |
| POST   | `/transactions/lead_source`                     | 🔐   | dashboard, transaction, v2           |
| GET    | `/transactions/lead_source_list`                | 🔐   | dashboard, transaction, v2           |
| PATCH  | `/transactions/manual_entry`                    | 🔐   | dashboard, v2                        |
| GET    | `/transactions/manual_entry/{id}`               | 🔐   | dashboard, v2                        |
| DELETE | `/transactions/manual_entry/{id}`               | 🔐   | dashboard, v2                        |
| PATCH  | `/transactions/update_effective_team`           | 🔐   | dashboard, v2                        |
| GET    | `/transactions/by-participant/{participant_id}` | 🔐   | dashboard, v2                        |
| PATCH  | `/transactions/coordinates/{transaction_id}`    | 🔐   | dashboard, v2                        |

### Listings Domain

| Method | Endpoint                                    | Auth | Tags                    |
| ------ | ------------------------------------------- | ---- | ----------------------- |
| GET    | `/listings/all`                             | 🔐   | dashboard, v2, listings |
| GET    | `/listings/count`                           | 🔐   | dashboard, listing, v2  |
| GET    | `/listings/by-participant/{participant_id}` | 🔐   | dashboard, v2           |
| PATCH  | `/listings/coordinates/{listing_id}`        | 🔐   | dashboard, v2           |

### Revenue Domain

| Method | Endpoint                                   | Auth | Tags                   |
| ------ | ------------------------------------------ | ---- | ---------------------- |
| GET    | `/revenue/all`                             | 🔐   | dashboard, v2, revenue |
| GET    | `/revenue/by-participant/{participant_id}` | 🔐   | dashboard, v2          |

### Network Domain

| Method | Endpoint                           | Auth | Tags                   |
| ------ | ---------------------------------- | ---- | ---------------------- |
| GET    | `/network/all`                     | 🔐   | dashboard, v2, network |
| GET    | `/network/counts`                  | 🔐   | dashboard, v2, network |
| GET    | `/network/pipeline`                | 🔐   | dashboard, v2, network |
| POST   | `/network/favorite`                | 🔐   | -                      |
| POST   | `/network/unfavorite`              | 🔐   | -                      |
| POST   | `/network/frequency`               | 🔐   | network, follow-ups    |
| POST   | `/network/last_contacted_date`     | 🔐   | network, follow-ups    |
| POST   | `/network/pipeline/new_card`       | 🔐   | -                      |
| POST   | `/network/pipeline/edit_card`      | 🔐   | pipeline, prospects    |
| POST   | `/network/pipeline/stage`          | 🔐   | -                      |
| POST   | `/network/pipeline/stage_update`   | 🔐   | -                      |
| DELETE | `/network/pipeline/stage`          | 🔐   | -                      |
| DELETE | `/network/pipeline/card`           | 🔐   | -                      |
| POST   | `/network/pipeline/status_changed` | 🔐   | -                      |

### Team Management Domain

| Method | Endpoint                             | Auth | Tags                                   |
| ------ | ------------------------------------ | ---- | -------------------------------------- |
| GET    | `/team`                              | 🔐   | -                                      |
| GET    | `/team_management/roster`            | -    | dashboard, team, v2, normalized-tables |
| GET    | `/team_management/count`             | -    | dashboard, team, v2                    |
| GET    | `/team_management/members`           | -    | dashboard, team, v2                    |
| GET    | `/team_management/seats`             | -    | dashboard, team, v2                    |
| GET    | `/team_management/paid_participants` | 🔐   | dashboard, team, v2                    |
| GET    | `/team_management/agent_by_id`       | -    | dashboard, team, v2                    |
| GET    | `/team_management/agents_all`        | -    | dashboard, team, v2                    |
| GET    | `/team_management/leaders`           | -    | dashboard, team, v2                    |
| GET    | `/team_management/leaders_all`       | -    | dashboard, team, v2                    |
| GET    | `/team_management/directors`         | -    | dashboard, team, v2                    |
| GET    | `/team_management/directors_all`     | -    | dashboard, team, v2                    |
| GET    | `/team_management/mentors_all`       | -    | dashboard, team, v2                    |
| GET    | `/team_management/roster/count`      | 🔐   | -                                      |
| POST   | `/team_management/details`           | 🔐   | -                                      |
| POST   | `/team_management/seat`              | 🔐   | -                                      |
| POST   | `/team_management/settings`          | 🔐   | -                                      |
| POST   | `/team_management/hide`              | -    | dashboard, team, v2                    |

### Team Roster Domain

| Method | Endpoint                          | Auth | Tags                                   |
| ------ | --------------------------------- | ---- | -------------------------------------- |
| POST   | `/team_roster/update`             | 🔐   | dashboard, team, v2, roster-management |
| PATCH  | `/team_roster/update_coordinates` | 🔐   | dashboard, team, v2, location          |

### Staff Management Domain

| Method | Endpoint                              | Auth | Tags                 |
| ------ | ------------------------------------- | ---- | -------------------- |
| GET    | `/staff_management/all`               | 🔐   | -                    |
| GET    | `/staff_management/admin`             | 🔐   | dashboard, staff, v2 |
| GET    | `/staff_management/agents_with_seats` | 🔐   | dashboard, team, v2  |
| POST   | `/staff_management/invite`            | 🔐   | -                    |
| POST   | `/staff_management/update`            | 🔐   | -                    |
| POST   | `/staff_management/delete`            | 🔐   | -                    |

### Charts Domain

| Method | Endpoint                            | Auth | Tags                                     |
| ------ | ----------------------------------- | ---- | ---------------------------------------- |
| GET    | `/chart/revenue-by-agent`           | 🔐   | dashboard, v2, chart-data, revenue, team |
| GET    | `/chart/transactions-status`        | 🔐   | dashboard, v2, chart-data, transactions  |
| GET    | `/chart/revenue-trends`             | 🔐   | dashboard, v2, chart-data, revenue       |
| GET    | `/chart/network-activity`           | 🔐   | dashboard, v2, chart-data, network       |
| GET    | `/chart_catalog`                    | 🔐   | dashboard, v2, chart_catalog             |
| PATCH  | `/chart_catalog/{chart_catalog_id}` | 🔐   | -                                        |

### Page Builder Domain

| Method | Endpoint                                   | Auth | Tags |
| ------ | ------------------------------------------ | ---- | ---- |
| GET    | `/page_builder/pages`                      | -    | -    |
| GET    | `/page_builder/pages/by-slug`              | -    | -    |
| POST   | `/page_builder/pages`                      | -    | -    |
| PATCH  | `/page_builder/pages/{page_id}`            | -    | -    |
| DELETE | `/page_builder/pages/{page_id}`            | -    | -    |
| GET    | `/page_builder/tabs`                       | -    | -    |
| POST   | `/page_builder/tabs`                       | -    | -    |
| PATCH  | `/page_builder/tabs/{tab_id}`              | -    | -    |
| DELETE | `/page_builder/tabs/{tab_id}`              | -    | -    |
| GET    | `/page_builder/sections`                   | -    | -    |
| POST   | `/page_builder/sections`                   | -    | -    |
| PATCH  | `/page_builder/sections/{section_id}`      | -    | -    |
| DELETE | `/page_builder/sections/{section_id}`      | -    | -    |
| GET    | `/page_builder/widgets`                    | -    | -    |
| POST   | `/page_builder/widgets`                    | -    | -    |
| PATCH  | `/page_builder/widgets/{widget_id}`        | -    | -    |
| DELETE | `/page_builder/widgets/{widget_id}`        | -    | -    |
| GET    | `/page_builder/filters`                    | -    | -    |
| POST   | `/page_builder/filters`                    | -    | -    |
| PATCH  | `/page_builder/filters/{filter_id}`        | -    | -    |
| DELETE | `/page_builder/filters/{filter_id}`        | -    | -    |
| POST   | `/page_builder/filter_options`             | -    | -    |
| PATCH  | `/page_builder/filter_options/{option_id}` | -    | -    |
| DELETE | `/page_builder/filter_options/{option_id}` | -    | -    |

### Dashboard Configuration Domain

| Method | Endpoint                              | Auth | Tags                            |
| ------ | ------------------------------------- | ---- | ------------------------------- |
| GET    | `/user_dashboard_configuration`       | 🔐   | dashboard, v2, favorites        |
| POST   | `/user_dashboard_configuration`       | 🔐   | dashboard, v2, favorites        |
| PATCH  | `/user_dashboard_configuration/{id}`  | 🔐   | dashboard, v2, favorites        |
| PATCH  | `/user_dashboard_configuration/batch` | 🔐   | dashboard, v2, favorites, batch |
| DELETE | `/user_dashboard_configuration/{id}`  | 🔐   | dashboard, v2, favorites        |
| GET    | `/user_dashboard_sections`            | 🔐   | dashboard, v2, sections         |
| POST   | `/user_dashboard_sections`            | 🔐   | dashboard, v2, sections         |
| PATCH  | `/user_dashboard_sections/{id}`       | 🔐   | dashboard, v2, sections         |
| DELETE | `/user_dashboard_sections/{id}`       | 🔐   | dashboard, v2, sections         |
| POST   | `/user_dashboard_sections/reorder`    | 🔐   | -                               |

### KPI Goals Domain

| Method | Endpoint          | Auth | Tags               |
| ------ | ----------------- | ---- | ------------------ |
| GET    | `/kpi_goals/list` | 🔐   | dashboard, v2, kpi |
| POST   | `/kpi_goals/save` | 🔐   | -                  |
| GET    | `/goals`          | 🔐   | -                  |

### Contributions Domain

| Method | Endpoint           | Auth | Tags                         |
| ------ | ------------------ | ---- | ---------------------------- |
| GET    | `/contributions`   | 🔐   | dashboard, v2, contributions |
| GET    | `/revshare_totals` | 🔐   | dashboard, v2, revshare      |

### Leads / FUB Domain

| Method | Endpoint                       | Auth | Tags                 |
| ------ | ------------------------------ | ---- | -------------------- |
| GET    | `/leads/all`                   | 🔐   | dashboard, leads, v2 |
| GET    | `/leads/fub/people`            | 🔐   | -                    |
| GET    | `/leads/fub/people/aggregates` | 🔐   | -                    |
| GET    | `/leads/fub/deals`             | 🔐   | -                    |
| GET    | `/leads/fub/deals/aggregates`  | 🔐   | -                    |
| GET    | `/leads/fub/events`            | 🔐   | -                    |
| GET    | `/leads/fub/events/aggregates` | 🔐   | -                    |
| GET    | `/leads/fub/calls`             | 🔐   | -                    |
| GET    | `/leads/fub/calls/aggregates`  | 🔐   | -                    |
| GET    | `/fub/people`                  | 🔐   | -                    |
| GET    | `/fub/events`                  | 🔐   | -                    |
| GET    | `/fub/appointments`            | 🔐   | -                    |
| GET    | `/fub/text_messages`           | 🔐   | -                    |
| POST   | `/fub/bulk_add_people`         | -    | -                    |

### NORA AI Domain

| Method | Endpoint                                         | Auth | Tags                |
| ------ | ------------------------------------------------ | ---- | ------------------- |
| GET    | `/nora/conversations`                            | 🔐   | dashboard, v2, nora |
| POST   | `/nora/conversations`                            | 🔐   | dashboard, v2, nora |
| GET    | `/nora/conversations/{conversation_id}`          | 🔐   | dashboard, v2, nora |
| POST   | `/nora/conversations/{conversation_id}/messages` | 🔐   | dashboard, v2, nora |
| DELETE | `/nora/conversations/{conversation_id}`          | 🔐   | dashboard, v2, nora |
| POST   | `/nora/generate`                                 | -    | -                   |
| GET    | `/nora/notifications_summary`                    | 🔐   | -                   |

### Leaderboard Domain

| Method | Endpoint                    | Auth | Tags                       |
| ------ | --------------------------- | ---- | -------------------------- |
| GET    | `/leaderboard/transactions` | -    | dashboard, leaderboard, v2 |
| POST   | `/leaderboard/show_stats`   | 🔐   | -                          |

### Website Domain

| Method | Endpoint                                   | Auth | Tags                   |
| ------ | ------------------------------------------ | ---- | ---------------------- |
| GET    | `/website/notifications`                   | 🔐   | dashboard, website, v2 |
| GET    | `/website/notifications_count`             | 🔐   | dashboard, website, v2 |
| GET    | `/website/notification_categories`         | 🔐   | dashboard, website, v2 |
| POST   | `/website/notifications/read`              | 🔐   | dashboard, website, v2 |
| POST   | `/website/notifications/mark_all_read`     | 🔐   | dashboard, website, v2 |
| POST   | `/website/notifications/mark-read`         | 🔐   | -                      |
| DELETE | `/website/notifications/{notification_id}` | 🔐   | -                      |
| POST   | `/website/notifications/daily`             | 🔐   | -                      |
| POST   | `/website/notifications/weekly`            | 🔐   | -                      |
| POST   | `/website/notifications/admins`            | 🔐   | -                      |
| POST   | `/website/switch_view`                     | 🔐   | dashboard, website, v2 |
| POST   | `/website/reset_admin_account`             | 🔐   | dashboard, website, v2 |
| POST   | `/website/contact`                         | -    | dashboard, website, v2 |
| POST   | `/website/raffle`                          | -    | dashboard, website, v2 |
| GET    | `/website/note`                            | 🔐   | -                      |
| POST   | `/website/note`                            | 🔐   | -                      |
| DELETE | `/website/note`                            | 🔐   | -                      |

### Stripe Domain

| Method | Endpoint                    | Auth | Tags                 |
| ------ | --------------------------- | ---- | -------------------- |
| GET    | `/stripe/pricing`           | -    | stripe, pricing, v2  |
| POST   | `/stripe/checkout`          | 🔐   | stripe, checkout, v2 |
| GET    | `/stripe/user_subscription` | 🔐   | -                    |

### Integrations Domain

| Method | Endpoint                      | Auth | Tags |
| ------ | ----------------------------- | ---- | ---- |
| GET    | `/integrations/url`           | 🔐   | -    |
| POST   | `/integrations/code`          | 🔐   | -    |
| POST   | `/integrations/connect-rezen` | 🔐   | -    |
| POST   | `/integrations/disconnect`    | 🔐   | -    |

### User Domain

| Method | Endpoint          | Auth | Tags                |
| ------ | ----------------- | ---- | ------------------- |
| POST   | `/user/password`  | 🔐   | dashboard, user, v2 |
| POST   | `/update_api_key` | 🔐   | -                   |
| GET    | `/admin`          | 🔐   | -                   |

### CSV Import Domain

| Method | Endpoint                      | Auth | Tags |
| ------ | ----------------------------- | ---- | ---- |
| GET    | `/csv/upload`                 | 🔐   | -    |
| POST   | `/csv/validate`               | 🔐   | -    |
| POST   | `/csv/configure_mapping`      | 🔐   | -    |
| GET    | `/csv/configure_mapping/list` | 🔐   | -    |
| POST   | `/csv/process_batch`          | 🔐   | -    |

### Contact Log Domain

| Method | Endpoint       | Auth | Tags |
| ------ | -------------- | ---- | ---- |
| GET    | `/contact_log` | 🔐   | -    |
| POST   | `/contact_log` | 🔐   | -    |

### Links Domain

| Method | Endpoint | Auth | Tags |
| ------ | -------- | ---- | ---- |
| GET    | `/links` | 🔐   | -    |
| POST   | `/links` | 🔐   | -    |

### Login Domain

| Method | Endpoint                  | Auth | Tags                 |
| ------ | ------------------------- | ---- | -------------------- |
| GET    | `/login/team_seat-multi`  | -    | dashboard, login, v2 |
| GET    | `/login/team_seat-public` | -    | dashboard, login, v2 |
| GET    | `/login/slack_error`      | -    | dashboard, login, v2 |

### Onboarding Domain

| Method | Endpoint                   | Auth | Tags                      |
| ------ | -------------------------- | ---- | ------------------------- |
| GET    | `/onboarding/default_team` | -    | dashboard, onboarding, v2 |

### Lambda/Dashboard Domain

| Method | Endpoint                     | Auth | Tags |
| ------ | ---------------------------- | ---- | ---- |
| GET    | `/dashboard/roster_data`     | -    | -    |
| POST   | `/lambda/job_checkpoint`     | -    | -    |
| POST   | `/fub/lambda_worker_logs`    | -    | -    |
| PATCH  | `/fub/lambda_worker_logs/id` | -    | -    |
| POST   | `/fub/lambda_failed_records` | -    | -    |
| GET    | `/importer/create_token`     | -    | -    |

---

## Auth API (519) - 12 Endpoints

Base URL: `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:i6a062_x`

| Method | Endpoint                          | Auth | Tags                     | Purpose               |
| ------ | --------------------------------- | ---- | ------------------------ | --------------------- |
| POST   | `/auth/login`                     | -    | auth, user, v2, verified | Standard login        |
| POST   | `/auth/signup`                    | -    | auth, user, v2, verified | User registration     |
| GET    | `/auth/me`                        | 🔐   | auth, user, v2, verified | Get current user      |
| GET    | `/auth/magic-link`                | -    | auth, magic-link, v2     | Request magic link    |
| POST   | `/auth/magic-login`               | -    | auth, magic-link, v2     | Login via magic link  |
| GET    | `/auth/test-token`                | -    | -                        | Token validation test |
| POST   | `/auth/test-login`                | -    | -                        | Login test            |
| POST   | `/auth/set-password`              | -    | -                        | Set password          |
| GET    | `/role-based-access/user`         | 🔐   | auth, user, v2           | Get user permissions  |
| GET    | `/password_reset/request-link`    | -    | auth, security, v2       | Request reset link    |
| POST   | `/password_reset/update_password` | 🔐   | auth, security, v2       | Update password       |
| POST   | `/password_reset/magic-login`     | -    | auth, security, v2       | Magic login for reset |

---

## Webhooks API (646) - 22 Endpoints

Base URL: `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:XOwEm4wm`

### FUB Webhooks

| Method | Endpoint                           | Purpose              |
| ------ | ---------------------------------- | -------------------- |
| POST   | `/fub/webhook/create`              | Generic webhook      |
| POST   | `/fub/webhook/appointment_created` | Appointment webhooks |
| POST   | `/fub/webhook/textMessagesCreated` | SMS webhooks         |

### reZEN Webhooks

| Method | Endpoint                         | Purpose              |
| ------ | -------------------------------- | -------------------- |
| POST   | `/rezen/webhook/create`          | Generic webhook      |
| POST   | `/rezen/webhook/delete`          | Delete webhook       |
| POST   | `/rezen/user/{id}/transactions`  | Transactions by user |
| POST   | `/rezen/user_1/transactions`     | User 1 transactions  |
| POST   | `/rezen/user_1/listings`         | User 1 listings      |
| POST   | `/rezen/user_1/agents`           | User 1 agents        |
| POST   | `/rezen/user_1/life_cycle_group` | Lifecycle groups     |
| POST   | `/rezen/user_10/transactions`    | User 10 transactions |
| POST   | `/rezen/{id}/listing`            | Listing by ID        |

### SkySlope Webhooks

| Method | Endpoint                     | Purpose              |
| ------ | ---------------------------- | -------------------- |
| POST   | `/skyslope/credentials`      | Auth credentials     |
| GET    | `/skyslope/transactions/all` | Get all transactions |

### Other Webhooks

| Method | Endpoint                | Purpose              |
| ------ | ----------------------- | -------------------- |
| POST   | `/slack/notification`   | Slack notifications  |
| POST   | `/postmark/webhook`     | Email webhooks       |
| POST   | `/textiful/webhook`     | SMS webhooks         |
| POST   | `/remlo/webhook/data`   | Remlo webhooks       |
| POST   | `/otc/webhook/incoming` | OTC webhooks         |
| GET    | `/qualia/test`          | Qualia test endpoint |
| GET    | `/circle/auth_token`    | Circle auth          |
| GET    | `/circle/admin/members` | Circle members       |

---

## Endpoint Distribution by Domain

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           ENDPOINT DISTRIBUTION                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  Frontend API v2 (200 endpoints)                                                    │
│  ═══════════════════════════════════════════════════════════════════════════════   │
│                                                                                      │
│  Transactions       ████████████████  14 endpoints                                  │
│  Team Management    ██████████████████  18 endpoints                                │
│  Page Builder       █████████████████████████  25 endpoints                         │
│  Dashboard Config   ██████████  10 endpoints                                        │
│  Network            ██████████████  14 endpoints                                    │
│  Website            ███████████████  15 endpoints                                   │
│  Leads/FUB          ██████████████  14 endpoints                                    │
│  Charts             ██████  6 endpoints                                             │
│  NORA AI            ███████  7 endpoints                                            │
│  Other              ████████████████████████████████████████  77 endpoints          │
│                                                                                      │
│  Auth API (12 endpoints)                                                            │
│  ═══════════════════════════════════════════════════════════════════════════════   │
│                                                                                      │
│  Login/Signup       ████  4 endpoints                                               │
│  Magic Link         ████  4 endpoints                                               │
│  Password Reset     ███  3 endpoints                                                │
│  Other              █  1 endpoint                                                   │
│                                                                                      │
│  Webhooks API (22 endpoints)                                                        │
│  ═══════════════════════════════════════════════════════════════════════════════   │
│                                                                                      │
│  reZEN              ████████████  12 endpoints                                      │
│  FUB                ███  3 endpoints                                                │
│  SkySlope           ██  2 endpoints                                                 │
│  Other              █████  5 endpoints                                              │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Authentication Patterns

### Auth Token Requirements

| Pattern           | Endpoints      | Notes                             |
| ----------------- | -------------- | --------------------------------- |
| 🔐 Token Required | ~180 endpoints | Most Frontend API v2              |
| Public            | ~20 endpoints  | Team roster, leaderboard, pricing |
| Webhook           | 22 endpoints   | Inbound only, signature verified  |

### Token Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           AUTHENTICATION FLOW                                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  1. LOGIN                                                                           │
│     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                        │
│     │ POST login  │────>│ Validate    │────>│ Return JWT  │                        │
│     │ credentials │     │ password    │     │ + authToken │                        │
│     └─────────────┘     └─────────────┘     └─────────────┘                        │
│                                                                                      │
│  2. MAGIC LINK                                                                      │
│     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                        │
│     │ GET magic-  │────>│ Send email  │────>│ POST magic- │                        │
│     │    link     │     │ with link   │     │    login    │                        │
│     └─────────────┘     └─────────────┘     └─────────────┘                        │
│                                                                                      │
│  3. API CALLS                                                                       │
│     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                        │
│     │ Request +   │────>│ Middleware  │────>│ Process     │                        │
│     │ Auth Header │     │ validates   │     │ request     │                        │
│     └─────────────┘     └─────────────┘     └─────────────┘                        │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Endpoint Tagging Conventions

| Tag                | Meaning                       |
| ------------------ | ----------------------------- |
| `🏠 dashboard`     | Frontend dashboard feature    |
| `✨ v2`            | V2 implementation             |
| `🔵 verified-dec3` | Verified working December 3rd |
| `✅ verified`      | Verified working              |
| `🔧 iso-dates-*`   | ISO date format fix           |
| `📦 legacy`        | Legacy endpoint               |
| `🔐 auth`          | Authentication related        |
| `👥 team`          | Team management               |
| `💵 transaction`   | Transaction related           |
| `📊 chart-data`    | Chart data endpoint           |
| `🔗 magic-link`    | Magic link auth               |

---

## Curl Testing Examples

### Auth - Login

```bash
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:i6a062_x/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Transactions

```bash
curl -X GET "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/transactions/all" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Page Builder - Get Pages

```bash
curl -X GET "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/page_builder/pages"
```

---

_Generated: 2026-01-26_
_Task: fn-1-2cy.9_
