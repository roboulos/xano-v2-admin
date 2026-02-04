# fn-7-wlv.10 Run full validation suite on xano-v2-admin (4 validators)

## Description

TBD

## Acceptance

- [ ] TBD

## Done summary

Ran all 4 validators on xano-v2-admin. Tables: 100% (223/223). Functions: ~95% testable pass rate (workers 100%, FUB 92.68%). Endpoints: 98.14% (211/215). References: 18.75% (6/32) - FAILED due to orphaned foreign keys in V2 workspace data (known data integrity issue in Xano backend, not this admin interface).

## Evidence

- Commits:
- Tests: npm run validate:tables - PASS (100% - 223/223 tables), npm run validate:functions - PASS (~95% testable - workers 100%, FUB 92.68%), npm run validate:endpoints - PASS (98.14% - 211/215 endpoints), npm run validate:references - FAIL (18.75% - 6/32 references due to orphaned foreign keys)
- PRs:
