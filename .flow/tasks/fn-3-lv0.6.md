# fn-3-lv0.6 Create end-to-end pipeline test endpoint

## Description

Create a new Xano endpoint that tests the full data pipeline end-to-end.

**Size:** M
**Files:** (new endpoint in Migration API group 650)

## Approach

1. Create endpoint `pipeline-health-check` in api:Lrekz_3S
2. Check each stage: External API → Worker → Stage table → Task → Final table
3. Return status for each integration (FUB, reZEN, SkySlope)
4. Include staging backlog counts and processing status
5. Document the endpoint for ongoing monitoring

## Key context

- Use patterns from existing Migration API endpoints
- Should be a GET endpoint that returns health status
- Follow XanoScript patterns from existing endpoints in group 650

## Acceptance

- [ ] Created `pipeline-health-check` endpoint
- [ ] Checks FUB, reZEN, SkySlope integration status
- [ ] Returns staging backlog counts
- [ ] Returns last sync timestamps
- [ ] Documented in `.flow/docs/`

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
