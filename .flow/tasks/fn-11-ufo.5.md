# fn-11-ufo.5 Polish migration tabs (status-dashboard, gaps, checklist)

## Description

Apply shared components and consistent patterns to migration tabs (status-dashboard, gaps, checklist). Blockers tab is already gold standard.

**Size:** M
**Files:**

- `components/migration-tabs/status-dashboard-tab.tsx`
- `components/migration-tabs/gaps-tab.tsx`
- `components/migration-tabs/checklist-tab.tsx`

## Approach

**status-dashboard-tab.tsx:**

- Already has good PageHeader pattern
- Import shared MetricCard (replace inline)
- Import shared ProgressBar (replace inline)
- Add AlertBanner for critical status (e.g., sync < 50%)
- Add refresh button to header

**gaps-tab.tsx:**

- Import shared SeverityBadge, StatusBadge (replace inline definitions)
- Add AlertBanner for critical gaps count
- Replace raw export button with ShadCN Button

**checklist-tab.tsx:**

- Import shared PriorityBadge (replace inline)
- Import shared ProgressBar
- Add AlertBanner when blocked items > 0
- Standardize spacing with tokens

## Key context

- Follow patterns from `blockers-tab.tsx` as reference
- All tabs should have consistent header structure

## Acceptance

- [ ] status-dashboard uses shared MetricCard and ProgressBar
- [ ] status-dashboard has refresh button in header
- [ ] status-dashboard has AlertBanner for critical status
- [ ] gaps-tab uses shared Badge components
- [ ] gaps-tab has AlertBanner for critical gaps
- [ ] gaps-tab uses ShadCN Button for export
- [ ] checklist-tab uses shared components
- [ ] checklist-tab has AlertBanner for blocked items
- [ ] Consistent spacing across all three tabs
- [ ] `pnpm build` passes

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
