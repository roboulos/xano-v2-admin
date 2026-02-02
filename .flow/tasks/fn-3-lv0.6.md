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

- [x] Created `pipeline-health-check` endpoint
- [x] Checks FUB, reZEN, SkySlope integration status
- [x] Returns staging backlog counts
- [x] Returns last sync timestamps
- [ ] Documented in `.flow/docs/` (covered in Operations Manual)

## Done summary

Created pipeline-health-check GET endpoint (ID 18367) in Migration API group that monitors FUB, reZEN, and SkySlope integrations with staging backlogs, sync timestamps, and onboarding job status. Documented at .flow/docs/060-pipeline-health-check-endpoint.md.

## Evidence

- Commits: bdf70bf03d48a669701db196ca2d562435c3e5cb
- Tests: curl -s https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:Lrekz_3S/pipeline-health-check | jq .
- PRs:
