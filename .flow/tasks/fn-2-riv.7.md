# fn-2-riv.2.4 Identify Broken Functions

## Description

Analyze validation results to identify which specific functions are broken and why. Create prioritized fix list.

**Size:** S
**Phase:** 2 - V2 Validation
**Depends on:** 2.3

## Categories of Broken Functions

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  BROKEN FUNCTION CATEGORIES                                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  1. Empty Stack       │ Function exists but has no operations                        │
│  2. Runtime Error     │ Function errors when called                                  │
│  3. Wrong Output      │ Function returns unexpected format                           │
│  4. Missing Deps      │ Function calls non-existent function                         │
│  5. Timeout           │ Function takes too long to respond                           │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Analysis Process

1. Parse validation reports for failed functions
2. Group by error type
3. Identify patterns (same folder, same domain, etc.)
4. Prioritize by:
   - Critical: Used by client-facing features
   - Medium: Used by background processes
   - Low: Internal utilities or deprecated

## Output Format

Create `.flow/docs/022-broken-functions.md`:

```markdown
# Broken Functions Analysis

## Critical (Client-Facing)

| Function                | ID   | Error Type    | Fix Approach  |
| ----------------------- | ---- | ------------- | ------------- |
| Workers/FUB - Get Deals | 8300 | Runtime Error | Check API key |

## Medium (Background)

| Function | ID  | Error Type | Fix Approach |
| -------- | --- | ---------- | ------------ |

## Low (Internal/Deprecated)

| Function | ID  | Error Type | Notes |
| -------- | --- | ---------- | ----- |
```

## Acceptance

- [ ] All failed functions categorized by error type
- [ ] Priority assigned to each (Critical/Medium/Low)
- [ ] Root cause identified where possible
- [ ] Document created at .flow/docs/022-broken-functions.md

## Done summary

Analyzed validation results to identify broken functions and data integrity issues. Created comprehensive document at .flow/docs/022-broken-functions.md categorizing 1 runtime error (Network Downline HTTP 404), 6 orphaned reference issues (500+ agent orphans), 171 untestable internal functions by domain, and 22 passing functions with prioritized fix recommendations.

## Evidence

- Commits: 37dc7c6344b527cabdda69c29d5d7a66bf34e6b4
- Tests: Read validation-reports/function-validation-workers-2026-01-26T14-02-01-966Z.json, Read validation-reports/reference-validation-2026-01-26T14-47-18-284Z.json, Read validation-reports/table-validation-2026-01-26T14-13-12-407Z.json
- PRs:
