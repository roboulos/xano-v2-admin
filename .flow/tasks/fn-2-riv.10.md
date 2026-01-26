# fn-2-riv.3.3 Test Webhook Handlers

## Description

Verify all webhook handlers are properly configured and respond correctly to incoming webhook events.

**Size:** S
**Phase:** 3 - End-to-End Flow Testing
**Depends on:** 3.2

## Webhook Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  WEBHOOK HANDLERS                                                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  External Service ──► Xano Webhook Endpoint ──► Handler Function ──► Database       │
│                                                                                      │
│  ┌─────────────────┐                                                                 │
│  │ FUB Webhooks    │  /webhooks/fub/*                                               │
│  │ - deal.created  │  → Process deal, update FUB - deals table                      │
│  │ - person.update │  → Update FUB - people table                                   │
│  └─────────────────┘                                                                 │
│                                                                                      │
│  ┌─────────────────┐                                                                 │
│  │ reZEN Webhooks  │  /webhooks/rezen/*                                             │
│  │ - transaction   │  → Create/update transaction                                   │
│  │ - agent.update  │  → Update agent data                                           │
│  └─────────────────┘                                                                 │
│                                                                                      │
│  ┌─────────────────┐                                                                 │
│  │ Stripe Webhooks │  /webhooks/stripe/*                                            │
│  │ - payment       │  → Update subscription status                                  │
│  │ - subscription  │  → Process billing                                             │
│  └─────────────────┘                                                                 │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Test Approach

### 1. Inventory Webhook Endpoints

Query all endpoints containing "webhook" in path.

### 2. Test Each Handler with Mock Payload

```bash
# Example: Test FUB deal webhook
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:webhooks/fub/deal" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "deal.created",
    "data": {
      "id": "test-123",
      "name": "Test Deal"
    }
  }'
```

### 3. Verify Handler Responses

- 200 OK = handler processed successfully
- 400 Bad Request = missing required fields
- 500 Error = handler broken

## Verification Checklist

| Webhook           | Endpoint                    | Expected Response |
| ----------------- | --------------------------- | ----------------- |
| FUB Deal          | /webhooks/fub/deal          | 200 + ack         |
| FUB Person        | /webhooks/fub/person        | 200 + ack         |
| reZEN Transaction | /webhooks/rezen/transaction | 200 + ack         |
| Stripe Payment    | /webhooks/stripe/payment    | 200 + ack         |

## Acceptance

- [ ] All webhook endpoints discovered and documented
- [ ] Each handler tested with mock payload
- [ ] Response codes verified
- [ ] Broken handlers identified and documented

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
