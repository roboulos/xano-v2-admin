# fn-14-7cl Close fn-13 Gaps: Wire Story Tabs + Build Missing Story Lines

## Overview

Epic fn-13-iz6 built the Interactive Proof System but left gaps:

1. **CRITICAL**: 4 story tab components were built but never wired into `app/page.tsx` — users can't access them
2. **MEDIUM**: Only 4 of 6 planned story lines were built (Webhooks + Functions missing)
3. **LOW**: `/api/users/[id]/timeline` endpoint from the spec was never created

## Scope

### In Scope

- Wire 4 existing story tabs into page navigation
- Build Webhooks story tab showing Rezen webhook configs and recent events
- Build Functions story tab showing V2 function inventory with health status
- Build `/api/users/[id]/timeline` endpoint returning chronological user events
- All new tabs use existing UserContext, semantic CSS tokens, ShadCN components

### Out of Scope

- Modifying existing story tab implementations
- Adding sub-tab navigation (keep top-level tabs for now)

## Approach

### Existing Story Tabs (built, orphaned)

- `components/story-tabs/onboarding-story-tab.tsx` → `OnboardingStoryTab`
- `components/story-tabs/background-tasks-story-tab.tsx` → `BackgroundTasksStoryTab`
- `components/story-tabs/sync-pipelines-story-tab.tsx` → `SyncPipelinesStoryTab`
- `components/story-tabs/schema-mapping-story-tab.tsx` → `SchemaMappingStoryTab`

### page.tsx Structure

- `ViewMode` type union at lines 47-65
- `viewModes` array at lines 69-87 (drives tab navigation)
- Content rendering at lines 126-176 (ErrorBoundary wrapped)
- Add new entries after 'proof-system' in both the type, array, and content sections

### Key Patterns

- Icons from `lucide-react`
- `ErrorBoundary` wrapping each tab
- Semantic tokens: `--status-success`, `--status-warning`, `--status-error`
- `useSelectedUserId()` for user-dependent tabs
- ShadCN: Card, Badge, Button, Collapsible, Skeleton

## Quick commands

- `npx tsc --noEmit` — type check
- `pnpm lint` — lint
- `pnpm build` — production build

## Acceptance

- [ ] All 4 existing story tabs reachable via navigation
- [ ] Webhooks story tab shows webhook configuration and recent events
- [ ] Functions story tab shows V2 function inventory grouped by API group
- [ ] Timeline endpoint returns chronological events for a user
- [ ] Zero TypeScript errors, zero new lint errors
- [ ] All existing functionality preserved

## References

- Epic fn-13-iz6 spec: `.flow/specs/fn-13-iz6.md`
- `app/page.tsx` — main navigation
- `components/story-tabs/` — existing story tab components
- `lib/mcp-endpoints.ts` — endpoint definitions
- `CLAUDE.md` — project documentation with endpoint details
