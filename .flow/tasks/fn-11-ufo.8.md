# fn-11-ufo.8 Polish live-migration-status.tsx styling

## Description

Apply consistent styling patterns to live-migration-status.tsx without restructuring the component.

**Size:** M
**Files:**

- `components/live-migration-status.tsx`

## Approach

This is a 1759-line monolith. Do NOT split it (separate epic). Focus on styling consistency only:

1. **Replace HTML details with ShadCN Collapsible** where used
2. **Add proper PageHeader** with title and description (line 166-171)
3. **Standardize button styling** - replace raw buttons with ShadCN Button
4. **Use shared Badge components** for status indicators
5. **Use shared LoadingState** for loading patterns
6. **Use shared AlertBanner** for critical sync warnings
7. **Standardize Card padding** to use spacing tokens
8. **Remove inline color calculations** where possible - use semantic classes

## Key context

- Don't refactor logic, only styling
- Component has 5+ SWR calls - ensure loading states are consistent
- Multiple sections: Architecture, Migration Score, Technical Deep Dive, Sample Flow, Record Count, Entity Sync, V1/V2 Comparison, Status Info

## Acceptance

- [ ] HTML details replaced with ShadCN Collapsible
- [ ] PageHeader added with title and description
- [ ] All buttons use ShadCN Button component
- [ ] Badge components use shared components
- [ ] LoadingState uses shared component
- [ ] AlertBanner added for critical sync warnings
- [ ] Card padding uses spacing tokens
- [ ] No inline color calculations (use semantic classes)
- [ ] `pnpm build` passes
- [ ] No functionality regressions

## Done summary

Polished live-migration-status.tsx styling by replacing HTML details elements with ShadCN Collapsible components, adding proper PageHeader pattern, standardizing buttons with ShadCN Button, using shared LoadingState and AlertBanner components for consistent loading/error states, and standardizing Card padding with p-6 spacing tokens.

## Evidence

- Commits: a72e70193aace440af1278f93ef3ed64057072df
- Tests: pnpm build
- PRs:
