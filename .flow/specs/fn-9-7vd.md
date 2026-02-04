# V2 Data Integrity - Fix Orphans and Validate System

## Overview

**CORRECTED UNDERSTANDING:** V2 workspace has 100 real users with production data. The "77%" issue comes from orphaned foreign key references in child tables pointing to user IDs (34-43, etc.) that don't exist in V2.

**Current V2 State:**

- `user` table: **100 records** (real users: David Keener, Jennifer Vogel, Charity Pagano, etc.)
- Child tables (user_credentials, user_settings, etc.): Have records for user IDs that DON'T exist
- Demo accounts: In V1 only (michael@demo, sarah@demo, james@demo) - NOT in V2

**Root Cause:** Partial migration or leftover test data in child tables.

## Research Findings

### V1 vs V2 Architecture

- **V1:** Workspace 1, `xmpx-swi5-tlvy.n7c.xano.io`, 251 tables, production + demo_data datasources
- **V2:** Workspace 5, `x2nu-xcjc-vhax.agentdashboards.xano.io`, 193 tables (normalized)

### Demo Account System

- Demo accounts use `X-Data-Source: demo_data` header with V1
- Demo users (Michael, Sarah, James) are in V1's demo_data datasource
- V2 does NOT have demo accounts - it's production data only

### Orphaned References (from validation output)

| Table              | Column  | Orphan Count | Sample Missing IDs |
| ------------------ | ------- | ------------ | ------------------ |
| user_credentials   | user_id | 82           | 34-43              |
| user_settings      | user_id | 89           | 30-39              |
| user_roles         | user_id | 23           | 27-40              |
| user_subscriptions | user_id | 82           | 23-32              |
| agent              | user_id | 94           | 470-479            |
| team_members       | user_id | 100          | 88-97              |

## Scope

### In Scope

1. **Audit V2 data** - Document exactly what exists vs what's orphaned
2. **Clean orphaned records** - Delete child records with no parent
3. **Fix validation scripts** - Ensure tests reflect actual achievable state
4. **Verify endpoints work** - Test with real V2 user (David Keener, ID 60)

### Out of Scope

- Migrating demo accounts to V2 (they work in V1)
- Full V1→V2 migration (separate epic)
- Frontend lint fixes (separate concern)

## Quick Commands

```bash
# Check V2 user count
curl -s "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/user" | jq '.length'

# Run reference validation
cd xano-v2-admin && pnpm validate:references

# Test with real user 60 (David Keener)
curl -s -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/test-function-8066-team-roster" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 60}'
```

## Acceptance Criteria

- [ ] V2 has 100 valid users (no orphans pointing to non-existent users)
- [ ] `pnpm validate:references` shows 32/32 passing
- [ ] User 60 (David Keener) can successfully call all WORKERS endpoints
- [ ] `pnpm test` passes with realistic assertions
- [ ] Documentation accurately describes V2 state

## References

- `lib/v2-data.ts` - V2 table configuration
- `scripts/validation/validate-references.ts` - Reference validation
- `DELIVERY_MANIFEST.md` - Current delivery state (needs update)
