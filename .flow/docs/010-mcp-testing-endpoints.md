# MCP Testing Endpoints - V2 Backend

> Task 4.2: Document MCP testing endpoints

## MCP API Groups Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           MCP API GROUPS                                             │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────┐    │
│  │  ID   │ Name                 │ Endpoints │ Purpose                        │    │
│  ├───────┼──────────────────────┼───────────┼────────────────────────────────┤    │
│  │  532  │ 🔧 MCP: Tasks        │   100+    │ Background task triggers       │    │
│  │  535  │ 🔧 MCP: System       │    38     │ System utilities, backfills    │    │
│  │  536  │ 🔧 MCP: Workers      │   150+    │ Worker function testing        │    │
│  │  531  │ 🔧 MCP: Seeding      │    24     │ Test data management           │    │
│  │  574  │ 🔧 MCP: SkySlope     │     4     │ SkySlope auth testing          │    │
│  └───────┴──────────────────────┴───────────┴────────────────────────────────┘    │
│                                                                                      │
│  Total: ~316+ test/utility endpoints                                                │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## MCP: Tasks (532) - Background Task Triggers

Base URL: `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4psV7fp6`

### Purpose

Endpoints to manually trigger background tasks for testing and debugging.

### FUB Task Triggers

| Endpoint                                          | Tags                  | Purpose                  |
| ------------------------------------------------- | --------------------- | ------------------------ |
| `POST fub-onboarding-jobs`                        | test, v3, fub, active | Trigger FUB onboarding   |
| `POST fub-onboarding-people-worker-1`             | test, v3, fub         | People import worker     |
| `POST fub-onboarding-calls-worker-1..4`           | test, v3, fub         | Calls import (4 workers) |
| `POST fub-onboarding-events-worker-1`             | test, v3, fub         | Events import            |
| `POST fub-onboarding-appointments-worker`         | test, v3, fub         | Appointments import      |
| `POST fub-onboarding-text-messages-from-people`   | test, v3, fub         | SMS import               |
| `POST fub-onboarding-deals-from-people`           | test, v3, fub         | Deals import             |
| `POST fub-daily-update-text-messages-phone`       | test, v3, fub         | Daily SMS sync           |
| `POST fub-get-people`                             | test, v3, fub         | Get FUB people           |
| `POST fub-process-text-messages-from-stage`       | test, v3, fub         | Process staged SMS       |
| `POST fub-pull-text-messages-from-calling-number` | test, v3, fub         | Pull SMS by number       |
| `POST fub-pull-count-records-update-accounts`     | test, v3, fub         | Update account counts    |
| `POST fub-pull-events-with-people-id-0`           | test, v3, fub         | Fix orphaned events      |
| `POST fub-fix-people-data-in-events`              | test, v3, fub         | Fix event data           |
| `POST fub-fix-people-data-in-fub-people`          | test, v3, fub         | Fix people data          |
| `POST fub-fix-appointments-missing-created-by`    | test, v3, fub         | Fix appointments         |
| `POST fub-fix-calls-missing-record-username`      | test, v3, fub         | Fix calls                |
| `POST fub-people-url`                             | test, v3, fub         | Get people URL           |
| `POST fub-import-fub-users-id`                    | test, v3, fub         | Import FUB users         |
| `POST fub-get-appointments-missing-data`          | test, v3, fub         | Get incomplete appts     |

### SkySlope Task Triggers

| Endpoint                                       | Tags               | Purpose                 |
| ---------------------------------------------- | ------------------ | ----------------------- |
| `POST skyslope-transactions-sync-worker-1`     | test, v3, skyslope | Sync transactions       |
| `POST skyslope-listings-sync-worker-1`         | test, v3, skyslope | Sync listings           |
| `POST skyslope-move-transactions-from-staging` | test, v3, skyslope | Process txn staging     |
| `POST skyslope-move-listings-from-staging`     | test, v3, skyslope | Process listing staging |
| `POST skyslope-account-users-sync-worker-1`    | test, v3, skyslope | Sync account users      |

### Title Task Triggers

| Endpoint                              | Tags            | Purpose            |
| ------------------------------------- | --------------- | ------------------ |
| `POST title-orders`                   | test, v3, title | Get title orders   |
| `POST title-get-todays-qualia-orders` | test, v3, title | Get today's orders |

### Admin/Reporting Task Triggers

| Endpoint                                   | Tags                | Purpose                 |
| ------------------------------------------ | ------------------- | ----------------------- |
| `POST metrics-create-snapshot`             | test, v3, metrics   | Create metrics snapshot |
| `POST reporting-process-errors-send-slack` | test, v3, reporting | Send error reports      |
| `POST ad-email-network-news-daily`         | test, v3, admin     | Daily email digest      |
| `POST ad-email-network-news-weekly`        | test, v3, admin     | Weekly email digest     |
| `POST ad-missing-agent-ids-participants`   | test, v3, admin     | Backfill agent IDs      |
| `POST ad-missing-team-roster-avatars`      | test, v3, admin     | Backfill avatars        |
| `POST ad-upload-network-images`            | test, v3, admin     | Upload network images   |
| `POST ad-upload-team-roster-images`        | test, v3, admin     | Upload roster images    |
| `POST ad-csv-insert-data-from-temp-table`  | test, v3, admin     | CSV import              |

### reZEN Task Triggers

| Endpoint                                      | Purpose                |
| --------------------------------------------- | ---------------------- |
| `POST test-orchestrator-user-60`              | Test full orchestrator |
| `POST test-listings-worker-user-60`           | Test listings worker   |
| `POST test-rezen-listing-processor-fixed`     | Test listing processor |
| `POST test-rezen-process-transaction-staging` | Test txn staging       |
| `POST rezen-process-stage-contributions`      | Process contributions  |
| `POST emergency-reset-rezen-user-60`          | Reset user 60 data     |

### Debug/Utility Endpoints

| Endpoint                              | Purpose                           |
| ------------------------------------- | --------------------------------- |
| `GET verify-fub-data`                 | Verify FUB data integrity         |
| `GET check-new-contributions`         | Check for new contributions       |
| `GET debug-find-skyslope-txn`         | Debug SkySlope transaction lookup |
| `POST debug-skyslope-insert`          | Debug SkySlope inserts            |
| `POST test-transform-only`            | Test data transformation          |
| `POST test-deals-orchestrator-direct` | Test deals orchestrator           |

---

## MCP: System (535) - System Utilities

Base URL: `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN`

### Purpose

System-level utilities for monitoring, backfills, and administrative operations.

### Status/Monitoring Endpoints

| Endpoint                  | Tags       | Purpose                     |
| ------------------------- | ---------- | --------------------------- |
| `GET job-queue-status`    | 2026-01-16 | Check background job queue  |
| `GET table-counts`        | -          | Get record counts per table |
| `GET onboarding-status`   | -          | Get onboarding job status   |
| `GET staging-status`      | -          | Check staging table status  |
| `GET staging-unprocessed` | -          | Count unprocessed staging   |

### Backfill Endpoints

| Endpoint                                            | Tags | Purpose                         |
| --------------------------------------------------- | ---- | ------------------------------- |
| `POST backfill-agent-join-dates`                    | -    | Backfill agent join dates       |
| `POST backfill-all-updated-at`                      | -    | Backfill updated_at fields      |
| `POST backfill-address-country`                     | -    | Backfill address countries      |
| `POST backfill-address-state`                       | -    | Backfill address states         |
| `POST backfill-contribution-fields`                 | -    | Backfill contribution fields    |
| `POST backfill-fub-calls-direction`                 | -    | Backfill call directions        |
| `POST backfill-fub-calls-people-id`                 | -    | Backfill FUB people IDs         |
| `POST backfill-fub-people-stage-id`                 | -    | Backfill FUB stage IDs          |
| `POST backfill-fub-users-agent-id`                  | -    | Link FUB users to agents        |
| `POST backfill-listing-agent-id`                    | -    | Link listings to agents         |
| `POST backfill-participant-agent-id`                | -    | Link participants to agents     |
| `POST backfill-transaction-updated-at`              | -    | Backfill txn timestamps         |
| `POST backfill-transaction-financials-updated-at`   | -    | Backfill financials timestamps  |
| `POST backfill-transaction-participants-updated-at` | -    | Backfill participant timestamps |

### Trigger Endpoints

| Endpoint                                 | Purpose                    |
| ---------------------------------------- | -------------------------- |
| `POST trigger-backfill-listing-agent-id` | Trigger listing backfill   |
| `POST trigger-sponsor-tree`              | Rebuild sponsor tree       |
| `POST trigger-transaction-worker`        | Trigger transaction worker |
| `POST assign-transaction-worker`         | Assign txn to worker       |
| `POST execute-worker`                    | Execute arbitrary worker   |

### Reset/Clear Endpoints

| Endpoint                        | Tags | Purpose                  |
| ------------------------------- | ---- | ------------------------ |
| `POST reset-skyslope-staging`   | -    | Reset SkySlope staging   |
| `POST reset-transaction-errors` | -    | Clear transaction errors |
| `POST reset-processed-staging`  | -    | Reset processed flags    |
| `POST clear-external-data`      | -    | Clear external API data  |

### Data Quality Endpoints

| Endpoint                                    | Tags                | Purpose               |
| ------------------------------------------- | ------------------- | --------------------- |
| `POST audit-table-data-quality`             | audit, data-quality | Run quality audit     |
| `POST fix-domestic-partnership-user-ids`    | utility, backfill   | Fix user ID linking   |
| `POST fix-empty-type-fields`                | -                   | Fix empty type fields |
| `POST rezen-move-transactions-from-staging` | -                   | Process reZEN staging |

### Admin Utilities

| Endpoint                                  | Purpose                       |
| ----------------------------------------- | ----------------------------- |
| `POST set-user-password`                  | Set user password             |
| `POST /bulk-import-dashboard-configs`     | Bulk import dashboard configs |
| `POST /run-process-pending-contributions` | Process pending contributions |

---

## MCP: Workers (536) - Worker Function Testing

Base URL: `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m`

### Purpose

Test endpoints for individual worker functions. Each maps to a Workers/ function.

### Onboarding Workers (8051-8080)

| Endpoint                                          | Function ID | Purpose               |
| ------------------------------------------------- | ----------- | --------------------- |
| `POST test-function-8051-agent-data`              | 8051        | Load agent data       |
| `POST test-function-8052-txn-sync`                | 8052        | Transaction sync      |
| `POST test-function-8053-listings-sync`           | 8053        | Listings sync         |
| `POST test-function-8054-listings-update`         | 8054        | Update listings       |
| `POST test-function-8055-equity`                  | 8055        | Process equity        |
| `POST test-function-8056-contributions`           | 8056        | Process contributions |
| `POST test-function-8057-stage-contributions`     | 8057        | Stage contributions   |
| `POST test-function-8058-network-cap`             | 8058        | Network cap data      |
| `POST test-function-8059-network-frontline`       | 8059        | Network frontline     |
| `POST test-function-8060-load-contributions`      | 8060        | Load contributions    |
| `POST test-function-8061-contributors`            | 8061        | Process contributors  |
| `POST test-function-8062-network-downline`        | 8062        | Network downline      |
| `POST test-function-8063-network-frontline-ob`    | 8063        | Frontline onboard     |
| `POST test-function-8065-fub-calls`               | 8065        | FUB calls worker      |
| `POST test-function-8066-team-roster`             | 8066        | Team roster sync      |
| `POST test-function-8067-onboarding-appointments` | 8067        | Appointments onboard  |
| `POST test-function-8068-cap-data`                | 8068        | Cap data worker       |
| `POST test-function-8069-equity-ob`               | 8069        | Equity onboard        |
| `POST test-function-8070-sponsor-tree`            | 8070        | Sponsor tree          |
| `POST test-function-8071-revshare-totals`         | 8071        | RevShare totals       |
| `POST test-function-8072-pending-contributions`   | 8072        | Pending contributions |
| `POST test-function-8073-contributions`           | 8073        | Contributions worker  |
| `POST test-function-8074-sync-nw-downline`        | 8074        | Sync network downline |
| `POST test-function-8078-nw-pull-temp`            | 8078        | Pull network temp     |
| `POST test-function-8079-nw-update-dump`          | 8079        | Update network dump   |
| `POST test-function-8080-api-wrapper`             | 8080        | API wrapper           |

### Utility Workers (8081-8100)

| Endpoint                                   | Function ID | Purpose            |
| ------------------------------------------ | ----------- | ------------------ |
| `POST test-function-8082-api-key`          | 8082        | API key management |
| `POST test-function-8085-people-transform` | 8085        | People transform   |
| `POST test-function-8095-listing-counts`   | 8095        | Listing counts     |
| `POST test-function-8096-network-counts`   | 8096        | Network counts     |

### reZEN Workers

| Endpoint                                       | Function ID | Purpose              |
| ---------------------------------------------- | ----------- | -------------------- |
| `POST test-function-8032-rezen-team-roster`    | 8032        | Team roster sync     |
| `POST test-function-8034-network-get-downline` | 8034        | Get network downline |
| `POST test-rezen-team-roster-sync`             | 8032        | Team roster (alt)    |

### FUB Workers

| Endpoint                                     | Function ID | Purpose            |
| -------------------------------------------- | ----------- | ------------------ |
| `POST test-function-7977-people-worker`      | 7977        | FUB people worker  |
| `POST test-function-7972-email-daily`        | 7972        | Daily email        |
| `POST test-function-10972-fub-users`         | 10972       | FUB users          |
| `POST test-function-8118-lambda-coordinator` | 8118        | Lambda coordinator |
| `POST test-function-8134-events-pull-people` | 8134        | Events from people |
| `POST test-function-8136-event-by-id`        | 8136        | Event by ID        |
| `POST test-function-8152-avatars`            | 8152        | Avatar uploads     |
| `POST test-function-10022-get-deals`         | 10022       | Get FUB deals      |

### Verification Endpoints

| Endpoint                 | Purpose                |
| ------------------------ | ---------------------- |
| `POST verify-fixed-8080` | Verify API wrapper fix |
| `POST verify-fixed-8089` | Verify fix 8089        |
| `POST verify-fixed-8104` | Verify fix 8104        |
| `POST verify-fixed-8132` | Verify fix 8132        |
| `POST verify-fixed-8135` | Verify fix 8135        |
| `POST verify-fixed-8150` | Verify fix 8150        |

### Trigger Endpoints

| Endpoint                                          | Tags               | Purpose                 |
| ------------------------------------------------- | ------------------ | ----------------------- |
| `POST trigger-geocode-addresses`                  | mcp, geocoding     | Geocode addresses       |
| `POST trigger-backfill-listing-agents`            | -                  | Backfill listing agents |
| `POST trigger-backfill-team-join-date`            | backfill, team     | Team join dates         |
| `POST trigger-backfill-revshare-dates`            | -                  | RevShare dates          |
| `POST trigger-backfill-network-member-cap-data`   | -                  | Network cap data        |
| `POST trigger-backfill-team-members`              | utils, backfill    | Team members            |
| `POST trigger-backfill-agent-core-fields`         | utils, backfill    | Agent fields            |
| `POST trigger-backfill-error-logs`                | -                  | Error logs              |
| `POST trigger-generate-audit-record`              | v3, trigger, audit | Generate audit          |
| `POST trigger-create-users-from-agents`           | -                  | Create users            |
| `POST trigger-chart-transactions-aggregate`       | chart, trigger     | Chart aggregates        |
| `POST trigger-sync-pipeline-prospects`            | -                  | Pipeline sync           |
| `POST trigger-populate-user-roles`                | v3, trigger        | Populate roles          |
| `POST trigger-title-get-all-orders`               | v3, trigger, title | Title orders            |
| `POST trigger-title-get-settlement-agencies`      | -                  | Settlement agencies     |
| `POST trigger-title-populate-closing-disclosures` | -                  | Closing disclosures     |
| `POST trigger-populate-commission-payment`        | v3, trigger        | Commission payment      |
| `POST trigger-rezen-get-agent-commission`         | v3, trigger, rezen | Agent commission        |
| `POST trigger-rezen-get-cap-data-all-agents`      | v3, trigger, rezen | Cap data                |
| `POST trigger-migrate-participants`               | -                  | Migrate participants    |
| `POST trigger-rezen-populate-revshare-payments`   | v3, trigger        | RevShare payments       |
| `POST trigger-backfill-agent-performance`         | -                  | Agent performance       |
| `POST trigger-network-downline-v2`                | -                  | Network downline        |
| `POST trigger-income-aggregation`                 | test, income       | Income aggregation      |

### Backfill Endpoints

| Endpoint                                          | Purpose                 |
| ------------------------------------------------- | ----------------------- |
| `POST backfill-agent-home-addresses`              | Backfill home addresses |
| `POST backfill-rezen-transaction-dates`           | Backfill txn dates      |
| `POST backfill-agent-user-id`                     | Link agents to users    |
| `POST backfill-transaction-financials`            | Backfill financials     |
| `POST backfill-transaction-net-payout`            | Backfill net payout     |
| `POST backfill-transaction-list-price`            | Backfill list price     |
| `POST backfill-transaction-owner-agent-id`        | Backfill owner agent    |
| `POST backfill-network-member-agent-id`           | Backfill network agent  |
| `POST backfill-fub-calls-linking`                 | Link FUB calls          |
| `POST backfill-fub-events-linking`                | Link FUB events         |
| `POST backfill-fub-calls-people-fk`               | Backfill calls FK       |
| `POST backfill-fub-people-assigned-to`            | Backfill assigned_to    |
| `POST backfill-tp-agent-id`                       | Transaction participant |
| `POST backfill-transaction-participants-agent-id` | Participant agent       |

### Utility/Debug Endpoints

| Endpoint                                   | Purpose                    |
| ------------------------------------------ | -------------------------- |
| `POST test-transaction-metrics`            | Test metrics               |
| `POST test-commission-sync`                | Test commission sync       |
| `POST test-job-status-utils`               | Test job utils             |
| `POST test-input-echo`                     | Echo input (debug)         |
| `POST test-address-helper`                 | Test address helper        |
| `POST test-error-logging`                  | Test error logging         |
| `POST run-all-linking-functions`           | Run all FK linking         |
| `POST util-link-network-member-agent`      | Link network members       |
| `POST util-link-hierarchy-fks`             | Link hierarchy FKs         |
| `POST util-process-network-staging`        | Process network staging    |
| `POST util-contributions-full-pipeline`    | Full contribution pipeline |
| `POST util-batch-process-contributions-v2` | Batch contributions        |
| `POST enrich-team-members`                 | Enrich team member data    |
| `POST link-team-members-to-agents`         | Link members to agents     |
| `POST link-fub-deals-users`                | Link deals to users        |

---

## MCP: Seeding (531) - Test Data Management

Base URL: `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:2kCRUYxG`

### Purpose

Create and clear test data for development and testing.

### Seed Endpoints (Create Data)

| Endpoint                     | Tags                            | Purpose                         |
| ---------------------------- | ------------------------------- | ------------------------------- |
| `POST seed/user`             | test-data, seeding, user        | Create test user                |
| `POST seed/user/full`        | test-data, seeding, user        | Create full user with relations |
| `POST seed/agent/full`       | test-data, seeding, agent       | Create full agent               |
| `POST seed/team/full`        | test-data, seeding, team        | Create full team                |
| `POST seed/transaction/full` | test-data, seeding, transaction | Create full transaction         |
| `POST seed/listing/full`     | test-data, seeding, listing     | Create full listing             |
| `POST seed/network/full`     | test-data, seeding, network     | Create network data             |
| `POST seed/demo-dataset`     | test-data, seeding, utility     | Create demo dataset             |

### Count Endpoints (Check Data)

| Endpoint                     | Tags                           | Purpose               |
| ---------------------------- | ------------------------------ | --------------------- |
| `GET seed/user/count`        | test-data, counts, user        | Count test users      |
| `GET seed/agent/count`       | test-data, counts, agent       | Count test agents     |
| `GET seed/team/count`        | test-data, counts, team        | Count test teams      |
| `GET seed/transaction/count` | test-data, counts, transaction | Count test txns       |
| `GET seed/listing/count`     | test-data, counts, listing     | Count test listings   |
| `GET seed/network/count`     | test-data, counts, network     | Count network records |
| `GET seed/status`            | test-data, counts, utility     | Overall seed status   |

### Clear Endpoints (Remove Data)

| Endpoint                                  | Tags                          | Purpose               |
| ----------------------------------------- | ----------------------------- | --------------------- |
| `POST clear/user/{user_id}`               | test-data, clear, user        | Clear user data       |
| `POST clear/agent/{agent_id}`             | test-data, clear, agent       | Clear agent data      |
| `POST clear/team/{team_id}`               | test-data, clear, team        | Clear team data       |
| `POST clear/transaction/{transaction_id}` | test-data, clear, transaction | Clear txn data        |
| `POST clear/all`                          | -                             | Clear ALL test data   |
| `POST clear-user-data`                    | 2026-01-16                    | Clear user data (new) |

### Chart Configuration

| Endpoint                         | Purpose                   |
| -------------------------------- | ------------------------- |
| `POST seed-chart-catalog-bulk`   | Bulk seed chart catalog   |
| `POST update-chart-configs-bulk` | Bulk update chart configs |

---

## MCP: SkySlope Tests (574) - SkySlope Auth Testing

Base URL: `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:6kzol9na`

### Purpose

Test SkySlope API authentication methods.

| Endpoint                     | Purpose                  |
| ---------------------------- | ------------------------ |
| `POST test-skyslope-auth`    | Test basic auth          |
| `POST skyslope-auth-native`  | Test native auth method  |
| `POST skyslope-auth-flat`    | Test flat auth structure |
| `POST skyslope-auth-filters` | Test auth with filters   |

---

## Testing Patterns

### Standard Test Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           MCP TESTING WORKFLOW                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  1. CHECK STATUS                                                                    │
│     └── GET /table-counts                                                           │
│     └── GET /job-queue-status                                                       │
│     └── GET /staging-status                                                         │
│                                                                                      │
│  2. SEED TEST DATA (if needed)                                                      │
│     └── POST /seed/user/full                                                        │
│     └── POST /seed/agent/full                                                       │
│     └── POST /seed/demo-dataset                                                     │
│                                                                                      │
│  3. TRIGGER WORKER                                                                  │
│     └── POST /test-function-{id}-{name}                                            │
│                                                                                      │
│  4. VERIFY RESULTS                                                                  │
│     └── GET /staging-unprocessed                                                    │
│     └── POST /verify-fixed-{id}                                                     │
│                                                                                      │
│  5. CLEANUP (if needed)                                                             │
│     └── POST /clear/user/{user_id}                                                  │
│     └── POST /reset-processed-staging                                               │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Curl Testing Example

```bash
# 1. Check job queue status
curl -X GET "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN/job-queue-status"

# 2. Seed test user
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:2kCRUYxG/seed/user/full" \
  -H "Content-Type: application/json" \
  -d '{}'

# 3. Test team roster worker
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/test-function-8066-team-roster" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 60
  }'

# 4. Check staging status
curl -X GET "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN/staging-status"

# 5. Clear test data
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:2kCRUYxG/clear/user/60" \
  -H "Content-Type: application/json"
```

---

## Endpoint Naming Conventions

| Pattern                     | Meaning                      | Example                          |
| --------------------------- | ---------------------------- | -------------------------------- |
| `test-function-{id}-{name}` | Direct worker test           | `test-function-8066-team-roster` |
| `trigger-{action}`          | Trigger background operation | `trigger-geocode-addresses`      |
| `backfill-{entity}-{field}` | Backfill missing data        | `backfill-agent-join-dates`      |
| `verify-fixed-{id}`         | Verify bug fix               | `verify-fixed-8080`              |
| `seed/{entity}/full`        | Create full test entity      | `seed/user/full`                 |
| `clear/{entity}/{id}`       | Clear test entity            | `clear/user/60`                  |
| `util-{action}`             | Utility operation            | `util-link-hierarchy-fks`        |

---

## Primary Test User

| Field    | Value             |
| -------- | ----------------- |
| User ID  | 60                |
| Agent ID | 37208             |
| Team ID  | 1                 |
| Name     | David Keener      |
| Status   | PRIMARY test user |

---

_Generated: 2026-01-26_
_Task: fn-1-2cy.10_
