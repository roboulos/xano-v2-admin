# fn-13-iz6.9 Create Sync Pipelines Story tab

## Description

## Overview

Create a Story tab that visualizes the V1→V2 sync pipeline status, showing data flow from V1 through staging to V2.

## Implementation

### File: `components/story-tabs/sync-pipelines-story-tab.tsx`

### Sync Pipeline Flow

```
V1 Source → Staging Tables → Processing → V2 Target
```

### Pipeline Types (from CLAUDE.md)

- **FUB Pipeline**: fub\_\* tables sync
- **reZEN Pipeline**: rezen\_\* tables sync
- **SkySlope Pipeline**: skyslope\_\* staging
- **DotLoop Pipeline**: dotloop\_\* staging
- **Lofty Pipeline**: lofty\_\* staging

### UI Layout

```
┌────────────────────────────────────────────────────────────────┐
│ SYNC PIPELINES - User #60                                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  V1 SOURCE ────► STAGING ────► PROCESSING ────► V2 TARGET     │
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ FUB Pipeline                              Last: 5 min ago│   │
│ │ ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐     │   │
│ │ │ People │───►│Staging │───►│Process │───►│V2 FUB  │     │   │
│ │ │ 12,456 │    │   234  │    │  ✓ OK  │    │ 12,456 │     │   │
│ │ └────────┘    └────────┘    └────────┘    └────────┘     │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ reZEN Pipeline                           Last: 2 hrs ago │   │
│ │ ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐     │   │
│ │ │ Agents │───►│Staging │───►│Process │───►│V2 Agent│     │   │
│ │ │ 37,041 │    │    0   │    │  ✓ OK  │    │ 37,041 │     │   │
│ │ └────────┘    └────────┘    └────────┘    └────────┘     │   │
│ └──────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

### Features

1. **Pipeline Diagram**: Visual flow from V1 to V2
2. **Stage Counts**: Record counts at each pipeline stage
3. **Staging Backlog**: Highlight if staging has unprocessed records
4. **Last Sync Time**: Show when pipeline last ran
5. **Trigger Sync**: Button to manually trigger pipeline

### Data Sources

- Use SYSTEM `/staging-status` endpoint
- Use SYSTEM `/staging-unprocessed` endpoint
- Reference sync status data from V2_SYNC_PIPELINE_GUIDE.md

## Acceptance

- [ ] SyncPipelinesStoryTab component created at `components/story-tabs/sync-pipelines-story-tab.tsx`
- [ ] Pipeline flow diagram rendered for each integration
- [ ] Record counts shown at each stage
- [ ] Staging backlog highlighted if non-zero
- [ ] Last sync timestamp displayed
- [ ] Trigger sync button calls appropriate endpoint
- [ ] Pipeline status indicators (healthy/warning/error)
- [ ] Uses UserContext for selected user
- [ ] Loading states while fetching
- [ ] Expandable details for each pipeline
- [ ] Responsive layout
- [ ] Build passes with no type errors

## Done summary

Created SyncPipelinesStoryTab component with 4-stage pipeline flow visualization (V1 Source -> Staging -> Processing -> V2 Target) for 5 integration pipelines (FUB, reZEN, SkySlope, DotLoop, Lofty). Added /api/staging/status and /api/staging/unprocessed proxy routes, pipeline status indicators (healthy/warning/error/inactive), staging backlog highlighting, expandable per-table breakdown, and UserContext integration with graceful fallback for missing endpoints.

## Evidence

- Commits: d677bbf45e68714c6766c48682e5b8855b6fbdd9
- Tests: npx tsc --noEmit, pnpm build
- PRs:
