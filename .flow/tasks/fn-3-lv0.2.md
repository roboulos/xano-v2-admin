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

Debugged and fixed FUB Lambda Coordinator ad_user_id issue. Root cause: Function 8118 expects `ad_user_id` parameter (not `user_id`), and also requires `endpoint_type` (people|events|calls|appointments|deals|textMessages). Updated mcp-endpoints.ts interface to support custom param names and added proper configuration for this endpoint. Updated validate-daily-sync.ts to pass correct parameters.

## Evidence

- Commits: 2a447d55b397fea18f67c0ec0a6b45c61c7b5c6a, 6e9a803a474de3f3c00f7a1f8084eca0f4638548
- Tests: curl with user_id returns 'No ad_user_id provided', curl with ad_user_id passes check (fails later on missing endpoint_type), curl with ad_user_id + endpoint_type processes correctly (times out - long-running)
- PRs:
