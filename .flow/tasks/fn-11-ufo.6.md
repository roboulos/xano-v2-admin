# fn-11-ufo.6 Polish doc tabs (data-model, integration-guide)

## Description

Apply shared components and consistent patterns to doc tabs (data-model, integration-guide). Architecture and endpoint-catalog are already good.

**Size:** S
**Files:**

- `components/doc-tabs/data-model-tab.tsx`
- `components/doc-tabs/integration-guide-tab.tsx`

## Approach

**data-model-tab.tsx:**

- Add consistent PageHeader if missing
- Use shared Badge components for any status indicators
- Ensure consistent Card structure
- Use standard spacing tokens

**integration-guide-tab.tsx:**

- Add consistent PageHeader if missing
- Use shared Badge components
- Ensure consistent Card structure
- Add EmptyState for sections without content

## Key context

- Follow patterns from `architecture-tab.tsx` for Card/CollapsibleSection usage
- Follow patterns from `endpoint-catalog-tab.tsx` for expandable detail sections

## Acceptance

- [ ] data-model-tab has consistent PageHeader
- [ ] data-model-tab uses standard Card structure
- [ ] integration-guide-tab has consistent PageHeader
- [ ] integration-guide-tab uses shared components
- [ ] Consistent spacing with spacing tokens
- [ ] `pnpm build` passes

## Done summary

Polished data-model-tab.tsx and integration-guide-tab.tsx with consistent PageHeader (h2 + description), MetricCard for statistics, EmptyState for empty sections, and shared Badge components. Applied consistent Card structure and spacing patterns following architecture-tab.tsx reference.

## Evidence

- Commits: 8ff488c4c716e7ebaef6fff6f3d0808525220939
- Tests: pnpm build
- PRs:
