# fn-2-riv.4.1 Fix Function Gaps

## Description

Fix specific function gaps identified in Phases 1-3. This includes creating missing Workers/ functions and fixing broken functions.

**Size:** L
**Phase:** 4 - Surgical Gap Fixes
**Depends on:** 1.3, 2.4

## Gap Categories

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  FUNCTION GAP CATEGORIES                                                             │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  1. MISSING         Functions V1 has that V2 doesn't                                │
│     - Create from scratch                                                            │
│     - Use V1 as reference                                                            │
│                                                                                      │
│  2. BROKEN          V2 functions that error or return wrong format                  │
│     - Debug and fix                                                                  │
│     - May need XanoScript corrections                                                │
│                                                                                      │
│  3. INCOMPLETE      V2 functions missing operations                                 │
│     - Add missing steps                                                              │
│     - Compare to V1 equivalent                                                       │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Input Required

From Task 1.3 (V1 vs V2 Gap Analysis):

- List of V1 functions without V2 equivalent
- Priority classification (Critical/Medium/Low)

From Task 2.4 (Broken Functions):

- List of broken V2 functions
- Error types and root causes

## Fix Process

### For Missing Functions

1. Get V1 function details via MCP
2. Understand what it does
3. Create V2 equivalent using XanoScript
4. Test with curl
5. Verify output matches V1 behavior

### For Broken Functions

1. Identify error type from validation report
2. Get function stack via MCP
3. Debug using XanoScript patterns
4. Apply fix
5. Re-test

## Priority Order

1. **Critical First** - Client-facing features
2. **Medium Second** - Background processes
3. **Low Last** - Internal utilities

## XanoScript Reference

See CLAUDE.md for XanoScript patterns:

- Header array construction with |push
- Safe property access with |get
- Timestamp formatting
- FP Result Type pattern

## Acceptance

- [ ] All Critical gaps fixed
- [ ] All Medium gaps fixed
- [ ] Low gaps documented (may defer)
- [ ] All fixes tested with curl
- [ ] Function validation pass rate > 95%

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
