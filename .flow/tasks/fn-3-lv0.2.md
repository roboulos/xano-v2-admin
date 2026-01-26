# fn-3-lv0.2 Debug FUB Lambda Coordinator ad_user_id

## Description

Debug why FUB Lambda Coordinator fails with "No ad_user_id provided".

**Size:** S
**Files:** lib/mcp-endpoints.ts

## Approach

1. Find the FUB Lambda Coordinator endpoint/function in V2
2. Check what `ad_user_id` means vs `user_id`
3. Determine if it's a parameter mapping issue or missing data
4. Test with correct parameters
5. Fix or document the fix needed

## Key context

- Error from daily sync validation: "No ad_user_id provided"
- Test user 60 (David Keener) has agent_id: 37208
- FUB endpoints typically in `api:4UsTtl3m` (WORKERS)

## Acceptance

- [ ] Found FUB Lambda Coordinator function
- [ ] Understood ad_user_id vs user_id mapping
- [ ] Tested with correct parameters
- [ ] Documented fix (parameter change or code fix needed)

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
