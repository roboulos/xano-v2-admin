# fn-2-riv.3.2 Test Daily Sync Cycles

## Description

Test the daily data synchronization cycles that pull data from external integrations (FUB, reZEN, SkySlope).

**Size:** M
**Phase:** 3 - End-to-End Flow Testing
**Depends on:** 3.1

## Daily Sync Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  DAILY SYNC CYCLE                                                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────┐     ┌─────────┐     ┌───────────┐     ┌─────────────┐                  │
│  │   FUB   │────►│  reZEN  │────►│ SkySlope  │────►│ Aggregation │                  │
│  │  Sync   │     │  Sync   │     │   Sync    │     │   Workers   │                  │
│  └─────────┘     └─────────┘     └───────────┘     └─────────────┘                  │
│       │               │               │                   │                         │
│       ▼               ▼               ▼                   ▼                         │
│  [FUB tables]   [transaction]    [listing]         [agg_* tables]                   │
│  [calls,events] [participant]    [transaction]                                      │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Test Scenarios

### FUB Sync (Follow Up Boss)

```bash
# Test FUB data sync for user 60
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/workers-fub-sync" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 60}'
```

**Expected Tables Updated:**

- FUB - deals
- FUB - people
- FUB - calls
- FUB - events
- FUB - text messages

### reZEN Sync

```bash
# Test reZEN data sync
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/workers-rezen-sync" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 60}'
```

**Expected Tables Updated:**

- transaction
- participant
- network
- contributions

### SkySlope Sync

```bash
# Test SkySlope data sync
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/workers-skyslope-sync" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 60}'
```

**Expected Tables Updated:**

- listing
- transaction (additional fields)

## Verification Steps

1. Record counts before sync
2. Run sync workers
3. Record counts after sync
4. Verify delta makes sense
5. Check for errors in sync_jobs table

## Acceptance

- [ ] FUB sync completes without errors
- [ ] reZEN sync completes without errors
- [ ] SkySlope sync completes without errors
- [ ] Data appears in correct tables
- [ ] Sync jobs logged properly

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
