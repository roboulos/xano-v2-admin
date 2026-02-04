# fn-11-ufo.2 Extract MetricCard and ProgressBar shared components

## Description

Extract MetricCard and ProgressBar components from status-dashboard-tab into reusable shared components.

**Size:** S
**Files:**

- `components/ui/metric-card.tsx` (new)
- `components/ui/progress-bar.tsx` (new)
- `components/migration-tabs/status-dashboard-tab.tsx` (remove inline definitions)
- `components/migration-tabs/checklist-tab.tsx` (uses ProgressBar pattern)

## Approach

Extract MetricCard from `status-dashboard-tab.tsx:56-80`. Props: title, value, subtitle, highlight (boolean for emphasis).

Extract ProgressBar from `status-dashboard-tab.tsx:82-96`. Props: value (0-100), label, showPercentage, colorThresholds.

Follow existing Card component pattern from `components/ui/card.tsx`.

## Key context

- MetricCard uses conditional `highlight` class for primary emphasis
- ProgressBar has color thresholds: green >= 75%, blue >= 50%, yellow >= 25%, red < 25%

## Acceptance

- [ ] MetricCard extracted to `/components/ui/metric-card.tsx`
- [ ] ProgressBar extracted to `/components/ui/progress-bar.tsx`
- [ ] status-dashboard-tab.tsx imports from `/components/ui/`
- [ ] checklist-tab.tsx uses shared ProgressBar
- [ ] Components have TypeScript types for props
- [ ] `pnpm build` passes

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
