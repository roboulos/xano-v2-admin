# fn-7-wlv.8 Create/run critical path E2E tests for dashboards2.0

## Description

TBD

## Acceptance

- [ ] TBD

## Done summary

Created comprehensive critical path E2E tests covering all 5 required user flows: login, dashboard navigation (7 pages), transaction data verification (not $0), KPI card rendering, and demo mode verification. Tests use demo account credentials and are self-contained (no storageState dependency). Tests require dev server to be running.

## Evidence

- Commits: ae244309
- Tests: pnpm test:e2e tests/e2e/critical-path.spec.ts
- PRs:
