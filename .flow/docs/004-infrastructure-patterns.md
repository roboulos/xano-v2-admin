# Infrastructure Patterns - V2 Backend

> Task 1.4: Document infrastructure patterns (sync state, jobs, logging)

## Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           INFRASTRUCTURE LAYERS                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │                         SYNC STATE MANAGEMENT                                 │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │  │
│  │  │ fub_sync_   │ │ rezen_sync_ │ │ skyslope_   │ │ stripe_sync_│            │  │
│  │  │   state     │ │   state     │ │ sync_state  │ │   state     │            │  │
│  │  │   (685)     │ │   (688)     │ │   (689)     │ │   (687)     │            │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘            │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │                           JOB MANAGEMENT                                      │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │  │
│  │  │ job_status  │ │ fub_sync_   │ │ rezen_sync_ │ │ lambda_job_ │            │  │
│  │  │   (693)     │ │   jobs      │ │   jobs      │ │   status    │            │  │
│  │  │  Unified    │ │   (475)     │ │   (464)     │ │   (902)     │            │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘            │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │                           WORKER QUEUES                                       │  │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐                │  │
│  │  │ fub_worker_     │ │ rezen_process_  │ │ notification    │                │  │
│  │  │    queue (709)  │ │   webhook (495) │ │     (703)       │                │  │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────┘                │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │                           LOGGING & AUDIT                                     │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │  │
│  │  │ audit_log   │ │ error logs  │ │ event log   │ │ system_     │            │  │
│  │  │   (700)     │ │   (474)     │ │   (428)     │ │   audit     │            │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ │   (425)     │            │  │
│  │                                                   └─────────────┘            │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │                         CREDENTIALS & CONFIG                                  │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │  │
│  │  │ credentials │ │ user_       │ │ global_     │ │ integrations│            │  │
│  │  │   (890)     │ │ credentials │ │  variables  │ │   (376)     │            │  │
│  │  └─────────────┘ │   (665)     │ │   (404)     │ └─────────────┘            │  │
│  │                  └─────────────┘ └─────────────┘                            │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Sync State Pattern

### Common Schema (All \*\_sync_state tables)

```
┌─────────────────────────────────────────────────────────────────┐
│                    SYNC STATE TABLE                             │
├─────────────────────────────────────────────────────────────────┤
│  id              int         Primary key                        │
│  created_at      timestamp   Record creation                    │
│  entity_type     text        What entity is being synced        │
│  last_sync_at    timestamp   When last successful sync          │
│  cursor          text        Pagination cursor/offset           │
│  status          text        Current sync status                │
│  error_message   text        Last error if any                  │
│  records_synced  int         Count of records synced            │
└─────────────────────────────────────────────────────────────────┘
```

### Sync State Tables

| Table               | ID  | Purpose                         |
| ------------------- | --- | ------------------------------- |
| fub_sync_state      | 685 | Follow Up Boss sync tracking    |
| rezen_sync_state    | 688 | reZEN sync tracking             |
| skyslope_sync_state | 689 | SkySlope sync tracking          |
| stripe_sync_state   | 687 | Stripe sync tracking            |
| dotloop_sync_state  | 989 | DotLoop sync tracking (planned) |
| lofty_sync_state    | 994 | Lofty sync tracking (planned)   |

### Usage Pattern

```
1. Check sync_state for entity_type
2. If cursor exists, resume from cursor
3. Fetch batch of records from external API
4. Process and store records
5. Update cursor and last_sync_at
6. If error, store in error_message
7. Update records_synced count
```

---

## 2. Job Management

### job_status (Table ID: 693)

**Purpose**: Unified job status tracking for ALL background tasks.

| Field             | Type      | Description                         |
| ----------------- | --------- | ----------------------------------- |
| id                | int       | Primary key                         |
| created_at        | timestamp | Job creation                        |
| started_at        | timestamp | When job started                    |
| last_activity     | timestamp | Last progress update                |
| completed_at      | timestamp | When job finished                   |
| job_type          | text      | Type of job                         |
| status            | text      | PENDING/IN_PROGRESS/COMPLETED/ERROR |
| progress          | int       | Progress percentage (0-100)         |
| records_processed | int       | Records processed so far            |
| records_stored    | int       | Records successfully stored         |
| workers_spawned   | int       | Worker tasks created                |
| workers_completed | int       | Workers finished                    |
| workers_failed    | int       | Workers that errored                |
| error_message     | text      | Error description                   |
| error_details     | json      | Detailed error info                 |
| job_id            | text      | Unique job identifier               |
| rezen_records     | int       | reZEN source count                  |
| ad_records        | int       | AgentDashboards count               |
| records_remaining | int       | Records left to process             |
| user_id           | int       | FK → user                           |
| fub_accounts_id   | int       | FK → fub_accounts                   |
| agent_id          | int       | FK → agent                          |
| period_key        | text      | Time period identifier              |
| priority          | text      | NORMAL/HIGH/LOW                     |
| attempts          | int       | Retry count                         |

### Job Status Flow

```
                    ┌─────────────────┐
                    │    PENDING      │
                    │  (initial)      │
                    └────────┬────────┘
                             │
                             v
                    ┌─────────────────┐
                    │  IN_PROGRESS    │
                    │  (processing)   │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              v                             v
     ┌─────────────────┐           ┌─────────────────┐
     │   COMPLETED     │           │     ERROR       │
     │   (success)     │           │   (failed)      │
     └─────────────────┘           └────────┬────────┘
                                            │
                                            v (retry)
                                   ┌─────────────────┐
                                   │    PENDING      │
                                   │ (attempts += 1) │
                                   └─────────────────┘
```

### Integration-Specific Job Tables

| Table                 | ID  | Purpose                 | Key Fields                            |
| --------------------- | --- | ----------------------- | ------------------------------------- |
| fub_sync_jobs         | 475 | FUB ongoing sync        | 6 entity types with status/timestamps |
| fub_onboarding_jobs   | 476 | FUB initial import      | Same pattern as sync_jobs             |
| rezen_sync_jobs       | 464 | reZEN ongoing sync      | 10+ entity types tracked              |
| rezen_onboarding_jobs | 405 | reZEN initial import    | Same pattern as sync_jobs             |
| lambda_job_status     | 902 | Lambda execution status | Overall lambda tracking               |
| lambda_job_logs       | 901 | Lambda execution logs   | Detailed execution logs               |

---

## 3. Worker Queue Pattern

### fub_worker_queue (Table ID: 709)

**Purpose**: Queue for FUB API worker tasks.

| Field           | Type      | Description                                         |
| --------------- | --------- | --------------------------------------------------- |
| id              | int       | Primary key                                         |
| created_at      | timestamp | Queue entry creation                                |
| cron_name       | text      | Which cron triggered this                           |
| process_status  | enum      | pending/in_progress/completed/failed                |
| endpoint_type   | enum      | people/events/calls/appointments/deals/textMessages |
| worker_input    | json      | Parameters for worker                               |
| pickup_at       | timestamp | When worker picked up                               |
| finish_at       | timestamp | When worker finished                                |
| user_id         | int       | FK → user                                           |
| fub_user_id_ref | int       | Reference FUB user                                  |
| ad_user_id      | int       | AgentDashboards user                                |
| fub_user_id     | int       | FUB user ID                                         |

### Worker Queue Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Cron/Trigger  │────>│   Queue Entry   │────>│    Worker       │
│                 │     │   (pending)     │     │   (pickup)      │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         v
                                                ┌─────────────────┐
                                                │   Process API   │
                                                │   (in_progress) │
                                                └────────┬────────┘
                                                         │
                              ┌───────────────────────────┴───────────────────────────┐
                              │                                                        │
                              v                                                        v
                     ┌─────────────────┐                                    ┌─────────────────┐
                     │   Store Data    │                                    │    Error        │
                     │  (completed)    │                                    │   (failed)      │
                     └─────────────────┘                                    └─────────────────┘
```

### Other Queue Tables

| Table                 | ID  | Purpose                    |
| --------------------- | --- | -------------------------- |
| rezen_process_webhook | 495 | Incoming reZEN webhooks    |
| notification          | 703 | User notification delivery |

---

## 4. Logging & Audit

### audit_log (Table ID: 700)

**Purpose**: System-wide audit trail for entity changes.

| Field       | Type      | Description          |
| ----------- | --------- | -------------------- |
| id          | int       | Primary key          |
| created_at  | timestamp | When change occurred |
| action      | text      | CREATE/UPDATE/DELETE |
| entity_type | text      | What was changed     |
| entity_id   | int       | ID of changed entity |
| old_value   | json      | Previous state       |
| new_value   | json      | New state            |
| user_id     | int       | Who made the change  |

### error logs (Table ID: 474)

**Purpose**: Application error tracking.

| Field             | Type      | Description          |
| ----------------- | --------- | -------------------- |
| id                | int       | Primary key          |
| created_at        | timestamp | When error occurred  |
| module            | text      | Where error occurred |
| message           | text      | Error message        |
| payload           | json      | Error context/stack  |
| notified_on_slack | bool      | Slack alert sent     |
| user_id           | int       | Affected user        |

### event log (Table ID: 428)

**Purpose**: System event logging.

| Field           | Type      | Description       |
| --------------- | --------- | ----------------- |
| id              | int       | Primary key       |
| created_at      | timestamp | Event time        |
| type            | text      | Event type        |
| source          | text      | Event source      |
| message         | text      | Event description |
| lifecycle_group | text      | Lifecycle stage   |
| tier            | int       | User tier         |
| data            | json      | Event payload     |
| user_id         | int       | Related user      |

### All Log Tables

| Table                 | ID  | Purpose                        |
| --------------------- | --- | ------------------------------ |
| audit_log             | 700 | Entity change audit            |
| audits                | 414 | Compliance tracking (110 cols) |
| error logs            | 474 | Application errors             |
| event log             | 428 | System events                  |
| system_audit          | 425 | System-level audit             |
| email_logs            | 499 | Email delivery tracking        |
| log_api_keys          | 454 | API key operations             |
| log_contributions     | 426 | Contribution tracking          |
| log_network           | 427 | Network activity               |
| network_change_log    | 440 | Network hierarchy changes      |
| contact_log           | 897 | Contact activity               |
| transaction_history   | 678 | Transaction changes            |
| webhook_events        | 430 | Webhook delivery               |
| lambda_worker_logs    | 900 | Lambda execution               |
| lambda_failed_records | 899 | Lambda failures                |
| rezen_sync_jobs_logs  | 502 | reZEN sync logs                |

---

## 5. Credentials & Configuration

### credentials (Table ID: 890)

**Purpose**: Integration API credentials.

| Field            | Type      | Description                 |
| ---------------- | --------- | --------------------------- |
| id               | int       | Primary key                 |
| created_at       | timestamp | Creation                    |
| updated_at       | timestamp | Last update                 |
| platform         | text      | Integration name (required) |
| api_key          | text      | API key                     |
| api_secret       | text      | API secret                  |
| participant_uuid | text      | External UUID               |
| account_id       | text      | External account ID         |
| external_user_id | text      | External user ID            |
| verified         | bool      | Credentials verified        |
| verified_at      | timestamp | When verified               |
| active           | bool      | Currently active            |
| user_id          | int       | FK → user                   |
| agent_id         | int       | FK → agent                  |

### user_credentials (Table ID: 665)

**Purpose**: User authentication data.

| Field             | Type      | Description                |
| ----------------- | --------- | -------------------------- |
| id                | int       | Primary key                |
| created_at        | timestamp | Creation                   |
| password          | password  | Hashed password (required) |
| api_key           | text      | User API key               |
| api_key_confirmed | bool      | API key verified           |
| account_confirmed | bool      | Account verified           |
| magic_link        | json      | Magic link data            |
| confirmation_code | int       | Confirmation code          |
| confirmed         | bool      | User confirmed             |
| user_id           | int       | FK → user                  |

### Configuration Tables

| Table            | ID  | Purpose             |
| ---------------- | --- | ------------------- |
| global_variables | 404 | System-wide config  |
| integrations     | 376 | Integration configs |
| user_settings    | 667 | User preferences    |
| team_settings    | 682 | Team config         |

---

## 6. Infrastructure Patterns Summary

### Pattern 1: Sync State

```
Every integration has a *_sync_state table with:
- entity_type: What entity is syncing
- cursor: Pagination position
- last_sync_at: Last success
- status: Current state
- error_message: Last error
- records_synced: Count
```

### Pattern 2: Job Tracking

```
Jobs have unified status tracking:
- status: PENDING → IN_PROGRESS → COMPLETED/ERROR
- progress: 0-100%
- records_processed/stored: Counts
- workers_spawned/completed/failed: Worker tracking
- attempts: Retry count
- error_message/details: Error info
```

### Pattern 3: Worker Queue

```
Queue-based async processing:
- process_status: pending → in_progress → completed/failed
- worker_input: JSON parameters
- pickup_at/finish_at: Timing
- endpoint_type: What to process
```

### Pattern 4: Audit Trail

```
All entity changes logged:
- action: CREATE/UPDATE/DELETE
- entity_type/entity_id: What changed
- old_value/new_value: JSON diffs
- user_id: Who changed it
```

### Pattern 5: Credentials

```
Credentials stored per-platform:
- platform: Integration name
- api_key/api_secret: Auth credentials
- verified/active: Status flags
- user_id/agent_id: Ownership
```

---

_Generated: 2026-01-26_
_Task: fn-1-2cy.4_
