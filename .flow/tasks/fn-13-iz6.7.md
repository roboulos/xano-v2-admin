# fn-13-iz6.7 Create Onboarding Story tab with 6-step progress

## Description

## Overview

Create a Story tab that visualizes the 6-step onboarding process with real-time status for the selected user.

## Implementation

### File: `components/story-tabs/onboarding-story-tab.tsx`

### The 6 Onboarding Steps

From CLAUDE.md MCP endpoint documentation:

| Step | Name          | Endpoints                                   | Tables                                |
| ---- | ------------- | ------------------------------------------- | ------------------------------------- |
| 1    | Team Data     | `/test-function-8066-team-roster`           | team, team_roster, team_owners        |
| 2    | Agent Data    | `/test-function-8051-agent-data`            | agent, user                           |
| 3    | Transactions  | `/test-function-8052-txn-sync`              | transaction, participant              |
| 4    | Listings      | `/test-function-8053/8054-listings-sync`    | listing                               |
| 5    | Contributions | `/test-function-8056/8060-contributions`    | contribution, income, revshare_totals |
| 6    | Network       | `/test-function-8062/8070-network-downline` | network, connections                  |

### UI Layout

```
┌────────────────────────────────────────────────────────────────┐
│ ONBOARDING JOURNEY - User #60                                  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ①───────②───────③───────④───────⑤───────⑥                    │
│  Team    Agent   Txns    Lists   Contrib Network               │
│  ✓       ✓       ✓       ✓       ⋯       ○                     │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│ Step 5: Contributions                         [▶ Trigger Sync] │
│ Status: Processing (45 of 1,234 records)                       │
│ V1: 1,234 contributions | V2: 45 contributions                 │
│ Progress: ████████░░░░░░░░░░░░ 3.6%                           │
└────────────────────────────────────────────────────────────────┘
```

### Features

1. **Progress Visualization**: Linear step indicator with status icons
2. **Step Details**: Expand each step to see tables/endpoints involved
3. **Trigger Actions**: Button to manually trigger each step's sync
4. **V1/V2 Comparison**: Show record counts for each step's tables
5. **Error Display**: Show error messages if step failed

### Data Sources

- Use WORKERS endpoints (api:4UsTtl3m) for triggering
- Use SYSTEM endpoints (api:LIdBL1AN) for status checks

## Acceptance

- [ ] OnboardingStoryTab component created at `components/story-tabs/onboarding-story-tab.tsx`
- [ ] 6-step progress indicator rendered
- [ ] Each step shows status (complete/processing/pending/error)
- [ ] Step details expandable showing tables and endpoints
- [ ] V1/V2 record counts displayed for each step
- [ ] Trigger Sync button calls appropriate WORKERS endpoint
- [ ] Progress bar shows processing percentage
- [ ] Error messages displayed for failed steps
- [ ] Uses UserContext for selected user
- [ ] Loading states while fetching status
- [ ] Responsive layout
- [ ] Build passes with no type errors

## Done summary

Created OnboardingStoryTab component with 6-step progress visualization, collapsible step details showing tables/endpoints/V1-V2 record counts, trigger sync buttons calling WORKERS endpoints, and status derivation from UserContext data.

## Evidence

- Commits: d677bbf45e68714c6766c48682e5b8855b6fbdd9
- Tests: npx tsc --noEmit, pnpm lint
- PRs:
