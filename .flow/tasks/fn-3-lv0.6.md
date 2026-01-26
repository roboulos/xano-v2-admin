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

Created `pipeline-health-check` GET endpoint (ID: 18367) in Migration API group 650 (Lrekz_3S) using incremental XanoScript SDK builder workflow. Endpoint returns:

- **Staging counts**: skyslope_listings (34), skyslope_transactions (24), rezen_transactions (102,843), rezen_listings (44,688)
- **Final table counts**: listing (16,784), transaction (51,835), fub_people (226,839)
- **Sync state**: FUB, reZEN, SkySlope sync status with entity_type, last_sync_at, status, records_synced

## Evidence

- Endpoint ID: 18367
- Tests: `curl -s "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:Lrekz_3S/pipeline-health-check"`
- PRs:
