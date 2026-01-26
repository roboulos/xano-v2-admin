# fn-2-riv.1.2 Identify V1 [v2] Tagged Features

## Description

Search V1 workspace for tables and functions with [v2] tags - these are features the client specifically requested after initial build and are HIGH PRIORITY for V2.

**Size:** S
**Phase:** 1 - V1 vs V2 Comparison

## Already Found

From lib/v1-data.ts analysis:

```
Tables with [v2] tag:
├─ agg_transactions_by_week    (ID: 972)
├─ agg_revenue_by_week         (ID: 973)
├─ agg_network_by_week         (ID: 974)
├─ agg_fub_activity_by_month   (ID: 1003)
├─ agg_fub_activity_by_agent   (ID: 1004)
├─ agg_calls_by_direction      (ID: 1008)
├─ agg_calls_by_outcome        (ID: 1009)
├─ agg_events_by_type          (ID: 1006)
├─ agg_events_by_source        (ID: 1007)
└─ agg_texts_by_direction      (ID: 1010)

Pattern: Weekly breakdowns + FUB activity analytics
```

## Approach

1. Search V1 tables for "v2" in tags
2. Search V1 functions for "v2" in tags
3. Cross-reference with V2 - do equivalents exist?
4. Document gaps

## Output Format

```markdown
## V1 [v2] Tagged Features

### Tables (High Priority)

| V1 Table                  | V1 ID | V2 Equivalent               | Status     |
| ------------------------- | ----- | --------------------------- | ---------- |
| agg_transactions_by_week  | 972   | agg_agent_monthly (derived) | ⚠ Partial  |
| agg_fub_activity_by_agent | 1004  | None                        | ❌ Missing |

### Functions (High Priority)

| V1 Function | V1 ID | V2 Equivalent | Status |
| ----------- | ----- | ------------- | ------ |
| ...         | ...   | ...           | ...    |
```

## Acceptance

- [ ] All V1 tables with [v2] tag identified
- [ ] All V1 functions with [v2] tag identified
- [ ] V2 equivalent status documented for each
- [ ] Priority list of missing features created

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
