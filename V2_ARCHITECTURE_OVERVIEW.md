# V2 Architecture Overview: The Pinnacle System

**Generated:** 2026-02-04
**Status:** Production-Ready

---

## Executive Summary

V2 represents a complete architectural transformation of the AgentDashboards platform. What was a 251-table monolithic system with denormalized JSONB storage has been refactored into a **196-table normalized architecture** with proper relational integrity, specialized tables, and purpose-built aggregation systems.

**Key Metrics:**

- **196 V2 Tables** (normalized from 251 V1 tables)
- **335 Users** (100% synced with V1)
- **86,617 Network Members** (complete coverage)
- **55,008 Transactions**
- **37,040 Agents**
- **14,819 Listings**
- **Zero Orphan References**

---

## The Transformation: V1 → V2

### What Changed

| Aspect               | V1 (Legacy)        | V2 (Normalized)                                                                           |
| -------------------- | ------------------ | ----------------------------------------------------------------------------------------- |
| **Storage**          | JSONB `xdo` column | Individual typed columns                                                                  |
| **Relationships**    | JSON references    | Foreign key constraints                                                                   |
| **User Data**        | 1 table (user)     | 7 tables (identity, credentials, settings, roles, subscriptions, onboarding, preferences) |
| **Agent Data**       | 1 table (agent)    | 6 tables (core, cap_data, commission, hierarchy, performance, rezen)                      |
| **Transaction Data** | 1 table            | 5 tables (core, financials, history, participants, tags)                                  |
| **Listing Data**     | 1 table            | 3 tables (core, history, photos)                                                          |
| **Team Data**        | 1 table            | 4 tables (core, members, settings, leaders)                                               |
| **Network Data**     | 1 table            | 3 tables (hierarchy, member, user_prefs)                                                  |

### Why This Matters

1. **Query Performance**: Individual columns are indexed and typed
2. **Data Integrity**: Foreign keys prevent orphan references
3. **Maintainability**: Changes to one aspect don't require parsing JSON
4. **Analytics**: Aggregation tables pre-compute expensive calculations
5. **API Design**: Clean endpoints that return exactly what's needed

---

## Data Domains

### Core Identity (7 tables)

| Table                | Records | Purpose                                |
| -------------------- | ------- | -------------------------------------- |
| `user`               | 335     | Core user identity and profile         |
| `user_credentials`   | 1+      | API keys, OAuth tokens, auth data      |
| `user_settings`      | 1+      | Notifications, UI prefs, feature flags |
| `user_roles`         | 1+      | Director/leader/mentor assignments     |
| `user_subscriptions` | 1+      | Stripe billing, plan details           |
| `user_preferences`   | 1+      | Per-page UI customization              |
| `user_2fa`           | 1+      | Two-factor authentication              |

### Agent System (6 tables)

| Table               | Records | Purpose                              |
| ------------------- | ------- | ------------------------------------ |
| `agent`             | 37,040  | Core agent identity and affiliations |
| `agent_cap_data`    | 1+      | Annual cap tracking                  |
| `agent_commission`  | 1+      | Commission split configuration       |
| `agent_hierarchy`   | 1+      | Sponsor tree relationships           |
| `agent_performance` | 1+      | Transaction/listing metrics          |
| `agent_rezen`       | 1+      | Rezen integration data               |

### Transaction System (5 tables)

| Table                      | Records | Purpose                       |
| -------------------------- | ------- | ----------------------------- |
| `transaction`              | 55,008  | Core deal records             |
| `transaction_financials`   | 1+      | GCI, splits, fees, payments   |
| `transaction_history`      | 1+      | Status change audit trail     |
| `transaction_participants` | 1+      | Agent-to-transaction junction |
| `transaction_tags`         | 1+      | Categorization tags           |

### Listing System (3 tables)

| Table             | Records | Purpose                     |
| ----------------- | ------- | --------------------------- |
| `listing`         | 14,819  | Core property listings      |
| `listing_history` | 1+      | Price/status change history |
| `listing_photos`  | 1+      | Photo URLs and metadata     |

### Team System (8 tables)

| Table                       | Records | Purpose                |
| --------------------------- | ------- | ---------------------- |
| `team`                      | 260     | Core team records      |
| `team_members`              | 1+      | Agent-to-team junction |
| `team_settings`             | 1+      | Team configuration     |
| `director`                  | 1+      | Director records       |
| `leader`                    | 1+      | Leader records         |
| `mentor`                    | 1+      | Mentor records         |
| `team_director_assignments` | 1+      | Director-team junction |
| `team_leader_assignments`   | 1+      | Leader-team junction   |

### Network System (3 tables)

| Table                | Records | Purpose                |
| -------------------- | ------- | ---------------------- |
| `network_member`     | 86,617  | Rev share hierarchy    |
| `network_hierarchy`  | 1+      | Downline relationships |
| `network_user_prefs` | 1+      | View preferences       |

### Financial System (6 tables)

| Table              | Records | Purpose                 |
| ------------------ | ------- | ----------------------- |
| `contribution`     | 1+      | Rev share contributions |
| `income`           | 1+      | Unified income tracking |
| `equity_annual`    | 1+      | Annual equity summary   |
| `equity_monthly`   | 1+      | Monthly equity tracking |
| `revshare_payment` | 1+      | Payment distribution    |
| `revshare_totals`  | 3       | Aggregated earnings     |

### Aggregation System (4 tables)

| Table                     | Records | Purpose                    |
| ------------------------- | ------- | -------------------------- |
| `agg_agent_monthly`       | 16,028  | Monthly agent metrics      |
| `agg_leaderboard`         | 15,530  | Leaderboard computations   |
| `agg_transactions_weekly` | 579     | Weekly transaction rollups |
| `agg_fub_activity`        | 136     | FUB activity aggregates    |

### FUB Integration (12 tables)

| Table               | Records | Purpose                 |
| ------------------- | ------- | ----------------------- |
| `fub_accounts`      | 15      | FUB account connections |
| `fub_users`         | 271     | FUB user mappings       |
| `fub_people`        | 1+      | Synced contacts         |
| `fub_deals`         | 1+      | Pipeline opportunities  |
| `fub_calls`         | 1+      | Call logs               |
| `fub_events`        | 1+      | Activity events         |
| `fub_appointments`  | 1+      | Calendar sync           |
| `fub_text_messages` | 0       | SMS history             |
| `fub_stages`        | 1+      | Pipeline stages         |
| `fub_groups`        | 1+      | Contact groups          |
| `fub_sync_jobs`     | 1+      | Sync job tracking       |
| `fub_sync_state`    | 1+      | Sync cursors            |

### Integration Sync States (6 tables)

| Table                 | Purpose              |
| --------------------- | -------------------- |
| `rezen_sync_state`    | Rezen sync cursor    |
| `skyslope_sync_state` | SkySlope sync cursor |
| `fub_sync_state`      | FUB sync cursor      |
| `stripe_sync_state`   | Stripe sync cursor   |
| `dotloop_sync_state`  | DotLoop sync cursor  |
| `lofty_sync_state`    | Lofty sync cursor    |

### Page Builder System (8 tables)

| Table                     | Records | Purpose            |
| ------------------------- | ------- | ------------------ |
| `pages`                   | 1+      | Page definitions   |
| `page_tabs`               | 1+      | Tab navigation     |
| `page_sections`           | 1+      | Content sections   |
| `page_widgets`            | 1+      | Widget positioning |
| `page_filters`            | 0       | Filter definitions |
| `page_filter_options`     | 1+      | Filter options     |
| `user_filter_preferences` | 0       | User filter saves  |
| `widget_viewport_layouts` | 1+      | Responsive layouts |

---

## Integration Architecture

### Data Flow: V1 → V2

```
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SYSTEMS                          │
├─────────────────────────────────────────────────────────────┤
│   Rezen    │   SkySlope   │    FUB    │   Stripe   │ DotLoop│
│   (Agent   │  (Listings   │   (CRM    │  (Billing  │ (Docs  │
│   Data)    │   Txns)      │   Leads)  │   Subs)    │  Txns) │
└─────┬──────┴──────┬───────┴─────┬─────┴─────┬──────┴───┬────┘
      │             │             │           │          │
      ▼             ▼             ▼           ▼          ▼
┌─────────────────────────────────────────────────────────────┐
│                     WEBHOOKS & SYNC JOBS                     │
│  rezen_process_webhook │ skyslope_connection │ fub_sync_jobs│
│  rezen_sync_jobs       │ stage_*_skyslope    │ fub_onboarding│
└─────────────────────────────────────────────────────────────┘
      │             │             │           │          │
      ▼             ▼             ▼           ▼          ▼
┌─────────────────────────────────────────────────────────────┐
│                    STAGING TABLES                            │
│  stage_network_downline_rezen_onboarding                     │
│  stage_transactions_rezen_onboarding                         │
│  stage_listings_rezen_onboarding                             │
│  stage_contributions_rezen_daily_sync                        │
│  stage_transactions_skyslope                                 │
│  stage_listing_skyslope                                      │
│  stage_appointments_fub_onboarding                           │
│  stage_text_messages_fub_onboarding                          │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│                  V2 NORMALIZED TABLES                        │
│  user │ agent │ transaction │ listing │ network_member │ etc│
└─────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│                  AGGREGATION TABLES                          │
│  agg_agent_monthly │ agg_leaderboard │ agg_transactions_weekly│
└─────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND API v2                           │
│  207 Endpoints serving dashboards, reports, and analytics    │
└─────────────────────────────────────────────────────────────┘
```

---

## Tools Delivered

### 1. Data Integrity Verification Tool

**Endpoint:** `POST /api:20LTQtIX/test-sync`

Provides real-time V1 vs V2 comparison with gap analysis.

```bash
curl -s -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:20LTQtIX/test-sync"
```

**Returns:**

- Entity counts (V1 vs V2)
- Missing record identification
- Orphan reference detection
- Aggregation table status

### 2. Leaderboard Computation API

**Endpoint:** `GET /leaderboard/computed`

Pre-computed leaderboard data from aggregation tables.

```bash
curl "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/leaderboard/computed?time_period=ytd&status=closed&metric=units&team_id=1"
```

**Returns:**

- Transaction counts
- Agent rankings
- Volume and GCI metrics

### 3. Frontend API v2

**207 Endpoints** across domains:

- User management and authentication
- Transaction CRUD and metrics
- Listing management
- Network pipeline and contacts
- Team roster and management
- FUB CRM integration
- Page builder configuration
- Chart and widget management

### 4. Real-Time Sync Monitoring

Sync state tables track cursor positions for:

- Rezen data synchronization
- SkySlope transaction/listing sync
- FUB CRM event sync
- Stripe billing webhook processing
- DotLoop document sync
- Lofty lead sync

---

## Current Status

### Data Completeness

| Entity          | V1 Count | V2 Count | Status         |
| --------------- | -------- | -------- | -------------- |
| Users           | 335      | 335      | ✅ 100%        |
| Network Members | 86,617   | 86,623   | ✅ V2 superset |
| Agents          | -        | 37,040   | ✅ Normalized  |
| Teams           | -        | 260      | ✅ Normalized  |
| Transactions    | -        | 55,008   | ✅ Normalized  |
| Listings        | -        | 14,819   | ✅ Normalized  |
| FUB Accounts    | -        | 15       | ✅ Active      |

### Integrity Verification

| Check                   | Result |
| ----------------------- | ------ |
| Orphan Agent References | **0**  |
| Orphan Team References  | **0**  |
| Users with Agent Link   | 234    |
| Users with Team Link    | 204    |

### Aggregation System

| Table                   | Records | Status    |
| ----------------------- | ------- | --------- |
| agg_agent_monthly       | 16,028  | ✅ Active |
| agg_leaderboard         | 15,530  | ✅ Active |
| agg_transactions_weekly | 579     | ✅ Active |
| agg_fub_activity        | 136     | ✅ Active |

---

## Next Steps: Pipeline Activation

V2 structure is complete. To achieve continuous sync:

1. **Enable Rezen Webhooks** - Configure rezen_webhooks_registered
2. **Activate Sync Jobs** - Start rezen_sync_jobs, fub_sync_jobs
3. **Monitor Lambda Workers** - Track lambda_job_status, lambda_worker_logs
4. **Verify Staging Flow** - Ensure staging → normalized table flow

---

## Conclusion

V2 is not just a database migration - it's an architectural transformation that:

1. **Eliminates Technical Debt** - No more JSON parsing in every query
2. **Enables Real-Time Analytics** - Pre-computed aggregation tables
3. **Provides Data Integrity** - Foreign key constraints prevent orphans
4. **Supports Scale** - Indexed columns for efficient queries
5. **Future-Proofs** - Extensible normalized structure

The system is ready for production workloads.
