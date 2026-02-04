# Dashboard Design Polish - Professional Client Presentation

## Overview

The xano-v2-admin dashboard has 15 tabs with **inconsistent design quality**. Some tabs (Endpoints, Architecture, Blockers) look clean and professional, while others lag behind with inconsistent patterns, missing states, and visual inconsistencies. This epic brings ALL tabs up to the same professional standard for client presentation.

**Reference Tabs (Gold Standard):**

- `blockers-tab.tsx` - Best PageHeader, AlertBanner, MetricCards, EmptyState patterns
- `architecture-tab.tsx` - Clean Card structure, CollapsibleSection pattern
- `endpoint-catalog-tab.tsx` - Search/filter UI, expandable details, copy functionality

**Tabs Needing Work:**

- `functions-tab.tsx` - Missing PageHeader, inconsistent badges, no alert banners
- `background-tasks-tab.tsx` - Missing PageHeader, no metric cards, no alerts
- `live-migration-status.tsx` - 1759 lines monolith, uses HTML `<details>` instead of ShadCN
- `transformation-story-tab.tsx` - Missing PageHeader, weak loading states
- `status-dashboard-tab.tsx` - Good but needs alert banners, refresh button
- `gaps-tab.tsx` - Duplicate badges, raw button styling
- `checklist-tab.tsx` - Good but missing alert banners for blocked items
- `parallel-comparison-tab.tsx` - Missing alert banners for mismatches

## Scope

**In Scope:**

- Extract 6 duplicate Badge components to `/components/ui/`
- Extract shared MetricCard and ProgressBar components
- Standardize PageHeader pattern across all tabs
- Add consistent AlertBanner, LoadingState, EmptyState patterns
- Fix spacing inconsistencies (define tokens in globals.css)
- Ensure every tab has: header, refresh, export (where applicable)

**Out of Scope (Future Work):**

- Tab consolidation (reducing 15 tabs to 5-6) - separate epic
- Splitting `live-migration-status.tsx` into sub-components - separate refactor
- Adding "presentation mode" for client demos

## Approach

**Phase 1: Extract Shared Components (Foundation)**

1. Extract SeverityBadge, StatusBadge, PriorityBadge, CategoryBadge, MethodBadge
2. Extract MetricCard and ProgressBar from status-dashboard-tab
3. Create AlertBanner, LoadingState, EmptyState shared components
4. Define spacing tokens in globals.css

**Phase 2: Apply to Migration Tabs** 5. Polish status-dashboard-tab.tsx 6. Polish gaps-tab.tsx 7. Polish checklist-tab.tsx
(blockers-tab.tsx is already gold standard)

**Phase 3: Apply to Doc Tabs** 8. Polish data-model-tab.tsx 9. Polish integration-guide-tab.tsx
(architecture-tab.tsx and endpoint-catalog-tab.tsx already good)

**Phase 4: Apply to Live/Tool Tabs** 10. Polish functions-tab.tsx 11. Polish background-tasks-tab.tsx 12. Polish transformation-story-tab.tsx 13. Polish parallel-comparison-tab.tsx 14. Polish live-migration-status.tsx (styling only, no split)

**Phase 5: Apply to Machine 2.0 Tabs** 15. Polish schema-tab.tsx 16. Polish backend-validation-tab.tsx

## Quick commands

```bash
# Build to verify no TypeScript errors
pnpm build

# Run dev server to visually verify
pnpm dev

# Check all tabs visually at http://localhost:3000
```

## Risks & Dependencies

**Risks:**

- `live-migration-status.tsx` at 1759 lines may have styling deeply coupled to logic
- Existing duplicate badges have slight variations - need to pick canonical version

**Dependencies:**

- Extends work from fn-4-tkb (Frontend Enhancement)
- Should coordinate with fn-2/fn-3 (ESLint/Prettier) if active

## Acceptance

- [ ] All 6 duplicate Badge components extracted to `/components/ui/`
- [ ] MetricCard and ProgressBar are shared components
- [ ] AlertBanner, LoadingState, EmptyState patterns consistent across tabs
- [ ] Spacing tokens defined in globals.css and used consistently
- [ ] All 15 tabs visually reviewed and matching quality standard
- [ ] `pnpm build` passes with no TypeScript errors
- [ ] No regressions in functionality

## References

- Reference patterns: `components/migration-tabs/blockers-tab.tsx` (lines 19-66 for badges, 221-264 for metrics)
- Existing UI components: `components/ui/` (15+ ShadCN components)
- UX proposal: `UX_REORGANIZATION_PROPOSAL.md` (tab consolidation for future)
- Practice research: ShadCN dashboard patterns, Tailwind CSS 4 design tokens
