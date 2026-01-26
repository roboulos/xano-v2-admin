# fn-2-riv.2.2 Fix Endpoint Validation

## Description

Fix the endpoint validation script. Currently shows 0% pass rate with HTTP 404 errors - need to add auth headers and required parameters.

**Size:** M
**Phase:** 2 - V2 Validation
**Depends on:** None (can start immediately)

## Current Problem

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  ENDPOINT VALIDATION STATUS                                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  Total Endpoints: 751+                                                               │
│  Pass Rate: 0%                                                                       │
│  Errors: HTTP 404                                                                    │
│                                                                                      │
│  REASONS:                                                                            │
│  1. Missing authentication headers                                                   │
│  2. Missing required parameters (user_id, agent_id, etc.)                           │
│  3. Wrong HTTP methods                                                               │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Approach

1. Categorize endpoints by auth requirement:
   - Public (no auth)
   - User auth (Authorization header)
   - Admin auth (X-API-KEY header)

2. Add test user credentials:
   - User 60 (David Keener) - verified test user
   - Agent ID: 37208
   - Team ID: 1

3. Add required parameters per endpoint type:
   - GET endpoints: query params
   - POST endpoints: body params

## Files to Modify

- `scripts/validation/validate-endpoints.ts`
- `lib/mcp-endpoints.ts` (add auth requirements)

## Test Categories

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  Category        │ Auth Type    │ Example Endpoints                                 │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  Public          │ None         │ /health, /status                                  │
│  User Protected  │ Bearer token │ /user/profile, /dashboard/*                       │
│  Admin Only      │ X-API-KEY    │ /admin/*, /internal/*                             │
│  System          │ Internal     │ /webhooks/*, /tasks/*                             │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Acceptance

- [ ] Endpoints categorized by auth requirement
- [ ] Test credentials configured for protected endpoints
- [ ] Required parameters added per endpoint
- [ ] Pass rate > 90% for endpoints

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
