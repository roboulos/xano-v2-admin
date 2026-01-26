# Webhook Event Handling - V2 Backend

> Task 5.3: Map webhook event handling

## Event Processing Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           WEBHOOK EVENT PROCESSING                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  EXTERNAL SYSTEM                                                                    │
│       │                                                                              │
│       │ POST event                                                                   │
│       ▼                                                                              │
│  ┌─────────────────┐                                                                │
│  │ Webhook Endpoint│───────────────────────────────────────────────┐               │
│  │ (API Group 646) │                                               │               │
│  └─────────────────┘                                               │               │
│       │                                                             │               │
│       │ 1. Validate signature/auth                                  │               │
│       │ 2. Parse event type                                         │               │
│       │ 3. Queue for processing                                     │               │
│       ▼                                                             │               │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐               │
│  │ rezen_process_  │     │ fub_worker_     │     │ stripe_webhook_ │               │
│  │ webhook (495)   │     │ queue (709)     │     │ events          │               │
│  └────────┬────────┘     └────────┬────────┘     └────────┬────────┘               │
│           │                       │                       │                         │
│           │ Every 5 min           │ Every 15 min          │ Immediate               │
│           ▼                       ▼                       ▼                         │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐               │
│  │ reZEN Handler   │     │ FUB Handler     │     │ Stripe Handler  │               │
│  │ (8124/8122)     │     │ (8089)          │     │ (inline)        │               │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘               │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## reZEN Event Types

### Transaction Events

| Event Name                  | Trigger                  | Handler                                | Action                                                 |
| --------------------------- | ------------------------ | -------------------------------------- | ------------------------------------------------------ |
| TRANSACTION_CREATED         | New transaction in reZEN | Workers/reZEN - Process Webhook Events | Fetch details, upsert transaction, create notification |
| TRANSACTION_UPDATED         | Transaction modified     | Workers/reZEN - Process Webhook Events | Fetch details, upsert transaction                      |
| TRANSACTION_CLOSED          | Deal closed              | Workers/reZEN - Process Webhook Events | Update status, create notification                     |
| TRANSACTION_TERMINATED      | Deal fell through        | Workers/reZEN - Process Webhook Events | Update status, create notification                     |
| WEBHOOK_ENDPOINT_TEST_EVENT | Registration test        | Workers/reZEN - Process Webhook Events | Notify Slack, delete from queue                        |

### Listing Events

| Event Name      | Trigger          | Handler                                  | Action                        |
| --------------- | ---------------- | ---------------------------------------- | ----------------------------- |
| LISTING_CREATED | New listing      | Workers/reZEN - Process Listing Webhooks | Fetch details, upsert listing |
| LISTING_UPDATED | Listing modified | Workers/reZEN - Process Listing Webhooks | Fetch details, upsert listing |
| LISTING_CLOSED  | Listing sold     | Workers/reZEN - Process Listing Webhooks | Update status                 |

### Event Payload Structure

```json
{
  "eventName": "TRANSACTION_CREATED",
  "rezenObject": {
    "id": "abc123",
    "type": "TRANSACTION"
  },
  "timestamp": "2026-01-26T12:00:00Z",
  "userId": "user123"
}
```

---

## FUB Event Types

### Contact Events

| Event Name     | Trigger          | Handler    | Tables Updated           |
| -------------- | ---------------- | ---------- | ------------------------ |
| people.created | New contact      | FUB worker | fub_people               |
| people.updated | Contact modified | FUB worker | fub_people               |
| people.deleted | Contact removed  | FUB worker | fub_people (soft delete) |

### Activity Events

| Event Name           | Trigger            | Handler          | Tables Updated    |
| -------------------- | ------------------ | ---------------- | ----------------- |
| calls.created        | New call logged    | FUB worker       | fub_calls         |
| events.created       | New event          | FUB worker       | fub_events        |
| appointments.created | New appointment    | Webhook endpoint | fub_appointments  |
| textMessages.created | New SMS            | Webhook endpoint | fub_text_messages |
| deals.created        | New deal           | FUB worker       | fub_deals         |
| deals.updated        | Deal stage changed | FUB worker       | fub_deals         |

### FUB Event Payload Structure

```json
{
  "type": "textMessages.created",
  "data": {
    "id": 12345,
    "personId": 67890,
    "direction": "outgoing",
    "body": "Message content",
    "created": "2026-01-26T12:00:00Z"
  }
}
```

---

## Stripe Event Types

### Subscription Events

| Event Name                    | Trigger          | Handler                        | Tables Updated                         |
| ----------------------------- | ---------------- | ------------------------------ | -------------------------------------- |
| customer.subscription.created | New subscription | /webhook/subscription_created  | stripe_subscription, user_subscription |
| customer.subscription.updated | Plan change      | /webhook/subscription_updated  | stripe_subscription, user_subscription |
| customer.subscription.deleted | Cancellation     | /webhook/subscription_canceled | stripe_subscription, user_subscription |

### Payment Events

| Event Name                    | Trigger            | Handler                    | Tables Updated      |
| ----------------------------- | ------------------ | -------------------------- | ------------------- |
| payment_intent.succeeded      | Payment successful | /webhook/payment_succeeded | commission_payment  |
| payment_intent.payment_failed | Payment failed     | /webhook/payment_failed    | error_logs          |
| checkout.session.completed    | Checkout done      | /webhook/session_completed | stripe_subscription |

### Customer Events

| Event Name       | Trigger             | Handler                   | Tables Updated  |
| ---------------- | ------------------- | ------------------------- | --------------- |
| customer.created | New Stripe customer | /webhook/customer_created | stripe_customer |

### Stripe Event Payload Structure

```json
{
  "id": "evt_123",
  "type": "customer.subscription.created",
  "data": {
    "object": {
      "id": "sub_123",
      "customer": "cus_123",
      "status": "active",
      "items": {...}
    }
  }
}
```

---

## Event-to-Table Mapping

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           EVENT → TABLE MAPPING                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  reZEN EVENTS                                                                       │
│  ─────────────────────────────────────────────────────────────────                  │
│  TRANSACTION_* ──────────► transaction, participant, paid_participant               │
│                            notification_items                                        │
│  LISTING_* ──────────────► listing                                                  │
│                                                                                      │
│  FUB EVENTS                                                                         │
│  ─────────────────────────────────────────────────────────────────                  │
│  people.* ───────────────► fub_people                                               │
│  calls.* ────────────────► fub_calls                                                │
│  events.* ───────────────► fub_events                                               │
│  appointments.* ─────────► fub_appointments                                         │
│  textMessages.* ─────────► fub_text_messages                                        │
│  deals.* ────────────────► fub_deals                                                │
│                                                                                      │
│  STRIPE EVENTS                                                                      │
│  ─────────────────────────────────────────────────────────────────                  │
│  customer.* ─────────────► stripe_customer                                          │
│  subscription.* ─────────► stripe_subscription, user_subscription                   │
│  payment_intent.* ───────► commission_payment, error_logs                           │
│  checkout.session.* ─────► stripe_subscription                                      │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Notification Generation

Events that trigger user notifications:

| Event                  | Notification Code   | Message                                          |
| ---------------------- | ------------------- | ------------------------------------------------ |
| TRANSACTION_CREATED    | INFO                | "The transaction for {ADDRESS}, is PENDING"      |
| TRANSACTION_CLOSED     | INFO                | "The transaction for {ADDRESS}, has CLOSED."     |
| TRANSACTION_TERMINATED | INFO                | "The transaction for {ADDRESS}, has TERMINATED." |
| ONBOARDING_STARTED     | ONBOARDING_STARTED  | "We've started syncing data from ReZEN"          |
| ONBOARDING_COMPLETE    | ONBOARDING_COMPLETE | "We've synced all your data from ReZEN"          |
| ONBOARDING_ERROR       | ONBOARDING_ERROR    | "We've run into an error..."                     |

---

## Error Handling by Event Type

### reZEN Events

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  reZEN EVENT ERROR HANDLING                                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  1. Retry up to 3 times with exponential backoff                                    │
│  2. On final failure:                                                               │
│     ├── Log to error_logs table                                                     │
│     ├── Send Slack notification with:                                               │
│     │   • Webhook Name                                                              │
│     │   • User/Agent Name                                                           │
│     │   • Event Name & ID                                                           │
│     │   • Error message                                                             │
│     └── Leave in queue for manual review                                            │
│  3. On success: Delete from rezen_process_webhook queue                             │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Stripe Events

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  STRIPE EVENT ERROR HANDLING                                                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  1. Verify webhook signature                                                        │
│  2. If invalid signature: Return 401, do not process                                │
│  3. If processing error:                                                            │
│     ├── Log to error_logs                                                           │
│     └── Return 500 (Stripe will retry)                                              │
│  4. On success: Return 200                                                          │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Processing Frequencies

| Integration | Queue Processing | Notes                      |
| ----------- | ---------------- | -------------------------- |
| reZEN       | Every 5 min      | Batch of 40 events per run |
| FUB         | Every 15 min     | Delta sync based           |
| Stripe      | Immediate        | Synchronous processing     |
| Slack       | Immediate        | Fire-and-forget            |

---

## Queue Status Monitoring

Check queue depth and processing status:

```bash
# Check reZEN webhook queue
curl -X GET "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN/staging-status"

# Check job queue status
curl -X GET "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN/job-queue-status"
```

---

## Slack Notification Channels

| Purpose              | Channel ID  | Events                          |
| -------------------- | ----------- | ------------------------------- |
| Webhook Registration | B09GY36ECJ1 | WEBHOOK_ENDPOINT_TEST_EVENT     |
| Transaction Success  | B08JT90808P | Successful transaction webhooks |
| Webhook Errors       | B08ME356CDV | All webhook processing errors   |
| Onboarding           | B08A6CJB2CT | Onboarding start/complete       |
| Critical Errors      | B09CL7YEF6Y | Exception-level errors          |

---

_Generated: 2026-01-26_
_Task: fn-1-2cy.14_
