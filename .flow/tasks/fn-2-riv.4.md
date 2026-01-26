# fn-2-riv.2.1 Fix Function Validation

## Description

Fix the function validation script to properly test Workers/ functions. Currently shows 0% pass rate because Workers don't have direct endpoints - need to use MCP Workers API group.

**Size:** M
**Phase:** 2 - V2 Validation
**Depends on:** None (can start immediately)

## Current Problem

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  FUNCTION VALIDATION STATUS                                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  Workers/ Functions: 194                                                             │
│  Pass Rate: 0%                                                                       │
│  Error: "No test endpoint found"                                                     │
│                                                                                      │
│  REASON: Workers are internal functions, not direct API endpoints                    │
│  SOLUTION: Use MCP Workers API group (4UsTtl3m) for testing                         │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Approach

1. Map Workers/ functions to their test endpoints in api:4UsTtl3m
2. Update `scripts/validation/validate-functions.ts` with mapping
3. Add proper test parameters (user_id: 60 for David Keener)
4. Run validation and verify improved pass rate

## Test Endpoint Pattern

```bash
# MCP Workers test endpoint pattern
curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/test-worker" \
  -H "Content-Type: application/json" \
  -d '{
    "function_id": 8300,
    "user_id": 60
  }'
```

## Files to Modify

- `scripts/validation/validate-functions.ts`
- `lib/function-endpoint-mapping.json` (create if needed)

## Acceptance

- [ ] Function → endpoint mapping created
- [ ] Validation script uses correct test endpoints
- [ ] Test parameters include user_id where needed
- [ ] Pass rate > 80% for Workers/

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
