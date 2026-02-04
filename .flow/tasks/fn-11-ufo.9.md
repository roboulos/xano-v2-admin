# fn-11-ufo.9 Polish machine 2.0 tabs (schema, backend-validation)

## Description

Apply shared components and consistent patterns to machine 2.0 tabs (schema, backend-validation).

**Size:** S
**Files:**

- `components/machine-2/schema-tab.tsx`
- `components/machine-2/backend-validation-tab.tsx`

## Approach

**schema-tab.tsx (1079 lines):**

- Add proper PageHeader if missing
- Use shared Badge components for any status indicators
- Ensure consistent Card structure
- Info note section (line 1053-1075) could use AlertBanner info variant
- Standardize spacing

**backend-validation-tab.tsx:**

- Add proper PageHeader if missing
- Use shared Badge components
- Use shared LoadingState and EmptyState
- Standardize Card structure and spacing

## Key context

- schema-tab.tsx is large (1079 lines) but well-structured
- Both tabs are part of "Machine 2.0" system - should match blockers-tab quality

## Acceptance

- [ ] schema-tab has proper PageHeader
- [ ] schema-tab uses shared Badge components
- [ ] schema-tab info note uses AlertBanner info variant
- [ ] backend-validation-tab has proper PageHeader
- [ ] backend-validation-tab uses shared components
- [ ] Both tabs use consistent spacing tokens
- [ ] `pnpm build` passes

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
