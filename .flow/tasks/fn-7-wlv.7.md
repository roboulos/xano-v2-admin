# fn-7-wlv.7 Configure test coverage for all repos (vitest + thresholds)

## Description

TBD

## Acceptance

- [ ] TBD

## Done summary

Added coverage thresholds (60% for lines, functions, branches, statements) to vitest configs for xano-v2-admin and v0-demo-sync-admin-interface. Also installed @vitest/coverage-v8 in xano-v2-admin. dashboards2.0 already had thresholds configured at 70/70/60/70 which exceeds the minimum. Verified v0-demo-sync tests pass (53 tests).

## Evidence

- Commits: 948b26a411ff78f056697dbe0eb4bc8c040f9a8a, 7ae348d643282c180d0cfee3409db2728d1c2002
- Tests: pnpm test -- --run (v0-demo-sync: 53 tests pass)
- PRs:
