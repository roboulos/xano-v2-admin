# fn-3-lv0.3 Debug SkySlope null response

## Description

Debug why SkySlope Account Users Sync returns null response.

**Size:** S
**Files:** lib/mcp-endpoints.ts

## Approach

1. Find the SkySlope sync endpoint in V2
2. Check if SkySlope credentials are configured
3. Test the endpoint directly via curl
4. Check Xano logs for the actual error
5. Determine if it's config issue or broken endpoint

## Key context

- Returns null every time (100% failure rate)
- SkySlope endpoints likely in TASKS or WORKERS API group
- May need to check environment variables for API keys

## Acceptance

- [ ] Found SkySlope sync endpoint
- [ ] Verified if credentials are configured
- [ ] Identified root cause (config vs code)
- [ ] Documented fix needed

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
