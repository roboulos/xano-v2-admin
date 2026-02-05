# fn-14-7cl.4 Build /api/users/[id]/timeline endpoint

## Description

Build a timeline API endpoint that returns chronological events for a specific user, aggregated from multiple data sources (sync jobs, staging activity, onboarding steps).

### What to build

Create `app/api/users/[id]/timeline/route.ts` with a `GET` handler.

### Response Shape

```typescript
interface TimelineEvent {
  id: string
  timestamp: string // ISO 8601
  type: 'sync' | 'onboarding' | 'staging' | 'error' | 'system'
  source: string // e.g., 'rezen', 'fub', 'skyslope', 'system'
  title: string // Human-readable event title
  details?: string // Optional additional detail
  status: 'success' | 'error' | 'pending' | 'processing'
}

interface TimelineResponse {
  user_id: number
  events: TimelineEvent[]
  total: number
  has_more: boolean
}
```

### Data Sources

Fetch from V2 Xano endpoints in parallel:

1. **SYSTEM `/onboarding-status`** — `user_id` param → onboarding step events
2. **SYSTEM `/staging-status`** — `user_id` param → staging table activity
3. **Comparison API data** — Reuse logic from `/api/users/[id]/comparison` for sync status

### Query Parameters

- `limit` (default 50, max 200) — number of events to return
- `offset` (default 0) — pagination offset
- `type` (optional) — filter by event type
- `source` (optional) — filter by source

### Patterns to follow

- Follow existing API route patterns (see `app/api/users/[id]/comparison/route.ts`)
- Use `Promise.allSettled` for resilient parallel fetching
- Return partial data if some sources fail (don't fail entire request)
- Proper error handling with informative error messages
- Sort events by timestamp descending (newest first)

## Acceptance

- [ ] GET `/api/users/60/timeline` returns chronological events
- [ ] Events aggregated from multiple sources
- [ ] Pagination with limit/offset
- [ ] Graceful handling when some sources return 404
- [ ] Zero TypeScript errors

## Done summary

Built GET /api/users/[id]/timeline endpoint that aggregates chronological events from onboarding-status, staging-status, and table-counts Xano endpoints using Promise.allSettled for resilient parallel fetching. Supports pagination (limit/offset) and filtering by event type and source.

## Evidence

- Commits: 3171b0e8e14f9ddb523a16fa0106c30e2a6637dd
- Tests: npx tsc --noEmit, pnpm lint
- PRs:
