# fn-3-lv0.5 Document onboarding job creation flow

## Description

Document how onboarding jobs are created - only 1 exists currently.

**Size:** S
**Files:** lib/mcp-endpoints.ts, lib/tasks-inventory.ts

## Approach

1. Find `rezen_onboarding_jobs` table structure
2. Find the endpoint/function that creates onboarding jobs
3. Understand the job state machine (pending → in_progress → completed)
4. Test creating a new onboarding job
5. Document the full onboarding flow

## Key context

- Only 1 onboarding job exists in `rezen_onboarding_jobs`
- Network downline sync SKIPS when no pending jobs found
- Onboarding has 6 steps: Team → Agent → Transactions → Listings → Contributions → Network

## Acceptance

- [ ] Found onboarding job creation endpoint
- [ ] Documented job state machine
- [ ] Tested creating a new job (or documented why not)
- [ ] Updated `.flow/docs/` with onboarding flow

## Done summary

Documented the complete onboarding job creation flow including job state machine (New->Started->Complete/Partial/Error), key functions (8299 for create, 7981 for poll/start, 8297 for orchestrate), and added 3 onboarding endpoints to mcp-endpoints.ts. Explains why Network Downline sync SKIPS when no pending jobs exist.

## Evidence

- Commits: 6e9a803a474de3f3c00f7a1f8084eca0f4638548
- Tests: curl test of onboarding-start-job endpoint confirmed no_jobs response
- PRs:
