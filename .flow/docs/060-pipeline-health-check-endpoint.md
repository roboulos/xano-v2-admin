# Pipeline Health Check Endpoint

## Overview

The `pipeline-health-check` endpoint provides a comprehensive view of the V2 data pipeline health across all integrations (FUB, reZEN, SkySlope). It monitors staging table backlogs, final table counts, sync state, and onboarding job status.

## Endpoint Details

| Property           | Value                                                                               |
| ------------------ | ----------------------------------------------------------------------------------- |
| **URL**            | `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:Lrekz_3S/pipeline-health-check` |
| **Method**         | GET                                                                                 |
| **Authentication** | None (public)                                                                       |
| **API Group**      | 650 (Migration: V1 to V2)                                                           |
| **Endpoint ID**    | 18367                                                                               |
| **Tags**           | pipeline, health, monitoring, integrations                                          |

## Response Structure

```json
{
  "success": true,
  "checked_at": 1769466340233,
  "staging": {
    "skyslope_listings": 34,
    "skyslope_transactions": 24,
    "rezen_transactions": 102843,
    "rezen_listings": 44688,
    "rezen_network": 1539,
    "rezen_contributions": 5899,
    "fub_appointments": 1,
    "fub_text_messages": 1
  },
  "final_tables": {
    "listing": 16784,
    "transaction": 51835,
    "fub_people": 226839,
    "fub_calls": 571483,
    "fub_events": 157950,
    "contribution": 515369,
    "network_hierarchy": 2
  },
  "sync_state": {
    "fub": [...],
    "rezen": [...],
    "skyslope": [...]
  },
  "onboarding_jobs": {
    "fub_active": 0,
    "fub_pending": 0,
    "fub_total": 20,
    "rezen_active": 0,
    "rezen_pending": 0,
    "rezen_total": 1
  }
}
```

## Response Fields

### `staging`

Counts of records in staging tables awaiting processing:

| Field                   | Source Table                              | Description                    |
| ----------------------- | ----------------------------------------- | ------------------------------ |
| `skyslope_listings`     | `stage_listing_skyslope`                  | SkySlope listing imports       |
| `skyslope_transactions` | `stage_transactions_skyslope`             | SkySlope transaction imports   |
| `rezen_transactions`    | `stage_transactions_rezen_onboarding`     | reZEN transaction imports      |
| `rezen_listings`        | `stage_listings_rezen_onboarding`         | reZEN listing imports          |
| `rezen_network`         | `stage_network_downline_rezen_onboarding` | reZEN network/downline imports |
| `rezen_contributions`   | `stage_contributions_rezen_onboarding`    | reZEN contribution imports     |
| `fub_appointments`      | `stage_appointments_fub_onboarding`       | FUB appointment imports        |
| `fub_text_messages`     | `stage_text_messages_fub_onboarding`      | FUB SMS imports                |

### `final_tables`

Record counts in the final V2 tables:

| Field               | Source Table        | Description                    |
| ------------------- | ------------------- | ------------------------------ |
| `listing`           | `listing`           | V2 listing records             |
| `transaction`       | `transaction`       | V2 transaction records         |
| `fub_people`        | `fub_people`        | FUB contacts                   |
| `fub_calls`         | `fub_calls`         | FUB call records               |
| `fub_events`        | `fub_events`        | FUB activity events            |
| `contribution`      | `contribution`      | Rev share contributions        |
| `network_hierarchy` | `network_hierarchy` | Network/downline relationships |

### `sync_state`

Array of sync state records for each integration:

| Field            | Description                                                         |
| ---------------- | ------------------------------------------------------------------- |
| `entity_type`    | What data type this sync tracks (people, deals, transactions, etc.) |
| `last_sync_at`   | Timestamp of last successful sync (null if never synced)            |
| `status`         | Current status: `ready`, `syncing`, `error`                         |
| `error_message`  | Error details if status is `error`                                  |
| `records_synced` | Total records synced by this entity                                 |

### `onboarding_jobs`

Status of initial data import jobs:

| Field           | Description                             |
| --------------- | --------------------------------------- |
| `fub_active`    | FUB onboarding jobs currently running   |
| `fub_pending`   | FUB onboarding jobs waiting to start    |
| `fub_total`     | Total FUB onboarding jobs               |
| `rezen_active`  | reZEN onboarding jobs currently running |
| `rezen_pending` | reZEN onboarding jobs waiting to start  |
| `rezen_total`   | Total reZEN onboarding jobs             |

## Health Indicators

### Healthy State

- All `sync_state` entries have `status: "ready"` or recent `last_sync_at`
- Staging counts are low (< 1000) or decreasing over time
- `onboarding_jobs` active counts are 0 when no users are onboarding

### Warning Signs

- Large staging backlogs (> 10,000 records)
- `sync_state.status == "error"` for any integration
- Staging counts not decreasing over time
- Many pending onboarding jobs not being processed

### Critical Issues

- `sync_state.last_sync_at` is null and data exists
- Staging backlogs growing continuously
- `error_message` populated in sync state

## Usage Examples

### Basic Health Check

```bash
curl -s "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:Lrekz_3S/pipeline-health-check" | jq .
```

### Check Staging Backlog Only

```bash
curl -s "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:Lrekz_3S/pipeline-health-check" | jq '.staging'
```

### Check Sync Status

```bash
curl -s "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:Lrekz_3S/pipeline-health-check" | jq '.sync_state'
```

### Monitor for Errors (scripted)

```bash
# Alert if any sync has error status
response=$(curl -s "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:Lrekz_3S/pipeline-health-check")
errors=$(echo "$response" | jq '[.sync_state.fub[], .sync_state.rezen[], .sync_state.skyslope[]] | map(select(.status == "error")) | length')
if [ "$errors" -gt 0 ]; then
  echo "ALERT: $errors sync errors detected"
fi
```

## Integration with Monitoring

This endpoint can be called periodically to:

1. **Track staging backlog trends** - Store counts over time to detect processing issues
2. **Alert on sync failures** - Check for `error` status in sync_state
3. **Verify onboarding completion** - Monitor active/pending job counts
4. **Compare V1 vs V2 data** - Use final_tables counts alongside V1 counts

## Related Endpoints

| Endpoint                         | Purpose                              |
| -------------------------------- | ------------------------------------ |
| `comprehensive-v1-v2-comparison` | Compare V1 and V2 workspace metadata |
| `staging-counts`                 | Detailed staging table analysis      |
| `v1-v2-full-gap-check`           | FUB and equity table gap analysis    |

## Created

- **Task:** fn-3-lv0.6
- **Date:** 2026-01-26
- **Purpose:** End-to-end pipeline monitoring for V2 system verification
