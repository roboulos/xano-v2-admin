# Interactive Proof System - V1/V2 Migration Verification Dashboard

## Overview

Transform the static V1→V2 Migration Admin into a **live interactive proof system** that lets users:

- Select any user and instantly see their data from both V1 and V2 workspaces
- Verify 100% data alignment with visual diff highlighting
- Navigate multiple "story lines" (onboarding, background tasks, sync pipelines, webhooks, functions, tables)
- Monitor real-time job queues, sync progress, and recent events
- Visualize V1→V2 schema mappings (251 tables → 193 normalized tables)

**Philosophy:** "Frontend Reveals Backend on Steroids" - Not just documentation, but active verification tools that prove migration success.

## Scope

### In Scope

- User picker component with search (query V2 `user` table)
- User data loader service (fetch all user-related entities)
- Enhanced V1/V2 side-by-side comparison with diff highlighting
- 6 Story Line tabs: Onboarding, Background Tasks, Sync Pipelines, Webhooks, Functions, Tables
- Job queue status display (with graceful fallback for 404)
- Schema mapping visualization (table-level + expandable field-level)
- Real-time polling with "what changed" indicators
- Integration with existing fn-11 UI components (MetricCard, StatusBadge, etc.)

### Out of Scope

- FUB (Follow Up Boss) data visualization (separate epic)
- Bulk "run all users" comparison
- Export to PDF/CSV (defer to future)
- WebSocket real-time updates (use polling first)
- Mobile-specific layouts

## Approach

### Architecture Pattern (Codex-reviewed)

```
┌─────────────────────────────────────────────────────────────────┐
│  SelectedUserIdContext (tiny)  +  UserDataQueryContext (heavy)  │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌──────────────────────────────────────────────┐│
│  │ User      │  │ Story Line Tabs                              ││
│  │ Picker    │  │ ┌──────────┬──────────┬──────────┬─────────┐ ││
│  │ (Combobox)│  │ │Onboarding│ Bg Tasks │  Sync    │ Tables  │ ││
│  └───────────┘  │ └──────────┴──────────┴──────────┴─────────┘ ││
│                 │ ┌────────────────────────────────────────────┐││
│                 │ │ Comparison Panel (V1 ↔ V2)                 │││
│                 │ │ - Record counts with delta                 │││
│                 │ │ - Diff highlighting                        │││
│                 │ │ - "100% aligned" / "X differences" badges  │││
│                 │ └────────────────────────────────────────────┘││
│                 └──────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Key Patterns to Reuse

- **SWR polling pattern**: Follow `live-migration-status.tsx:47-48` (10s refresh interval)
- **Comparison modal**: Extend `comparison-modal.tsx` for user-scoped comparisons
- **Status tokens**: Use `var(--status-success)`, `var(--status-error)` from `globals.css`
- **MetricCard, StatusBadge**: From fn-11-ufo (already complete)

### API Routes to Create

1. `GET /api/users/list` - Return users with basic info
2. `GET /api/users/[id]/comparison` - V1/V2 comparison for specific user
3. `GET /api/users/[id]/timeline` - Chronological events for user

## Risks & Dependencies

### Dependencies

| Epic                             | Status      | What We Use                                   |
| -------------------------------- | ----------- | --------------------------------------------- |
| fn-10-p87 (V1/V2 Sync Dashboard) | In Progress | Phase 4 overlaps - coordinate tasks           |
| fn-11-ufo (Dashboard Polish)     | Complete    | MetricCard, StatusBadge, ProgressBar          |
| fn-2-riv (Verification)          | In Progress | Validation output from `/scripts/validation/` |

### Risks (Codex-reviewed)

| Risk                                    | Mitigation                                                                                    |
| --------------------------------------- | --------------------------------------------------------------------------------------------- |
| `/job-queue-status` returns 404         | Show "endpoint unavailable" + exponential backoff after 3 failures (not constant 10s polling) |
| Large user data (50k+ records)          | Pagination + sections filter + gzip compression. Each tab requests only its section           |
| Race conditions on rapid user switch    | AbortController per fetch + monotonically increasing request ID                               |
| V1 API downtime                         | Clear fallback UI showing V2-only data                                                        |
| Payload size (1MB+ for heavy users)     | Sections filter, pagination on arrays, summary-only mode for counts                           |
| Schema drift (static table-mappings.ts) | Document risk; consider CI check that diff-checks mappings against Xano                       |
| Manual trigger abuse                    | Rate-limit sync trigger buttons per user+action                                               |

## Quick commands

```bash
# Build and verify no TypeScript errors
pnpm build

# Test user picker with known good users
curl -s "http://localhost:3000/api/users/list" | jq '.users[:5]'

# Test user comparison endpoint
curl -s "http://localhost:3000/api/users/60/comparison" | jq '.totals'

# Verify story line tabs render
open http://localhost:3000 # Navigate to "Proof System" tab
```

## Acceptance Criteria

### Core Features

- [ ] User picker shows searchable list of users from V2
- [ ] Selecting user loads V1 + V2 data with loading states
- [ ] Comparison panel shows record counts with delta (V2 - V1)
- [ ] Diff highlighting: green (match), yellow (difference), red (missing)
- [ ] "100% aligned" badge when all counts match

### Story Lines

- [ ] Onboarding tab shows 6-step progress for selected user
- [ ] Background Tasks tab shows job queue status (or graceful fallback)
- [ ] Sync Pipelines tab shows FUB/Rezen/SkySlope sync status
- [ ] Tables tab shows V1→V2 schema mapping with expand/collapse

### Real-time

- [ ] Auto-refresh every 10 seconds (SWR pattern)
- [ ] Manual refresh button available
- [ ] "What changed" indicator on refresh

### Polish

- [ ] All UI uses semantic status tokens (theme-compatible)
- [ ] Loading skeletons during data fetch
- [ ] Error boundaries with retry buttons
- [ ] Responsive layout (works at 1200px+)

## Test Notes

### Test Users

| User            | ID  | Notes                                |
| --------------- | --- | ------------------------------------ |
| David Keener    | 60  | Primary test user, extensive V2 data |
| Michael Johnson | 7   | Demo team owner                      |
| Sarah Williams  | 256 | Demo team member                     |
| James Anderson  | 133 | Network builder                      |

### Verification Points

1. **User 60 full comparison**: Should show 100% alignment for users/agents/transactions
2. **User with no V2 data**: Should show clear "pending onboarding" state
3. **Large data user**: Verify pagination/summary handles 50k+ records
4. **Rapid user switching**: No race conditions, latest user wins

## References

### Existing Files

- `components/live-migration-status.tsx` - Real-time dashboard pattern
- `components/comparison-modal.tsx` - Field-by-field diff
- `components/parallel-comparison-tab.tsx` - V1/V2 API comparison (hardcoded user 60 at line 71)
- `lib/mcp-endpoints.ts` - All Xano endpoint definitions
- `lib/table-mappings.ts` - V1→V2 table mappings
- `app/globals.css` - Status tokens (lines 83-105)

### Documentation to Update

- CLAUDE.md - Add "Interactive Verification Tools" section
- V2_TOOLS_REFERENCE.md - New API routes
- V2_SYNC_PIPELINE_GUIDE.md - Story line documentation
