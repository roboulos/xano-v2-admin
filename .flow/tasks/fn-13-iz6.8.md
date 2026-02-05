# fn-13-iz6.8 Create Background Tasks Story tab with job queue status

## Description

## Overview

Create a Story tab that shows background task/job queue status for the selected user, revealing the async processing state.

## Implementation

### File: `components/story-tabs/background-tasks-story-tab.tsx`

### Job Queue Types

From Xano V2 architecture:

- **fub_onboarding_jobs**: FUB initial data import
- **fub_sync_jobs**: Ongoing FUB data sync
- **rezen_sync_jobs**: reZEN API sync
- **job_status**: General job tracking table

### UI Layout

```
┌────────────────────────────────────────────────────────────────┐
│ BACKGROUND TASKS - User #60                                    │
├────────────────────────────────────────────────────────────────┤
│ JOB QUEUES                                                     │
│ ┌──────────────┬─────────┬────────────┬──────────┬─────────┐  │
│ │ Queue        │ Pending │ Processing │ Complete │ Error   │  │
│ ├──────────────┼─────────┼────────────┼──────────┼─────────┤  │
│ │ FUB Onboard  │ 0       │ 0          │ 156      │ 2       │  │
│ │ FUB Sync     │ 5       │ 1          │ 8,234    │ 0       │  │
│ │ reZEN Sync   │ 0       │ 0          │ 45       │ 0       │  │
│ │ General      │ 12      │ 3          │ 1,234    │ 5       │  │
│ └──────────────┴─────────┴────────────┴──────────┴─────────┘  │
├────────────────────────────────────────────────────────────────┤
│ RECENT JOBS                                 [Filter ▼] [🔄]    │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ ● FUB Sync #8234 - Completed 2 min ago                    │ │
│ │   Synced 45 contacts, 12 deals                            │ │
│ │ ○ reZEN Txn Sync #456 - Processing...                     │ │
│ │   Progress: 234 of 567 transactions                       │ │
│ │ ✗ FUB Onboard #12 - Failed 15 min ago                     │ │
│ │   Error: Rate limit exceeded                              │ │
│ └────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### Features

1. **Queue Summary**: Aggregate counts by status
2. **Recent Jobs List**: Chronological job list with details
3. **Job Drilldown**: Expand job to see full details/logs
4. **Filter by Type**: Filter to specific job types
5. **Auto-refresh**: Poll for updates on processing jobs

### API Integration

- Use SYSTEM endpoint `/job-queue-status` (needs implementation in Xano)
- Query job_status table directly via comparison API

## Acceptance

- [ ] BackgroundTasksStoryTab component created at `components/story-tabs/background-tasks-story-tab.tsx`
- [ ] Queue summary table shows counts by status
- [ ] Recent jobs list with expandable details
- [ ] Filter dropdown for job type selection
- [ ] Auto-refresh toggle for processing jobs
- [ ] Job status indicators (pending/processing/complete/error)
- [ ] Error messages displayed for failed jobs
- [ ] Progress shown for in-flight jobs
- [ ] Uses UserContext for selected user
- [ ] Loading states while fetching
- [ ] Empty state when no jobs exist
- [ ] Responsive layout
- [ ] Build passes with no type errors

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
