# fn-2-riv.4.3 Fix Endpoint Gaps

## Description

Fix API endpoint gaps including missing endpoints, broken endpoints, and incorrect response formats.

**Size:** M
**Phase:** 4 - Surgical Gap Fixes
**Depends on:** 2.2, 4.1

## Gap Categories

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  ENDPOINT GAP CATEGORIES                                                             │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  1. MISSING         Endpoints V1 has that V2 doesn't                                │
│     - Create new API endpoint                                                        │
│     - Wire to appropriate function                                                   │
│                                                                                      │
│  2. BROKEN          V2 endpoints that return errors                                 │
│     - Fix underlying function                                                        │
│     - Fix route configuration                                                        │
│                                                                                      │
│  3. WRONG FORMAT    Endpoints returning incorrect structure                         │
│     - Update function response                                                       │
│     - Ensure FP Result Type compliance                                               │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## API Groups

| Group    | Base URL     | Purpose                    |
| -------- | ------------ | -------------------------- |
| Frontend | api:LIdBL1AN | Client-facing API          |
| Workers  | api:4UsTtl3m | Internal workers (testing) |
| Tasks    | api:4psV7fp6 | Background tasks           |
| System   | api:2kCRUYxG | System/admin endpoints     |

## Fix Process

### For Missing Endpoints

1. Identify needed endpoint from V1
2. Create endpoint in appropriate API group
3. Wire to existing function OR create new function
4. Test with curl
5. Document in OpenAPI spec

### For Broken Endpoints

1. Check endpoint validation report
2. Identify error (404, 500, etc.)
3. Debug: is it route issue or function issue?
4. Apply fix
5. Re-test

### For Wrong Format

1. Identify expected format (usually FP Result Type)
2. Update function response block
3. Test output matches expected structure

## FP Result Type Standard

```json
{
  "success": true,
  "data": { ... },
  "error": "",
  "step": "endpoint_name"
}
```

## Acceptance

- [ ] All Critical endpoint gaps fixed
- [ ] All endpoints return proper FP Result format
- [ ] Endpoint validation pass rate > 96%
- [ ] OpenAPI spec updated for new endpoints
- [ ] Frontend can consume all required endpoints

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
