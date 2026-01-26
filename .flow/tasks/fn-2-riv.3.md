# fn-2-riv.1.3 V1 vs V2 Coverage Comparison

## Description

Systematically compare V1 and V2 function coverage to identify gaps. This is the definitive gap analysis.

**Size:** M
**Phase:** 1 - V1 vs V2 Comparison
**Depends on:** 1.1, 1.2

## Comparison Approach

### By Domain

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Domain         │ V1 Count │ V2 Count │ Gap    │ Notes                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ FUB            │ ???      │ 25       │ ???    │ Get Deals, People, Calls, etc.     │
│ reZEN          │ ???      │ 30       │ ???    │ Transactions, Listings, Network    │
│ SkySlope       │ ???      │ 8        │ ???    │ Listings, Transactions             │
│ Network        │ ???      │ 15       │ ???    │ Hierarchy, Frontline, Sponsor      │
│ Income         │ ???      │ 10       │ ???    │ Aggregation, RevShare              │
│ Metrics        │ ???      │ 8        │ ???    │ Calculations                       │
│ Auth           │ ???      │ 5        │ ???    │ Login, Token                       │
│ Linking        │ ???      │ 12       │ ???    │ FK linking workers                 │
│ Title/Qualia   │ ???      │ 6        │ ???    │ Orders, Disclosures                │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### By Function Type

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Type           │ V1 Count │ V2 Count │ Match Rate │                                │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ Workers/       │ ???      │ 194      │ ???%       │                                │
│ Tasks/         │ ???      │ ???      │ ???%       │                                │
│ Utils/         │ ???      │ ???      │ ???%       │                                │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Mapping Process

1. For each V1 active function:
   - Find V2 equivalent by name similarity
   - Verify functionality matches
   - Mark status: ✓ Match | ⚠ Partial | ❌ Missing

2. For each V2 function:
   - Check if V1 has equivalent
   - Mark if new V2-only function

## Output

Create `.flow/docs/021-v1-v2-gap-analysis.md` with:

- Complete coverage table
- Critical gaps list (client-facing features)
- Nice-to-have gaps list (internal tooling)
- New V2 features (not in V1)

## Acceptance

- [ ] Every V1 active function mapped to V2 equivalent or marked missing
- [ ] Gap severity assessed (Critical/Medium/Low)
- [ ] Document created at .flow/docs/021-v1-v2-gap-analysis.md
- [ ] Summary table shows overall coverage percentage

## Done summary

Created comprehensive V1 vs V2 gap analysis showing 100% function coverage across all 9 domains (~240 active functions) but identified 10 missing client-requested [v2] tables (weekly aggregations and FUB activity analytics). Document includes prioritized remediation plan.

## Evidence

- Commits: 6fb75d8c3e83c731c1423752cc0cec5e85fb9369
- Tests: manual verification of gap analysis document
- PRs:
