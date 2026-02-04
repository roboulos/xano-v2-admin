# fn-9-7vd.2 Delete orphaned child records from V2 tables

## Description

Delete orphaned child records from V2 Xano tables identified in task 1.

**Size:** M
**Files:** Xano MCP delete operations

## Approach

1. Use Xano MCP `delete_record` or `bulk_delete` to remove orphans
2. Work through tables in dependency order:
   - First: user-related orphans (user_credentials, user_settings, etc.)
   - Then: agent-related orphans
   - Then: team-related orphans
3. Run `pnpm validate:references` after each batch to verify
4. Document any records that couldn't be deleted and why

## Safety

- No cascade deletes - only target specific orphan IDs
- Log all deletions
- Verify parent table is NOT affected

## Acceptance

- [ ] All orphaned user\_\* records deleted
- [ ] All orphaned agent\_\* records deleted
- [ ] All orphaned team\_\* records deleted
- [ ] `pnpm validate:references` shows improvement (target: 100%)
- [ ] No legitimate data deleted

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
