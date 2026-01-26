# fn-2-riv.4.2 Fix Schema Gaps

## Description

Fix schema gaps identified during validation, including missing foreign keys, missing fields, and data integrity issues.

**Size:** M
**Phase:** 4 - Surgical Gap Fixes
**Depends on:** 2.3

## Known Gaps

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  KNOWN SCHEMA GAPS                                                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  Brokerage Domain:                                                                   │
│  ├─ office → brokerage FK (may need linking)                                        │
│  └─ brokerage_id_raw on relevant tables                                             │
│                                                                                      │
│  Reference Integrity:                                                                │
│  ├─ Any broken FKs from validation                                                  │
│  └─ Any orphaned records                                                            │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Schema Fix Types

| Type           | Description                     | MCP Tool         |
| -------------- | ------------------------------- | ---------------- |
| Add Field      | New field to existing table     | add_column       |
| Add FK         | Create foreign key relationship | (via field type) |
| Fix Field Type | Change field data type          | edit_column      |
| Add Index      | Performance optimization        | add_index        |

## Process

1. Review reference validation report
2. Identify tables with broken FKs
3. Check if target table exists
4. Apply fix via MCP or Xano UI
5. Re-run reference validation

## Specific Fixes (From Interview)

### Brokerage Linking

- **Status:** Already determined office has all needed fields
- **Action:** Verify office.brokerage_id links correctly
- **Don't:** Create duplicate fields in brokerage table

### Address Table

- **Status:** Centralized address table exists (ID: 692)
- **Action:** Verify all address FKs point to address table

## Acceptance

- [ ] All broken FKs identified and fixed
- [ ] Reference validation passes 100%
- [ ] No orphaned records
- [ ] Brokerage linking verified

## Done summary

Fixed reference validation script to use table IDs instead of names, removed non-existent table references (team_owners, team_admins, contributors), and added missing FK relationships (user.brokerage_id, user.team_id, office address FKs). Validation now correctly identifies orphaned records (471 total across user-related tables) - these are data migration issues, not schema issues.

## Evidence

- Commits: 47a49a7, 10cc4b6
- Tests: npx tsx scripts/validation/validate-references.ts --relationship=user
- PRs:
