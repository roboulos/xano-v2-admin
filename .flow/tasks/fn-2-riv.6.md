# fn-2-riv.2.3 Run Comprehensive Validation

## Description

Run all validation scripts after fixing 2.1 and 2.2. Generate complete validation report showing system health.

**Size:** S
**Phase:** 2 - V2 Validation
**Depends on:** 2.1, 2.2

## Validation Suite

```bash
# Run all validators
npm run validate:all

# Individual validators
npm run validate:tables      # 193 V2 tables
npm run validate:functions   # 270+ functions
npm run validate:endpoints   # 801+ endpoints
npm run validate:references  # 156 foreign keys
```

## Expected Output

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  V2 SYSTEM VALIDATION REPORT                                                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  Component       │ Total    │ Passed   │ Failed   │ Pass Rate                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  Tables          │ 193      │ ???      │ ???      │ ???%                            │
│  Functions       │ 270      │ ???      │ ???      │ ???%                            │
│  Endpoints       │ 801      │ ???      │ ???      │ ???%                            │
│  References      │ 156      │ ???      │ ???      │ ???%                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  OVERALL         │ 1420     │ ???      │ ???      │ ???%                            │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Minimum Target Scores

| Component  | Target | Notes                               |
| ---------- | ------ | ----------------------------------- |
| Tables     | 100%   | Schema integrity must be perfect    |
| Functions  | 95%    | Some deprecated functions expected  |
| Endpoints  | 96%    | Some admin-only may not be testable |
| References | 100%   | FK integrity must be perfect        |

## Output Files

Reports saved to `validation-reports/`:

- `table-validation-{timestamp}.json`
- `function-validation-{timestamp}.json`
- `endpoint-validation-{timestamp}.json`
- `reference-validation-{timestamp}.json`

## Acceptance

- [ ] All 4 validators run successfully
- [ ] Tables: 100% pass rate
- [ ] Functions: > 95% pass rate
- [ ] Endpoints: > 96% pass rate
- [ ] References: 100% pass rate
- [ ] Reports saved to validation-reports/

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
