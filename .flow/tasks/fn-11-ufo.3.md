# fn-11-ufo.3 Create AlertBanner, LoadingState, EmptyState shared components

## Description

Create reusable AlertBanner, LoadingState, and EmptyState components for consistent UX patterns.

**Size:** S
**Files:**

- `components/ui/alert-banner.tsx` (new)
- `components/ui/loading-state.tsx` (new)
- `components/ui/empty-state.tsx` (new)

## Approach

**AlertBanner** - Follow pattern from `blockers-tab.tsx:268-296`:

- Props: variant (critical/warning/info/success), title, description, icon (optional)
- Colors: red for critical, yellow for warning, blue for info, green for success

**LoadingState** - Follow pattern from `parallel-comparison-tab.tsx:164-175`:

- Props: message (optional), size (sm/md/lg)
- Uses Loader2 icon with animate-spin

**EmptyState** - Follow pattern from `blockers-tab.tsx:334-338`:

- Props: icon, title, description
- Centered layout with icon above text

## Key context

- AlertBanner should support dark mode (use semantic colors)
- LoadingState should match existing Loader2 animation
- EmptyState commonly uses CheckCircle2 for "no issues" states

## Acceptance

- [ ] AlertBanner with critical/warning/info/success variants
- [ ] LoadingState with customizable message and size
- [ ] EmptyState with icon, title, description props
- [ ] All components support dark mode
- [ ] TypeScript types exported for all props
- [ ] `pnpm build` passes

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
