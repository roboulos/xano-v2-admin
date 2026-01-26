# Webhook Handlers - V2 Backend

> Task 4.3: Document webhook handlers

## Webhook Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           WEBHOOK PROCESSING FLOW                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  EXTERNAL SERVICE                                                                   │
│       │                                                                              │
│       ▼                                                                              │
│  ┌─────────────────┐                                                                │
│  │ Webhook Endpoint│ (API Group 646/348/340)                                        │
│  │ POST /webhook/* │                                                                │
│  └────────┬────────┘                                                                │
│           │                                                                          │
│           ▼                                                                          │
│  ┌─────────────────┐                                                                │
│  │ Queue Table     │ (rezen_process_webhook, fub_worker_queue)                      │
│  │ Store event     │                                                                │
│  └────────┬────────┘                                                                │
│           │                                                                          │
│           ▼ (Background Task polls)                                                 │
│  ┌─────────────────┐                                                                │
│  │ Orchestrator    │ (Tasks/reZEN - Process Webhooks, etc.)                         │
│  │ Reads queue     │                                                                │
│  └────────┬────────┘                                                                │
│           │                                                                          │
│           ▼                                                                          │
│  ┌─────────────────┐                                                                │
│  │ Worker Function │ (Workers/reZEN - Process Webhook Events)                       │
│  │ • API call      │                                                                │
│  │ • Transform     │                                                                │
│  │ • Upsert        │                                                                │
│  │ • Notify        │                                                                │
│  └────────┬────────┘                                                                │
│           │                                                                          │
│           ▼                                                                          │
│  ┌─────────────────┐                                                                │
│  │ Delete from     │                                                                │
│  │ Queue           │                                                                │
│  └─────────────────┘                                                                │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Webhook API Groups

### 1. Webhooks API (646) - Unified Inbound Webhooks

Base URL: `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:XOwEm4wm`

| Endpoint                                | Integration | Purpose                     |
| --------------------------------------- | ----------- | --------------------------- |
| `POST /fub/webhook/create`              | FUB         | Generic FUB webhook         |
| `POST /fub/webhook/appointment_created` | FUB         | Appointment creation        |
| `POST /fub/webhook/textMessagesCreated` | FUB         | Text message creation       |
| `POST /rezen/webhook/create`            | reZEN       | Generic reZEN webhook       |
| `POST /rezen/webhook/delete`            | reZEN       | Webhook deletion            |
| `POST /rezen/user/{id}/transactions`    | reZEN       | Transaction events per user |
| `POST /rezen/{id}/listing`              | reZEN       | Listing events              |
| `POST /skyslope/credentials`            | SkySlope    | Credential webhooks         |
| `POST /slack/notification`              | Slack       | Slack notifications         |
| `POST /postmark/webhook`                | Postmark    | Email webhooks              |
| `POST /textiful/webhook`                | Textiful    | SMS webhooks                |
| `POST /remlo/webhook/data`              | Remlo       | Remlo data webhooks         |
| `POST /otc/webhook/incoming`            | OTC         | OTC webhooks                |

### 2. Webhook: FUB (348) - Follow Up Boss Webhooks

Base URL: `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:sCYsDnFD`

| Endpoint                            | Purpose                 |
| ----------------------------------- | ----------------------- |
| `POST /webhook/create`              | Generic webhook handler |
| `POST /webhook/appointment_created` | Appointment events      |
| `POST /webhook/textMessagesCreated` | SMS events              |
| `POST /accounts/{id}/data`          | Account data webhook    |
| `POST /fub-worker`                  | FUB worker trigger      |

### 3. Webhook: Stripe (340) - Payment Webhooks

Base URL: `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:ihFeqSDq`

| Endpoint                              | Purpose             |
| ------------------------------------- | ------------------- |
| `POST /webhook/subscription_created`  | New subscription    |
| `POST /webhook/subscription_updated`  | Subscription change |
| `POST /webhook/subscription_canceled` | Cancellation        |
| `POST /webhook/payment_succeeded`     | Payment success     |
| `POST /webhook/payment_failed`        | Payment failure     |
| `POST /webhook/payment_intent`        | Payment intent      |
| `POST /webhook/customer_created`      | New customer        |
| `POST /webhook/session_completed`     | Checkout complete   |

---

## Webhook Queue Tables

### rezen_process_webhook (Table ID: 495)

Stores incoming reZEN webhook events for batch processing.

| Field      | Type      | Purpose                |
| ---------- | --------- | ---------------------- |
| id         | int       | Primary key            |
| created_at | timestamp | When received          |
| user_id    | int       | Affected user          |
| type       | text      | TRANSACTION or LISTING |
| data       | json      | Raw webhook payload    |
| processed  | bool      | Processing flag        |

### fub_worker_queue (Table ID: 709)

Stores FUB webhook events for worker processing.

| Field          | Type      | Purpose                                             |
| -------------- | --------- | --------------------------------------------------- |
| id             | int       | Primary key                                         |
| created_at     | timestamp | When received                                       |
| cron_name      | text      | Triggering cron                                     |
| process_status | enum      | pending/in_progress/completed/failed                |
| endpoint_type  | enum      | people/events/calls/appointments/deals/textMessages |
| worker_input   | json      | Parameters for worker                               |
| pickup_at      | timestamp | When picked up                                      |
| finish_at      | timestamp | When completed                                      |
| user_id        | int       | Affected user                                       |

---

## Webhook Handler Functions

### reZEN Webhook Processing

#### Tasks/reZEN - Process Webhooks (ID: 7995)

**Role:** Orchestrator - Polls queue and dispatches to workers

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  reZEN WEBHOOK ORCHESTRATOR                                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  1. Query rezen_process_webhook (batch of 40)                                       │
│                                                                                      │
│  2. For each webhook event:                                                         │
│     ┌─────────────────────────────────────────────────────────────────────────┐    │
│     │  if (type == "LISTING")                                                  │    │
│     │    → call Workers/reZEN - Process Listing Webhooks                      │    │
│     │  else                                                                    │    │
│     │    → call Workers/reZEN - Process Webhook Events                        │    │
│     └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  3. Return processing summary                                                       │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

#### Workers/reZEN - Process Webhook Events (ID: 8124)

**Role:** Worker - Processes individual transaction/event webhooks

**Flow:**

1. Get user credentials (API key)
2. Skip if no API key configured
3. Handle WEBHOOK_ENDPOINT_TEST_EVENT (notify Slack, delete)
4. For transaction events:
   - Call reZEN API to get transaction data
   - Call Workers/reZEN - Transaction Details By Object
   - Create notification for key events (CREATED, CLOSED, TERMINATED)
5. For listing events:
   - Call Workers/reZEN - Listing Details By Object
6. Delete from queue on success
7. Retry up to 3 times with exponential backoff
8. Log errors and notify Slack on final failure

**Supported Events:**
| Event Name | Action |
|------------|--------|
| WEBHOOK*ENDPOINT_TEST_EVENT | Notify Slack, delete |
| TRANSACTION_CREATED | Update + Create notification |
| TRANSACTION_CLOSED | Update + Create notification |
| TRANSACTION_TERMINATED | Update + Create notification |
| LISTING*\* | Update listing data |

#### Workers/reZEN - Process Listing Webhooks (ID: 8122)

**Role:** Worker - Processes listing-specific webhooks

#### Workers/reZEN - Register Webhooks (ID: 8127)

**Role:** Worker - Registers webhook endpoints with reZEN API

### FUB Webhook Processing

#### Tasks/FUB - Webhook Check (ID: 7945)

**Role:** Orchestrator - Checks and processes FUB webhooks

#### Workers/FUB - Webhooks Sync (ID: 8089)

**Role:** Worker - Syncs FUB webhook data

### Utility Functions

#### Workers/Utility - Slack Webhook (ID: 8105)

**Role:** Send notifications to Slack channels

**Inputs:**
| Input | Type | Purpose |
|-------|------|---------|
| url | text | Slack webhook URL |
| text | text | Message content |

**Usage:** Error notifications, success alerts, test event confirmations

---

## Webhook Event Types

### reZEN Events

| Event                       | Description          | Tables Updated                         |
| --------------------------- | -------------------- | -------------------------------------- |
| TRANSACTION_CREATED         | New transaction      | transaction, participant, notification |
| TRANSACTION_UPDATED         | Transaction modified | transaction                            |
| TRANSACTION_CLOSED          | Deal closed          | transaction, notification              |
| TRANSACTION_TERMINATED      | Deal fell through    | transaction, notification              |
| LISTING_CREATED             | New listing          | listing                                |
| LISTING_UPDATED             | Listing modified     | listing                                |
| LISTING_CLOSED              | Listing sold         | listing                                |
| WEBHOOK_ENDPOINT_TEST_EVENT | Registration test    | (none - notification only)             |

### FUB Events

| Event               | Description      | Tables Updated    |
| ------------------- | ---------------- | ----------------- |
| textMessagesCreated | New SMS          | fub_text_messages |
| appointment_created | New appointment  | fub_appointments  |
| people.created      | New contact      | fub_people        |
| people.updated      | Contact modified | fub_people        |
| deals.created       | New deal         | fub_deals         |
| deals.updated       | Deal modified    | fub_deals         |
| events.created      | New event        | fub_events        |
| calls.created       | New call         | fub_calls         |

### Stripe Events

| Event                         | Description      | Tables Updated                         |
| ----------------------------- | ---------------- | -------------------------------------- |
| customer.created              | New customer     | stripe_customer                        |
| customer.subscription.created | New subscription | stripe_subscription, user_subscription |
| customer.subscription.updated | Plan change      | stripe_subscription, user_subscription |
| customer.subscription.deleted | Cancellation     | stripe_subscription, user_subscription |
| payment_intent.succeeded      | Payment success  | commission_payment                     |
| payment_intent.failed         | Payment failed   | error_logs                             |
| checkout.session.completed    | Checkout done    | stripe_subscription                    |

---

## Error Handling Pattern

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           WEBHOOK ERROR HANDLING                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  1. RETRY LOGIC (3 attempts with exponential backoff)                               │
│     ┌─────────────────────────────────────────────────────────────────────────┐    │
│     │  for (3) {                                                               │    │
│     │    try { process webhook }                                               │    │
│     │    catch {                                                               │    │
│     │      if (final attempt) {                                                │    │
│     │        • Log to error_logs table                                         │    │
│     │        • Notify Slack                                                    │    │
│     │        • Set result_success = false                                      │    │
│     │      } else {                                                            │    │
│     │        • Sleep (2 * attempt_index seconds)                               │    │
│     │      }                                                                   │    │
│     │    }                                                                     │    │
│     │  }                                                                       │    │
│     └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  2. ERROR LOG RECORD                                                                │
│     {                                                                               │
│       created_at: timestamp                                                         │
│       user_id: affected user                                                        │
│       module: "Transaction Webhook"                                                 │
│       message: error name                                                           │
│       payload: original webhook data                                                │
│       notified_on_slack: true                                                       │
│     }                                                                               │
│                                                                                      │
│  3. SLACK NOTIFICATION                                                              │
│     • Webhook Name: /user/{id}/transactions                                         │
│     • User: agent name                                                              │
│     • Event Name: TRANSACTION_CREATED etc.                                          │
│     • Event ID: reZEN object ID                                                     │
│     • Error details                                                                 │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Slack Webhook Channels

| Channel              | URL Identifier | Purpose                         |
| -------------------- | -------------- | ------------------------------- |
| Webhook Registration | B09GY36ECJ1    | Test event confirmations        |
| Transaction Success  | B08JT90808P    | Successful transaction webhooks |
| Webhook Errors       | B08ME356CDV    | Error notifications             |

---

## Background Tasks for Webhooks

| Task ID | Name                                   | Frequency | Purpose                     |
| ------- | -------------------------------------- | --------- | --------------------------- |
| 2405    | reZEN - process webhooks and delete V3 | 5 min     | Process reZEN webhook queue |
| 7999    | reZEN - Webhooks Register Check        | On-demand | Register webhooks           |
| 7945    | FUB - Webhook Check                    | On-demand | Process FUB webhooks        |

---

## Webhook Security

### Authentication Methods

| Integration | Method      | Notes                          |
| ----------- | ----------- | ------------------------------ |
| reZEN       | API Key     | X-API-KEY header               |
| FUB         | OAuth       | Bearer token                   |
| Stripe      | Signature   | Webhook signature verification |
| Slack       | Webhook URL | URL contains auth token        |

### Queue-Based Processing Benefits

1. **Idempotency**: Events stored once, processed once
2. **Retry Safety**: Failed events remain in queue
3. **Rate Limiting**: Batch processing controls API call rate
4. **Visibility**: Queue inspection for debugging
5. **Decoupling**: Webhook receipt separate from processing

---

## Testing Webhooks

### Verify reZEN Webhook Registration

```bash
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4psV7fp6/test-rezen-listing-processor-fixed" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 60
  }'
```

### Test Webhook Event Processing

```bash
# Trigger webhook orchestrator
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4psV7fp6/test-orchestrator-user-60"
```

### Check Webhook Queue Status

```bash
curl -X GET "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN/staging-status"
```

---

_Generated: 2026-01-26_
_Task: fn-1-2cy.11_
