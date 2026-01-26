# Core Entity Relationships - V2 Backend

> Task 1.1: Map core entity relationships (user, agent, team, transaction, listing, network)

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           CORE ENTITY RELATIONSHIPS                                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌──────────┐         ┌──────────┐         ┌──────────┐                            │
│  │   USER   │────────>│  AGENT   │────────>│   TEAM   │                            │
│  │  (664)   │  1:1    │  (670)   │   N:1   │  (704)   │                            │
│  └──────────┘         └──────────┘         └──────────┘                            │
│       │                    │                    │                                   │
│       │                    │                    │                                   │
│       │                    v                    v                                   │
│       │              ┌──────────────┐    ┌──────────────┐                          │
│       │              │ TEAM_MEMBERS │    │ TEAM_SETTINGS│                          │
│       │              │    (683)     │    │    (682)     │                          │
│       │              └──────────────┘    └──────────────┘                          │
│       │                    │                                                        │
│       │                    │                                                        │
│       v                    v                                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐          │
│  │                        TRANSACTION DOMAIN                              │          │
│  │  ┌─────────────┐    ┌─────────────────────┐    ┌──────────────────┐  │          │
│  │  │ TRANSACTION │───>│ TRANSACTION_FINANCIALS│   │TRANSACTION_HISTORY│  │          │
│  │  │    (675)    │    │       (677)          │   │      (678)        │  │          │
│  │  └─────────────┘    └─────────────────────┘    └──────────────────┘  │          │
│  │        │                                                              │          │
│  │        └───────────────────────────────────────┐                     │          │
│  │                                                v                     │          │
│  │  ┌─────────────┐    ┌─────────────────────┐   ┌──────────────────┐  │          │
│  │  │ PARTICIPANT │───>│TRANSACTION_PARTICIPANTS│  │   ADDRESS        │  │          │
│  │  │    (696)    │    │       (676)          │   │    (692)         │  │          │
│  │  └─────────────┘    └─────────────────────┘   └──────────────────┘  │          │
│  └──────────────────────────────────────────────────────────────────────┘          │
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐          │
│  │                         LISTING DOMAIN                                │          │
│  │  ┌─────────────┐    ┌─────────────────┐    ┌──────────────────┐     │          │
│  │  │   LISTING   │───>│ LISTING_HISTORY │    │  LISTING_PHOTOS  │     │          │
│  │  │    (694)    │    │     (680)       │    │      (681)       │     │          │
│  │  └─────────────┘    └─────────────────┘    └──────────────────┘     │          │
│  └──────────────────────────────────────────────────────────────────────┘          │
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐          │
│  │                         NETWORK DOMAIN                                │          │
│  │  ┌──────────────────┐    ┌──────────────────┐                        │          │
│  │  │ NETWORK_HIERARCHY│    │  NETWORK_MEMBER  │                        │          │
│  │  │      (684)       │    │      (698)       │                        │          │
│  │  │ (ancestor/desc)  │    │ (sponsor/downline)│                        │          │
│  │  └──────────────────┘    └──────────────────┘                        │          │
│  └──────────────────────────────────────────────────────────────────────┘          │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. USER Domain

### user (Table ID: 664)

**Purpose**: Core user identity - the central record that all other user tables reference.

| Field            | Type      | Description        |
| ---------------- | --------- | ------------------ |
| id               | int       | Primary key        |
| first_name       | text      | Required           |
| last_name        | text      |                    |
| full_name        | text      | Computed/cached    |
| display_name     | text      |                    |
| email            | email     | Required, for auth |
| email2           | text      | Secondary email    |
| cell_phone       | text      |                    |
| avatar           | text      | URL to avatar      |
| active           | bool      | Account status     |
| demo_account     | bool      | Demo user flag     |
| **agent_id**     | int       | FK → agent         |
| **team_id**      | int       | FK → team          |
| **brokerage_id** | int       | FK → brokerage     |
| last_login       | timestamp |                    |

**Key Relationships**:

- `user.agent_id` → `agent.id` (1:1)
- `user.team_id` → `team.id` (N:1)

---

## 2. AGENT Domain

### agent (Table ID: 670)

**Purpose**: Real estate agent profile with team and brokerage affiliations.

| Field                  | Type  | Description            |
| ---------------------- | ----- | ---------------------- |
| id                     | int   | Primary key            |
| agent_id_raw           | text  | External ID from reZEN |
| display_name           | text  |                        |
| first_name             | text  |                        |
| last_name              | text  |                        |
| email                  | email |                        |
| phone                  | text  |                        |
| agent_status           | text  | Active/Inactive/etc    |
| type                   | text  | Agent type             |
| title                  | text  | Job title              |
| avatar                 | text  |                        |
| join_date              | date  | Joined brokerage       |
| anniversary_date       | date  |                        |
| real_agent             | bool  | Real (not demo) agent  |
| active_on_team         | bool  |                        |
| is_demo                | bool  | Demo agent flag        |
| source                 | text  | Data source            |
| city                   | text  |                        |
| state                  | text  |                        |
| state_abbreviation     | text  |                        |
| **user_id**            | int   | FK → user              |
| **team_id**            | int   | FK → team              |
| **brokerage_id**       | int   | FK → brokerage         |
| **home_address_id**    | int   | FK → address           |
| **commission_plan_id** | int   | FK → commission plan   |
| api_key                | text  | Agent's API key        |

**Key Relationships**:

- `agent.user_id` → `user.id` (1:1)
- `agent.team_id` → `team.id` (N:1)

### Related Agent Tables

| Table             | ID  | Purpose                                          |
| ----------------- | --- | ------------------------------------------------ |
| agent_cap_data    | 671 | Cap tracking by year (team caps, brokerage caps) |
| agent_commission  | 672 | Commission split configuration                   |
| agent_performance | 673 | Metrics, rankings (cached)                       |
| agent_hierarchy   | 674 | Sponsor tree relationships                       |

---

## 3. TEAM Domain

### team (Table ID: 704)

**Purpose**: Core team record (normalized from V1 team_365).

| Field                   | Type | Description |
| ----------------------- | ---- | ----------- |
| id                      | int  | Primary key |
| team_name               | text |             |
| team_type               | text |             |
| team_id_raw             | text | External ID |
| active                  | bool |             |
| status                  | text |             |
| max_teammates           | int  | Limit       |
| max_leaders             | int  | Limit       |
| config_id               | text |             |
| commission_plan_id      | text |             |
| logo                    | text |             |
| **team_owner_agent_id** | int  | FK → agent  |

### team_members (Table ID: 683)

**Purpose**: Junction table linking teams to agents.

| Field          | Type | Description         |
| -------------- | ---- | ------------------- |
| id             | int  | Primary key         |
| active         | bool | Default: true       |
| status         | text | Default: "Active"   |
| is_leader      | bool | Team leader flag    |
| is_director    | bool | Director flag       |
| is_mentor      | bool | Mentor flag         |
| seat           | bool | Has seat            |
| team_join_date | date |                     |
| agent_id_raw   | text | External ID         |
| avatar         | text |                     |
| xano_avatar    | text | Cloud-hosted avatar |
| **agent_id**   | int  | FK → agent          |
| **team_id**    | int  | FK → team           |

### Role Tables

| Table                     | ID  | Purpose                        |
| ------------------------- | --- | ------------------------------ |
| director                  | 707 | Directors who oversee leaders  |
| leader                    | 705 | Team leaders who manage agents |
| mentor                    | 706 | Experienced agents who coach   |
| team_director_assignments | 407 | Director ↔ team junction       |
| team_leader_assignments   | 408 | Leader ↔ team junction         |
| team_mentor_assignments   | 409 | Mentor ↔ agent junction        |
| team_settings             | 682 | Team config and preferences    |
| user_roles                | 668 | User organizational roles      |

---

## 4. TRANSACTION Domain

### transaction (Table ID: 675)

**Purpose**: Core transaction record - real estate deals.

| Field                          | Type      | Description    |
| ------------------------------ | --------- | -------------- |
| id                             | int       | Primary key    |
| status                         | text      | Current status |
| transaction_type               | text      | Buy/Sell/etc   |
| stage                          | text      | Pipeline stage |
| lifecycle_state                | text      |                |
| contract_date                  | timestamp |                |
| closing_date                   | timestamp |                |
| listing_date                   | timestamp |                |
| firm_date                      | date      |                |
| sale_price                     | decimal   |                |
| list_price                     | decimal   |                |
| gross_commission               | decimal   |                |
| net_payout                     | decimal   |                |
| property_type                  | text      |                |
| mls_num                        | text      |                |
| representation                 | text      |                |
| transaction_id_raw             | text      | External ID    |
| rezen_code                     | text      | reZEN code     |
| team_id_raw                    | text      |                |
| sync_source                    | text      | Data source    |
| closed                         | bool      |                |
| terminated                     | bool      |                |
| transaction_owner_name         | text      |                |
| transaction_owner_email        | text      |                |
| **listing_id**                 | int       | FK → listing   |
| **address_id**                 | int       | FK → address   |
| **user_id**                    | int       | FK → user      |
| **team_id**                    | int       | FK → team      |
| **transaction_owner_agent_id** | int       | FK → agent     |
| **team_owner_agent_id**        | int       | FK → agent     |
| **office_id**                  | int       | FK → office    |

### transaction_financials (Table ID: 677)

**Purpose**: Financial details - GCI, splits, fees.

| Field              | Type    | Description             |
| ------------------ | ------- | ----------------------- |
| id                 | int     | Primary key             |
| gci                | decimal | Gross Commission Income |
| agent_commission   | decimal |                         |
| team_split         | decimal |                         |
| brokerage_split    | decimal |                         |
| fees               | decimal |                         |
| **transaction_id** | int     | FK → transaction        |

### transaction_history (Table ID: 678)

**Purpose**: Status change audit trail.

| Field              | Type      | Description      |
| ------------------ | --------- | ---------------- |
| id                 | int       | Primary key      |
| old_status         | text      |                  |
| new_status         | text      |                  |
| changed_at         | timestamp |                  |
| changed_by         | int       | User ID          |
| **transaction_id** | int       | FK → transaction |

### participant (Table ID: 696)

**Purpose**: Agents and parties involved in deals.

| Field              | Type      | Description                    |
| ------------------ | --------- | ------------------------------ |
| id                 | int       | Primary key                    |
| role               | text      | Buyer Agent, Seller Agent, etc |
| status             | text      |                                |
| first_name         | text      |                                |
| last_name          | text      |                                |
| email              | text      |                                |
| phone              | text      |                                |
| company            | text      |                                |
| is_real_agent      | bool      | Real brokerage agent           |
| paid_by_real       | bool      |                                |
| external           | bool      | External participant           |
| commission_split   | decimal   |                                |
| gross_commission   | decimal   |                                |
| net_payout         | decimal   |                                |
| paid               | bool      |                                |
| paid_at            | timestamp |                                |
| agent_id_raw       | text      |                                |
| participant_id_raw | text      |                                |
| is_transaction     | bool      | Transaction participant        |
| is_listing         | bool      | Listing participant            |
| **transaction_id** | int       | FK → transaction               |
| **agent_id**       | int       | FK → agent                     |
| **address_id**     | int       | FK → address                   |
| **listing_id**     | int       | FK → listing                   |
| **user_id**        | int       | FK → user                      |

---

## 5. LISTING Domain

### listing (Table ID: 694)

**Purpose**: Property listings with status, pricing, dates.

| Field                          | Type    | Description             |
| ------------------------------ | ------- | ----------------------- |
| id                             | int     | Primary key             |
| status                         | text    | Active/Pending/Sold/etc |
| list_price                     | decimal |                         |
| listing_date                   | date    |                         |
| expiration_date                | date    |                         |
| days_on_market                 | int     |                         |
| property_type                  | text    |                         |
| mls_number                     | text    |                         |
| listing_id_raw                 | text    | External ID             |
| data_source                    | text    | SkySlope, reZEN, etc    |
| is_demo                        | bool    |                         |
| closed                         | bool    |                         |
| terminated                     | bool    |                         |
| closed_at                      | date    |                         |
| terminated_at                  | date    |                         |
| **address_id**                 | int     | FK → address            |
| **transaction_owner_agent_id** | int     | FK → agent              |
| **team_id**                    | int     | FK → team               |
| **team_owner_agent_id**        | int     | FK → agent              |
| **office_id**                  | int     | FK → office             |
| **user_id**                    | int     | FK → user               |

### listing_history (Table ID: 680)

**Purpose**: Status and price change tracking.

| Field          | Type      | Description  |
| -------------- | --------- | ------------ |
| id             | int       | Primary key  |
| status         | text      | Required     |
| price          | decimal   |              |
| changed_at     | timestamp |              |
| **listing_id** | int       | FK → listing |

### listing_photos (Table ID: 681)

**Purpose**: Photo URLs and metadata.

---

## 6. NETWORK Domain

### network_hierarchy (Table ID: 684)

**Purpose**: Sponsor tree relationships using closure table pattern.

| Field                   | Type | Description           |
| ----------------------- | ---- | --------------------- |
| id                      | int  | Primary key           |
| path_json               | json | Full path as JSON     |
| depth                   | int  | Distance in hierarchy |
| **ancestor_agent_id**   | int  | FK → agent (sponsor)  |
| **descendant_agent_id** | int  | FK → agent (downline) |

**Pattern**: Closure table for hierarchical queries

- Find all descendants: `WHERE ancestor_agent_id = X`
- Find all ancestors: `WHERE descendant_agent_id = X`
- Find direct children: `WHERE ancestor_agent_id = X AND depth = 1`

### network_member (Table ID: 698)

**Purpose**: Network membership with rev share details.

| Field                   | Type      | Description            |
| ----------------------- | --------- | ---------------------- |
| id                      | int       | Primary key            |
| status                  | text      |                        |
| tier                    | text      | Network tier           |
| sponsor_split           | decimal   | Rev share percentage   |
| unlocking               | bool      | In unlocking period    |
| unlocking_expiry        | date      |                        |
| network_size            | int       | Downline count         |
| capped                  | bool      | Cap reached            |
| cap_amount              | decimal   |                        |
| cap_amount_paid         | decimal   |                        |
| left_network            | bool      |                        |
| total_contribution      | decimal   | Total rev share earned |
| contact_frequency       | text      |                        |
| last_contacted_date     | timestamp |                        |
| network_id_raw          | text      |                        |
| sponsorship_type        | text      |                        |
| anniversary_date        | date      |                        |
| broker_join_date        | date      |                        |
| broker_terminated_date  | date      |                        |
| **user_id**             | int       | FK → user              |
| **agent_id**            | int       | FK → agent             |
| **downline_agent_id**   | int       | FK → agent             |
| **sponsoring_agent_id** | int       | FK → agent             |

---

## Key Relationship Summary

```
USER ─────────────────── 1:1 ──────────────────> AGENT
  │                                                │
  │                                                │
  └── team_id ─── N:1 ──> TEAM <── N:1 ─── team_id┘
                            │
                            v
                      TEAM_MEMBERS (junction)
                            │
                            v
                         AGENT

TRANSACTION ──────────> PARTICIPANT ──────────> AGENT
     │
     ├──> TRANSACTION_FINANCIALS (1:1)
     ├──> TRANSACTION_HISTORY (1:N)
     ├──> ADDRESS
     └──> LISTING

LISTING ──────────> LISTING_HISTORY (1:N)
    │
    └──> ADDRESS

AGENT ──────────> NETWORK_HIERARCHY (closure table)
    │               │
    │               v
    └──────────> NETWORK_MEMBER (rev share details)
```

---

## Normalized vs V1 Comparison

| V1 Pattern                           | V2 Pattern                                                                  | Improvement                    |
| ------------------------------------ | --------------------------------------------------------------------------- | ------------------------------ |
| Address fields in every table        | Centralized `address` table (692)                                           | DRY, single source of truth    |
| Single `transaction` with all fields | Split into `transaction` + `transaction_financials` + `transaction_history` | Separation of concerns         |
| `team_365` monolithic                | Split into `team` + `team_members` + `team_settings`                        | Cleaner relationships          |
| Network in single table              | `network_hierarchy` (closure) + `network_member`                            | Efficient hierarchical queries |

---

_Generated: 2026-01-26_
_Task: fn-1-2cy.1_
