# fn-9-7vd.3 Update integration test assertions to match V2 reality

## Description

Update V2 integration tests to reflect the actual achievable state after orphan cleanup.

**Size:** S
**Files:** `test/v2-integration.test.ts`, `scripts/validation/*.ts`

## Approach

1. Run `pnpm validate:references` after orphan cleanup to get new baseline
2. Update test assertions to expect:
   - 100% reference integrity (32/32 tables)
   - 100 user records in V2
   - Proper foreign key relationships
3. Ensure tests use real user IDs (60, 62, 77, etc.) not fictional demo IDs
4. Remove any assertions expecting demo accounts in V2

## Acceptance

- [ ] `pnpm validate:references` shows 32/32 passing (100%)
- [ ] Integration tests pass with real V2 user IDs
- [ ] No tests reference demo accounts (michael@demo, sarah@demo, james@demo)
- [ ] `pnpm test` passes

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
