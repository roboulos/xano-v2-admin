# Integration Architecture - V2 Backend

> Task 1.3: Document integrations (FUB, reZEN, SkySlope, DotLoop, Lofty)

## Integration Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           INTEGRATION LANDSCAPE                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                    FULLY IMPLEMENTED (Production Ready)                      │   │
│  │                                                                              │   │
│  │   ┌───────────────────┐           ┌───────────────────┐                    │   │
│  │   │   FOLLOW UP BOSS  │           │      reZEN        │                    │   │
│  │   │   (FUB) - CRM     │           │  (Real Brokerage) │                    │   │
│  │   │                   │           │                   │                    │   │
│  │   │  ✓ 18 tables      │           │  ✓ 15 tables      │                    │   │
│  │   │  ✓ Full sync      │           │  ✓ Full sync      │                    │   │
│  │   │  ✓ Webhooks       │           │  ✓ Webhooks       │                    │   │
│  │   │  ✓ Lambda workers │           │  ✓ Staging tables │                    │   │
│  │   └───────────────────┘           └───────────────────┘                    │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                    PARTIALLY IMPLEMENTED                                     │   │
│  │                                                                              │   │
│  │   ┌───────────────────┐                                                     │   │
│  │   │     SKYSLOPE      │                                                     │   │
│  │   │   (Transaction    │                                                     │   │
│  │   │    Management)    │                                                     │   │
│  │   │                   │                                                     │   │
│  │   │  ✓ 4 tables       │                                                     │   │
│  │   │  ✓ Transactions   │                                                     │   │
│  │   │  ✓ Listings       │                                                     │   │
│  │   └───────────────────┘                                                     │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                    SCHEMA ONLY (Not Yet Implemented)                         │   │
│  │                                                                              │   │
│  │   ┌───────────────────┐           ┌───────────────────┐                    │   │
│  │   │     DOTLOOP       │           │      LOFTY        │                    │   │
│  │   │   (Transaction    │           │    (CRM/Leads)    │                    │   │
│  │   │    Management)    │           │                   │                    │   │
│  │   │                   │           │                   │                    │   │
│  │   │  ○ 6 tables       │           │  ○ 4 tables       │                    │   │
│  │   │  ○ Empty schemas  │           │  ○ Empty schemas  │                    │   │
│  │   │  ○ 0 records      │           │  ○ 0 records      │                    │   │
│  │   └───────────────────┘           └───────────────────┘                    │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Common Integration Patterns

### Sync State Pattern

All integrations use a consistent `*_sync_state` table:

```
┌─────────────────────────────────────────┐
│           SYNC STATE TABLE              │
├─────────────────────────────────────────┤
│  id              int       Primary key  │
│  created_at      timestamp              │
│  entity_type     text      What syncing │
│  last_sync_at    timestamp Last success │
│  cursor          text      Pagination   │
│  status          text      Current state│
│  error_message   text      Last error   │
│  records_synced  int       Count        │
└─────────────────────────────────────────┘
```

### Job Status Pattern

Sync jobs track multiple entity types with consistent status fields:

```
Entity Status Pattern:
  {entity}_status          : enum (PENDING, IN_PROGRESS, COMPLETED, ERROR)
  {entity}_last_started_at : timestamp
  {entity}_last_finished_at: timestamp
```

---

## 1. Follow Up Boss (FUB) Integration

### Purpose

CRM integration for contact management, calls, appointments, deals, and activity tracking.

### Table Summary

| Table                              | ID  | Records | Purpose                           |
| ---------------------------------- | --- | ------- | --------------------------------- |
| fub_accounts                       | 421 | 1+      | Account connections & credentials |
| fub_people                         | 419 | 1+      | Contacts/leads from FUB           |
| fub_deals                          | 449 | 1+      | Deal pipeline opportunities       |
| fub_stages                         | 420 | 1+      | Pipeline stage definitions        |
| fub_events                         | 450 | 1+      | Activity events                   |
| fub_calls                          | 418 | 1+      | Phone call records                |
| fub_text_messages                  | 424 | 0       | SMS history                       |
| fub_appointments                   | 423 | 1+      | Calendar appointments             |
| fub_users                          | 392 | 1+      | FUB user accounts                 |
| fub_groups                         | 422 | 1+      | Contact groups/tags               |
| fub_sync_jobs                      | 475 | 0       | Ongoing sync tracking             |
| fub_onboarding_jobs                | 476 | 1+      | Initial import tracking           |
| fub_sync_state                     | 685 | 1+      | Sync cursor/state                 |
| fub_worker_queue                   | 709 | 1+      | Worker job queue                  |
| lambda_failed_records              | 899 | 1+      | Failed processing records         |
| lambda_worker_logs                 | 900 | 1+      | Worker execution logs             |
| stage_appointments_fub_onboarding  | 501 | 1+      | Appointment staging               |
| stage_text_messages_fub_onboarding | 498 | 1+      | SMS staging                       |

### Data Flow

```
FUB API ──────────────────────────────────────────────────────────────────────
    │
    │  Initial Sync (Onboarding)
    │
    v
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ fub_onboarding_ │────>│ staging tables  │────>│ Core FUB tables │
│      jobs       │     │ (appointments,  │     │ (people, deals, │
│                 │     │  text_messages) │     │  calls, events) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        v
                                                ┌─────────────────┐
                                                │ Core entities   │
                                                │ (participant,   │
                                                │  contact_log)   │
                                                └─────────────────┘
    │
    │  Ongoing Sync (Delta)
    │
    v
┌─────────────────┐     ┌─────────────────┐
│  fub_sync_jobs  │────>│ Lambda workers  │───> Direct to core tables
│                 │     │ (fub_worker_    │     (no staging)
│                 │     │      queue)     │
└─────────────────┘     └─────────────────┘
```

### fub_accounts Schema (31 fields)

**Credentials & Config:**

- `active`, `account_id_raw`, `fub_uid`
- `webhook_url`, `host_name`, `data_pull`
- `user_id`, `team_id`, `fub_owner_id`, `credentials_id`

**Sync Counts (FUB vs AD comparison):**

- `users_fub`, `users_ad`, `users_updated`
- `people_fub`, `people_ad`, `people_updated`
- `deals_fub`, `deals_ad`, `deal_updated`
- `calls_fub`, `calls_ad`, `call_updated`
- `text_messages_fub`, `text_messages_ad`
- `events_fub`, `events_ad`
- `appointments_fub`, `appointments_ad`

### fub_people Schema (41 fields)

Key fields:

- Identity: `people_name`, `first_name`, `last_name`, `emails`, `url`
- Source: `source_name`, `source_id`, `source_url`, `created_via`
- Stage: `stage_name`, `stage_id`, `fub_stage_id`
- Deal: `deal_status`, `deal_price`, `deal_stage`, `deal_name`, `deal_close_date`
- Activity: `contacted`, `website_visits`, `last_activity`, `claimed`
- FKs: `fub_account_id`, `assigned_to_fub_id`, `people_id`, `credentials_id`

### fub_sync_jobs Schema (25 fields)

Tracks sync status for each entity type:

- `type`: Onboarding, Sync, All, Created Today, Updated Today, etc.
- Per-entity tracking: appointments, calls, deals, events, peoples, text_messages
- Each has: `{entity}_status`, `{entity}_last_started_at`, `{entity}_last_finished_at`

---

## 2. reZEN Integration

### Purpose

Real brokerage platform integration for transactions, listings, network data, contributions, and equity.

### Table Summary

| Table                                   | ID  | Records | Purpose                      |
| --------------------------------------- | --- | ------- | ---------------------------- |
| rezen_sync_jobs                         | 464 | 1+      | Ongoing sync tracking        |
| rezen_onboarding_jobs                   | 405 | 1+      | Initial import               |
| rezen_sync_state                        | 688 | 1+      | Sync cursor/state            |
| rezen_webhooks_registered               | 489 | 1+      | Webhook subscriptions        |
| rezen_process_webhook                   | 495 | 1+      | Incoming webhook queue       |
| rezen_referral_code                     | 494 | 1+      | Agent referral links         |
| rezen_sync_jobs_logs                    | 502 | 1+      | Detailed sync logs           |
| agent_rezen                             | 930 | 1+      | V2 agent-specific data       |
| user_rezen                              | 928 | 1+      | V2 user-specific data        |
| stage_transactions_rezen_onboarding     | 483 | 1+      | Transaction staging          |
| stage_listings_rezen_onboarding         | 486 | 1+      | Listing staging              |
| stage_contributions_rezen_onboarding    | 491 | 1+      | Initial contribution staging |
| stage_contributions_rezen_daily_sync    | 507 | 1+      | Daily contribution staging   |
| stage_network_downline_rezen_onboarding | 490 | 1+      | Network staging              |
| stage_pending_contribution_rezen        | 505 | 0       | Pending contributions        |

### Data Flow

```
reZEN API ────────────────────────────────────────────────────────────────────
    │
    │  Webhooks (Real-time)
    │
    v
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ rezen_process_  │────>│ Webhook handler │────>│ Core tables     │
│    webhook      │     │                 │     │ (transaction,   │
│                 │     │                 │     │  listing, etc.) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
    │
    │  Batch Sync
    │
    v
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ rezen_sync_jobs │────>│ Staging tables  │────>│ Core tables     │
│                 │     │ (transactions,  │     │                 │
│ Tracks status   │     │  listings,      │     │                 │
│ for 10+ entity  │     │  contributions, │     │                 │
│ types           │     │  network)       │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### rezen_sync_jobs Schema (46 fields)

Tracks sync for multiple entity types:

| Entity            | Status Fields                                               |
| ----------------- | ----------------------------------------------------------- |
| Transactions      | transaction_status, transaction_last_started_at/finished_at |
| Transaction Count | tc_status, tc_rezen (obj), tc_ad (obj), tc_mismatch         |
| Listings          | listings_status, listings_last_started_at/finished_at       |
| Listings Update   | lu_status, lu_last_started_at/finished_at                   |
| Network Downline  | network_downline_status, network_downline_sync_status       |
| Equity            | equity_status, equity_last_started_at/finished_at           |
| Network Cap       | network_cap_status                                          |
| Network Frontline | network_frontline_status                                    |
| Team Roster       | team_roster_status                                          |
| Agent Data        | agent_data_status                                           |
| Contributions     | contributions_status                                        |

Plus: `active`, `assigned_to_worker_id`, `error_list`, `user_id`

---

## 3. SkySlope Integration

### Purpose

Transaction management system integration for listings and transactions.

### Table Summary

| Table                       | ID  | Records | Purpose                         |
| --------------------------- | --- | ------- | ------------------------------- |
| skyslope_connection         | 466 | 1+      | OAuth credentials & sync config |
| skyslope_sync_state         | 689 | 1+      | Sync cursor/state               |
| stage_listing_skyslope      | 470 | 1+      | Listing staging                 |
| stage_transactions_skyslope | 468 | 1+      | Transaction staging             |

### Data Flow

```
SkySlope API ─────────────────────────────────────────────────────────────────
    │
    v
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   skyslope_     │────>│ Staging tables  │────>│ Core tables     │
│   connection    │     │ (listings,      │     │ (listing,       │
│                 │     │  transactions)  │     │  transaction)   │
│  OAuth creds    │     │                 │     │                 │
│  Sync status    │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### skyslope_connection Schema (22 fields)

**OAuth Credentials:**

- `access_key`, `access_secret`, `session_token`, `expiration`
- `credentials_id`

**Sync Status:**

- Transactions: `transaction_status`, `transaction_last_started_at/finished_at/updated_at`
- Listings: `listing_status`, `listings_last_started_at/finished_at/updated_at`
- Account Users: `account_users_status`, `account_users_last_started_at/finished_at`

**Config:**

- `has_team_been_created`, `assigned_to_worker_id`, `error_list`, `user_id`

---

## 4. DotLoop Integration (Schema Only)

### Purpose

Transaction management system integration (alternative to SkySlope).

### Table Summary

| Table              | ID  | Records | Status                 |
| ------------------ | --- | ------- | ---------------------- |
| dotloop_accounts   | 985 | 0       | Schema only (2 fields) |
| dotloop_profiles   | 986 | 0       | Schema only            |
| dotloop_loops      | 987 | 0       | Schema only            |
| dotloop_contacts   | 988 | 0       | Schema only            |
| dotloop_sync_state | 989 | 0       | Schema only            |
| dotloop_staging    | 990 | 0       | Schema only            |

### Implementation Status

Tables have been created but not yet populated with full schemas. Currently only have `id` and `created_at` fields.

---

## 5. Lofty Integration (Schema Only)

### Purpose

CRM/lead management integration.

### Table Summary

| Table            | ID  | Records | Status                 |
| ---------------- | --- | ------- | ---------------------- |
| lofty_accounts   | 991 | 0       | Schema only (2 fields) |
| lofty_leads      | 992 | 0       | Schema only            |
| lofty_staging    | 993 | 0       | Schema only            |
| lofty_sync_state | 994 | 0       | Schema only            |

### Implementation Status

Tables have been created but not yet populated with full schemas. Currently only have `id` and `created_at` fields.

---

## Integration Comparison

```
┌─────────────────┬───────────┬─────────┬──────────┬───────────┬────────────┐
│ Feature         │ FUB       │ reZEN   │ SkySlope │ DotLoop   │ Lofty      │
├─────────────────┼───────────┼─────────┼──────────┼───────────┼────────────┤
│ Tables          │ 18        │ 15      │ 4        │ 6         │ 4          │
│ Records         │ ✓ Active  │ ✓ Active│ ✓ Active │ ○ Empty   │ ○ Empty    │
│ Full Schema     │ ✓         │ ✓       │ ✓        │ ○ Minimal │ ○ Minimal  │
│ Sync Jobs       │ ✓         │ ✓       │ ✓        │ ○         │ ○          │
│ Sync State      │ ✓         │ ✓       │ ✓        │ ○         │ ○          │
│ Staging Tables  │ ✓         │ ✓       │ ✓        │ ○         │ ○          │
│ Webhooks        │ ✓         │ ✓       │ ○        │ ○         │ ○          │
│ Lambda Workers  │ ✓         │ ○       │ ○        │ ○         │ ○          │
│ Status          │ PROD      │ PROD    │ PARTIAL  │ PLANNED   │ PLANNED    │
└─────────────────┴───────────┴─────────┴──────────┴───────────┴────────────┘
```

---

## Data Entities by Integration Source

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DATA ENTITIES BY SOURCE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  FUB (CRM)                  reZEN (Brokerage)         SkySlope (TM)        │
│  ─────────                  ─────────────────         ─────────────        │
│  • Contacts (people)        • Transactions            • Transactions       │
│  • Deals                    • Listings                • Listings           │
│  • Calls                    • Contributions           • Account Users      │
│  • Text Messages            • Network Downline                             │
│  • Appointments             • Equity                                       │
│  • Events                   • Team Roster                                  │
│  • Users                    • Agent Data                                   │
│  • Groups                   • Network Cap                                  │
│  • Stages                   • Frontline                                    │
│                                                                             │
│  Future: DotLoop            Future: Lofty                                  │
│  ──────────────             ────────────────                               │
│  • Loops (Txns)             • Leads                                        │
│  • Contacts                 • Contacts                                     │
│  • Profiles                                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

_Generated: 2026-01-26_
_Task: fn-1-2cy.3_
