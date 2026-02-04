# V2 Sync Pipeline Guide

> Comprehensive reference for V1→V2 data synchronization using cross-workspace direct SQL.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    V1/V2 SYNC ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  V1 Workspace (Production)          V2 Workspace (Normalized)           │
│  ┌─────────────────────────┐       ┌─────────────────────────────────┐  │
│  │ mvpw1_41 (user)         │ ───→  │ mvpw5_664 (user)                │  │
│  │   └── xdo (JSONB)       │       │ mvpw5_665 (user_credentials)    │  │
│  │                         │       │ mvpw5_666 (user_subscriptions)  │  │
│  │                         │       │ mvpw5_667 (user_settings)       │  │
│  │                         │       │ mvpw5_668 (user_roles)          │  │
│  ├─────────────────────────┤       ├─────────────────────────────────┤  │
│  │ mvpw1_36 (agent)        │ ───→  │ mvpw5_670 (agent)               │  │
│  │   └── xdo (JSONB)       │       │ mvpw5_671 (agent_cap_data)      │  │
│  │                         │       │ mvpw5_672 (agent_commission)    │  │
│  │                         │       │ mvpw5_673 (agent_performance)   │  │
│  │                         │       │ mvpw5_674 (agent_hierarchy)     │  │
│  ├─────────────────────────┤       ├─────────────────────────────────┤  │
│  │ mvpw1_34 (transaction)  │ ───→  │ mvpw5_675 (transaction)         │  │
│  │   └── xdo (JSONB)       │       │                                 │  │
│  ├─────────────────────────┤       ├─────────────────────────────────┤  │
│  │ mvpw1_39 (participant)  │ ───→  │ mvpw5_696 (participant)         │  │
│  │   └── xdo (JSONB)       │       │                                 │  │
│  ├─────────────────────────┤       ├─────────────────────────────────┤  │
│  │ mvpw1_48 (network)      │ ───→  │ mvpw5_698 (network_member)      │  │
│  │   └── xdo (JSONB)       │       │ mvpw5_684 (network_hierarchy)   │  │
│  └─────────────────────────┘       └─────────────────────────────────┘  │
│                                                                         │
│  Key: V1 uses JSONB xdo column → V2 uses normalized typed columns       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Sync Mechanisms

### 1. Cross-Workspace Direct SQL

V1 and V2 tables share the same PostgreSQL database, enabling direct SQL queries across workspaces.

**Pattern:**

```sql
INSERT INTO mvpw5_XXX (column1, column2, ...)
SELECT
  id,
  xdo->>'field1',
  COALESCE((xdo->>'field2')::boolean, false)
FROM mvpw1_YYY
WHERE id NOT IN (SELECT id FROM mvpw5_XXX)
ON CONFLICT DO NOTHING;
```

**Key Syntax:**

- `xdo->>'field_name'` - Extract text from JSONB
- `(xdo->>'field')::type` - Cast to specific type
- `COALESCE(NULLIF(xdo->>'field', '')::int, 0)` - Handle empty strings
- `ON CONFLICT DO NOTHING` - Idempotent inserts

### 2. Xano XanoScript Integration

Use `db.direct_query` in XanoScript for cross-workspace operations:

```xanoscript
db.direct_query {
  sql = "SELECT COUNT(*) FROM mvpw1_41"
  parser = "numeric"
  response_type = "list"
} as $count
```

---

## Table Mappings

### V1 Table IDs

| Entity      | V1 Table | Field Count |
| ----------- | -------- | ----------- |
| User        | mvpw1_41 | 111 JSONB   |
| Agent       | mvpw1_36 | 132 JSONB   |
| Transaction | mvpw1_34 | 119 JSONB   |
| Participant | mvpw1_39 | 30 JSONB    |
| Network     | mvpw1_48 | 57 JSONB    |

### V2 Table IDs

| Entity             | V2 Table  | Purpose               |
| ------------------ | --------- | --------------------- |
| user               | mvpw5_664 | Main user record      |
| user_credentials   | mvpw5_665 | Auth, API keys        |
| user_subscriptions | mvpw5_666 | Billing, Stripe       |
| user_settings      | mvpw5_667 | Preferences           |
| user_roles         | mvpw5_668 | Roles, team links     |
| agent              | mvpw5_670 | Main agent record     |
| agent_cap_data     | mvpw5_671 | Cap tracking          |
| agent_commission   | mvpw5_672 | Commission splits     |
| agent_performance  | mvpw5_673 | Metrics               |
| agent_hierarchy    | mvpw5_674 | Sponsor tree          |
| transaction        | mvpw5_675 | Deal records          |
| participant        | mvpw5_696 | Transaction parties   |
| network_member     | mvpw5_698 | Network relationships |
| network_hierarchy  | mvpw5_684 | Sponsor chain         |

### Complete Field Mapping

See `.flow/V1_V2_FIELD_MAPPING.json` for comprehensive field-by-field mappings.

---

## Monitoring

### Check Sync Status

```bash
# Get all entity counts (V1 vs V2)
curl -s -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:20LTQtIX/sync-v1-to-v2-direct" \
  -H "Content-Type: application/json" | python3 -m json.tool
```

**Expected Response:**

```json
{
  "entity_counts": [
    { "entity": "users", "v1": 335, "v2": 335 },
    { "entity": "agents", "v1": 37041, "v2": 37041 },
    { "entity": "transactions", "v1": 55023, "v2": 55038 },
    { "entity": "participants", "v1": 702072, "v2": 701551 },
    { "entity": "network", "v1": 86618, "v2": 86628 }
  ]
}
```

### Sync Status Interpretation

| Metric      | Good | Warning  | Critical |
| ----------- | ---- | -------- | -------- |
| V2/V1 Ratio | ≥99% | 95-99%   | <95%     |
| Delta       | <100 | 100-1000 | >1000    |

---

## Troubleshooting

### Common Issues

#### 1. INVALID TEXT REPRESENTATION Error

**Cause:** Empty string being cast to int/numeric
**Fix:** Use `NULLIF(xdo->>'field', '')::int` instead of `(xdo->>'field')::int`

#### 2. Sync Not Adding Records

**Cause:** Records already exist (ON CONFLICT DO NOTHING)
**Check:** Verify with `SELECT COUNT(*) FROM mvpw5_XXX WHERE id NOT IN (SELECT id FROM mvpw1_YYY)`

#### 3. Boolean Cast Failures

**Cause:** V1 stores booleans as strings "true"/"false"
**Fix:** Use `COALESCE((xdo->>'field')::boolean, false)`

#### 4. Timeout on Large Tables

**Cause:** Participants table has 700K+ records
**Fix:** Run sync in batches with `LIMIT 10000`

---

## API Reference

### Sync Endpoint

**URL:** `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:20LTQtIX/sync-v1-to-v2-direct`
**Method:** POST
**ID:** 18569

**Curl:**

```bash
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:20LTQtIX/sync-v1-to-v2-direct" \
  -H "Content-Type: application/json"
```

### Test Sync (Original)

**URL:** `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:20LTQtIX/test-sync`
**Method:** POST
**ID:** 18027

---

## Current Sync Status (2026-02-04)

| Entity       | V1 Count | V2 Count | Status   |
| ------------ | -------- | -------- | -------- |
| Users        | 335      | 335      | ✅ 100%  |
| Agents       | 37,041   | 37,041   | ✅ 100%  |
| Transactions | 55,023   | 55,038   | ✅ 100%  |
| Participants | 702,072  | 701,551  | ✅ 99.9% |
| Network      | 86,618   | 86,628   | ✅ 100%  |

**User Split Tables:**

- user_credentials: 335 ✅
- user_subscriptions: 335 ✅
- user_settings: 335 ✅
- user_roles: 335 ✅

**Agent Split Tables:**

- agent_cap_data: 37,042 ✅
- agent_commission: 37,263 ✅
- agent_performance: 51,107 ✅
- agent_hierarchy: 50,774 ✅

---

## Files Reference

| File                             | Purpose                 |
| -------------------------------- | ----------------------- |
| `.flow/V1_V2_FIELD_MAPPING.json` | Complete field mappings |
| `CLAUDE.md`                      | Project instructions    |
| `V2_SYNC_PIPELINE_GUIDE.md`      | This document           |

---

_Last updated: 2026-02-04_
