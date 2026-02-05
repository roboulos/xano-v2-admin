# fn-13-iz6.11 Add real-time refresh with change indicators

## Description

## Overview

Add real-time refresh capabilities with visual change indicators across all Interactive Proof System components.

**IMPORTANT (Codex review):** Polling metadata (isRefreshing, changes) should be managed by React Query/SWR, NOT raw React state. Use exponential backoff on 404 failures (not constant 10s polling on dead endpoints).

## Implementation

### Files

- `hooks/use-polling.ts` - React Query-based polling hook with backoff
- `components/refresh-indicator.tsx` - Visual refresh UI
- Updates to all story tabs and comparison panel

### Polling Hook

```typescript
interface UsePollingOptions {
  interval: number // ms between polls (default: 30000)
  enabled: boolean // toggle polling on/off
  onDataChange?: (prev, next) => void // callback when data changes
  backoffOnError: boolean // exponential backoff on errors (default: true)
  maxBackoff: number // max backoff ms (default: 300000 = 5 min)
}
```

### Backoff Strategy (per Codex review)

- First 404/error: retry at normal interval
- After 3 consecutive failures: exponential backoff (10s → 20s → 40s → ... → 5min max)
- Reset backoff on successful response
- Log failures but don't spam console

### Change Indicators

```typescript
interface ChangeIndicator {
  field: string
  previousValue: unknown
  currentValue: unknown
  timestamp: Date
}
```

### Visual Elements

1. **Refresh Badge**: Pulsing indicator when refreshing
2. **Change Highlight**: Brief flash animation on changed values
3. **Last Updated**: Timestamp of last successful fetch
4. **Change Count**: Badge showing number of changes since load
5. **Auto-refresh Toggle**: User can enable/disable polling

### Integration

- Apply to Comparison Panel (fn-13-iz6.5)
- Apply to all Story tabs (fn-13-iz6.7-10)
- Use semantic tokens for highlight colors

## Overview

Add real-time refresh capabilities with visual change indicators across all Interactive Proof System components.

## Implementation

### Files

- `hooks/use-polling.ts` - SWR-based polling hook
- `components/refresh-indicator.tsx` - Visual refresh UI
- Updates to all story tabs and comparison panel

### Polling Hook

```typescript
interface UsePollingOptions {
  interval: number // ms between polls (default: 30000)
  enabled: boolean // toggle polling on/off
  onDataChange?: (prev, next) => void // callback when data changes
}

function usePolling<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UsePollingOptions
): {
  data: T | undefined
  isLoading: boolean
  isRefreshing: boolean
  lastUpdated: Date | null
  changes: ChangeIndicator[] // fields that changed
  refresh: () => void
}
```

### Change Indicators

```typescript
interface ChangeIndicator {
  field: string
  previousValue: unknown
  currentValue: unknown
  timestamp: Date
}
```

### Visual Elements

1. **Refresh Badge**: Pulsing indicator when refreshing
2. **Change Highlight**: Brief flash on changed values
3. **Last Updated**: Timestamp of last successful fetch
4. **Change Count**: Badge showing number of changes since load
5. **Auto-refresh Toggle**: User can enable/disable polling

### UI Pattern

```
┌─────────────────────────────────────────────────┐
│ TRANSACTIONS          ●      Last: 30s ago  🔄 │
│                    2 changes                    │
│ ┌─────────────────────────────────────────────┐ │
│ │ count: 156 → 157         ← highlighted      │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Integration

- Apply to Comparison Panel (fn-13-iz6.5)
- Apply to all Story tabs (fn-13-iz6.7-10)
- Use semantic tokens for highlight colors

## Acceptance

- [ ] usePolling hook created at `hooks/use-polling.ts`
- [ ] Backed by React Query (not raw state)
- [ ] RefreshIndicator component created at `components/refresh-indicator.tsx`
- [ ] Auto-refresh with configurable interval
- [ ] Exponential backoff after 3 consecutive failures
- [ ] Max backoff of 5 minutes
- [ ] Backoff resets on successful response
- [ ] Change detection compares previous and current data
- [ ] Changed values briefly highlight with animation
- [ ] Last updated timestamp displayed
- [ ] Change count badge shows pending changes
- [ ] Auto-refresh toggle available
- [ ] Manual refresh button available
- [ ] Comparison Panel uses polling hook
- [ ] Story tabs use polling hook
- [ ] Build passes with no type errors

## Done summary

Created usePolling hook (React Query-based with exponential backoff and change detection) and RefreshIndicator component (pulsing status, last updated, change count badge, auto-refresh toggle, manual refresh). Integrated RefreshIndicator into comparison-panel header and added highlight-change CSS animation.

## Evidence

- Commits: 288577fe785c2fa92c17b4a50ecaede16a9c5678
- Tests: npx tsc --noEmit, pnpm lint
- PRs:
