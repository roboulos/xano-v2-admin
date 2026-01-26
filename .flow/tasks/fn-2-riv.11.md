# fn-2-riv.3.4 Test Aggregation Pipeline

## Description

Test the data aggregation pipeline that transforms source data into dashboard-ready aggregations.

**Size:** S
**Phase:** 3 - End-to-End Flow Testing
**Depends on:** 3.2

## Aggregation Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  AGGREGATION PIPELINE                                                                │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  Source Data         Workers              Aggregation Tables      Dashboard          │
│  ───────────         ───────              ──────────────────      ─────────          │
│                                                                                      │
│  transaction  ──►  Workers/Agg/*  ──►   agg_agent_monthly   ──►  Charts/KPIs        │
│  listing      ──►                 ──►   agg_leaderboard     ──►                     │
│  FUB data     ──►                                                                    │
│  network      ──►                                                                    │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## V2 Aggregation Tables

| Table               | Fields | Purpose                                |
| ------------------- | ------ | -------------------------------------- |
| `agg_agent_monthly` | 29     | Consolidated monthly metrics per agent |
| `agg_leaderboard`   | 21     | Flexible leaderboard rankings          |

## Test Scenarios

### 1. Run Aggregation for Test User

```bash
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/workers-run-aggregation" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 60,
    "period": "2025-01"
  }'
```

### 2. Verify agg_agent_monthly

Check that aggregation created/updated record for agent 37208 (user 60's agent).

### 3. Verify agg_leaderboard

Check that leaderboard positions updated based on aggregated data.

## Verification Queries

```sql
-- Check agg_agent_monthly for test agent
SELECT * FROM agg_agent_monthly WHERE agent_id = 37208 ORDER BY period DESC LIMIT 5;

-- Check leaderboard entries
SELECT * FROM agg_leaderboard WHERE agent_id = 37208 ORDER BY created_at DESC LIMIT 5;
```

## Performance Check

V2 uses 2 consolidated tables instead of V1's 48 separate tables.
Verify that:

- Aggregation completes in < 10 seconds per agent
- Dashboard queries return in < 500ms
- No timeouts on leaderboard generation

## Acceptance

- [ ] Aggregation workers execute successfully
- [ ] agg_agent_monthly populated correctly
- [ ] agg_leaderboard populated correctly
- [ ] Performance within acceptable limits
- [ ] Dashboard can render from aggregated data

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
