# fn-11-ufo.1 Extract duplicate Badge components to /components/ui/

## Description

Extract 6 duplicate Badge components currently scattered across tab files into reusable `/components/ui/` components.

**Size:** S
**Files:**

- `components/ui/severity-badge.tsx` (new)
- `components/ui/status-badge.tsx` (consolidate existing)
- `components/ui/priority-badge.tsx` (new)
- `components/ui/category-badge.tsx` (new)
- `components/ui/method-badge.tsx` (new)
- `components/migration-tabs/blockers-tab.tsx` (remove inline definitions)
- `components/migration-tabs/gaps-tab.tsx` (remove inline definitions)
- `components/migration-tabs/checklist-tab.tsx` (remove inline definitions)
- `components/doc-tabs/endpoint-catalog-tab.tsx` (remove inline definitions)

## Approach

Follow pattern from `components/ui/badge.tsx` (line 1-36) for structure.

Extract from:

- SeverityBadge: `blockers-tab.tsx:19-33`, `gaps-tab.tsx:25-37`
- StatusBadge: `blockers-tab.tsx:35-49`, `gaps-tab.tsx:39-51` (also has existing `status-badge.tsx`)
- PriorityBadge: `checklist-tab.tsx:25-39`
- CategoryBadge: `blockers-tab.tsx:51-66`
- MethodBadge: `endpoint-catalog-tab.tsx:34-48`

## Key context

- Existing `components/ui/status-badge.tsx` has different API - consolidate both versions
- Use `cva` from class-variance-authority for variant styling (already used in badge.tsx)

## Acceptance

- [ ] SeverityBadge extracted to `/components/ui/severity-badge.tsx`
- [ ] StatusBadge consolidated in `/components/ui/status-badge.tsx`
- [ ] PriorityBadge extracted to `/components/ui/priority-badge.tsx`
- [ ] CategoryBadge extracted to `/components/ui/category-badge.tsx`
- [ ] MethodBadge extracted to `/components/ui/method-badge.tsx`
- [ ] All tab files updated to import from `/components/ui/`
- [ ] No duplicate Badge definitions remain in tab files
- [ ] `pnpm build` passes

## Done summary

Extracted 5 duplicate Badge components (SeverityBadge, SimpleStatusBadge, PriorityBadge, CategoryBadge, MethodBadge) to /components/ui/ and updated blockers-tab, gaps-tab, checklist-tab, and endpoint-catalog-tab to import from shared components.

## Evidence

- Commits: 256d1c51bf652166318d34e5338b4192cabe4723
- Tests: pnpm build
- PRs:
