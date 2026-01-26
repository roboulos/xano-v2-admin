# V2 System Logic Verification - Pipeline Gap Investigation

## Problem

V2 has massive data gaps NOT because data wasn't migrated from V1, but because **V2's own data pipelines are broken or not running**:

```
STAGING BACKLOG (data stuck, not processing):
├── stage_listings: 44,688  →  listing: 16,784     (~27K unprocessed)
├── stage_transactions: 102,843  →  transaction: 51,835  (~51K unprocessed)
└── FUB people: V1=1.7M, V2=226K (87% gap - sync not working?)

DAILY SYNC FAILURES (2026-01-26):
├── FUB Lambda Coordinator: FAILED - "No ad_user_id provided"
├── SkySlope Account Users: FAILED - null response (configured but broken)
└── Network Downline: SKIPPED - "No pending onboarding jobs"

BACKGROUND TASKS:
├── 100+ tasks defined, only 10 cached
├── Schedule fields are EMPTY STRINGS
└── Not clear what triggers processing
```

## Key Decisions (from interview)

### Data & Scope

- **FUB scope**: V2 should have ALL historical FUB data (87% gap is a real bug)
- **Integrations needed**: ALL - FUB, reZEN, SkySlope, Title/Qualia
- **Onboarding**: Must support NEW users, not just V1 migration
- **Sync scope**: All users (not just active)
- **Sync frequency**: Research V1/V2 behavior; real-time preferred if feasible
- **Data truth**: Case-by-case basis when V1 and V2 differ (needs discussion)

### Architecture

- **Tasks/ structure**: Called 1:1 by Background Tasks AND by test endpoints
- **Workers/ structure**: Also have 1:1 test endpoints for individual testing
- **User context**: Need to define standard (may have inherited V1 bad habits like JSON user objects)
- **FP pattern**: All functions return consistent {success, data, error} structure
- **Failure behavior**: Fail fast, bubble errors to surface
- **Sync order**: Dependencies exist (e.g., transactions before participants) - NOT fully understood yet

### Fixes

- **Fix type**: Code fixes in XanoScript (not just config/scheduling)
- **Fix approach**: Fix at source + process backlog via Xano logic
- **Test endpoints**: Keep simple, don't let test setup cause problems
- **Deduplication**: Unknown, need to research current behavior

### Monitoring & Validation

- **Alerting**: ADD to scope - notify on failures
- **Health metrics**: All - staging backlog, last sync timestamp, error counts
- **Logging**: FP error bubbling (limited visibility vs other stacks)
- **Validation**: All methods - record counts, sample data, API responses
- **Observability**: Partial exists, needs expansion

### Deliverables

- **Parallel run**: INCLUDE capability to run V1/V2 side-by-side
- **Documentation**: Full V2 Operations Manual required
- **Automated tests**: Create test scripts for fixed pipelines
- **Rollback**: Git history for reverting changes

## Edge Cases

- Staging records fail validation → Mark as error or retry queue?
- External API timeout (>30s) → Why? Rate limiting? Large batch?
- Missing FK dependencies → e.g., transaction without participant
- FUB rate limits → May need throttling/pagination
- reZEN API changes → "teamMembers" path may have changed
- Duplicate handling → `Workers/Contributions - Duplicates` exists but unclear trigger
- `ad_user_id` vs `user_id` → Unknown if same or different concept

## Open Questions

1. What triggers processing of staged records? (bulk process function exists?)
2. How are onboarding jobs created for new users?
3. What is `ad_user_id` and how does it map to `user_id`?
4. What's the exact sync dependency order? (teams → agents → transactions → participants → contributions?)
5. Why are background task schedules empty strings?
6. What rate limits exist on FUB, reZEN, SkySlope APIs?
7. What's the standard user context format we should use?

## Acceptance

- [ ] All daily sync steps pass (FUB, reZEN, SkySlope)
- [ ] All onboarding steps pass for new users
- [ ] Staging backlogs processed (or understood why they exist)
- [ ] FUB data gap explained and fixed (87% → ~0%)
- [ ] SkySlope integration working (currently returns null)
- [ ] Alerting mechanism for pipeline failures
- [ ] V1/V2 parallel comparison capability exists
- [ ] V2 record counts match expected (within tolerance)
- [ ] Frontend can be switched to V2 endpoints
- [ ] V2 Operations Manual documented

## Quick Commands

```bash
# Test daily sync cycle
curl -s "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4psV7fp6/test-task-fub-daily-deals" \
  -H "Content-Type: application/json" -d '{"user_id": 60}'

# Check staging table counts
curl -s "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:Lrekz_3S/comprehensive-v1-v2-comparison" | jq '.summary'

# List background tasks
curl -s "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:meta/workspace/5/task?per_page=100" \
  -H "Authorization: Bearer $XANO_META_TOKEN" | jq '.items | length'

# Curl external APIs directly (use keys from DB tables)
# FUB, reZEN, SkySlope have API keys stored in integration tables
```

## Key Context

**Data Flow (where gaps occur):**

```
External APIs → Workers/ → stage_* tables → [GAP HERE] → Tasks/ → V2 tables
                                                ↑
                                    What triggers processing?
```

**Function Architecture:**

```
Background Tasks (Xano scheduler)
        │
        ├──1:1──> Tasks/ functions (orchestrators)
        │               │
        │               └──calls──> Workers/ functions (data operations)
        │
Test Endpoints (MCP groups)
        │
        ├──1:1──> Tasks/ functions
        │
        └──1:1──> Workers/ functions
```

**MCP Test Endpoints:**

- TASKS: `api:4psV7fp6` - orchestrators
- WORKERS: `api:4UsTtl3m` - data fetch/transform
- SYSTEM: `api:LIdBL1AN` - system operations
- SEEDING: `api:2kCRUYxG` - data seeding

## References

- Epic fn-2-riv: V2 System Verification (completed research phase)
- `.flow/docs/030-CORRECTED-v1-v2-gap-analysis.md` - Accurate V1/V2 counts
- Migration API Group: 650 (canonical: Lrekz_3S)
- `lib/mcp-endpoints.ts:24-29` - MCP base URLs
- `lib/workers-inventory.ts` - 194 worker functions
- `scripts/validation/validate-daily-sync.ts:34-156` - Daily sync test
