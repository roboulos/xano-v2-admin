# fn-14-7cl.1 Wire 4 story tabs into page.tsx navigation

## Description

Wire the 4 existing (but orphaned) story tab components into `app/page.tsx` so they appear in the tab navigation and are accessible to users.

### What to do

1. **Add 4 new ViewMode values** to the `ViewMode` type union (~line 47):
   - `'onboarding-story'`
   - `'bg-tasks-story'`
   - `'sync-pipelines-story'`
   - `'schema-mapping-story'`

2. **Add 4 new entries to `viewModes` array** (~line 69), grouped after `proof-system`:
   - `{ id: 'onboarding-story', label: 'Onboarding Steps', icon: <appropriate> }`
   - `{ id: 'bg-tasks-story', label: 'Job Queues', icon: <appropriate> }`
   - `{ id: 'sync-pipelines-story', label: 'Sync Pipelines', icon: <appropriate> }`
   - `{ id: 'schema-mapping-story', label: 'Schema Map', icon: <appropriate> }`

3. **Add 4 imports** at the top of page.tsx:

   ```typescript
   import { OnboardingStoryTab } from '@/components/story-tabs/onboarding-story-tab'
   import { BackgroundTasksStoryTab } from '@/components/story-tabs/background-tasks-story-tab'
   import { SyncPipelinesStoryTab } from '@/components/story-tabs/sync-pipelines-story-tab'
   import { SchemaMappingStoryTab } from '@/components/story-tabs/schema-mapping-story-tab'
   ```

4. **Add 4 ErrorBoundary-wrapped renders** in the content section (~line 126):

   ```tsx
   <ErrorBoundary title="Onboarding Steps">
     {viewMode === 'onboarding-story' && <OnboardingStoryTab />}
   </ErrorBoundary>
   ```

   (repeat for each)

5. **Add appropriate lucide-react icons** for each tab. Suggestions:
   - Onboarding: `ListChecks` or `Footprints`
   - Job Queues: `Clock` or `Timer`
   - Sync Pipelines: `RefreshCw` or `ArrowLeftRight`
   - Schema Map: `Map` or `TableProperties`

### Key files

- `app/page.tsx` — the only file that needs changes

## Acceptance

- [ ] All 4 story tabs appear in the tab navigation bar
- [ ] Clicking each tab renders the correct component
- [ ] Tabs are grouped near the Proof System tab
- [ ] Zero TypeScript errors (`npx tsc --noEmit`)
- [ ] Zero new lint errors (`pnpm lint`)

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
