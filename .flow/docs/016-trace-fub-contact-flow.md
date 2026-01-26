# Trace: FUB Contact Flow - Webhook to People Table

> Task 6.2: Trace FUB contact: webhook → people table

## Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                    FUB CONTACT: WEBHOOK → PEOPLE TABLE                               │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  STEP 1: SOURCE - Follow Up Boss API                                                │
│  ═══════════════════════════════════════════════════════════════════════════════   │
│                                                                                      │
│  PATH A: Webhook (Real-time)           PATH B: Daily Sync (Every 15 min)           │
│  POST to /fub/webhook/create            GET /people?updatedSince={timestamp}        │
│                                                                                      │
│  Webhook Payload:                                                                   │
│  {                                                                                   │
│    "type": "people.created",                                                        │
│    "data": {                                                                        │
│      "id": 12345,                                                                   │
│      "firstName": "John",                                                           │
│      "lastName": "Doe",                                                             │
│      "emails": [{"value": "john@example.com", "isPrimary": true}],                 │
│      "phones": [{"value": "+1-555-1234", "type": "mobile"}],                       │
│      "stage": {"id": 5, "name": "Hot Lead"},                                       │
│      "assignedTo": 789,                                                             │
│      "created": "2026-01-26T12:00:00Z"                                             │
│    }                                                                                │
│  }                                                                                   │
│       │                                                                              │
│       ▼                                                                              │
│  STEP 2: RECEIVE - Webhook Endpoint                                                 │
│  ═══════════════════════════════════════════════════════════════════════════════   │
│                                                                                      │
│  Endpoint: POST /fub/webhook/create (API Group 348)                                │
│                                                                                      │
│  Actions:                                                                           │
│  ├── Validate webhook signature (X-Signature header)                               │
│  ├── Parse event type (people.created, people.updated, etc.)                       │
│  ├── Queue in fub_worker_queue for batch processing                                │
│  └── Return 200 OK                                                                  │
│                                                                                      │
│       │                                                                              │
│       ▼                                                                              │
│  STEP 3: QUEUE - fub_worker_queue (Table ID: 709)                                  │
│  ═══════════════════════════════════════════════════════════════════════════════   │
│                                                                                      │
│  Record:                                                                            │
│  {                                                                                   │
│    "id": 999,                                                                       │
│    "created_at": "2026-01-26T12:00:01Z",                                           │
│    "cron_name": "fub-people-webhook",                                              │
│    "process_status": "pending",                                                     │
│    "endpoint_type": "people",                                                       │
│    "worker_input": {...webhook payload...},                                         │
│    "user_id": 60,                                                                   │
│    "fub_user_id": 789                                                               │
│  }                                                                                   │
│       │                                                                              │
│       │ Polled every 15 min by background task                                      │
│       ▼                                                                              │
│  STEP 4: PROCESS - Workers/FUB - Webhooks Sync (ID: 8089)                          │
│  ═══════════════════════════════════════════════════════════════════════════════   │
│                                                                                      │
│  Actions:                                                                           │
│  ├── Read pending records from fub_worker_queue                                    │
│  ├── Group by endpoint_type                                                        │
│  ├── For each people record:                                                       │
│  │   ├── Transform to normalized format                                            │
│  │   ├── Lookup/create related records (stage, assignedTo)                         │
│  │   └── Upsert to fub_people                                                      │
│  ├── Update process_status = "completed"                                           │
│  └── Return FP Result                                                              │
│                                                                                      │
│       │                                                                              │
│       ▼                                                                              │
│  STEP 5: TRANSFORM - Data Normalization                                             │
│  ═══════════════════════════════════════════════════════════════════════════════   │
│                                                                                      │
│  Input (FUB API):                      Output (Normalized):                         │
│  ┌─────────────────────────────┐      ┌─────────────────────────────┐              │
│  │ firstName: "John"           │      │ first_name: "John"          │              │
│  │ lastName: "Doe"             │      │ last_name: "Doe"            │              │
│  │ emails[0].value: "..."      │  ──► │ email: "john@example.com"   │              │
│  │ phones[0].value: "..."      │      │ phone: "+15551234"          │              │
│  │ stage.id: 5                 │      │ stage_id: 5 (FK)            │              │
│  │ assignedTo: 789             │      │ assigned_to: 789 (FK)       │              │
│  │ created: "2026-01-26..."    │      │ created_at: timestamp       │              │
│  └─────────────────────────────┘      └─────────────────────────────┘              │
│                                                                                      │
│       │                                                                              │
│       ▼                                                                              │
│  STEP 6: STORE - fub_people (Table ID: 696)                                         │
│  ═══════════════════════════════════════════════════════════════════════════════   │
│                                                                                      │
│  Upsert Logic:                                                                      │
│  ├── If fub_people_id exists: UPDATE                                               │
│  └── If new: INSERT                                                                │
│                                                                                      │
│  Record:                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  id:             1001                                                        │   │
│  │  fub_people_id:  12345           ← FUB external ID                          │   │
│  │  first_name:     "John"                                                      │   │
│  │  last_name:      "Doe"                                                       │   │
│  │  full_name:      "John Doe"      ← Computed                                  │   │
│  │  email:          "john@example.com"                                          │   │
│  │  phone:          "+15551234"                                                 │   │
│  │  stage_id:       5               ← FK to fub_stages                          │   │
│  │  stage_name:     "Hot Lead"      ← Denormalized                              │   │
│  │  assigned_to:    789             ← FK to fub_users                           │   │
│  │  user_id:        60              ← FK to user                                │   │
│  │  agent_id:       37208           ← FK to agent                               │   │
│  │  created_at:     2026-01-26      ← FUB created date                          │   │
│  │  updated_at:     2026-01-26      ← Last sync time                            │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│       │                                                                              │
│       ▼                                                                              │
│  STEP 7: API - Frontend API v2 Endpoints                                            │
│  ═══════════════════════════════════════════════════════════════════════════════   │
│                                                                                      │
│  GET /leads/fub/people                                                              │
│  ├── Query fub_people with user_id filter                                          │
│  ├── Join fub_stages for stage details                                             │
│  ├── Apply pagination                                                              │
│  └── Return contact list                                                           │
│                                                                                      │
│  GET /leads/fub/people/aggregates                                                   │
│  └── Return counts by stage, source, etc.                                          │
│                                                                                      │
│       │                                                                              │
│       ▼                                                                              │
│  STEP 8: DISPLAY - Leads Page                                                       │
│  ═══════════════════════════════════════════════════════════════════════════════   │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  LEADS                                                                       │   │
│  │  ╔═══════════════════════════════════════════════════════════════════════╗  │   │
│  │  ║ John Doe │ john@example.com │ Hot Lead │ +1-555-1234 │ [Call] [Email] ║  │   │
│  │  ╚═══════════════════════════════════════════════════════════════════════╝  │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Table Schema: fub_people (ID: 696)

| Field           | Type      | Source               | Notes              |
| --------------- | --------- | -------------------- | ------------------ |
| id              | int       | Auto                 | PK                 |
| fub_people_id   | int       | FUB: id              | External ID        |
| first_name      | text      | FUB: firstName       |                    |
| last_name       | text      | FUB: lastName        |                    |
| full_name       | text      | Computed             | first + last       |
| email           | text      | FUB: emails[0].value | Primary email      |
| phone           | text      | FUB: phones[0].value | Normalized         |
| stage_id        | int       | FUB: stage.id        | FK                 |
| stage_name      | text      | FUB: stage.name      | Denormalized       |
| assigned_to     | int       | FUB: assignedTo      | FK to fub_users    |
| source          | text      | FUB: source          | Lead source        |
| tags            | json      | FUB: tags            | Array              |
| user_id         | int       | Context              | FK to user         |
| agent_id        | int       | Linked               | FK to agent        |
| fub_accounts_id | int       | Context              | FK to fub_accounts |
| created_at      | timestamp | FUB: created         |                    |
| updated_at      | timestamp | System               | Last sync          |

---

## Related Tables

| Table        | Purpose          | FK in fub_people |
| ------------ | ---------------- | ---------------- |
| fub_stages   | Lead stages      | stage_id         |
| fub_users    | FUB users/agents | assigned_to      |
| fub_accounts | FUB accounts     | fub_accounts_id  |
| user         | AD users         | user_id          |
| agent        | AD agents        | agent_id         |

---

## API Endpoints for FUB People

| Endpoint                     | Method | Purpose             |
| ---------------------------- | ------ | ------------------- |
| /leads/fub/people            | GET    | List contacts       |
| /leads/fub/people/aggregates | GET    | Contact metrics     |
| /fub/people                  | GET    | Raw FUB people data |
| /fub/bulk_add_people         | POST   | Bulk add contacts   |

---

## Sync State: fub_sync_state

| Field          | Value                |
| -------------- | -------------------- |
| entity_type    | "people"             |
| last_sync_at   | 2026-01-26T12:00:00Z |
| cursor         | null                 |
| status         | "IDLE"               |
| records_synced | 150                  |

---

## Background Task

| Task ID | Name                              | Frequency |
| ------- | --------------------------------- | --------- |
| 2418    | FUB - Daily Update - People V2 V3 | 15 min    |

---

## Timing

| Stage              | Latency  |
| ------------------ | -------- |
| Webhook received   | < 1 sec  |
| Queue → Processing | 0-15 min |
| Transform + Upsert | < 2 sec  |
| API response       | < 300ms  |

---

_Generated: 2026-01-26_
_Task: fn-1-2cy.16_
