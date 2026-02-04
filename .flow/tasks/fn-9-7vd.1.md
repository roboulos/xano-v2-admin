# fn-9-7vd.1 Audit V2 orphaned records and identify cleanup targets

## Description

Audit V2 workspace to identify exactly which child records are orphaned (pointing to non-existent parent records).

**Size:** S
**Files:** Xano MCP queries, scripts/validation/validate-references.ts

## Tables to Audit

Query each child table and identify records where the foreign key doesn't exist in the parent:

| Child Table        | FK Column | Parent Table | Known Orphan Count |
| ------------------ | --------- | ------------ | ------------------ |
| user_credentials   | user_id   | user         | 82                 |
| user_settings      | user_id   | user         | 89                 |
| user_roles         | user_id   | user         | 23                 |
| user_subscriptions | user_id   | user         | 82                 |
| agent              | user_id   | user         | 94                 |
| team_members       | user_id   | user         | 100                |
| agent_cap_data     | agent_id  | agent        | 2                  |
| agent_commission   | agent_id  | agent        | 99                 |
| agent_hierarchy    | agent_id  | agent        | 12                 |
| agent_performance  | agent_id  | agent        | 95                 |
| income             | agent_id  | agent        | 95                 |

## Approach

1. Use Xano MCP to query each child table
2. Cross-reference with parent table to find missing IDs
3. Document exact record IDs to delete
4. Output cleanup script/list

## Acceptance

- [ ] Complete list of orphaned record IDs per table
- [ ] Total count matches validation output (~800 orphans)
- [ ] Cleanup script/commands ready for task 2

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
