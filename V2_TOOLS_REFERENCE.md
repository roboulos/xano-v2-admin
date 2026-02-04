# V2 Tools Reference

**Purpose:** Diagnostic and operational tools for managing the V2 system

---

## 1. Data Integrity Verification Tool

**Endpoint:** `POST /api:20LTQtIX/test-sync`

Real-time comparison of V1 vs V2 data with gap analysis.

### Usage

```bash
curl -s -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:20LTQtIX/test-sync" | jq
```

### Response

```json
{
  "current_counts": {
    "v1_users": 335,
    "v2_users": 335,
    "v1_network": 86617,
    "v2_network": 86623
  },
  "gap_analysis": {
    "users_delta": 0,
    "network_delta": -6
  },
  "missing_users": [],
  "missing_network": {
    "count": 0,
    "recent_samples": []
  }
}
```

### What It Reveals

- **users_delta = 0**: V1 and V2 user counts match
- **network_delta < 0**: V2 has MORE than V1 (superset)
- **missing_users**: Any V1 users not yet in V2
- **missing_network**: Any V1 network members not yet in V2

---

## 2. Leaderboard Computation API

**Endpoint:** `GET /api:pe1wjL5I/leaderboard/computed`

Pre-computed leaderboard metrics from aggregation tables.

### Usage

```bash
curl "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/leaderboard/computed?time_period=ytd&status=closed&metric=units&team_id=1"
```

### Parameters

| Param         | Required | Values                            |
| ------------- | -------- | --------------------------------- |
| `time_period` | Yes      | `ytd`, `mtd`, `qtd`, `last_month` |
| `status`      | Yes      | `closed`, `pending`, `active`     |
| `metric`      | Yes      | `units`, `volume`, `gci`          |
| `team_id`     | Yes      | Team ID number                    |

### Response

```json
{
  "success": true,
  "transaction_count": 1743,
  "agent_count": 8,
  "leaderboard": [
    {
      "id": 10067,
      "name": "Wendy Lyman",
      "units": 21,
      "volume": 6613650,
      "gci": 175565.5
    }
  ]
}
```

---

## 3. Transaction Metrics API

**Endpoint:** `GET /api:pe1wjL5I/transactions/metrics`

Aggregated transaction metrics for dashboard KPIs.

### Usage

```bash
curl -H "Authorization: Bearer TOKEN" \
  "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/transactions/metrics"
```

---

## 4. Network Counts API

**Endpoint:** `GET /api:pe1wjL5I/network/counts`

Network hierarchy size and tier distribution.

### Usage

```bash
curl -H "Authorization: Bearer TOKEN" \
  "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/network/counts"
```

---

## 5. FUB Aggregates APIs

### People Aggregates

```bash
curl -H "Authorization: Bearer TOKEN" \
  "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/leads/fub/people/aggregates?fub_account_id=4&view=admin"
```

### Calls Aggregates

```bash
curl -H "Authorization: Bearer TOKEN" \
  "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/leads/fub/calls/aggregates?fub_account_id=4&view=admin"
```

### Events Aggregates

```bash
curl -H "Authorization: Bearer TOKEN" \
  "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/leads/fub/events/aggregates?fub_account_id=4&view=admin"
```

---

## 6. Chart APIs

### Revenue Trends

```bash
curl -H "Authorization: Bearer TOKEN" \
  "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/chart/revenue-trends"
```

### Transaction Status

```bash
curl -H "Authorization: Bearer TOKEN" \
  "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/chart/transactions-status"
```

### Network Activity

```bash
curl -H "Authorization: Bearer TOKEN" \
  "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/chart/network-activity"
```

### Revenue by Agent

```bash
curl -H "Authorization: Bearer TOKEN" \
  "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/chart/revenue-by-agent"
```

---

## 7. Team Management APIs

### Team Roster

```bash
curl "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/team_management/roster?team_id=1"
```

### Team Members

```bash
curl "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/team_management/members?team_id=1"
```

### Team Seats

```bash
curl "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/team_management/seats?team_id=1"
```

---

## 8. Page Builder APIs

### Get Pages

```bash
curl "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/page_builder/pages"
```

### Get Page by Slug

```bash
curl "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/page_builder/pages/by-slug?slug=dashboard"
```

### Get Widgets

```bash
curl "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/page_builder/widgets"
```

### Get Configuration

```bash
curl "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/page_builder/configuration"
```

---

## API Base URLs

| API Group         | Canonical  | Purpose              |
| ----------------- | ---------- | -------------------- |
| Machine 2.0 Tests | `20LTQtIX` | Data integrity tools |
| Frontend API v2   | `pe1wjL5I` | Dashboard endpoints  |
| MCP Workers       | `4UsTtl3m` | Background workers   |
| MCP Tasks         | `4psV7fp6` | Task runners         |
| MCP System        | `LIdBL1AN` | System oversight     |
| Auth              | `i6a062_x` | Authentication       |

---

## Authentication

Most endpoints require JWT authentication:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/endpoint"
```

### Get Token (Login)

```bash
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:i6a062_x/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

---

## Diagnostic Queries

### Check Table Counts

```bash
curl -s -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:20LTQtIX/test-sync" | jq '.current_counts'
```

### Check Gap Analysis

```bash
curl -s -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:20LTQtIX/test-sync" | jq '.gap_analysis'
```

### Check Missing Records

```bash
curl -s -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:20LTQtIX/test-sync" | jq '.missing_users, .missing_network'
```

---

## Summary

| Tool Category     | Count | Purpose               |
| ----------------- | ----- | --------------------- |
| Diagnostic APIs   | 1     | V1 vs V2 comparison   |
| Leaderboard APIs  | 1     | Pre-computed rankings |
| Transaction APIs  | 5+    | Deal management       |
| Network APIs      | 3+    | Rev share hierarchy   |
| FUB APIs          | 6+    | CRM integration       |
| Chart APIs        | 4+    | Visualization data    |
| Team APIs         | 5+    | Team management       |
| Page Builder APIs | 8+    | Dynamic dashboards    |

**Total Frontend API v2 Endpoints:** 207
