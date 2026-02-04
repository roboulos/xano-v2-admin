# V1 → V2 Table Mapping Reference

**Generated:** 2026-02-04
**Purpose:** Complete mapping of V1 JSONB tables to V2 normalized structure

---

## Mapping Legend

| Type           | Description                                   |
| -------------- | --------------------------------------------- |
| **1:1**        | Direct mapping, same entity                   |
| **1:N**        | V1 table split into multiple V2 tables        |
| **N:1**        | Multiple V1 concepts merged into one V2 table |
| **New**        | V2 table with no V1 equivalent                |
| **Deprecated** | V1 table not migrated (data in other tables)  |

---

## Core Entity Mappings

### User Domain

| V1 Table (JSONB)  | V2 Tables (Normalized)           | Mapping |
| ----------------- | -------------------------------- | ------- |
| `user` (mvpw1_41) | `user` (mvpw5_664)               | 1:N     |
|                   | `user_credentials` (mvpw5_665)   |         |
|                   | `user_subscriptions` (mvpw5_666) |         |
|                   | `user_settings` (mvpw5_667)      |         |
|                   | `user_roles` (mvpw5_668)         |         |
|                   | `user_preferences` (mvpw5_711)   |         |
|                   | `user_onboarding` (mvpw5_929)    |         |
| `user_2fa`        | `user_2fa` (mvpw5_504)           | 1:1     |

**V1 JSONB Fields → V2 Distribution:**

| V1 Field             | V2 Table           | V2 Column           |
| -------------------- | ------------------ | ------------------- |
| `id`                 | user               | id                  |
| `email`              | user               | email               |
| `first_name`         | user               | first_name          |
| `last_name`          | user               | last_name           |
| `cell_phone`         | user               | cell_phone          |
| `avatar`             | user               | avatar              |
| `active`             | user               | active              |
| `password`           | user_credentials   | password_hash       |
| `api_key`            | user_credentials   | api_key             |
| `google_sub`         | user_credentials   | oauth_google        |
| `stripe_customer_id` | user_subscriptions | stripe_customer_id  |
| `subscription_type`  | user_subscriptions | plan_type           |
| `is_team_owner`      | user_roles         | is_team_owner       |
| `is_leader`          | user_roles         | is_leader           |
| `is_director`        | user_roles         | is_director         |
| `is_mentor`          | user_roles         | is_mentor           |
| `privacy_mode`       | user_settings      | privacy_mode        |
| `daily_dash_daily`   | user_settings      | daily_email_enabled |

### Agent Domain

| V1 Table (JSONB) | V2 Tables (Normalized)          | Mapping |
| ---------------- | ------------------------------- | ------- |
| `agent`          | `agent` (mvpw5_670)             | 1:N     |
|                  | `agent_cap_data` (mvpw5_671)    |         |
|                  | `agent_commission` (mvpw5_672)  |         |
|                  | `agent_performance` (mvpw5_673) |         |
|                  | `agent_hierarchy` (mvpw5_674)   |         |
|                  | `agent_rezen` (mvpw5_930)       |         |

### Transaction Domain

| V1 Table (JSONB)   | V2 Tables (Normalized)                 | Mapping |
| ------------------ | -------------------------------------- | ------- |
| `transaction`      | `transaction` (mvpw5_675)              | 1:N     |
|                    | `transaction_participants` (mvpw5_676) |         |
|                    | `transaction_financials` (mvpw5_677)   |         |
|                    | `transaction_history` (mvpw5_678)      |         |
|                    | `transaction_tags` (mvpw5_679)         |         |
| `participant`      | `participant` (mvpw5_696)              | 1:1     |
| `participant_paid` | `participant_paid` (mvpw5_374)         | 1:1     |

### Listing Domain

| V1 Table (JSONB) | V2 Tables (Normalized)        | Mapping |
| ---------------- | ----------------------------- | ------- |
| `listing`        | `listing` (mvpw5_694)         | 1:N     |
|                  | `listing_history` (mvpw5_680) |         |
|                  | `listing_photos` (mvpw5_681)  |         |

### Team Domain

| V1 Table (JSONB)            | V2 Tables (Normalized)      | Mapping |
| --------------------------- | --------------------------- | ------- |
| `team`                      | `team` (mvpw5_704)          | 1:N     |
|                             | `team_settings` (mvpw5_682) |         |
|                             | `team_members` (mvpw5_683)  |         |
| `team_roster`               | `team_members` (mvpw5_683)  | N:1     |
| `directors`                 | `director` (mvpw5_707)      | 1:1     |
| `leaders`                   | `leader` (mvpw5_705)        | 1:1     |
| `mentors`                   | `mentor` (mvpw5_706)        | 1:1     |
| `team_director_assignments` | `team_director_assignments` | 1:1     |
| `team_leader_assignments`   | `team_leader_assignments`   | 1:1     |
| `team_mentor_assignments`   | `team_mentor_assignments`   | 1:1     |

### Network Domain

| V1 Table (JSONB)     | V2 Tables (Normalized)           | Mapping |
| -------------------- | -------------------------------- | ------- |
| `network` (mvpw1_48) | `network_member` (mvpw5_698)     | 1:N     |
|                      | `network_hierarchy` (mvpw5_684)  |         |
|                      | `network_user_prefs` (mvpw5_690) |         |
| `sponsor_tree`       | `agent_hierarchy` (mvpw5_674)    | N:1     |

---

## Financial Domain Mappings

| V1 Table                | V2 Tables                      | Mapping |
| ----------------------- | ------------------------------ | ------- |
| `contributions`         | `contribution` (mvpw5_701)     | 1:1     |
| `contributions_pending` | `contributions_pending`        | 1:1     |
| `revshare_totals`       | `revshare_totals` (mvpw5_383)  | 1:1     |
| `revshare_payments`     | `revshare_payment` (mvpw5_697) | 1:1     |
| `equity_transactions`   | `equity_annual` (mvpw5_699)    | 1:N     |
|                         | `equity_monthly` (mvpw5_702)   |         |
|                         | `income` (mvpw5_695)           | New     |

---

## Integration Domain Mappings

### FUB (Follow Up Boss)

| V1 Table            | V2 Table                        | Status      |
| ------------------- | ------------------------------- | ----------- |
| `fub_accounts`      | `fub_accounts` (mvpw5_421)      | ✅ Migrated |
| `fub_users`         | `fub_users` (mvpw5_392)         | ✅ Migrated |
| `fub_people`        | `fub_people` (mvpw5_419)        | ✅ Migrated |
| `fub_deals`         | `fub_deals` (mvpw5_449)         | ✅ Migrated |
| `fub_calls`         | `fub_calls` (mvpw5_418)         | ✅ Migrated |
| `fub_events`        | `fub_events` (mvpw5_450)        | ✅ Migrated |
| `fub_appointments`  | `fub_appointments` (mvpw5_423)  | ✅ Migrated |
| `fub_text_messages` | `fub_text_messages` (mvpw5_424) | ✅ Migrated |
| `fub_stages`        | `fub_stages` (mvpw5_420)        | ✅ Migrated |
| `fub_groups`        | `fub_groups` (mvpw5_422)        | ✅ Migrated |
| `fub_sync_jobs`     | `fub_sync_jobs` (mvpw5_475)     | ✅ Migrated |
| -                   | `fub_sync_state` (mvpw5_685)    | New         |
| -                   | `fub_worker_queue` (mvpw5_709)  | New         |

### Rezen

| V1 Table                | V2 Table                            | Status |
| ----------------------- | ----------------------------------- | ------ |
| `rezen_sync_jobs`       | `rezen_sync_jobs` (mvpw5_464)       | ✅     |
| `rezen_onboarding_jobs` | `rezen_onboarding_jobs` (mvpw5_405) | ✅     |
| `rezen_process_webhook` | `rezen_process_webhook` (mvpw5_495) | ✅     |
| `rezen_referral_code`   | `rezen_referral_code` (mvpw5_494)   | ✅     |
| -                       | `rezen_sync_state` (mvpw5_688)      | New    |

### SkySlope

| V1 Table              | V2 Table                          | Status |
| --------------------- | --------------------------------- | ------ |
| `skyslope_connection` | `skyslope_connection` (mvpw5_466) | ✅     |
| -                     | `skyslope_sync_state` (mvpw5_689) | New    |

### Stripe

| V1 Table                       | V2 Table                                   | Status |
| ------------------------------ | ------------------------------------------ | ------ |
| `stripe_pricing`               | `stripe_pricing` (mvpw5_370)               | ✅     |
| `stripe_product`               | `stripe_product` (mvpw5_496)               | ✅     |
| `stripe_subscriptions`         | `stripe_subscriptions` (mvpw5_369)         | ✅     |
| `stripe_subscription_packages` | `stripe_subscription_packages` (mvpw5_445) | ✅     |
| -                              | `stripe_events` (mvpw5_686)                | New    |
| -                              | `stripe_sync_state` (mvpw5_687)            | New    |

### DotLoop (New in V2)

| V2 Table                         | Purpose             |
| -------------------------------- | ------------------- |
| `dotloop_accounts` (mvpw5_985)   | Account connections |
| `dotloop_profiles` (mvpw5_986)   | Profile data        |
| `dotloop_loops` (mvpw5_987)      | Transaction loops   |
| `dotloop_contacts` (mvpw5_988)   | Contact sync        |
| `dotloop_sync_state` (mvpw5_989) | Sync cursor         |
| `dotloop_staging` (mvpw5_990)    | Import staging      |

### Lofty (New in V2)

| V2 Table                       | Purpose             |
| ------------------------------ | ------------------- |
| `lofty_accounts` (mvpw5_991)   | Account connections |
| `lofty_leads` (mvpw5_992)      | Lead sync           |
| `lofty_staging` (mvpw5_993)    | Import staging      |
| `lofty_sync_state` (mvpw5_994) | Sync cursor         |

---

## Staging Tables (V2)

| Table                                     | Source   | Purpose                 |
| ----------------------------------------- | -------- | ----------------------- |
| `stage_network_downline_rezen_onboarding` | Rezen    | Initial network import  |
| `stage_transactions_rezen_onboarding`     | Rezen    | Initial txn import      |
| `stage_listings_rezen_onboarding`         | Rezen    | Initial listing import  |
| `stage_contributions_rezen_daily_sync`    | Rezen    | Daily contribution sync |
| `stage_contributions_rezen_onboarding`    | Rezen    | Initial contributions   |
| `stage_pending_contribution_rezen`        | Rezen    | Pending contributions   |
| `stage_transactions_skyslope`             | SkySlope | Transaction import      |
| `stage_listing_skyslope`                  | SkySlope | Listing import          |
| `stage_appointments_fub_onboarding`       | FUB      | Appointment import      |
| `stage_text_messages_fub_onboarding`      | FUB      | SMS import              |
| `stage_csv_import`                        | Manual   | CSV uploads             |

---

## Aggregation Tables (New in V2)

| Table                       | Records | Computed From         |
| --------------------------- | ------- | --------------------- |
| `agg_agent_monthly`         | 16,028  | transaction, agent    |
| `agg_leaderboard`           | 15,530  | transaction, agent    |
| `agg_transactions_by_week`  | 579     | transaction           |
| `agg_fub_activity_by_agent` | 136     | fub_calls, fub_events |

---

## Page Builder System (New in V2)

| Table                     | Purpose            |
| ------------------------- | ------------------ |
| `pages`                   | Page definitions   |
| `page_tabs`               | Tab navigation     |
| `page_sections`           | Content sections   |
| `page_widgets`            | Widget positioning |
| `page_filters`            | Filter definitions |
| `page_filter_options`     | Filter options     |
| `user_filter_preferences` | User filter saves  |
| `widget_viewport_layouts` | Responsive layouts |

---

## Lookup/Reference Tables (Unchanged)

These tables exist in both V1 and V2 with minimal changes:

| Table                        | Purpose                 |
| ---------------------------- | ----------------------- |
| `brokerage`                  | Brokerage companies     |
| `office`                     | Office locations        |
| `state_province`             | Geographic reference    |
| `calendar`                   | Date dimension          |
| `permissions`                | Access control          |
| `modules`                    | Feature flags           |
| `tags`                       | Categorization          |
| `lead_source_defaults`       | Lead source options     |
| `lead_source_user`           | User lead sources       |
| `notification_defaults`      | Notification config     |
| `notification_user_prefs`    | User notification prefs |
| `pipeline_stage_defaults`    | Pipeline config         |
| `pipeline_prospect_defaults` | Prospect config         |

---

## PostgreSQL Table IDs

### V1 Tables (mvpw1\_\*)

| Entity  | Table ID | PostgreSQL Name |
| ------- | -------- | --------------- |
| User    | 41       | mvpw1_41        |
| Network | 48       | mvpw1_48        |
| Team    | 45       | mvpw1_45        |

### V2 Tables (mvpw5\_\*)

| Entity             | Table ID | PostgreSQL Name |
| ------------------ | -------- | --------------- |
| User               | 664      | mvpw5_664       |
| User Credentials   | 665      | mvpw5_665       |
| User Subscriptions | 666      | mvpw5_666       |
| User Settings      | 667      | mvpw5_667       |
| User Roles         | 668      | mvpw5_668       |
| Agent              | 670      | mvpw5_670       |
| Agent Cap Data     | 671      | mvpw5_671       |
| Agent Commission   | 672      | mvpw5_672       |
| Agent Performance  | 673      | mvpw5_673       |
| Agent Hierarchy    | 674      | mvpw5_674       |
| Transaction        | 675      | mvpw5_675       |
| Listing            | 694      | mvpw5_694       |
| Network Member     | 698      | mvpw5_698       |
| Team               | 704      | mvpw5_704       |
| FUB Accounts       | 421      | mvpw5_421       |
| FUB Users          | 392      | mvpw5_392       |

---

## Migration SQL Patterns

### Sync Users (V1 → V2)

```sql
INSERT INTO mvpw5_664 (id, created_at, first_name, last_name, email, ...)
SELECT
  v1.id,
  (v1.xdo->>'created_at')::bigint,
  v1.xdo->>'first_name',
  v1.xdo->>'last_name',
  v1.xdo->>'email',
  ...
FROM mvpw1_41 v1
WHERE v1.id NOT IN (SELECT id FROM mvpw5_664)
ON CONFLICT (id) DO NOTHING;
```

### Sync Network (V1 → V2)

```sql
INSERT INTO mvpw5_698 (id, created_at, status, tier, ...)
SELECT
  v1.id,
  (v1.xdo->>'created_at')::bigint,
  v1.xdo->>'status',
  v1.xdo->>'tier',
  ...
FROM mvpw1_48 v1
WHERE v1.id NOT IN (SELECT id FROM mvpw5_698)
ON CONFLICT (id) DO NOTHING;
```

---

## Verification Query

```sql
SELECT
  'users' as entity,
  (SELECT COUNT(*) FROM mvpw1_41) as v1,
  (SELECT COUNT(*) FROM mvpw5_664) as v2
UNION ALL
SELECT
  'network',
  (SELECT COUNT(*) FROM mvpw1_48),
  (SELECT COUNT(*) FROM mvpw5_698);
```

---

## Summary

| Metric              | V1  | V2  |
| ------------------- | --- | --- |
| Total Tables        | 251 | 196 |
| User Tables         | 1   | 7   |
| Agent Tables        | 1   | 6   |
| Transaction Tables  | 1   | 5   |
| Listing Tables      | 1   | 3   |
| Network Tables      | 1   | 3   |
| Aggregation Tables  | 0   | 4   |
| Sync State Tables   | 0   | 6   |
| Page Builder Tables | 0   | 8   |
