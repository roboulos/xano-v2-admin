# fn-11-ufo.7 Polish tool tabs (functions, background-tasks, transformation-story, parallel-comparison)

## Description

Apply shared components and consistent patterns to tool tabs (functions, background-tasks, transformation-story, parallel-comparison).

**Size:** M
**Files:**

- `components/functions-tab.tsx`
- `components/background-tasks-tab.tsx`
- `components/transformation-story-tab.tsx`
- `components/parallel-comparison-tab.tsx`

## Approach

**functions-tab.tsx:**

- Add proper PageHeader with title and description (missing)
- Replace inline CATEGORY_COLORS badges with shared Badge
- Replace getStatusBadge() with shared StatusBadge
- Add AlertBanner when test failures exist
- Improve EmptyState with icon (line 349-351)

**background-tasks-tab.tsx:**

- Add proper PageHeader (missing)
- Add metric summary cards row
- Add AlertBanner for inactive critical tasks
- Improve EmptyState with icon (line 147-149)

**transformation-story-tab.tsx:**

- Add proper PageHeader with description (missing, line 154)
- Add export functionality
- Improve LoadingState (line 246-248) to use shared component
- Add AlertBanner for sync warnings

**parallel-comparison-tab.tsx:**

- Already has PageHeader (good)
- Add AlertBanner for significant mismatches
- Standardize summary cards with MetricCard

## Key context

- functions-tab at 477 lines has most work needed
- transformation-story-tab was recently created - ensure it matches standard

## Acceptance

- [ ] functions-tab has PageHeader with description
- [ ] functions-tab uses shared Badge components
- [ ] functions-tab has AlertBanner for test failures
- [ ] functions-tab has proper EmptyState with icon
- [ ] background-tasks-tab has PageHeader
- [ ] background-tasks-tab has metric summary cards
- [ ] background-tasks-tab has AlertBanner capability
- [ ] transformation-story-tab has PageHeader
- [ ] transformation-story-tab uses shared LoadingState
- [ ] parallel-comparison-tab has AlertBanner for mismatches
- [ ] All tabs use consistent spacing tokens
- [ ] `pnpm build` passes

## Done summary

Polished all four tool tabs (functions-tab, background-tasks-tab, transformation-story-tab, parallel-comparison-tab) with consistent PageHeaders, AlertBanners for actionable warnings, MetricCard summaries, and shared LoadingState/EmptyState components.

## Evidence

- Commits: 362d2794b9c6441ac497cfd863bde4558b43e497
- Tests: pnpm build
- PRs:
